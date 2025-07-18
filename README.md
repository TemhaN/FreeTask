# 💼 FreeTask

**FreeTask** — веб-приложение на **React** для фрилансеров и клиентов.  
Позволяет искать исполнителей, управлять заказами и командами, вести портфолио, оставлять отзывы и смотреть аналитику.  
Приятный адаптивный интерфейс с анимациями (Framer Motion) и стилями на Tailwind CSS.

## ✨ Возможности

- 🔐 **Аутентификация**: регистрация, вход, сброс пароля, верификация email, Google OAuth.
- 👤 **Профиль**: редактирование биографии, навыков, аватара; рейтинг, уровни (Новичок → Эксперт).
- 📁 **Портфолио**: добавление/удаление работ с описаниями, изображениями и видео.
- 📝 **Отзывы**: добавление отзывов, просмотр рейтингов (звёздочки, конечно же).
- 👥 **Команды**: создание команд, просмотр и управление составом и навыками.
- 📊 **Аналитика**: статистика заказов, доходов, последние проекты.
- 🎨 **Интерфейс**: современный дизайн, анимации (Framer Motion), стилизация через Tailwind CSS.

## 📋 Требования

- Node.js 16+
- Любой современный браузер (Chrome, Firefox, Safari)
- Доступ к **FreeTask API** (бэкенд)

## 🧩 Зависимости

| Библиотека / Технология | Назначение |
|-------------------------|------------|
| `React`                 | UI-рендеринг |
| `React Router`          | Навигация |
| `Tailwind CSS`          | Стили |
| `Framer Motion`         | Анимации |
| `Axios`                 | HTTP-запросы |
| `jwt-decode`            | Декодирование JWT |
| `lodash`                | Утилиты (debounce и т.д.) |
| `prop-types`            | Проверка типов props |

Полный список — смотри в [`package.json`](./package.json).

## 🚀 Установка и запуск

### 1. Клонируй репозиторий
```bash
git clone https://github.com/TemhaN/FreeTask.git
cd FreeTask
````

### 2. Установи зависимости

```bash
npm install
```

### 3. Создай файл конфигурации

Создай `src/api/api.js`:

```js
export const API_BASE_URL = 'https://your-api-host.com';
export const FILE_BASE_URL = 'https://your-file-host.com';
```

> ⚠️ Укажи актуальные URL для API и файлового хранилища.

### 4. Запусти приложение

```bash
npm start
```

Открой браузер: [http://localhost:3000](http://localhost:3000)

## 🖱️ Использование

### 🔐 Аутентификация

| Маршрут           | Назначение                                |
| ----------------- | ----------------------------------------- |
| `/login`          | Вход                                      |
| `/register`       | Регистрация (роль, email, пароль, Google) |
| `/reset-password` | Сброс пароля                              |

### 👤 Профиль

| Маршрут    | Назначение                                            |
| ---------- | ----------------------------------------------------- |
| `/profile` | Просмотр и редактирование профиля                     |
|            | Управление портфолио, аналитикой, отзывами, командами |

### 👥 Команды

| Маршрут     | Назначение               |
| ----------- | ------------------------ |
| `/teams`    | Список и создание команд |
| `/team/:id` | Страница команды         |

### 📁 Портфолио / 📝 Отзывы

* Добавление / удаление работ (изображения, видео)
* Просмотр и публикация отзывов с рейтингом

## 📦 Сборка

### Релиз:

```bash
npm run build
```

Файлы будут в папке `build/`.

### Развёртывание:

* Скопируй `build/` на сервер (например, через FTP, SCP, rsync)
* Убедись, что API и файловый сервер доступны по указанным URL
* Настрой CORS и HTTPS при необходимости

## 📸 Скриншоты

<div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
  <img src="https://github.com/TemhaN/FreeTask/blob/main/Screenshots/1.png?raw=true" alt="FreeTask" width="30%">
  <img src="https://github.com/TemhaN/FreeTask/blob/main/Screenshots/2.png?raw=true" alt="FreeTask" width="30%">
  <img src="https://github.com/TemhaN/FreeTask/blob/main/Screenshots/3.png?raw=true" alt="FreeTask" width="30%">
  <img src="https://github.com/TemhaN/FreeTask/blob/main/Screenshots/4.png?raw=true" alt="FreeTask" width="30%">
  <img src="https://github.com/TemhaN/FreeTask/blob/main/Screenshots/5.png?raw=true" alt="FreeTask" width="30%">
  <img src="https://github.com/TemhaN/FreeTask/blob/main/Screenshots/6.png?raw=true" alt="FreeTask" width="30%">
  <img src="https://github.com/TemhaN/FreeTask/blob/main/Screenshots/7.png?raw=true" alt="FreeTask" width="30%">
  <img src="https://github.com/TemhaN/FreeTask/blob/main/Screenshots/8.png?raw=true" alt="FreeTask" width="30%">
  <img src="https://github.com/TemhaN/FreeTask/blob/main/Screenshots/9.png?raw=true" alt="FreeTask" width="30%">
  <img src="https://github.com/TemhaN/FreeTask/blob/main/Screenshots/10.png?raw=true" alt="FreeTask" width="30%">
  <img src="https://github.com/TemhaN/FreeTask/blob/main/Screenshots/11.png?raw=true" alt="FreeTask" width="30%">
  <img src="https://github.com/TemhaN/FreeTask/blob/main/Screenshots/12.png?raw=true" alt="FreeTask" width="30%">
  <img src="https://github.com/TemhaN/FreeTask/blob/main/Screenshots/13.png?raw=true" alt="FreeTask" width="30%">
  <img src="https://github.com/TemhaN/FreeTask/blob/main/Screenshots/14.png?raw=true" alt="FreeTask" width="30%">
  <img src="https://github.com/TemhaN/FreeTask/blob/main/Screenshots/15.png?raw=true" alt="FreeTask" width="30%">
  <img src="https://github.com/TemhaN/FreeTask/blob/main/Screenshots/16.png?raw=true" alt="FreeTask" width="30%">
  <img src="https://github.com/TemhaN/FreeTask/blob/main/Screenshots/17.png?raw=true" alt="FreeTask" width="30%">
  <img src="https://github.com/TemhaN/FreeTask/blob/main/Screenshots/18.png?raw=true" alt="FreeTask" width="30%">
</div>    

## 🧠 Автор

**TemhaN**  
[GitHub профиль](https://github.com/TemhaN)

## 🧾 Лицензия

Проект распространяется под лицензией [MIT License].

## 📬 Обратная связь

Нашли баг или хотите предложить улучшение?
Создайте **issue** или присылайте **pull request** в репозиторий!

## ⚙️ Технологии

* **React** — создание интерфейса
* **React Router** — маршрутизация
* **Tailwind CSS** — стили
* **Framer Motion** — анимации
* **Axios** — API-запросы
* **JWT** — авторизация через токены
* **Lodash** — полезные утилиты
