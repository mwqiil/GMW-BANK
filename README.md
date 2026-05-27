# G.M.W Bank
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

Это удалит старые учебные данные и создаст свежую структуру.
