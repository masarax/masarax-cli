import axios from 'axios';
import { t } from './lang/loader.js';

const NPM_REGISTRY_URL = 'https://registry.npmjs.org/@masarax/masarax-cli';

export const checkForUpdates = async () => {
  try {
    const response = await axios.get(NPM_REGISTRY_URL);
    const latestVersion = response.data['dist-tags'].latest;
    const currentVersion = process.env.npm_package_version;
    
    if (latestVersion !== currentVersion) {
      console.log(t('new_update', currentVersion, latestVersion));
    }
  } catch {
    // Fail silently
  }
};