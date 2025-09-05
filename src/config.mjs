import fs from 'fs';
import os from 'os';
import { YAML } from 'zx';

const baseDir = `${os.homedir()}/.devlocal`;
const outputPath = `${baseDir}/commands.sh`;

/**
 * Initialize configuration files and create base directory if needed
 * @returns {Object} Parsed configuration objects
 */
export const initConfig = () => {
  const configFiles = { projects: {}, commands: {}, config: {} };
  const configKeys = Object.keys(configFiles);

  if (fs.existsSync(baseDir)) {
    // Remove `commands.sh` from previous session
    fs.rmSync(outputPath, { force: true });
  } else {
    // Copy yml files to ~/.devlocal
    fs.mkdirSync(baseDir);
    for (let configFile of configKeys) {
      fs.copyFileSync(`./defaults/${configFile}.yml`, `${baseDir}/${configFile}.yml`);
    }
  }

  // Load yml files
  for (let configFile of configKeys) {
    const parsed = YAML.parse(fs.readFileSync(`${baseDir}/${configFile}.yml`, 'utf8'));
    configFiles[configFile] = Object.assign(configFiles[configFile], parsed);
  }

  return configFiles;
};

/**
 * Get the base directory path
 */
export const getBaseDir = () => baseDir;

/**
 * Get the output path for commands.sh
 */
export const getOutputPath = () => outputPath;
