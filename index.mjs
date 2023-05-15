#!/usr/bin/env zx

// import ZX global for better autocomplete
import 'zx/globals';

// Don't print commands
$.verbose = false;

const baseDir = `${os.homedir()}/.devlocal`;
const configFiles = {
  projects: {},
  commands: {},
  variables: {},
};

const usage = () => {
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

const [_, cmd, project] = argv._;

if (!cmd && !project) {
  usage();
  process.exit(0);
}

const commands = [];
const selectedProject = configFiles.projects[project] || { dir: project };

if (project) {
  const targetDir = `${configFiles.variables.baseDir}/${selectedProject.dir}`;
  commands.push(`cd ${targetDir}`);
  cd(targetDir);
  if (fs.existsSync('.git')) {
    $`git branch`;
  }

  // Set specified environment variables
  const envs = selectedProject['env'] || {};
  for (const [key, value] of Object.entries(envs)) {
    commands.push(`export env ${key}="${value}"`);
  }
}

if (cmd) {
  // Choose project-specific command or general command
  // console.log({ selectedProject, commands: configFiles.commands });
  const command = selectedProject.cmds?.[cmd] || configFiles.commands[cmd];
  // console.log({ command });
  if (command) {
    commands.push(command);
  } else {
    echo(`Command not found: ${cmd}`);
    process.exit(1);
  }
}

if (commands.length) {
  commands.unshift('set -o pipefail');
  fs.writeFileSync(`${baseDir}/commands.sh`, commands.join('\n'));
}
