const RESET = "\x1b[0m";
const RED = "\x1b[31m";
const GRAY = "\x1b[2m";
const GREEN = "\x1b[32m";

interface PluginContent {
  name: string;
  type: "file" | "dir";
  download_url?: string;
  url?: string;
}

export async function InstallCommand(plugin: string) {
  const parts = plugin.split("@");
  const version = parts[1];
  const pluginName = parts[0];

  console.log(`${GRAY}Fetching Data For ${plugin}${RESET}`);

  let url = `https://api.blitz-bots.com/plugins/get/${pluginName}`;
  if (version) {
    url = `https://api.blitz-bots.com/plugins/get/${pluginName}/${version}`;
  }

  try {
    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      if (data && data.data.repoUrl) {
        const contentsUrl =
          `https://api.github.com/repos/BLITZ-BOTS-REGISTRY/${pluginName.toUpperCase()}/contents?ref=${
            version || data.data.versions[0]
          }`;

        console.log(`${GRAY}Fetching repository contents...${RESET}`);

        const contentsResponse = await fetch(contentsUrl);

        if (!contentsResponse.ok) {
          console.log(
            `${RED}Error fetching repository contents: ${contentsResponse.statusText}${RESET}`,
          );
          return;
        }

        const contents: PluginContent[] = await contentsResponse.json();

        const pluginsDir = `${Deno.cwd()}/plugins`;
        const targetDir = `${pluginsDir}/${pluginName}`;

        // Create the plugins directory if it doesn't exist
        await Deno.mkdir(targetDir, { recursive: true });

        console.log(`${GRAY}Saving files to ${targetDir}...${RESET}`);

        await downloadAndSaveFiles(contents, targetDir);

        console.log(
          `${GREEN}Successfully installed ${pluginName} to${RESET} ${targetDir}`,
        );
      } else {
        console.log(`${RED}Error: repoUrl not found in the response.${RESET}`);
      }
    } else {
      console.log(`${RED}Error Getting Data For ${plugin}${RESET}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`${RED}Error: ${error.message}${RESET}`);
    }
  }
}

async function downloadAndSaveFiles(
  contents: PluginContent[],
  targetDir: string,
) {
  for (const item of contents) {
    // Ignore README.md
    if (item.name === "README.md") {
      continue;
    }

    const filePath = `${targetDir}/${item.name}`;

    if (item.type === "file" && item.download_url) {
      // Download the file and save it
      const fileResponse = await fetch(item.download_url);

      if (!fileResponse.ok) {
        console.log(`${RED}Error downloading file: ${item.name}${RESET}`);
        continue;
      }

      const fileData = await fileResponse.text();
      await Deno.writeTextFile(filePath, fileData);
    } else if (item.type === "dir" && item.url) {
      // Recursively create the directory and download its contents
      await Deno.mkdir(filePath, { recursive: true });
      const dirContentsResponse = await fetch(item.url);

      if (!dirContentsResponse.ok) {
        console.log(
          `${RED}Error fetching directory contents: ${item.name}${RESET}`,
        );
        continue;
      }

      const dirContents: PluginContent[] = await dirContentsResponse.json();
      await downloadAndSaveFiles(dirContents, filePath);
    }
  }
}
