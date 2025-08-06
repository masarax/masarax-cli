import fs from 'fs/promises';
import path from 'path';
import { getContents, downloadFile } from './github.js';
import ora from 'ora';
import { formatItem } from './ui.js';
import { t } from './lang/loader.js';

export const downloadRecursive = async (remotePath, downloadBase) => {
  const contents = await getContents(remotePath);
  const localPath = path.join(downloadBase, remotePath);
  
  await fs.mkdir(localPath, { recursive: true });

  for (const item of contents) {
    const itemPath = path.join(localPath, item.name);
    
    if (item.type === 'dir') {
      await downloadRecursive(item.path, downloadBase);
    } else {
      const spinner = ora(t('downloading', item.name)).start();
      try {
        await downloadFile(item.url, itemPath);
        spinner.succeed(t('download_complete', itemPath));
      } catch (error) {
        spinner.fail(t('download_failed', error.message));
      }
    }
  }
};