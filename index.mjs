#!/usr/bin/env zx

// import ZX global for better autocomplete
import 'zx/globals';

// Don't print commands
$.verbose = false;

const baseDir = `${os.homedir()}/.devlocal`;
const configFiles = { projects: {}, commands: {}, config: {} };
const { projects: PROJECTS, commands: COMMANDS, config: CONFIG } = configFiles;

const usage = () => {
  let cmd;
  // console.log({ PROJECTS });

  echo(`${chalk.blueBright('Projects:')}`);
  for (let project of Object.keys(PROJECTS)) {
    // console.log({ project });
    echo`  ${chalk.blue(`${project}`)}`;
    for (cmd in PROJECTS[project]?.cmds || []) {
      echo(`    ${chalk.green(`${cmd}`)}`);
    }
  }

  echo(`\n${chalk.greenBright('Commands:')}`);
  for (cmd in COMMANDS) {
    echo`  ${chalk.green(`${cmd}`)}`;
  }
};

const init = () => {
  const configKeys = Object.keys(configFiles);

  // Copy yml files to ~/.devlocal
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir);
    for (let configFile of configKeys) {
      echo(`Creating ${baseDir}/${configFile}.yml`);
      fs.copyFileSync(`./defaults/${configFile}.yml`, `${baseDir}/${configFile}.yml`);
    }
  }

  // Load yml files
  for (let configFile of configKeys) {
    const parsed = YAML.parse(fs.readFileSync(`${baseDir}/${configFile}.yml`, 'utf8'));
    configFiles[configFile] = Object.assign(configFiles[configFile], parsed);
  }
};

const getSelectedProject = (project) => {
  let selectedProject = PROJECTS[project];

  if (selectedProject) return selectedProject;

  selectedProject = { dir: project };

  // Look for aliases
  for (let key of Object.keys(PROJECTS)) {
    const aliases = PROJECTS[key]?.aliases || [];
    if (aliases.includes(project)) {
      selectedProject = PROJECTS[key];
      break;
    }
  }

  return selectedProject;
};

// --------------------------------------------------------------------------------------------- //
init();

const [_, cmd, project] = argv._;

if (!cmd && !project) {
  usage();
  process.exit(0);
}

const output = [];
const selectedProject = getSelectedProject(project);

if (project) {
  const targetDir = `${CONFIG.baseDir}/${selectedProject.dir}`;
  output.push(`cd ${targetDir}`);
  cd(targetDir);
  if (fs.existsSync('.git')) {
    $`git branch`;
  }

  // Set specified environment variables
  const envs = selectedProject['env'] || {};
  for (const [key, value] of Object.entries(envs)) {
    output.push(`export env ${key}="${value}"`);
  }
}

if (cmd) {
  // Choose project-specific command over general command
  const command = selectedProject.cmds?.[cmd] || COMMANDS[cmd];
  if (command) {
    output.push(command);
  } else {
    echo(`Command not found: ${cmd}`);
    process.exit(1);
  }
}

if (output.length) {
  // Create an output file that can be sourced as simply running commands from
  // this script will not actually change the directory or set env vars.
  output.unshift('set -o pipefail'); // Bail out immediately if any commands fail
  const outputPath = `${baseDir}/commands.sh`;
  fs.rmSync(outputPath, { force: true });
  fs.writeFileSync(outputPath, output.join('\n'));
}
