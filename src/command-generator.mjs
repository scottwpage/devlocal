import fs from 'fs';

/**
 * Generate shell commands for project navigation and setup
 * @param {Object} params - Command generation parameters
 * @param {string} params.cmd - The command to execute
 * @param {string} params.project - The project name
 * @param {Object} params.selectedProject - The selected project configuration
 * @param {Object} params.config - The global configuration
 * @param {Object} params.commands - The available commands
 * @returns {Array<string>} Array of shell commands
 */
export const generateCommands = ({ cmd, project, selectedProject, config, commands }) => {
  const output = [];

  if (project && (!cmd || cmd !== 'pwd')) {
    const targetDir = `${config.baseDir}/${selectedProject.dir}`;
    output.push(`cd ${targetDir}`);

    if (fs.existsSync(`${targetDir}/.nvmrc`)) {
      output.push(`nvm use`);
    }

    // Set specified environment variables
    const envs = selectedProject['env'] || {};

    for (const [key, value] of Object.entries(envs)) {
      output.push(`export env ${key}="${value}"`);
    }

    if (!cmd) {
      // Run any specified init commands after navigating to project
      const initCommands = selectedProject['init_cmds'] || [];
      for (const initCmd of initCommands) {
        output.push(initCmd);
      }
    }
  }

  if (cmd) {
    // Choose project-specific command over general command
    const command = selectedProject?.cmds?.[cmd] || commands[cmd];

    if (command) {
      output.push(Array.isArray(command) ? command.join(' && ') : command);
    } else if (cmd === 'pwd') {
      output.push(`echo ${config.baseDir}/${selectedProject.dir}`);
    } else {
      throw new Error(`Command not found: ${cmd}`);
    }
  }

  return output;
};

/**
 * Write shell commands to output file
 * @param {Array<string>} commands - Array of shell commands
 * @param {string} outputPath - Path to write the commands file
 * @param {boolean} verbose - Whether to output verbose logging
 */
export const writeCommands = (commands, outputPath, verbose = false) => {
  if (commands.length) {
    if (verbose) {
      console.log(commands.join('\n') + '\n');
    }
    const output = ['set -o pipefail', ...commands, 'echo'];
    fs.writeFileSync(outputPath, output.join('\n'));
  }
};
