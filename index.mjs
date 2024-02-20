#!/usr/bin/env zx

// import ZX global for better autocomplete
import 'zx/globals';

// Don't print commands
$.verbose = false;

const baseDir = `${os.homedir()}/.devlocal`;
const outputPath = `${baseDir}/commands.sh`;
const configFiles = { projects: {}, commands: {}, config: {} };
const { projects: PROJECTS, commands: COMMANDS, config: CONFIG } = configFiles;

const REPOS = [];

const getDirectories = (directory) =>
  fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

const findRepos = (directory = CONFIG.baseDir) => {
  if (fs.existsSync(`${directory}/.git`)) {
    const relativePath = directory.replace(`${CONFIG.baseDir}/`, '');
    const parts = relativePath.split('/');
    const repo = parts.pop();
    REPOS.push([repo, relativePath]);
    return;
  }

  for (const folder of getDirectories(directory)) {
    findRepos(`${directory}/${folder}`);
  }
};


const usage = () => {
  let cmd;
  echo(chalk.white.bgBlue.bold('\n** devlocal **'));
  echo(
    `\nNavigate between projects, set env variables and run commands.
    \nUsage:  dl <command> [<project>]
   or:  go <project>`
  );

  echo('\nProjects and project-specific commands');
  const repos = REPOS.map((p) => `${p[0]}|${p[1]}`).sort();
  for (const items of repos) {
    const { repo, dir } = items.split('|');
    dir.pop(); // Remove repo name
    echo(`  ${chalk.blue(`${repo}`)} (${dir})`);
    for (cmd of Object.keys(PROJECTS[repo]?.cmds || []).sort()) {
      echo(`    ${chalk.green(`${cmd}`)}`);
    }
  }

  echo('\nGeneral commands');
  for (cmd of Object.keys(COMMANDS).sort()) {
    echo(`  ${chalk.green(`${cmd}`)}`);
  }
  echo('');
};

const init = () => {
  const configKeys = Object.keys(configFiles);

  if (fs.existsSync(baseDir)) {
    // Remove `commands.sh` from previous session
    fs.rmSync(outputPath, { force: true });
  } else {
    // Copy yml files to ~/.devlocal
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

  findRepos();
};

const getSelectedProject = (project) => {
  let selectedProject = PROJECTS[project];

  if (selectedProject) return selectedProject;

  // Look for aliases
  for (let key of Object.keys(PROJECTS)) {
    const aliases = PROJECTS[key]?.aliases || [];
    if (aliases.includes(project)) {
      selectedProject = PROJECTS[key];
      break;
    }
  }

  if (!selectedProject) {
    const repo = REPOS.find((i) => i[0] === project);
    if (repo) return { dir: repo[1] };
  }

  return selectedProject;
};

//* =========================================================================================== *//
init();

const [_, cmd, project] = argv._;

if (!cmd && !project) {
  usage();
  process.exit(0);
}

const selectedProject = getSelectedProject(project);
const output = [];

if (project) {
  const targetDir = `${CONFIG.baseDir}/${selectedProject.dir}`;
  output.push(`cd ${targetDir}`);

  // Set specified environment variables
  const envs = selectedProject['env'] || {};
  for (const [key, value] of Object.entries(envs)) {
    output.push(`export env ${key}="${value}"`);
  }

  if (!cmd) {
    cd(targetDir);
    if (fs.existsSync('.git')) {
      echo(await $`git branch`);
    }
    // Run any specified init commands after navigating to project
    const initCommands = selectedProject['init_cmds'] || [];
    for (const cmd of initCommands) {
      output.push(cmd);
    }
  }
}

if (cmd) {
  // Choose project-specific command over general command
  const command = selectedProject?.cmds?.[cmd] || COMMANDS[cmd];
  if (command) {
    output.push(Array.isArray(command) ? command.join(' && ') : command);
  } else {
    echo(`Command not found: ${cmd}`);
    process.exit(1);
  }
}

if (output.length) {
  // Create an output file that can be sourced as simply running commands from
  // this script will not actually change the directory or set env vars.
  CONFIG?.verbose && echo(output.join('\n') + '\n');
  output.unshift('set -o pipefail'); // Bail out immediately if any commands fail
  output.push('echo');
  fs.writeFileSync(outputPath, output.join('\n'));
}
