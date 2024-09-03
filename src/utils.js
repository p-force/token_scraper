import fs, { link } from "fs";
import path from "path";
import { fileURLToPath } from "url";

export async function getJsonData() {
  try {
    // Получаем текущий файл и директорию
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, "links.json");

    const data = await fs.readFileSync(filePath, "utf-8");
    const jsonData = JSON.parse(data);

    return jsonData;
  } catch (err) {
    console.error("Ошибка чтения файла:", err);
  }
}
