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
  // console.log(configFiles.projects);
  echo('Projects:');
  for (let project in configFiles.projects) {
    echo`  ${chalk.blue(`${project}`)}`;
  }
  // TODO: add project commands

  echo('Commands:');
  for (let cmd in configFiles.commands) {
    echo`  ${chalk.blue(`${cmd}`)}`;
  }
};

const init = () => {
  // Copy yml files to ~/.devlocal
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir);
    for (let configFile of Object.keys(configFiles)) {
      echo(`Creating ${baseDir}/${configFile}.yml`);
      fs.copyFileSync(`./defaults/${configFile}.yml`, `${baseDir}/${configFile}.yml`);
    }
  }

  // Load yml files
  for (let configFile of Object.keys(configFiles)) {
    configFiles[configFile] = YAML.parse(fs.readFileSync(`${baseDir}/${configFile}.yml`, 'utf8'));
  }
};

// --------------------------------------------------------------------------------------------- //
init();

console.log({ projects: configFiles.projects });
const [_, cmd, project] = argv._;
console.log({ cmd, project });

if (!cmd && !project) {
  usage();
  process.exit(0);
}

let selectedProject = configFiles.projects[project] || { dir: project };

if (project) {
  // Set specified environment variables
  const envs = selectedProject?.env || {};
  for (const [key, value] of Object.entries(envs)) {
    await $`export env ${key}="${value}"`;
  }

  cd(`${configFiles.variables.baseDir}/${selectedProject.dir}`);
  if (fs.existsSync('.git')) {
    $`git branch`;
  }
}

if (cmd !== '') {
  // Choose project-specific command or general command
  console.log({ selectedProject, commands: configFiles.commands });
  const command = selectedProject.cmds?.[cmd] || configFiles.commands[cmd];
  console.log({ command });
  if (command) {
    await $`${command}`;
  } else {
    echo(`Command not found: ${cmd}`);
    process.exit(1);
  }
}
