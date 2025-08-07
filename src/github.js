import fs from 'fs/promises';
import axios from 'axios';

const REPO_OWNER = 'masarax';
const REPO_NAME = 'masarax-assets';
const API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents`;

// Function to extract actual file size from LFS pointer
const getActualSizeFromLFS = (content) => {
  const sizeMatch = content.match(/size (\d+)/);
  return sizeMatch ? parseInt(sizeMatch[1], 10) : null;
};

// Fallback data when GitHub API is rate limited
const getFallbackContents = (path) => {
  if (path === '' || path === '/') {
    return [
      {
        name: 'brushes',
        path: 'brushes',
        type: 'dir',
        url: null,
        size: 0
      }
    ];
  }

  if (path === 'brushes') {
    return [
      {
        name: 'Brushpack-Lighting.abr',
        path: 'brushes/Brushpack-Lighting.abr',
        type: 'file',
        url: `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/brushes/Brushpack-Lighting.abr`,
        size: 5253910
      },
      {
        name: 'Brushpack-Lighting.jpg',
        path: 'brushes/Brushpack-Lighting.jpg',
        type: 'file',
        url: `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/brushes/Brushpack-Lighting.jpg`,
        size: 194095
      },
      {
        name: 'MasaraX - Blood Brushes.abr',
        path: 'brushes/MasaraX - Blood Brushes.abr',
        type: 'file',
        url: `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/brushes/MasaraX - Blood Brushes.abr`,
        size: 75978840
      },
      {
        name: 'MasaraX - Blood Brushes.jpg',
        path: 'brushes/MasaraX - Blood Brushes.jpg',
        type: 'file',
        url: `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/brushes/MasaraX - Blood Brushes.jpg`,
        size: 342394
      },
      {
        name: 'MasaraX - Bubble Wrap Brushes.abr',
        path: 'brushes/MasaraX - Bubble Wrap Brushes.abr',
        type: 'file',
        url: `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/brushes/MasaraX - Bubble Wrap Brushes.abr`,
        size: 1014325248
      },
      {
        name: 'MasaraX - Cloud Brushes.abr',
        path: 'brushes/MasaraX - Cloud Brushes.abr',
        type: 'file',
        url: `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/brushes/MasaraX - Cloud Brushes.abr`,
        size: 232651776
      }
    ];
  }

  return [];
};

export const getContents = async (path = '') => {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(`${API_URL}/${path}`, {
        headers: {
          'User-Agent': 'masarax-cli/1.0.9',
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (response.status === 403) {
        const resetTime = response.headers.get('x-ratelimit-reset');
        if (resetTime) {
          const waitTime = (parseInt(resetTime) * 1000) - Date.now();
          if (waitTime > 0 && waitTime < 30000 && attempt < maxRetries) { // Wait max 30 seconds
            console.log(`Rate limit exceeded. Waiting ${Math.ceil(waitTime/1000)} seconds...`);
            await new Promise(resolve => setTimeout(resolve, waitTime + 1000));
            continue;
          }
        }

        // If rate limit exceeded and can't wait, try alternative approach
        if (attempt === maxRetries) {
          console.log('GitHub API rate limit exceeded. Using alternative data source...');
          return getFallbackContents(path);
        }

        throw new Error(`GitHub API rate limit exceeded. Retrying... (${attempt}/${maxRetries})`);
      }

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} - ${response.statusText}`);
      }

      const items = await response.json();

    // Get actual file sizes for files by checking for LFS pointers
    const itemsWithActualSizes = await Promise.all(
      items.map(async (item) => {
        if (item.type === 'file') {
          const downloadUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${item.path}`;

          // If file size is very small (likely LFS pointer), check for actual size
          // Skip text files like .md, .txt, .json etc.
          if (item.size < 200 && !item.name.match(/\.(md|txt|json|js|css|html|xml|yml|yaml)$/i)) {
            try {
              const response = await fetch(downloadUrl);
              const content = await response.text();

              // Check if it's an LFS pointer and extract actual size
              const actualSize = getActualSizeFromLFS(content);
              if (actualSize) {
                return {
                  name: item.name,
                  path: item.path,
                  type: item.type,
                  url: downloadUrl,
                  size: actualSize
                };
              }
            } catch (error) {
              // If LFS check fails, use original size
            }
          }

          return {
            name: item.name,
            path: item.path,
            type: item.type,
            url: downloadUrl,
            size: item.size
          };
        } else {
          return {
            name: item.name,
            path: item.path,
            type: item.type,
            url: null,
            size: item.size
          };
        }
      })
    );

    return itemsWithActualSizes;
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries) {
        throw new Error(t('connection_failed', error.message));
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  throw new Error(t('connection_failed', lastError?.message || 'Unknown error'));
};

export const downloadFile = async (url, filePath) => {
  try {
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'arraybuffer', // Important for binary data
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 60000, // 60 second timeout for large files
      headers: {
        'Accept': '*/*',
        'User-Agent': 'masarax-cli/1.0.9'
      }
    });

    const downloadedData = Buffer.from(response.data);

    // Check if this is an LFS pointer file (small size and contains LFS content)
    if (downloadedData.length < 200) {
      const content = downloadedData.toString('utf8');
      const actualSize = getActualSizeFromLFS(content);

      if (actualSize) {
        // This is an LFS pointer, we need to download from GitHub LFS
        console.log(`LFS file detected: ${filePath}, Expected size: ${(actualSize / (1024 * 1024)).toFixed(2)} MB`);

        // For GitHub LFS files, we need to use the GitHub LFS API
        // Extract the OID from the LFS pointer
        const oidMatch = content.match(/oid sha256:([0-9a-f]{64})/);
        if (oidMatch) {
          const oid = oidMatch[1];

          // Try to download from GitHub LFS endpoint
          const lfsUrl = `https://github.com/${REPO_OWNER}/${REPO_NAME}.git/info/lfs/objects/batch`;

          try {
            // Request the actual download URL from GitHub LFS
            const lfsResponse = await axios({
              method: 'post',
              url: lfsUrl,
              data: {
                operation: 'download',
                transfers: ['basic'],
                objects: [{ oid: oid, size: actualSize }]
              },
              headers: {
                'Accept': 'application/vnd.git-lfs+json',
                'Content-Type': 'application/vnd.git-lfs+json',
                'User-Agent': 'masarax-cli/1.0.9'
              }
            });

            if (lfsResponse.data.objects && lfsResponse.data.objects[0] && lfsResponse.data.objects[0].actions && lfsResponse.data.objects[0].actions.download) {
              const downloadUrl = lfsResponse.data.objects[0].actions.download.href;

              // Download the actual file from LFS
              const actualFileResponse = await axios({
                method: 'get',
                url: downloadUrl,
                responseType: 'arraybuffer',
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
                timeout: 120000, // 2 minute timeout for very large files
                headers: lfsResponse.data.objects[0].actions.download.header || {}
              });

              const actualFileData = Buffer.from(actualFileResponse.data);
              console.log(`Successfully downloaded LFS file: ${actualFileData.length} bytes`);
              await fs.writeFile(filePath, actualFileData);
              return;
            }
          } catch (lfsError) {
            console.log(`LFS download failed, falling back to pointer file: ${lfsError.message}`);
          }
        }
      }
    }

    // For regular files or if LFS download failed, save the downloaded data
    await fs.writeFile(filePath, downloadedData);

  } catch (error) {
    throw new Error(t('file_save_error', filePath, error.message));
  }
};
