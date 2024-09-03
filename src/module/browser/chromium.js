import { launch } from "chrome-launcher";
import chromium from "@sparticuz/chromium";
import CDP from "chrome-remote-interface";
import axios from "axios";
import Xvfb from "xvfb";
import { slugify } from "./general.js";
import logger from "../logger.js";


export const closeSession = async ({ xvfbsession, cdpSession, chrome }) => {
  if (xvfbsession) {
    try {
      //xvfbsession - виртуальный фреймбуфер для Linux, сессия останавливается
      xvfbsession.stopSync();
    } catch (err) {}
  }
  if (cdpSession) {
    try {
      // закрывает сессию, созданную с помощью chrome-remote-interface
      await cdpSession.close();
    } catch (err) {}
  }
  if (chrome) {
    try {
      // завершает процесс Chrome
      await chrome.kill();
    } catch (err) {}
  }
  return true;
};

export const startSession = ({
  args = [],
  headless = "auto",
  customConfig = {},
}) => {
  return new Promise(async (resolve, reject) => {
    try {
      let xvfbsession = null;
      // Устанавливается путь к исполняемому файлу Chrome, который может быть передан через customConfig или использует путь к Chromium
      let chromePath =
        customConfig.executablePath || customConfig.chromePath || chromium.path;

      // В зависимости от операционной системы и режима headless выводятся предупреждения о стабильности работы.
      if (slugify(process.platform).includes("linux") && headless === false) {
        logger.error(
          "This library is stable with headless: true in linuxt environment and headless: false in Windows environment. Please send headless: 'auto' for the library to work efficiently."
        );
      } else if (
        slugify(process.platform).includes("win") &&
        headless === true
      ) {
        logger.error(
          "This library is stable with headless: true in linuxt environment and headless: false in Windows environment. Please send headless: 'auto' for the library to work efficiently."
        );
      }

      if (headless === "auto") {
        headless = slugify(process.platform).includes("linux") ? true : false;
      }
      const chromeFlags = [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
      ].concat(args);

      if (headless === true) {
        slugify(process.platform).includes("win")
          ? chromeFlags.push("--headless=new")
          : "";
      }

      // if (proxy && proxy.host && proxy.host.length > 0) {
      //   chromeFlags.push(`--proxy-server=${proxy.host}:${proxy.port}`);
      // }

      // Если используется Linux, а режим headless отключен, запускается виртуальный фреймбуфер Xvfb для поддержки графического интерфейса.
      if (process.platform === "linux") {
        try {
          let xvfbsession = new Xvfb({
            silent: true,
            xvfb_args: ["-screen", "0", "1920x1080x24", "-ac"],
          });
          xvfbsession.startSync();
        } catch (err) {
          logger.error(
            "You are running on a Linux platform but do not have xvfb installed. The browser can be captured. Please install it with the following command\n\nsudo apt-get install xvfb\n\n" +
              err.message
          );
        }
      }

      // Chrome запускается с нужными флагами командной строки и прокси-настройками.
      let chrome = await launch({
        chromePath,
        chromeFlags,
        ...customConfig,
      });

      // С помощью chrome-remote-interface устанавливается соединение с запущенным экземпляром Chrome.
      let cdpSession = await CDP({ port: chrome.port });
      const { Network, Page, Runtime, DOM } = cdpSession;
      await Promise.all([
        Page.enable(),
        Page.setLifecycleEventsEnabled({ enabled: true }),
        Runtime.enable(),
        Network.enable(),
        DOM.enable(),
      ]);

      // С помощью HTTP-запроса через axios получает WebSocket endpoint для дальнейшего подключения Puppeteer или других клиентов.
      let chromeSession = await axios
        .get("http://localhost:" + chrome.port + "/json/version")
        .then((response) => {
          response = response.data;
          return {
            browserWSEndpoint: response.webSocketDebuggerUrl,
            agent: response["User-Agent"],
          };
        })
        .catch((err) => {
          throw new Error(err.message);
        });

      // Функция возвращает объект, содержащий сессии chromeSession, cdpSession, сам процесс chrome и, если применимо, xvfbsession.
      return resolve({
        chromeSession: chromeSession,
        cdpSession: cdpSession,
        chrome: chrome,
        xvfbsession: xvfbsession,
      });
    } catch (err) {
      logger.error(err);
      throw new Error(err.message);
    }
  });
};
