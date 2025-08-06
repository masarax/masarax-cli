import { showWelcomeBanner } from './ui.js';
import { checkForUpdates } from './updateChecker.js';
import { initConfig } from './configManager.js';
import { showMainMenu } from './menu.js';

const main = async () => {
  showWelcomeBanner();
  await checkForUpdates();
  
  const config = await initConfig();
  await showMainMenu(config);
};

export default main;