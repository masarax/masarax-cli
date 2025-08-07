import chalk from 'chalk';

export const showWelcomeBanner = () => {
  const bannerText = `
  ███╗   ███╗ █████╗ ███████╗ █████╗ ██████╗  █████╗    ██╗    ╔██╗
  ████╗ ████║██╔══██╗██╔════╝██╔══██╗██╔══██╗██╔══██╗   ╚██╗   ██╔╝
  ██╔████╔██║███████║███████╗███████║██████╔╝███████║      ╚███╔╝
  ██║╚██╔╝██║██╔══██║╚════██║██╔══██║██╔══██╗██╔══██║      ╔███╗
  ██║ ╚═╝ ██║██║  ██║███████║██║  ██║██║  ██║██║  ██║   ╔██╝   ╚██╗
  ╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝     ╚═╝
  `;

  const lines = bannerText.split('\n');
  const startColor = { r: 64, g: 93, b: 230 }; // Instagram Blue-Purple
  const endColor = { r: 131, g: 58, b: 180 };   // Instagram Purple-Pink

  lines.forEach((line, index) => {
    if (line.trim() === '') return;
    const ratio = index / (lines.length - 2); // -2 to get a better gradient range
    const r = Math.round(startColor.r + ratio * (endColor.r - startColor.r));
    const g = Math.round(startColor.g + ratio * (endColor.g - startColor.g));
    const b = Math.round(startColor.b + ratio * (endColor.b - startColor.b));
    console.log(chalk.rgb(r, g, b)(line));
  });

  console.log(chalk.cyan.bold('MASARAX CLI v1.0 | GitHub Content Downloader'));
  console.log(chalk.gray('© 2025 MASARAX Team. All rights reserved.'));
};

// Function to get appropriate icon for file type
const getFileIcon = (filename) => {
  const ext = filename.toLowerCase().split('.').pop();

  switch (ext) {
    case 'abr':
      return '🖌️';  // Brush icon for Photoshop brushes
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'webp':
      return '🖼️';  // Image icon
    case 'pdf':
      return '📕';  // PDF icon
    case 'doc':
    case 'docx':
      return '📘';  // Word document icon
    case 'xls':
    case 'xlsx':
      return '📗';  // Excel icon
    case 'ppt':
    case 'pptx':
      return '📙';  // PowerPoint icon
    case 'zip':
    case 'rar':
    case '7z':
      return '📦';  // Archive icon
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'mkv':
      return '🎬';  // Video icon
    case 'mp3':
    case 'wav':
    case 'flac':
      return '🎵';  // Audio icon
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx':
      return '📜';  // JavaScript icon
    case 'css':
    case 'scss':
    case 'sass':
      return '🎨';  // CSS icon
    case 'html':
    case 'htm':
      return '🌐';  // HTML icon
    case 'json':
      return '📋';  // JSON icon
    case 'md':
      return '📝';  // Markdown icon
    case 'txt':
      return '📄';  // Text icon
    case 'psd':
      return '🎭';  // Photoshop icon
    case 'ai':
      return '🎨';  // Illustrator icon
    case 'sketch':
      return '✏️';  // Sketch icon
    case 'fig':
      return '🎯';  // Figma icon
    default:
      return '📄';  // Default file icon
  }
};

export const formatItem = (item) => {
  const sizeMB = (item.size / (1024 * 1024)).toFixed(2);

  if (item.type === 'dir') {
    return `${chalk.cyan.bold('📁')} ${chalk.cyan.bold(item.name)} ${chalk.gray(`(dir)`)}`;
  }

  if (item.name.startsWith('@masarax/')) {
    return `${chalk.magenta('◆')} ${chalk.bold(item.name)} ${chalk.gray(`(${sizeMB} MB)`)}`;
  }

  const icon = getFileIcon(item.name);
  return `${chalk.cyan.bold(icon)} ${chalk.cyan.bold(item.name)} ${chalk.gray(`(${sizeMB} MB)`)}`;
};

export const showDownloadProgress = (filename, downloaded, total) => {
  const percent = Math.floor((downloaded / total) * 100);
  const bar = '■'.repeat(Math.floor(percent/5)).padEnd(20, '□');
  process.stdout.write(
    `\r${chalk.yellow('↳')} ${filename} ${chalk.cyan(bar)} ${percent}%`
  );
};

// Function to show download start message with border
export const showDownloadStart = (filename) => {
  console.log(chalk.gray('─'.repeat(60)));
  console.log(chalk.yellow.bold(`📥 Starting download: ${filename}`));
  console.log(chalk.gray('─'.repeat(60)));
};

// Function to show download complete message with border
export const showDownloadComplete = (filePath) => {
  console.log(chalk.gray('─'.repeat(60)));
  console.log(chalk.green.bold(`✅ Download complete: ${filePath}`));
  console.log(chalk.gray('─'.repeat(60)));
};