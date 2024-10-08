const fs = require("fs");
const path = require("path");
const os = require("os");
const supabase = require("../supabase/client");

async function Load_Session() {
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

  // Construct the full path to the session file
  const filePath = path.join(appDataDir, "supabase_session.json");

  // Check if the session file exists
  if (fs.existsSync(filePath)) {
    // Read the session data from the file
    const sessionData = fs.readFileSync(filePath);
    const session = JSON.parse(sessionData);

    // Set the session in supabase
    await supabase.auth.setSession(session);
  } else {
    console.log("Session file not found.");
  }
}

module.exports = Load_Session;
