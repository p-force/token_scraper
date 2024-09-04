<br/>
<p align="center">

  <h3 align="center">Token Scraper</h3>

  <p align="center">
    Утилита для автоматического сбора токенов с сайта <a href="https://dexscreener.com/">dexscreener</a>, обходящая защиту Cloudflare, и временно сохраняющая их в Redis.
  </p>
</p>

---

## 📖 Описание

Token Scraper разработан для автоматического сбора токенов с первой страницы веб-сайта. Он использует браузер для обхода защитных механизмов, таких как Cloudflare, и сохраняет собранные данные в Redis для временного хранения. Браузер работает в бесконечном цикле с указанным интервалом перезапуска, обеспечивая непрерывную работу скрапера.

## 🛠 Технологии

- Node.js
- Puppeteer
- Redis
- Axios
- Chromium (через @sparticuz/chromium)
- Xvfb

## 🚀 Установка

1. Клонируйте репозиторий:

   ```bash
   git clone https://github.com/p-force/token_scraper.git
   ```

2. Установите зависимости:

   ```bash
   npm install
   ```

3. Создайте файл .env на основе файла env_example и заполните файл .env своими данными для подключения к базе данных Redis:
   ```bash
   cp env_example .env
   ```

## ▶️ Использование

1.  <p>Собрать <b>ссылки</b>, которые содержат в себе информацию о фильтрах и выбранном вами блокчейне.</p>
      
      - [Фильтры](https://dexscreener.com/ "находятся горизонтально н-р Last 24 hours") и [Блокчейны](https://dexscreener.com/ "слева вертикальная панель Moonshot, Solana") располагаются на <a href="https://dexscreener.com/">главной странице</a><br><br><img src="./src/img/filter_blockchain.png">

2.  <p>Добавьте ссылки в файл <a href="https://github.com/p-force/token_scraper/blob/main/src/links.json"><b>links.json</b></a>. Запись в формате "имя_токена": "ссылка". </br><b>Важно</b>: имя токена из этого файла будет совпадать с ключом для поиска в базе данных. Пример: </p>

    ```json
    {
      "solanaTrending": "https://dexscreener.com/solana/5m?rankBy=trendingScoreM5&order=desc",
      "baseTrending": "https://dexscreener.com/base/5m?rankBy=trendingScoreM5&order=desc",
      "baseTop": "https://dexscreener.com/base/5m?rankBy=volume&order=desc&minLiq=25000&min24HTxns=50",
      "solanaTop": "https://dexscreener.com/solana/5m?rankBy=volume&order=desc&minLiq=25000&min24HTxns=50"
    }
    ```

3.  <p>Необходимо создать файл <b>.env</b> и скопировать туда содержимое файла <a href="https://github.com/p-force/token_scraper/blob/main/env_example"><b></b>env_example</a></p>

      ```bash
      cp env_example .env
      ```

4. <p>Заполните поля для подключения к вашей базе Redis</p>

   ```bash
   REDIS_HOST=
   REDIS_PORT=
   REDIS_PWD=
   REDIS_USER=

   REDIS_URL=redis://REDIS_USER:REDIS_PWD@REDIS_HOST:REDIS_PORT
   ```

4. <p>Запустив код, вы сможете получить адрес токена, который находится в указанной позиции на странице(картинка ниже). Перейдя по ссылке из колонки TOKEN, справа будет 3 адреса токенов этого блокчейна. Программа будет собирать средний токен. </br> При необходимости, вы можете поменять номер <a href="https://github.com/p-force/token_scraper/blob/55ad617eb30b39422821b55eef24d93bcf6eb351/src/index.js#L9">токена</a>, чтобы получить любой из трёх доступных (где 0 — номер первого токена). <br><img src="./src/img/pfour.jpg" width="800"/> </p>


5. Важно: Не рекомендуется использовать VPN при работе с проектом, так как это может привести к блокировке IP-адреса или нарушению работы скрапера.
