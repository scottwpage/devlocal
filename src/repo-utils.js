import fs from 'fs';

/**
 * Get directories from a given directory path
 * @param {string} directory - The directory to scan
 * @returns {Array<string>} Array of directory names
 */
export const getDirectories = (directory) =>
  fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

/**
 * Find all git repositories recursively
 * @param {string} directory - The base directory to start searching
 * @param {string} baseDir - The base directory for calculating relative paths
 * @param {Array} repos - The array to store found repositories
 * @returns {Array<Array>} Array of [repoName, relativePath] pairs
 */
export const findRepos = (directory, baseDir, repos = []) => {
  if (fs.existsSync(`${directory}/.git`)) {
    const relativePath = directory.replace(`${baseDir}/`, '');
    const parts = relativePath.split('/');
    const repo = parts.pop();
    repos.push([repo.toLowerCase(), relativePath]);
    return repos;
  }

  for (const folder of getDirectories(directory)) {
    findRepos(`${directory}/${folder}`, baseDir, repos);
  }

  return repos;
};

/**
 * Find a selected project by name or alias
 * @param {string} projectName - The project name to find
 * @param {Object} projects - The projects configuration object
 * @param {Array} repos - The array of available repositories
 * @returns {Object|undefined} The selected project or undefined
 */
export const getSelectedProject = (projectName, projects, repos) => {
  let selectedProject = projects[projectName];

  if (selectedProject) return selectedProject;

  // Look for aliases
  for (let key of Object.keys(projects)) {
    const aliases = projects[key]?.aliases || [];
    if (aliases.includes(projectName)) {
      selectedProject = projects[key];
      break;
    }
  }

  if (!selectedProject) {
    const repo = repos.find((i) => i[0] === projectName?.toLowerCase());
    if (repo) return { dir: repo[1] };
  }

  return selectedProject;
};
