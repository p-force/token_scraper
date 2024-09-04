import { connect } from "./module/browser/index.js";
import logger from "./module/logger.js";
import { RedisManager } from "./module/redis/index.js";
import { getJsonData } from "./utils.js";
import { ConnectDTO } from "./module/browser/dto.js";

let page;
let browser;

async function browserConnection(link) {
  logger.info("Start of the parser...");

  const data = await connect(
    new ConnectDTO({
      customConfig: { someKey: "someValue" },
      fingerprint: false,
      turnstile: true, // resolve cloudflare
      connectOption: { optionKey: "optionValue" },
      headless: false, // +ui
    })
  );

  page = data.page;
  browser = data.browser;

  logger.info("Connected to browser");

  await page.goto(link, {
    waitUntil: "domcontentloaded",
    timeout: 5000,
  });
}

async function startParsing() {
  await RedisManager.connect();
  while (true) {
    const objLinks = await getJsonData(); // при изменении json
    let links = Object.values(objLinks);
    let key;
		let result;

    for (let link of links) {
      let task = [];
      key = link;

      await browserConnection(link);
      await new Promise((resolve) => setTimeout(resolve, 10000));
      logger.info("Connection done");

      result = await page.evaluate(() => {
        const resultArr = [];
        const table = document.querySelectorAll(
          'div[class="ds-dex-table ds-dex-table-top"] > a'
        );

        for (const item of table) {
          resultArr.push({
            address:
              item
                .querySelector("div:nth-child(1) > img:nth-of-type(2)")
                ?.getAttribute("src")
                .split(".png")[0]
                .split("tokens")[1] || null,
            link: item.getAttribute("href"),
          });
        }
        return resultArr;
      });

      logger.info(
        `Parsing addresses(${result.length}) that couldn't be collected from the main page`
      );

      for (const el of result) {
        if (el.address === null) {
          await page.goto(`https://dexscreener.com${el.link}`, {
            waitUntil: "domcontentloaded",
          });
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const resultAddresses = await page.evaluate(() => {
            const element = document.querySelectorAll(
              'a[title="Open in block explorer"]'
            )[1];
            return element.getAttribute("href").split("token/")[1] || null;
          });
          task.push(
            typeof resultAddresses === "string"
              ? resultAddresses
              : JSON.stringify(resultAddresses)
          );
        } else {
          task.push(
            typeof el.address.split("/")[2] === "string"
              ? el.address.split("/")[2]
              : JSON.stringify(el.address.split("/")[2])
          );
        }
      }
      await RedisManager.setList(
        Object.entries(objLinks).find(([_, value]) => value === key)?.[0],
        [...new Set(task)],
        "1d"
      );
      logger.info(`End of parse link: ${link}`);
      const response = await RedisManager.select(
        Object.entries(objLinks).find(([_, value]) => value === key)?.[0]
      );
      logger.success(response);

      await browser.close();
    }

    // Пауза перед следующей итерацией
    await new Promise((resolve) => setTimeout(resolve, 1 * 60 * 1000));
  }
}

startParsing();
