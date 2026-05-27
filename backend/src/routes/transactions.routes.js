"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionsRouter = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const prisma_1 = require("../utils/prisma");
const security_1 = require("../utils/security");
exports.transactionsRouter = (0, express_1.Router)();
async function requireVerifiedUser(userId) {
    const user = await prisma_1.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (!user.emailVerified || !user.phoneVerified) {
        return {
            ok: false,
            message: 'Для пополнения и переводов нужно подтвердить почту и телефон',
            emailVerified: user.emailVerified,
            phoneVerified: user.phoneVerified
        };
    }
    return { ok: true, user };
}
exports.transactionsRouter.get('/', auth_1.auth, async (req, res) => {
    const accounts = await prisma_1.prisma.account.findMany({ where: { userId: req.user.id }, select: { id: true } });
    const ids = accounts.map((a) => a.id);
    const transactions = await prisma_1.prisma.transaction.findMany({
        where: { OR: [{ senderAccountId: { in: ids } }, { receiverAccountId: { in: ids } }] },
        orderBy: { createdAt: 'desc' }
    });
    res.json(transactions);
});
const transferSchema = zod_1.z.object({
    senderAccountId: zod_1.z.string(),
    receiverAccountId: zod_1.z.string(),
    amount: zod_1.z.number().positive(),
    comment: zod_1.z.string().optional()
});
exports.transactionsRouter.post('/transfer', auth_1.auth, async (req, res) => {
    const verified = await requireVerifiedUser(req.user.id);
    if (!verified.ok)
        return res.status(403).json(verified);
    const data = transferSchema.parse(req.body);
    if (data.senderAccountId === data.receiverAccountId)
        return res.status(400).json({ message: 'Нельзя перевести самому себе' });
    const sender = await prisma_1.prisma.account.findFirst({ where: { id: data.senderAccountId, userId: req.user.id, status: 'ACTIVE' } });
    const receiver = await prisma_1.prisma.account.findFirst({ where: { id: data.receiverAccountId, status: 'ACTIVE' } });
    if (!sender || !receiver)
        return res.status(404).json({ message: 'Счёт не найден' });
    if (Number(sender.balance) < data.amount)
        return res.status(400).json({ message: 'Недостаточно средств' });
    const result = await prisma_1.prisma.$transaction(async (tx) => {
        await tx.account.update({ where: { id: sender.id }, data: { balance: { decrement: new client_1.Prisma.Decimal(data.amount) } } });
        await tx.account.update({ where: { id: receiver.id }, data: { balance: { increment: new client_1.Prisma.Decimal(data.amount) } } });
        return tx.transaction.create({ data: { senderAccountId: sender.id, receiverAccountId: receiver.id, amount: data.amount, type: 'TRANSFER', category: 'Переводы', comment: data.comment } });
    });
    res.status(201).json(result);
});
const recipientTransferSchema = zod_1.z.object({
    senderAccountId: zod_1.z.string(),
    recipient: zod_1.z.string().min(3),
    amount: zod_1.z.number().positive(),
    comment: zod_1.z.string().optional()
});
exports.transactionsRouter.post('/transfer-recipient', auth_1.auth, async (req, res) => {
    const verified = await requireVerifiedUser(req.user.id);
    if (!verified.ok)
        return res.status(403).json(verified);
    const data = recipientTransferSchema.parse(req.body);
    const recipientKey = data.recipient.includes('@') ? data.recipient.toLowerCase().trim() : (0, security_1.normalizePhone)(data.recipient);
    const sender = await prisma_1.prisma.account.findFirst({ where: { id: data.senderAccountId, userId: req.user.id, status: 'ACTIVE' } });
    if (!sender)
        return res.status(404).json({ message: 'Счёт списания не найден' });
    const receiverUser = await prisma_1.prisma.user.findFirst({
        where: { OR: [{ email: recipientKey }, { phone: recipientKey }] },
        include: { accounts: { where: { status: 'ACTIVE' }, take: 1 } }
    });
    if (!receiverUser || receiverUser.accounts.length === 0)
        return res.status(404).json({ message: 'Получатель по почте или телефону не найден' });
    if (receiverUser.id === req.user.id)
        return res.status(400).json({ message: 'Нельзя перевести самому себе' });
    if (Number(sender.balance) < data.amount)
        return res.status(400).json({ message: 'Недостаточно средств' });
    const receiver = receiverUser.accounts[0];
    const result = await prisma_1.prisma.$transaction(async (tx) => {
        await tx.account.update({ where: { id: sender.id }, data: { balance: { decrement: new client_1.Prisma.Decimal(data.amount) } } });
        await tx.account.update({ where: { id: receiver.id }, data: { balance: { increment: new client_1.Prisma.Decimal(data.amount) } } });
        const transaction = await tx.transaction.create({
            data: {
                senderAccountId: sender.id,
                receiverAccountId: receiver.id,
                amount: data.amount,
                type: 'TRANSFER',
                category: 'Переводы',
                comment: data.comment || `Перевод пользователю ${receiverUser.firstName} ${receiverUser.lastName}`
            }
        });
        await tx.notification.create({
            data: {
                userId: receiverUser.id,
                title: 'Входящий перевод',
                message: `Вам поступил перевод ${data.amount.toLocaleString('ru-RU')} ₽`
            }
        });
        return transaction;
    });
    res.status(201).json({ ...result, receiver: { firstName: receiverUser.firstName, lastName: receiverUser.lastName, email: receiverUser.email, phone: receiverUser.phone } });
});
exports.transactionsRouter.post('/top-up', auth_1.auth, async (req, res) => {
    const verified = await requireVerifiedUser(req.user.id);
    if (!verified.ok)
        return res.status(403).json(verified);
    const { accountId, amount } = req.body;
    if (!amount || amount <= 0)
        return res.status(400).json({ message: 'Некорректная сумма' });
    const account = await prisma_1.prisma.account.findFirst({ where: { id: accountId, userId: req.user.id, status: 'ACTIVE' } });
    if (!account)
        return res.status(404).json({ message: 'Счёт не найден' });
    const result = await prisma_1.prisma.$transaction(async (tx) => {
        await tx.account.update({ where: { id: account.id }, data: { balance: { increment: new client_1.Prisma.Decimal(amount) } } });
        return tx.transaction.create({ data: { receiverAccountId: account.id, amount, type: 'TOP_UP', category: 'Пополнение', comment: 'Виртуальное пополнение счёта' } });
    });
    res.status(201).json(result);
});
exports.transactionsRouter.post('/top-up-card', auth_1.auth, async (req, res) => {
    const verified = await requireVerifiedUser(req.user.id);
    if (!verified.ok)
        return res.status(403).json(verified);
    const schema = zod_1.z.object({ cardId: zod_1.z.string(), amount: zod_1.z.number().positive() });
    const { cardId, amount } = schema.parse(req.body);
    const card = await prisma_1.prisma.card.findFirst({ where: { id: cardId, userId: req.user.id, status: 'ACTIVE' }, include: { account: true } });
    if (!card || card.account.status !== 'ACTIVE')
        return res.status(404).json({ message: 'Активная карта не найдена' });
    const result = await prisma_1.prisma.$transaction(async (tx) => {
        await tx.account.update({ where: { id: card.accountId }, data: { balance: { increment: new client_1.Prisma.Decimal(amount) } } });
        return tx.transaction.create({ data: { receiverAccountId: card.accountId, amount, type: 'TOP_UP', category: 'Пополнение', comment: `Пополнение карты **** ${card.cardNumber.slice(-4)}` } });
    });
    res.status(201).json(result);
});
