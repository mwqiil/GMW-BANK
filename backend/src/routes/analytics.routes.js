"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const prisma_1 = require("../utils/prisma");
exports.analyticsRouter = (0, express_1.Router)();
async function userAccountIds(userId) {
    const accounts = await prisma_1.prisma.account.findMany({ where: { userId }, select: { id: true } });
    return accounts.map((a) => a.id);
}
exports.analyticsRouter.get('/summary', auth_1.auth, async (req, res) => {
    const ids = await userAccountIds(req.user.id);
    const transactions = await prisma_1.prisma.transaction.findMany({
        where: { OR: [{ senderAccountId: { in: ids } }, { receiverAccountId: { in: ids } }] }
    });
    let income = 0;
    let expenses = 0;
    let cashback = 0;
    for (const tx of transactions) {
        const amount = Number(tx.amount);
        if (tx.receiverAccountId && ids.includes(tx.receiverAccountId))
            income += amount;
        if (tx.senderAccountId && ids.includes(tx.senderAccountId))
            expenses += amount;
        if (tx.type === 'CASHBACK')
            cashback += amount;
    }
    const user = await prisma_1.prisma.user.findUnique({ where: { id: req.user.id }, select: { score: true } });
    res.json({ income, expenses, cashback, score: user?.score ?? 500, operations: transactions.length });
});
exports.analyticsRouter.get('/categories', auth_1.auth, async (req, res) => {
    const ids = await userAccountIds(req.user.id);
    const outgoing = await prisma_1.prisma.transaction.findMany({ where: { senderAccountId: { in: ids }, status: 'SUCCESS' } });
    const totals = new Map();
    for (const tx of outgoing)
        totals.set(tx.category, (totals.get(tx.category) || 0) + Number(tx.amount));
    res.json([...totals.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value));
});
exports.analyticsRouter.get('/monthly', auth_1.auth, async (req, res) => {
    const ids = await userAccountIds(req.user.id);
    const txs = await prisma_1.prisma.transaction.findMany({
        where: { OR: [{ senderAccountId: { in: ids } }, { receiverAccountId: { in: ids } }], status: 'SUCCESS' },
        orderBy: { createdAt: 'asc' }
    });
    const months = new Map();
    for (const tx of txs) {
        const key = tx.createdAt.toLocaleDateString('ru-RU', { month: 'short', year: '2-digit' });
        if (!months.has(key))
            months.set(key, { month: key, income: 0, expenses: 0 });
        const row = months.get(key);
        if (tx.receiverAccountId && ids.includes(tx.receiverAccountId))
            row.income += Number(tx.amount);
        if (tx.senderAccountId && ids.includes(tx.senderAccountId))
            row.expenses += Number(tx.amount);
    }
    res.json([...months.values()]);
});
