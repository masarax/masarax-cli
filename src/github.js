import fs from 'fs/promises';
import { t } from './lang/loader.js';

const REPO_OWNER = 'masarax';
const REPO_NAME = 'masarax-assets';
const API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents`;

export const getContents = async (path = '') => {
  try {
    const response = await fetch(`${API_URL}/${path}`);
    if (!response.ok) throw new Error(t('github_error', response.status));
    
    const items = await response.json();
    return items.map(item => ({
      name: item.name,
      path: item.path,
      type: item.type,
      url: item.download_url || null,
      size: item.size
    }));
  } catch (error) {
    throw new Error(t('connection_failed', error.message));
  }
};

export const downloadFile = async (url, filePath) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(t('download_failed', response.status));
    
    const buffer = await response.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(buffer));
  } catch (error) {
    throw new Error(t('file_save_error', filePath, error.message));
  }
};