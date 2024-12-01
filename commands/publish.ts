import { createClient } from "jsr:@supabase/supabase-js@2";
import { join } from "https://deno.land/std@0.170.0/path/mod.ts";
import { writeJson } from "https://deno.land/x/jsonfile@1.0.0/mod.ts";
import * as YAML from "npm:yaml";
import { walk } from "https://deno.land/std@0.170.0/fs/mod.ts"; // Deno walk for traversing directories
import { BlobWriter, ZipWriter } from "https://deno.land/x/zipjs/index.js"; // Zip-js

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
  author: string;
  url: string;
  tags: string[];
  config?: Record<string, any>; 
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

const getConfigFilePath = (): string => {
  return join(Deno.cwd(), "blitz.config.yaml");
};

const isValidVersion = (version: string): boolean => {
  const semVerRegex = /^(\d+\.\d+\.\d+)$/;
  return semVerRegex.test(version);
};




export async function PublishCommand() {

    let accessToken;
    const configFilePath = `${Deno.cwd()}/blitz.config.yaml`
    let config: Config;


    try {
      const configContent = await Deno.readTextFile(configFilePath);
      config = YAML.parse(configContent); // Parse the content
    } catch (_err) {
      throw new Error("Error Publishing: Cannot Find blitz.config.yaml");
    }

    if (!config.name) return console.log(`${BOLD}${RED}Missing "name" value from blitz.config.yaml${RESET}\n\n`);
    if (!config.version) return console.log(`${BOLD}${RED}Missing "version" value from blitz.config.yaml${RESET}\n\n`);
    if (!isValidVersion(config.version)) return console.log(`${BOLD}${RED}Version value from blitz.config.yaml is malformed${RESET}\n\n`);


    const blitzFilePath = getAppDataPath();
    let tokenData: TokenData;
    try {
      const tokenContent = await Deno.readTextFile(blitzFilePath);
      tokenData = JSON.parse(tokenContent); 
    } catch (_err) {
      throw new Error("Error Publishing: .blitz file is either missing or corrupted. Please re-authenticate.");
    }

    // Check if token is expired and refresh if necessary
    const currentTime = Math.floor(Date.now() / 1000);

    if (currentTime > Number(tokenData.expires_at)) {
      console.log(YELLOW + "Access token expired. Refreshing token..." + RESET);
      const { data, error } = await supabase.auth.refreshSession({ refresh_token: tokenData?.refresh_token})
      if (error) {
        throw new Error("Error Publishing: Failed to refresh the access token. Please check your authentication details.");
      }
      // Update token data and save it
      tokenData = {
        access_token: data.session?.access_token || "",
        expires_at: String(data.session?.expires_at),
        refresh_token: data.session?.refresh_token || "" 
      };


      await writeJson(blitzFilePath, tokenData, { spaces: 2 });
      accessToken = data.session?.access_token;
      console.log(GREEN + "Token refreshed successfully!" + RESET);
    }




}
