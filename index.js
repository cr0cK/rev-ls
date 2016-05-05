#!/usr/bin/env node

// Write bytes received in stdin to a revved file path.
//
// Usage:
// ls *.png |rev-ls -r ./manifest.json
// find ./dist -type f -regextype posix-extended -regex ".*\.(png|svg)" |rev-ls -r ./dist/manifest.json

const fs = require('fs');
const path = require('path');
const commander = require('commander');
const revFile = require('rev-file');

const fileName = 'rev-data-[hash].file';
const revFileName = 'rev-manifest.json';

commander
  .option('-r, --manifest <filename>', 'Manifest file')
  .option('-m, --mv', 'move file instead of copy')
  .parse(process.argv);

/* Main */

process.stdin.resume();
process.stdin.setEncoding('utf8');

const timeID = setTimeout(() => {
  process.stdout.write('No data received from stdin!');
  commander.help();
  process.exit(1);
}, 2000);

var dataStdin = '';
process.stdin.on('data', function(data) {
  clearTimeout(timeID);
  dataStdin += data;
});

process.stdin.on('end', function() {
  if (dataStdin === '') {
    process.exit(1);
  }

  const files = dataStdin.split(/\s+/).filter(Boolean);
  const mapping = {};

  files.forEach((file) => {
    const fullPath = path.join(process.cwd(), file);
    const fullRevedPath = revFile.sync(fullPath);
    const revedFileOnly = path.relative(process.cwd(), fullRevedPath);

    // copy file
    if (commander.mv) {
      fs.renameSync(fullPath, fullRevedPath);
    } else {
      fs.createReadStream(file).pipe(fs.createWriteStream(fullRevedPath));
    }

    // add in mapping
    const removeDots = new RegExp(/^\.?\/?/);
    const file_ = file.replace(removeDots, '');
    const revedFileOnly_ = revedFileOnly.replace(removeDots, '');
    mapping[file_] = revedFileOnly_;

    process.stdout.write(`✔ ${file_} -> ${revedFileOnly_}\n`);
  });

  // build manifest
  if (commander.manifest) {
    const maniFullPath = path.join(process.cwd(), commander.manifest);
    fs.writeFileSync(maniFullPath, JSON.stringify(mapping, null, 2), 'utf8');
    process.stdout.write(`Write manifest into "${maniFullPath}".\n\n`);
  }
});
