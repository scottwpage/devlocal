#!/usr/bin/env node

import { initConfig, getOutputPath } from './src/config.js';
import { findRepos, getSelectedProject } from './src/repo-utils.js';
import { generateCommands, writeCommands } from './src/command-generator.js';
import { displayUsage } from './src/usage.js';
import { showGitBranch } from './src/git-utils.js';

/**
 * Main application function
 */
const main = async () => {
  // Initialize configuration
  const { projects, commands, config } = initConfig();

  // Find all repositories
  const repos = findRepos(config.baseDir, config.baseDir);

  const args = process.argv.slice(2);
  const [cmd, project] = args;

  // Show usage if no arguments provided
  if (!cmd && !project) {
    displayUsage({ repos, projects, commands, config });
    process.exit(0);
  }

  // Get selected project
  const selectedProject = project ? getSelectedProject(project, projects, repos) : null;

  // If project is specified but not found, show error
  if (project && !selectedProject) {
    console.error(`Project not found: ${project}`);
    process.exit(1);
  }

  try {
    // Generate shell commands
    const cmds = generateCommands({
      cmd,
      project,
      selectedProject,
      config,
      commands
    });

    // Show git branch if navigating to project without command
    if (project && !cmd) {
      const targetDir = `${config.baseDir}/${selectedProject.dir}`;
      await showGitBranch(targetDir);
    }

    // Write commands to output file
    writeCommands(cmds, getOutputPath(), config?.verbose);

  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

// Run the main function
main().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
