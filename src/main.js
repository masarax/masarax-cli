import { execSync } from 'child_process';
import os from 'os';
import { showWelcomeBanner } from './ui.js';
import { checkForUpdates } from './updateChecker.js';
import { initConfig } from './configManager.js';
import { showMainMenu } from './menu.js';

const main = async () => {
  if (os.platform() === 'win32') {
    try {
      execSync('chcp 65001');
    } catch (e) {
      // Ignore error if chcp is not available
    }
  }
  showWelcomeBanner();
  await checkForUpdates();
  
  const config = await initConfig();
  await showMainMenu(config);
};

export default main;