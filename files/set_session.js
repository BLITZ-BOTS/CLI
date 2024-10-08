const fs = require("fs");
const path = require("path");
const os = require("os");

async function Set_Session(session) {
  // Determine the application data directory
  let appDataDir;

  if (process.platform === "win32") {
    // Windows
    appDataDir = path.join(process.env.APPDATA, "BLITZ_CLI");
  } else if (process.platform === "darwin") {
    // macOS
    appDataDir = path.join(os.homedir(), "Library", "Application Support", "BLITZ_CLI");
  } else {
    // Linux
    appDataDir = path.join(os.homedir(), ".config", "BLITZ_CLI");
  }

  // Check if the directory exists, if not create it
  if (!fs.existsSync(appDataDir)) {
    fs.mkdirSync(appDataDir, { recursive: true });
  }

  // Write the session data to a file inside the application data directory
  const filePath = path.join(appDataDir, "supabase_session.json");
  fs.writeFileSync(filePath, JSON.stringify(session));
}

module.exports = Set_Session;
