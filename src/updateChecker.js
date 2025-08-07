import axios from 'axios';
import { t } from './lang/loader.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

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
      console.log(t('new_update', currentVersion, latestVersion));
    }
  } catch (error) {
    // Fail silently or log error for debugging
    console.error("Error checking for updates:", error.message);
  }
};