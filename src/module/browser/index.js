import { startSession, closeSession } from "./chromium.js";
import { targetFilter } from "./general.js";
import { sleep } from "./general.js";
import { checkStat } from "./turnstile.js";
import logger from "../logger.js";
import puppeteer from "puppeteer-extra";


export const connect = (options) => {
  return new Promise(async (resolve, reject) => {
    let global_target_status = false;
    const setTarget = ({ status = true }) => {
      global_target_status = status;
    };

    const { chromeSession, cdpSession, chrome, xvfbsession } =
      await startSession({
        args: options.args,
        headless: options.headless,
        customConfig: options.customConfig,
      });

    const browser = await puppeteer.connect({
      targetFilter: (target) =>
        targetFilter(
          { target: target, skipTarget: options.skipTarget },
          global_target_status
        ),
      browserWSEndpoint: chromeSession.browserWSEndpoint,
      ...options.connectOption,
    });

    let page = await browser.pages();

    page = page[0];

    setTarget({ status: true });

    // if (proxy && proxy.username && proxy.username.length > 0) {
    //   await page.authenticate({
    //     username: proxy.username,
    //     password: proxy.password,
    //   });
    // }

    let solve_status = true;

    const setSolveStatus = ({ status }) => {
      solve_status = status;
    };

    const autoSolve = ({ page }) => {
      return new Promise(async (resolve, reject) => {
        while (solve_status) {
          try {
            await sleep(1500);
            await checkStat({ page: page }).catch((err) => {});
          } catch (err) {}
        }
        resolve();
      });
    };

    // if (options.fingerprint === true) {
    //   handleNewPage({ page: page, config: options.fpconfig });
    // }
    if (options.turnstile === true) {
      setSolveStatus({ status: true });
      autoSolve({ page: page, browser: browser });
    }

    await page.setUserAgent(chromeSession.agent);

    await page.setViewport({
      width: 1920,
      height: 1080,
    });

    // Устанавливается обработчик события disconnected, которое срабатывает, когда сессия браузера завершается или разрывается соединение с Puppeteer
    browser.on("disconnected", async () => {
      logger.info("Browser Closed");
      try {
        setSolveStatus({ status: false });
      } catch (err) {}
      await closeSession({
        xvfbsession: xvfbsession,
        cdpSession: cdpSession,
        chrome: chrome,
      }).catch((err) => {
        logger.error(err.message);
      });
    });

    // Устанавливается обработчик события targetcreated. Это событие срабатывает каждый раз, когда создается новая цель (target) в браузере. Целью может быть, новая страница, открытая вкладка, фрейм или другой объект, с которым Puppeteer может взаимодействовать.
    browser.on("targetcreated", async (target) => {
      var newPage = await target.page();

      try {
        await newPage.setUserAgent(chromeSession.agent);
      } catch (err) {
        // logger.error(err.message);
      }

      try {
        await newPage.setViewport({
          width: 1920,
          height: 1080,
        });
      } catch (err) {
        // logger.error(err.message);
      }

      // if (newPage && options.fingerprint === true) {
      //   try {
      //     handleNewPage({ page: newPage, config: options.fpconfig });
      //   } catch (err) {}
      // }

      if (options.turnstile === true) {
        autoSolve({ page: newPage });
      }
    });

    resolve({
      browser: browser,
      page: page,
      xvfbsession: xvfbsession,
      cdpSession: cdpSession,
      chrome: chrome,
      setTarget: setTarget,
    });
  });
};
