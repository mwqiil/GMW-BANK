"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cardsRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const prisma_1 = require("../utils/prisma");
const security_1 = require("../utils/security");
exports.cardsRouter = (0, express_1.Router)();
function safeCard(card) {
    return { ...card, cardNumber: (0, security_1.maskCard)(card.cardNumber), cvvHash: undefined };
}
exports.cardsRouter.get('/', auth_1.auth, async (req, res) => {
    const cards = await prisma_1.prisma.card.findMany({ where: { userId: req.user.id }, include: { account: true }, orderBy: { createdAt: 'desc' } });
    res.json(cards.map(safeCard));
});
exports.cardsRouter.post('/', auth_1.auth, async (req, res) => {
    const account = await prisma_1.prisma.account.findFirst({ where: { userId: req.user.id, status: 'ACTIVE' } });
    if (!account)
        return res.status(400).json({ message: 'Активный счёт не найден' });
    const user = await prisma_1.prisma.user.findUniqueOrThrow({ where: { id: req.user.id } });
    const card = await prisma_1.prisma.card.create({
        data: {
            userId: user.id,
            accountId: account.id,
            cardNumber: (0, security_1.generateCardNumber)(),
            cardHolder: `${user.firstName} ${user.lastName}`.toUpperCase(),
            expiryDate: '08/29',
            cvvHash: await (0, security_1.hashPassword)('000')
        }
    });
    res.status(201).json(safeCard(card));
});
exports.cardsRouter.patch('/:id/block', auth_1.auth, async (req, res) => {
    const current = await prisma_1.prisma.card.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!current)
        return res.status(404).json({ message: 'Карта не найдена' });
    const card = await prisma_1.prisma.card.update({ where: { id: req.params.id }, data: { status: 'BLOCKED' } });
    res.json(safeCard(card));
});
exports.cardsRouter.patch('/:id/unblock', auth_1.auth, async (req, res) => {
    const current = await prisma_1.prisma.card.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!current)
        return res.status(404).json({ message: 'Карта не найдена' });
    const card = await prisma_1.prisma.card.update({ where: { id: req.params.id }, data: { status: 'ACTIVE' } });
    res.json(safeCard(card));
});
exports.cardsRouter.patch('/:id/limits', auth_1.auth, async (req, res) => {
    const body = zod_1.z.object({
        dailyLimit: zod_1.z.number().positive(),
        monthlyLimit: zod_1.z.number().positive()
    }).parse(req.body);
    if (body.monthlyLimit < body.dailyLimit)
        return res.status(400).json({ message: 'Месячный лимит не может быть меньше дневного' });
    const current = await prisma_1.prisma.card.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!current)
        return res.status(404).json({ message: 'Карта не найдена' });
    const card = await prisma_1.prisma.card.update({
        where: { id: req.params.id },
        data: { dailyLimit: body.dailyLimit, monthlyLimit: body.monthlyLimit }
    });
    res.json(safeCard(card));
});
