const fs = require("fs");
const path = require("path");

async function CreatePlugin(name, description) {
  const PluginFolderPath = process.cwd(); // Current working directory
  const PluginDirPath = path.join(PluginFolderPath, name); // New plugin directory
  const ExistingFiles = fs.readdirSync(PluginFolderPath);

  // Create the new plugin directory
  fs.mkdir(PluginDirPath, { recursive: true }, (err) => {
    

    // Prepare manifest content
    const manifest_content = {
      name: name,
      description: description,
      version: "1.0.0",
      repo: "",
      config: "config.json",
      files: {
        events: "events",
        commands: "commands",
        slash_commands: "slash_commands",
      },
    };

    // Create manifest.json
    fs.writeFile(
      path.join(PluginDirPath, "manifest.json"),
      JSON.stringify(manifest_content, null, 2),
      (err) => {
        if (err) {
          console.error("Error writing manifest.json:", err);
        }
      }
    );

    // Create config.json
    fs.writeFile(
      path.join(PluginDirPath, "config.json"),
      JSON.stringify({}, null, 2),
      (err) => {
        if (err) {
          console.error("Error writing config.json:", err);
        }
      }
    );

    // Create README.md
    fs.writeFile(
      path.join(PluginDirPath, "README.md"),
      "# PLUGIN NAME",
      (err) => {
        if (err) {
          console.error("Error writing README.md:", err);
        }
      }
    );

    // Create directories
    const directories = ["events", "commands", "slash_commands"];
    directories.forEach((dir) => {
      fs.mkdir(path.join(PluginDirPath, dir), { recursive: true }, (err) => {
        if (err) {
          console.error(`Error creating directory ${dir}:`, err);
        }
      });
    });

    console.log("Files added.");
    console.log(
      "\nPlease install discord.js and @blitz-bots/builder\nnpm i discord.js @blitz-bots/builder"
    );
  });
}

module.exports = CreatePlugin;
