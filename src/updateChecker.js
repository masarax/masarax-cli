import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import { exec } from 'child_process';
import chalk from 'chalk';

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
      // Show update notification with border
      console.log('');
      console.log(chalk.yellow('┌' + '─'.repeat(70) + '┐'));
      console.log(chalk.yellow('│') + chalk.red.bold(' ⚠️  NEW UPDATE AVAILABLE! ⚠️' + ' '.repeat(70 - ' ⚠️  NEW UPDATE AVAILABLE! ⚠️'.length - 1)) + chalk.yellow('│'));
      console.log(chalk.yellow('│') + chalk.white(` Current version: ${currentVersion}` + ' '.repeat(70 - ` Current version: ${currentVersion}`.length - 1)) + chalk.yellow('│'));
      console.log(chalk.yellow('│') + chalk.green(` Latest version: ${latestVersion}` + ' '.repeat(70 - ` Latest version: ${latestVersion}`.length - 1)) + chalk.yellow('│'));
      console.log(chalk.yellow('│') + chalk.cyan(' Update with: npm install -g @masarax/masarax-cli@latest' + ' '.repeat(70 - ' Update with: npm install -g @masarax/masarax-cli@latest'.length - 1)) + chalk.yellow('│'));
      console.log(chalk.yellow('└' + '─'.repeat(70) + '┘'));
      console.log('');
      
      const { confirmUpdate } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirmUpdate',
          message: 'Would you like to update now?',
          default: true
        }
      ]);
      
      if (confirmUpdate) {
        console.log('Updating MASARAX CLI...');
        exec('npm install -g @masarax/masarax-cli@latest', (error, stdout) => {
          if (error) {
            console.error(`Update failed: ${error.message}`);
            return;
          }
          console.log('Update completed successfully!');
          console.log(stdout);
        });
      }
    }
  } catch (error) {
    // Fail silently or log error for debugging
    console.error("Error checking for updates:", error.message);
  }
};