import fs from 'fs/promises';
import path from 'path';
import { getContents, downloadFile } from './github.js';
import ora from 'ora';

export const downloadRecursive = async (remotePath, downloadBase) => {
  const contents = await getContents(remotePath);
  const localPath = path.join(downloadBase, remotePath);
  
  await fs.mkdir(localPath, { recursive: true });

  for (const item of contents) {
    const itemPath = path.join(localPath, item.name);
    
    if (item.type === 'dir') {
      await downloadRecursive(item.path, downloadBase);
    } else {
      const spinner = ora(`Downloading: ${item.name}`).start();
      try {
        await downloadFile(item.url, itemPath);
        spinner.succeed(`Download complete: ${itemPath}`);
      } catch (error) {
        spinner.fail(`Download failed: ${error.message}`);
      }
    }
  }
};