import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import inquirer from 'inquirer';
import { t, setLanguage } from './lang/loader.js';

const CONFIG_PATH = path.join(os.homedir(), '.masarax-cli', 'config.json');
const DEFAULT_DOWNLOAD_DIR = path.join(os.homedir(), 'MASARAX_Downloads');

// Initialize or load configuration
export const initConfig = async () => {
  let config = await loadConfig();
  
  if (!config.language) {
    config = await setInitialLanguage(config);
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

const setInitialLanguage = async (config) => {
  const { language } = await inquirer.prompt({
    type: 'list',
    name: 'language',
    message: t('select_language'),
    choices: [
      { name: 'English', value: 'en' },
      { name: 'বাংলা (Bangla)', value: 'bn' }
    ]
  });
  
  config.language = language;
  setLanguage(language);
  await saveConfig(config);
  return config;
};

export const changeDownloadLocation = async () => {
  const { newPath } = await inquirer.prompt({
    type: 'input',
    name: 'newPath',
    message: t('enter_download_path'),
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
          return t('invalid_path');
        }
      }
    }
  });
  
  return newPath;
};