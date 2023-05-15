#!/usr/bin/env zx

// import ZX global for better autocomplete
import 'zx/globals';

const baseDir = `${os.homedir()}/.devlocal`;
const configFiles = {
  projects: {},
  commands: {},
  variables: {},
};

const usage = () => {
  console.log(configFiles.projects.items);
};

// --------------------------------------------------------------------------------------------- //
if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir);
  for (let configFile of Object.keys(configFiles)) {
    echo(`Creating ${baseDir}/${configFile}.yml`);
    fs.copyFileSync(`./defaults/${configFile}.yml`, `${baseDir}/${configFile}.yml`);
  }
}

for (let configFile of Object.keys(configFiles)) {
  configFiles[configFile] = YAML.parse(
    fs.readFileSync(`${baseDir}/${configFile}.yml`, 'utf8')
  ).items;
}

console.log({ projects: configFiles.projects });
const [_, cmd, project] = argv._;
console.log({ cmd, project, argv });

if (!cmd) {
  usage();
}
