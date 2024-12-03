const RESET = "\x1b[0m";
const RED = "\x1b[31m";
const GRAY = "\x1b[2m";

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
      const data = await response.text();
      console.log(data);
    } else {
      console.log(`${RED}Error Getting Data For${RESET} ${plugin}\n\n`);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log(`${RED}Error: ${error.message}${RESET}\n\n`);
    }
  }
}
