"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    const passwordHash = await bcrypt_1.default.hash('12345678', 10);
    const client = await prisma.user.upsert({
        where: { email: 'client@gmw.bank' },
        update: { emailVerified: true, phoneVerified: true },
        create: {
            firstName: 'Иван',
            lastName: 'Петров',
            email: 'client@gmw.bank',
            phone: '+79990000001',
            passwordHash,
            role: client_1.Role.CLIENT,
            emailVerified: true,
            phoneVerified: true,
            score: 720
        }
    });
    await prisma.user.upsert({
        where: { email: 'anna@gmw.bank' },
        update: { emailVerified: true, phoneVerified: true },
        create: {
            firstName: 'Анна',
            lastName: 'Смирнова',
            email: 'anna@gmw.bank',
            phone: '+79990000003',
            passwordHash,
            role: client_1.Role.CLIENT,
            score: 690,
            emailVerified: true,
            phoneVerified: true
        }
    });
    const anna = await prisma.user.findUniqueOrThrow({ where: { email: 'anna@gmw.bank' } });
    await prisma.user.upsert({
        where: { email: 'admin@gmw.bank' },
        update: { emailVerified: true, phoneVerified: true },
        create: {
            firstName: 'Админ',
            lastName: 'G.M.W',
            email: 'admin@gmw.bank',
            phone: '+79990000002',
            passwordHash,
            role: client_1.Role.ADMIN,
            emailVerified: true,
            phoneVerified: true,
            score: 1000
        }
    });
    const account = await prisma.account.upsert({
        where: { accountNumber: 'GMW-0001-0001' },
        update: {},
        create: { userId: client.id, accountNumber: 'GMW-0001-0001', balance: '125430', currency: 'RUB' }
    });
    const annaAccount = await prisma.account.upsert({
        where: { accountNumber: 'GMW-0001-0002' },
        update: {},
        create: { userId: anna.id, accountNumber: 'GMW-0001-0002', balance: '43000', currency: 'RUB' }
    });
    await prisma.card.upsert({
        where: { cardNumber: '4444555566664582' },
        update: {},
        create: {
            userId: client.id,
            accountId: account.id,
            cardNumber: '4444555566664582',
            cardHolder: 'IVAN PETROV',
            expiryDate: '12/29',
            cvvHash: await bcrypt_1.default.hash('123', 10),
            cardType: 'G.M.W Black',
            dailyLimit: '150000',
            monthlyLimit: '750000'
        }
    });
    await prisma.card.upsert({
        where: { cardNumber: '4444555566667777' },
        update: {},
        create: {
            userId: anna.id,
            accountId: annaAccount.id,
            cardNumber: '4444555566667777',
            cardHolder: 'ANNA SMIRNOVA',
            expiryDate: '11/29',
            cvvHash: await bcrypt_1.default.hash('123', 10),
            cardType: 'G.M.W Black'
        }
    });
    await prisma.transaction.deleteMany({
        where: {
            OR: [
                { comment: 'Стартовое пополнение G.M.W' },
                { comment: 'Перевод Анне' },
                { comment: 'Покупка в кафе' },
                { comment: 'Кешбэк G.M.W' }
            ]
        }
    });
    await prisma.transaction.createMany({
        data: [
            { receiverAccountId: account.id, amount: '10000', currency: 'RUB', type: client_1.TransactionType.TOP_UP, status: client_1.TransactionStatus.SUCCESS, category: 'Пополнение', comment: 'Стартовое пополнение G.M.W' },
            { senderAccountId: account.id, receiverAccountId: annaAccount.id, amount: '2500', currency: 'RUB', type: client_1.TransactionType.TRANSFER, status: client_1.TransactionStatus.SUCCESS, category: 'Переводы', comment: 'Перевод Анне' },
            { senderAccountId: account.id, amount: '650', currency: 'RUB', type: client_1.TransactionType.PAYMENT, status: client_1.TransactionStatus.SUCCESS, category: 'Кафе', comment: 'Покупка в кафе' },
            { receiverAccountId: account.id, amount: '150', currency: 'RUB', type: client_1.TransactionType.CASHBACK, status: client_1.TransactionStatus.SUCCESS, category: 'Бонусы', comment: 'Кешбэк G.M.W' }
        ]
    });
    await prisma.notification.create({ data: { userId: client.id, title: 'Добро пожаловать в G.M.W Bank', message: 'Ваш виртуальный счёт и карта успешно созданы.' } });
    await prisma.supportTicket.create({ data: { userId: client.id, subject: 'Вопрос по карте', message: 'Как изменить дневной лимит по карте?', status: 'OPEN' } });
    console.log('Seed completed successfully');
    console.log('Client login: client@gmw.bank / 12345678');
    console.log('Transfer test recipient: anna@gmw.bank or +79990000003');
    console.log('Admin login: admin@gmw.bank / 12345678');
}
main()
    .catch((error) => {
    console.error(error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
