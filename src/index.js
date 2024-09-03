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
  // await RedisManager.connect();
  while (true) {
    const objLinks = await getJsonData(); // при изменении json
    let links = Object.values(objLinks);
    // let key;

    await browserConnection(links[0]);
    // await browserConnection("chrome://flags/");
    await new Promise((resolve) => setTimeout(resolve, 10000));

    // for (let link of links) {
    //   let tokens = [];
    //   await browserConnection(link);
    // }

    // await RedisManager.setList("world", ["111", "222", "333"], "10m");
    // const response = await RedisManager.select("world");
    // logger.success(response);

    // Пауза перед следующей итерацией
    await new Promise((resolve) => setTimeout(resolve, 1 * 60 * 100000));
  }
  await browser.close();
}

startParsing();
