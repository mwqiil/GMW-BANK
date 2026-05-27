# G.M.W Bank — fullstack учебный цифровой банк на JavaScript

В проекте есть реальная PostgreSQL-база пользователей, счетов, карт, переводов, заявок поддержки и аналитики. Frontend и backend переведены с TypeScript на JavaScript: файлы React имеют расширение `.jsx`, backend-файлы — `.js`.

## Что работает

- регистрация пользователей с сохранением email и телефона в таблице `User`;
- уникальность email и телефона;
- перевод по email или телефону другого зарегистрированного пользователя;
- пополнение карты/счёта;
- изменение лимитов карты;
- Google Authenticator 2FA через QR-код;
- подтверждение email кодом;
- отправка email-кода через SMTP на Gmail/другую почту;
- админ-панель с реальными пользователями, транзакциями, статистикой и заявками поддержки;
- поддержка: клиент создаёт заявку, админ видит её в админ-панели.

## Важное ограничение

Проект не создаёт новые Gmail-аккаунты автоматически. Это невозможно и не нужно для банковского проекта: пользователь указывает уже существующую почту, а банк отправляет на неё код подтверждения.

## Запуск

В корне проекта:

```powershell
docker compose up -d
```

Backend:

```powershell
cd backend
copy .env.example .env
npm install
npm run prisma:generate
npx prisma db push --force-reset
npm run prisma:seed
npm run dev
```

Frontend во втором терминале:

```powershell
cd frontend
npm install
npm run dev
```

Открыть:

```text
http://localhost:5173
```

Проверка backend:

```text
http://localhost:4000/api/health
```

## Демо-аккаунты

Клиент:

```text
client@gmw.bank / 12345678
```

Получатель для перевода:

```text
anna@gmw.bank
+79990000003
```

Админ:

```text
admin@gmw.bank / 12345678
```

## Реальная отправка писем на Gmail

В файле `backend/.env` укажи SMTP. Для Gmail нужен пароль приложения Google, а не обычный пароль.

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-gmail@gmail.com"
SMTP_PASS="your_google_app_password"
MAIL_FROM="G.M.W Bank <your-gmail@gmail.com>"
```

Где взять пароль приложения: Google Account → Security → 2-Step Verification → App passwords.

Если SMTP не настроен, проект не падает: код подтверждения будет показан в терминале backend в dev-режиме.

## После замены старой версии проекта

Если база конфликтует со старой схемой:

```powershell
cd backend
npx prisma db push --force-reset
npm run prisma:seed
npm run dev
```

Это удалит старые учебные данные и создаст свежую структуру.
