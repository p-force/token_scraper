import redis, { createClient } from "redis";
import logger from "../logger.js";
import calculateMilliseconds from "./utils.js";
import "dotenv/config";

class Redis {
  /**
   * @type {redis.RedisClientType}
   */
  client;

  /**
   * @param {redis.RedisClientType} client
   */
  constructor(client) {
    this.client =
      client ||
      createClient({
        password: process.env.REDIS_PWD,
        socket: {
          host: process.env.REDIS_HOST,
          port: process.env.REDIS_PORT,
        },
      });
  }

  async connect() {
    try {
      logger.info(`Redis connect to REDIS`);
      await this.client.connect();
      logger.info(`Redis client is connected to ${process.env.REDIS_LINK}`);
    } catch (cause) {
      logger.error("Redis has not connected");
      logger.error(cause);
    }
  }

  /**
   * @param {Object} messageId 
   * @param {Array} messageArray 
   * @param {string} lifetime 
   */
  async setList(messageId, messageArray, lifetime) {
    const key =
      typeof messageId === "string" ? messageId : JSON.stringify(messageId);
    const stack = this.client.multi();

    // Удалить существующий список или данные по этому ключу перед добавлением новых элементов
    stack.del(key);

    for (let item of messageArray) {
      stack.rPush(key, item);
    }

    if (lifetime) {
      const lifetimeSeconds = calculateMilliseconds(lifetime)?.timestamp / 1;
      stack.expire(key, lifetimeSeconds);
    }

    await stack.exec();
  }

  /**
   * @param  {Object} key
   * @returns {Object} list
   */
  async select(key) {
    const parse_key = typeof key === "string" ? key : JSON.stringify(key);

    const list = await this.client.lRange(parse_key, 0, -1);

    if (!list.length) {
      return;
    }

    logger.info(`${key} selected from cache`);
    return list;
  }
}

export const RedisManager = new Redis();
