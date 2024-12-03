import { createClient } from "jsr:@supabase/supabase-js@2";
import { join } from "https://deno.land/std@0.170.0/path/mod.ts";
import { writeJson } from "https://deno.land/x/jsonfile@1.0.0/mod.ts";
import * as YAML from "npm:yaml";
import { compress } from "@fakoua/zip-ts";

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

export async function DeleteCommand(plugin: string) {
  let accessToken;
  let config: Config;

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
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: tokenData?.refresh_token,
    });
    if (error) {
      console.log(
        `${RED}Error Deleting: Failed to refresh the access token. Please check your authentication details.${RESET}\n\n`,
      );
      Deno.exit();
    }
    tokenData = {
      access_token: data.session?.access_token || "",
      expires_at: String(data.session?.expires_at),
      refresh_token: data.session?.refresh_token || "",
    };

    await writeJson(blitzFilePath, tokenData, { spaces: 2 });
    accessToken = data.session?.access_token;
  }

  const response = await fetch(`https://api.blitz-bots.com/plugins/${plugin}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.ok) {
    console.log(`${GREEN}Plugin successfully deleted.${RESET}\n\n`);
  } else {
    try {
      const errorData = await response.json();
      console.log(
        `${RED}Error Deleting Plugin:${RESET}`,
        errorData.message || errorData.error || "Unknown error occurred",
        "\n\n",
      );
    } catch (_err) {
      const errorText = await response.text();
      console.log(
        `${RED}Error Deleting Plugin:${RESET}`,
        errorText || "Unknown error occurred",
        "\n\n",
      );
    }
  }
}
