import { createClient } from "jsr:@supabase/supabase-js@2";
import { join } from "jsr:@std/path@1.0.8";
import { writeFile } from "jsr:@opensrc/jsonfile";
import * as YAML from "npm:yaml@2.6.1";
import { compress } from "jsr:@fakoua/zip-ts@1.3.1";

// Define ANSI color codes
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const GRAY = "\x1b[2m";

const supabase = createClient(
  "https://fewdjowxiqfzsfixqbzl.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZld2Rqb3d4aXFmenNmaXhxYnpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzExMDM5MDIsImV4cCI6MjA0NjY3OTkwMn0.SvzrrIcLU8lCrv-xcNFoHoOdqLh8n7wvE5TZ5QFl32s",
);

type Config = {
  name: string;
  description: string;
  version: string;
  url: string;
  tags: string[];
  config?: Record<string, unknown>;
};

type TokenData = {
  access_token: string;
  expires_at: string;
  refresh_token: string;
};

const getAppDataPath = (): string => {
  return Deno.build.os === "windows"
    ? join(Deno.env.get("APPDATA") || "", ".blitz")
    : join(Deno.env.get("HOME") || "", ".blitz");
};

const isValidVersion = (version: string): boolean => {
  const semVerRegex = /^(\d+\.\d+\.\d+)$/;
  return semVerRegex.test(version);
};

export async function PublishCommand() {
  let accessToken;
  const configFilePath = `${Deno.cwd()}/blitz.config.yaml`;
  const compressedFilePath = `${Deno.cwd()}/plugin.zip`;
  let config: Config;

  try {
    const configContent = await Deno.readTextFile(configFilePath);
    config = YAML.parse(configContent);
  } catch (_err) {
    throw new Error("Error Publishing: Cannot Find blitz.config.yaml");
  }

  if (!config.name) {
    console.log(
      `${BOLD}${RED}Missing "name" value from blitz.config.yaml${RESET}\n\n`,
    );
    return;
  }
  if (!config.version) {
    console.log(
      `${BOLD}${RED}Missing "version" value from blitz.config.yaml${RESET}\n\n`,
    );
    return;
  }
  if (!isValidVersion(config.version)) {
    console.log(
      `${BOLD}${RED}Version value from blitz.config.yaml is malformed${RESET}\n\n`,
    );
    return;
  }

  const blitzFilePath = getAppDataPath();
  let tokenData: TokenData;
  try {
    const tokenContent = await Deno.readTextFile(blitzFilePath);
    tokenData = JSON.parse(tokenContent);
    accessToken = tokenData.access_token;
  } catch (_err) {
    console.log(
      `${BOLD}${RED}.blitz file is either missing or corrupted. Please re-authenticate.\n\n`,
    );
    Deno.exit();
  }

  // Check if token is expired and refresh if necessary
  const currentTime = Math.floor(Date.now() / 1000);

  if (currentTime > Number(tokenData.expires_at)) {
    console.log(YELLOW + "Access token expired. Refreshing token..." + RESET);
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: tokenData?.refresh_token,
    });
    if (error) {
      throw new Error(
        "Error Publishing: Failed to refresh the access token. Please check your authentication details.",
      );
    }
    tokenData = {
      access_token: data.session?.access_token || "",
      expires_at: String(data.session?.expires_at),
      refresh_token: data.session?.refresh_token || "",
    };

    await writeFile(blitzFilePath, tokenData, { spaces: 2 });
    accessToken = data.session?.access_token;
    console.log(GREEN + "Token refreshed successfully!" + RESET);
  }

  console.log(`${GRAY}Compressing plugin files...${RESET}`);

  try {
    const compressed = await compress(`${Deno.cwd()}/*`, compressedFilePath, {
      overwrite: true,
    });

    if (!compressed) {
      console.log(`${BOLD}${RED}Error Compressing Plugin${RESET}\n\n`);
      return;
    }

    await Deno.stat(compressedFilePath);
    console.log(`${GRAY}Compression complete. Preparing to upload...${RESET}`);

    const fileContent = await Deno.readFile(compressedFilePath);
    const file = new File([fileContent], "plugin.zip", {
      type: "application/zip",
    });

    const formData = new FormData();
    formData.append("name", config.name);
    formData.append("version", config.version);
    formData.append("file", file);
    if (config.description) formData.append("description", config.description);
    if (config.url) formData.append("url", config.url);
    if (config.tags) formData.append("tags", config.tags.join(","));

    const response = await fetch("https://api.blitz-bots.com/plugins", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (response.ok) {
      console.log(
        `${GREEN}Successfully Published ${RESET}${BOLD}${config.name}@${config.version}${RESET}\n\n`,
      );
    } else if (response.status === 409) {
      // Handle conflict by updating the existing plugin
      const response2 = await fetch(
        `https://api.blitz-bots.com/plugins/${config.name}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        },
      );

      if (response2.ok) {
        console.log(
          `${GREEN}Successfully Updated ${RESET}${BOLD}${config.name}@${config.version}${RESET}\n\n`,
        );
      } else {
        try {
          const patchErrorData = await response2.json().catch(() => ({}));
          console.error(
            `${RED}Error Updating Plugin:${RESET}`,
            patchErrorData.message || patchErrorData,
            "\n\n",
          );
        } catch (err) {
          console.error(
            `${RED}Error Updating Plugin:${RESET}`,
            err instanceof Error ? err.message : err,
            "\n\n",
          );
        }
      }
    } else {
      try {
        const errorData = await response.json().catch(() => ({}));
        console.error(
          `${RED}Error Uploading Plugin:${RESET}`,
          errorData.message || errorData,
          "\n\n",
        );
      } catch (err) {
        console.error(
          `${RED}Error Uploading Plugin:${RESET}`,
          err instanceof Error ? err.message : err,
          "\n\n",
        );
      }
    }
  } catch (err) {
    if (err instanceof Error) {
      console.error(`${RED}Error:${RESET}`, err.message, "\n\n");
    }
  } finally {
    try {
      await Deno.remove(compressedFilePath);
      console.log(`${GRAY}Cleaned up: Deleted plugin.zip${RESET}`);
    } catch (cleanupErr) {
      if (cleanupErr instanceof Error) {
        console.error(
          `${YELLOW}Warning: Could not delete plugin.zip:${RESET}`,
          cleanupErr.message,
        );
      }
    }
  }
}
