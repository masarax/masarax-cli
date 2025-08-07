import inquirer from 'inquirer';
import chalk from 'chalk';
import { getContents, downloadFile } from './github.js';
import { downloadRecursive } from './downloader.js';
import { formatItem, showDownloadStart, showDownloadComplete } from './ui.js';
import { changeDownloadLocation } from './configManager.js';
import ora from 'ora';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';

let currentPath = '';
const history = [];

const calculateFolderSize = (items) => {
  const totalSize = items.reduce((sum, item) => {
    if (item.type === 'file') {
      return sum + (item.size || 0);
    }
    return sum;
  }, 0);
  const sizeMB = totalSize / (1024 * 1024);
  return sizeMB < 1 ? 0 : Math.ceil(sizeMB);
};

export const showMainMenu = async (config) => {
  while (true) {
    const choice = await showContentMenu(currentPath, config);
    
    if (choice === 'back') {
      if (history.length > 0) currentPath = history.pop();
      continue;
    }
    
    if (choice === 'exit') {
      console.log('Thank you for using MASARAX CLI!');
      process.exit(0);
    }
    
    if (choice === 'change_location') {
      const newPath = await changeDownloadLocation();
      if (newPath) {
        config.downloadDir = newPath;
        // Save the updated config
        await fs.writeFile(path.join(os.homedir(), '.masarax-cli', 'config.json'), JSON.stringify(config, null, 2));
        console.log(chalk.green.bold(`✅ Download location updated: ${config.downloadDir}`));
        console.log(''); // Add spacing
      }
      continue;
    }
    
    if (choice.type === 'dir') {
      history.push(currentPath);
      currentPath = choice.path;
      console.clear(); // Clear screen for better UX
      continue;
    }
    
    if (choice.type === 'file') {
      const destPath = path.join(config.downloadDir, currentPath, choice.name);

      showDownloadStart(choice.name);
      const spinner = ora(`Downloading: ${choice.name}`).start();

      try {
        await fs.mkdir(path.dirname(destPath), { recursive: true });
        await downloadFile(choice.url, destPath);
        spinner.succeed();
        showDownloadComplete(destPath);
        console.log(chalk.green.bold('Thank you for your download!'));
      } catch (error) {
        spinner.fail(`Download failed: ${error.message}`);
      }
      continue; // Continue to show the menu
    }
    
    if (choice === 'download_all') {
      const spinner = ora('Downloading all files...').start();
      try {
        await downloadRecursive(currentPath, config.downloadDir);
        spinner.succeed('All files downloaded successfully!');
      } catch (error) {
        spinner.fail(`Download failed: ${error.message}`);
      }
    }
  }
};

const showContentMenu = async (path) => {
  const contents = await getContents(path);
  
  // Sort MASARAX packages first
  contents.sort((a, b) => {
    if (a.name.startsWith('@masarax/') && !b.name.startsWith('@masarax/')) return -1;
    if (!a.name.startsWith('@masarax/') && b.name.startsWith('@masarax/')) return 1;
    return 0;
  });

  const folderSizeMB = calculateFolderSize(contents);
  const downloadAllText = `⬇️ Download All (${folderSizeMB} MB)`;

  // Filter out README.md files
  const filteredContents = contents.filter(item =>
    !item.name.toLowerCase().includes('readme')
  );

  const choices = filteredContents.map(item => ({
    name: formatItem(item),
    value: item,
    short: item.name
  }));



  // Add navigation options at the top for easy access
  const navigationChoices = [
    {
      name: chalk.yellow.bold('⬅️ Back'),
      value: 'back',
      disabled: path === '' || history.length === 0
    }
  ];

  // Only show Download All when inside a folder (not in root)
  if (path !== '') {
    navigationChoices.push({
      name: chalk.yellow.bold(downloadAllText),
      value: 'download_all'
    });
  }

  navigationChoices.push(
    {
      name: chalk.yellow.bold('📂 Change Download Location'),
      value: 'change_location'
    },
    {
      name: chalk.yellow.bold('❌ Exit'),
      value: 'exit'
    },
    new inquirer.Separator(chalk.yellow('─'.repeat(50)))
  );

  // Combine navigation and file choices
  const allChoices = [...navigationChoices, ...choices];

  const { selected } = await inquirer.prompt({
    type: 'list',
    name: 'selected',
    message: 'What would you like to download?',
    choices: allChoices,
    pageSize: 15, // Reduced page size for better navigation
    loop: false,   // Disable loop for better UX
    default: 0,    // Always start from first option
    validate: () => true, // Always allow selection
    theme: {
      style: {
        highlight: (text) => chalk.bgCyan.black.bold(text), // Cyan background with black text for clear visibility
        message: chalk.cyan.bold,
        answer: chalk.green.bold,
        disabled: chalk.gray,
        choice: (text, isSelected) => isSelected ? chalk.bgCyan.black.bold(text) : text
      }
    }
  });

  return selected;
};