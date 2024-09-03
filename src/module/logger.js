import clc from "cli-color";

const getTimeStamp = () => {
  const now = new Date();
  now.setHours(now.getHours() + 3);
  const timestamp = now.toISOString().replace("T", " ").substring(0, 23);
  return `[${timestamp}]`;
};

/**
 * Logger
 * @example
 * logger.success('Success msg'); //green
 * logger.error('Error msg'); //red
 * logger.warning('Warning msg'); //yellow
 * logger.log('Just logger'); //blue
 */

const logger = {
  success: (message) =>
    console.log(
      clc.green(getTimeStamp(), "[SUCCESS] [TOKEN_SCRAPER] |", message)
    ),
  error: (message) =>
    console.log(clc.red(getTimeStamp(), "[ERROR] [TOKEN_SCRAPER] |", message)),
  warning: (message) =>
    console.log(
      clc.yellow(getTimeStamp(), "[WARNING] [TOKEN_SCRAPER] |", message)
    ),
  info: (message) =>
    console.log(clc.blue(getTimeStamp(), "[INFO] [TOKEN_SCRAPER] |", message)),
};

export default logger;