import inquirer from 'inquirer';
import chalk from 'chalk';
import { getContents, downloadFile } from './github.js';
import { downloadRecursive } from './downloader.js';
import { formatItem } from './ui.js';
import { t } from './lang/loader.js';
import { changeDownloadLocation } from './configManager.js';
import ora from 'ora';
import path from 'path';
import fs from 'fs/promises';

let currentPath = '';
const history = [];

const calculateFolderSize = (items) => {
  const totalSize = items.reduce((sum, item) => 
    item.type === 'file' ? sum + item.size : sum, 0);
  return Math.ceil(totalSize / (1024 * 1024));
};

export const showMainMenu = async (config) => {
  while (true) {
    const choice = await showContentMenu(currentPath, config);
    
    if (choice === 'back') {
      if (history.length > 0) currentPath = history.pop();
      continue;
    }
    
    if (choice === 'exit') {
      console.log(t('thank_you'));
      process.exit(0);
    }
    
    if (choice === 'change_location') {
      config.downloadDir = await changeDownloadLocation();
      console.log(t('new_location_set', config.downloadDir));
      continue;
    }
    
    if (choice.type === 'dir') {
      history.push(currentPath);
      currentPath = choice.path;
      continue;
    }
    
    if (choice.type === 'file') {
      const destPath = path.join(config.downloadDir, currentPath, choice.name);
      const spinner = ora(t('downloading', choice.name)).start();
      
      try {
        await fs.mkdir(path.dirname(destPath), { recursive: true });
        await downloadFile(choice.url, destPath);
        spinner.succeed(t('download_complete', destPath));
        console.log(chalk.green.bold(t('thank_you_download')));
      } catch (error) {
        spinner.fail(t('download_failed', error.message));
      }
      continue; // Continue to show the menu
    }
    
    if (choice === 'download_all') {
      const spinner = ora(t('downloading_all')).start();
      try {
        await downloadRecursive(currentPath, config.downloadDir);
        spinner.succeed(t('all_downloaded'));
      } catch (error) {
        spinner.fail(t('download_failed', error.message));
      }
    }
  }
};

const showContentMenu = async (path, config) => {
  const contents = await getContents(path);
  
  // Sort MASARAX packages first
  contents.sort((a, b) => {
    if (a.name.startsWith('@masarax/') && !b.name.startsWith('@masarax/')) return -1;
    if (!a.name.startsWith('@masarax/') && b.name.startsWith('@masarax/')) return 1;
    return 0;
  });

  const folderSizeMB = calculateFolderSize(contents);
  const downloadAllText = t('download_all', folderSizeMB);

  const choices = contents.map(item => ({
    name: formatItem(item),
    value: item,
    short: item.name
  }));

  choices.push(
    new inquirer.Separator(),
    { 
      name: chalk.yellow(t('back')), 
      value: 'back',
      disabled: path === '' || history.length === 0
    },
    { 
      name: chalk.yellow(downloadAllText), 
      value: 'download_all' 
    },
    { 
      name: chalk.yellow(t('change_location')), 
      value: 'change_location' 
    },
    { 
      name: chalk.yellow(t('exit')), 
      value: 'exit' 
    }
  );

  const { selected } = await inquirer.prompt({
    type: 'list',
    name: 'selected',
    message: t('select_download'),
    choices,
    pageSize: 30
  });

  return selected;
};