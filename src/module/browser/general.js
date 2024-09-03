export function slugify(text) {
  text = String(text);
  return text
    .toUpperCase() // Преобразует текст в верхний регистр
    .toLowerCase() // Преобразует текст в нижний регистр
    .normalize("NFD") // Нормализует текст в форму Unicode NFD
    .trim() // Удаляет пробелы в начале и в конце строки
    .replace(/\s+/g, "-") // Заменяет пробелы на тире
    .replace(/[^\w\-]+/g, ""); // Удаляет все символы, кроме букв, цифр и тире
}

export const sleep = (ms) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
};

export function targetFilter({ target, skipTarget }, global_target_status) {
  if (global_target_status === false) {
    return true;
  }
  let response = false;
  try {
    response = !!target.url();
    if (
      skipTarget.find((item) => String(target.url()).indexOf(String(item)) > -1)
    ) {
      response = true;
    }
  } catch (err) {}
  return response;
}
