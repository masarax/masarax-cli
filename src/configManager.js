import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import inquirer from 'inquirer';

const CONFIG_PATH = path.join(os.homedir(), '.masarax-cli', 'config.json');
const DEFAULT_DOWNLOAD_DIR = path.join(os.homedir(), 'Downloads', 'MASARAX_Downloads');

// Initialize or load configuration
export const initConfig = async () => {
  let config = await loadConfig();

  // Always use English as default language
  if (!config.language) {
    config.language = 'en';
    await saveConfig(config);
  }

  if (!config.downloadDir) {
    config.downloadDir = DEFAULT_DOWNLOAD_DIR;
    await saveConfig(config);
  }

  return config;
};

const loadConfig = async () => {
  try {
    await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
    return JSON.parse(await fs.readFile(CONFIG_PATH, 'utf-8'));
  } catch {
    return { language: null, downloadDir: null };
  }
};

const saveConfig = async (config) => {
  await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));
};



export const changeDownloadLocation = async () => {
  const { newPath } = await inquirer.prompt({
    type: 'input',
    name: 'newPath',
    message: 'Enter download path:',
    default: DEFAULT_DOWNLOAD_DIR,
    validate: async (input) => {
      try {
        await fs.access(input);
        return true;
      } catch {
        try {
          await fs.mkdir(input, { recursive: true });
          return true;
        } catch {
          return 'Invalid path. Please enter a valid directory path.';
        }
      }
    }
  });
  
  return newPath;
};