const tar = require('tar');
const path = require('path');

// Define the current working directory
const cwd = process.cwd(); // current working directory
const outputFile = path.join(cwd, 'plugin.tgz'); // name of the resulting .tgz file

// Create the .tgz file
tar.c(
  {
    gzip: true,
    file: outputFile,
    cwd: cwd
  },
  ['.'] // This represents the contents of the current directory
).then(() => {
  console.log(`Successfully created archive: ${outputFile}`);
}).catch((err) => {
  console.error('Error while creating archive:', err);
});
