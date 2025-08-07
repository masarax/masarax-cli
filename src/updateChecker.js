import axios from 'axios';
import { t } from './lang/loader.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import { exec } from 'child_process';

const NPM_REGISTRY_URL = 'https://registry.npmjs.org/@masarax/masarax-cli';

export const checkForUpdates = async () => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const packageJsonPath = path.join(__dirname, '..' , 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
    const currentVersion = packageJson.version;

    const response = await axios.get(NPM_REGISTRY_URL);
    const latestVersion = response.data['dist-tags'].latest;
    
    if (latestVersion !== currentVersion) {
      console.log(new inquirer.Separator());
      console.log(t('new_update', currentVersion, latestVersion));
      console.log(new inquirer.Separator());
      
      const { confirmUpdate } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirmUpdate',
          message: t('update_prompt'),
          default: true
        }
      ]);
      
      if (confirmUpdate) {
        console.log(t('updating'));
        exec('npm install -g @masarax/masarax-cli@latest', (error, stdout, stderr) => {
          if (error) {
            console.error(t('update_error', error.message));
            return;
          }
          console.log(t('update_complete'));
          console.log(stdout);
        });
      }
    }
  } catch (error) {
    // Fail silently or log error for debugging
    console.error("Error checking for updates:", error.message);
  }
};