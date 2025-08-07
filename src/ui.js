import chalk from 'chalk';
import { t } from './lang/loader.js';

export const showWelcomeBanner = () => {
  console.log(chalk.blue(`
  ███╗   ███╗ █████╗ ███████╗ █████╗ ██████╗  █████╗    ██╗    ╔██╗
  ████╗ ████║██╔══██╗██╔════╝██╔══██╗██╔══██╗██╔══██╗   ╚██╗   ██╔╝
  ██╔████╔██║███████║███████╗███████║██████╔╝███████║      ╚███╔╝ 
  ██║╚██╔╝██║██╔══██║╚════██║██╔══██║██╔══██╗██╔══██║      ╔███╗ 
  ██║ ╚═╝ ██║██║  ██║███████║██║  ██║██║  ██║██║  ██║   ╔██╝   ╚██╗
  ╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝     ╚═╝
  `));
  console.log(chalk.cyan.bold(t('welcome_message')));
  console.log(chalk.gray(t('copyright')));
};

export const formatItem = (item) => {
  const sizeMB = (item.size / (1024 * 1024)).toFixed(2);
  
  if (item.type === 'dir') {
    return `${chalk.cyan.bold('📁')} ${chalk.cyan.bold(item.name)} ${chalk.gray(`(dir)`)}`;
  }
  
  if (item.name.startsWith('@masarax/')) {
    return `${chalk.magenta('◆')} ${chalk.bold(item.name)} ${chalk.gray(`(${sizeMB} MB)`)}`;
  }
  
  return `${chalk.cyan.bold('📄')} ${chalk.cyan.bold(item.name)} ${chalk.gray(`(${sizeMB} MB)`)}`;
};

export const showDownloadProgress = (filename, downloaded, total) => {
  const percent = Math.floor((downloaded / total) * 100);
  const bar = '■'.repeat(Math.floor(percent/5)).padEnd(20, '□');
  process.stdout.write(
    `\r${chalk.yellow('↳')} ${filename} ${chalk.cyan(bar)} ${percent}%`
  );
};