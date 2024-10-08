const supabase = require("../supabase/client");
const fs = require("fs");
const tar = require("tar");
const path = require("path");

async function Upload_Plugin() {
  try {
    const manifest = await Check_Manifest(process.cwd()); // Check and get manifest.json details

    if (!manifest) {
      console.error("Manifest check failed. Aborting upload.");
      return;
    }

    const { name, version } = manifest;
    const fileName = `${name}-${version}.tgz`; // Use manifest name and version for tarball name
    const currentDirectory = process.cwd();
    const tarballPath = path.join(currentDirectory, fileName);

    // Create a .tgz archive of the current directory
    await tar.c(
      {
        gzip: true,
        file: tarballPath,
        cwd: currentDirectory,
        filter: (name) => name !== fileName, // Skip the tarball itself from being added
      },
      ["."]
    );

    const fileStream = fs.createReadStream(tarballPath);

    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user)
      return console.error("Unable to get user or user not authenticated");

    const userFolder = `${user.user.id}`;
    const filePathInStorage = `${userFolder}/${name}/${fileName}`;

    // Upload the .tgz file to Supabase storage
    const { error } = await supabase.storage
      .from("plugins")
      .upload(filePathInStorage, fileStream, {
        duplex: "half",
      });

    if (error) return console.error(error);

    console.log(`${name}@${version} has been published!`);

    fs.unlinkSync(tarballPath);
  } catch (err) {
    // Only display the relevant error message
    console.error(`${err.message}`);
  }
}

async function Check_Manifest(directoryPath) {
  const manifestPath = path.join(directoryPath, "manifest.json");
  const exists = fs.existsSync(manifestPath);

  if (!exists) {
    console.error("manifest.json file not found");
    return null;
  }

  let jsonManifest;
  try {
    const rawManifest = fs.readFileSync(manifestPath, "utf8");
    jsonManifest = JSON.parse(rawManifest);
  } catch (error) {
    console.error(`Error reading or parsing manifest.json: ${error.message}`);
    return null;
  }

  // Validate 'name' field
  if (!jsonManifest.name) {
    console.error("manifest.json name value is malformed.");
    return null;
  }

  // Validate 'version' field with semantic versioning
  if (!jsonManifest.version || !isSemanticVersion(jsonManifest.version)) {
    console.error(
      "manifest.json version value is not a valid semantic version."
    );
    return null;
  }

  return jsonManifest;
}

function isSemanticVersion(value) {
  const semverPattern = /^[0-9]+\.[0-9]+\.[0-9]+$/;
  return typeof value === "string" && semverPattern.test(value);
}

module.exports = Upload_Plugin;
