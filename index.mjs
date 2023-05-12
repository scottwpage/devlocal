#!/usr/bin/env zx

const yaml = require('js-yaml');

// import ZX global for better autocomplete
import 'zx/globals';

const baseDir = `${os.homedir()}/.devlocal`;
const configFiles = ['projects.yml', 'commands.yml'];
const projectsPath = `${baseDir}/${configFiles[0]}`;
const commandsPath = `${baseDir}/${configFiles[1]}`;

fs.ensureDirSync(baseDir);

let targetPath;
for (let configFile of configFiles) {
  targetPath = `${baseDir}/${configFile}`;
  if (!fs.existsSync(targetPath)) {
    echo(`Creating ${targetPath}`);
    fs.copyFileSync(`./defaults/${configFile}`, `${targetPath}`);
  }
}

const projects = yaml.load(fs.readFileSync(`${baseDir}/${configFiles[0]}`, 'utf8'));
console.log({ projects });
