"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const prisma_1 = require("../utils/prisma");
exports.adminRouter = (0, express_1.Router)();
exports.adminRouter.use(auth_1.auth, (0, auth_1.allowRoles)('ADMIN'));
exports.adminRouter.get('/users', async (_req, res) => {
    const users = await prisma_1.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
            status: true,
            score: true,
            emailVerified: true,
            phoneVerified: true,
            twoFactorEnabled: true,
            createdAt: true,
            accounts: { select: { balance: true, currency: true, accountNumber: true } },
            cards: { select: { id: true, status: true } }
        }
    });
    res.json(users.map((u) => ({
        ...u,
        balance: u.accounts.reduce((sum, a) => sum + Number(a.balance), 0),
        cardsCount: u.cards.length
    })));
});
exports.adminRouter.patch('/users/:id/block', async (req, res) => {
    const user = await prisma_1.prisma.user.update({ where: { id: req.params.id }, data: { status: 'BLOCKED' } });
    res.json(user);
});
exports.adminRouter.patch('/users/:id/unblock', async (req, res) => {
    const user = await prisma_1.prisma.user.update({ where: { id: req.params.id }, data: { status: 'ACTIVE' } });
    res.json(user);
});
exports.adminRouter.get('/transactions', async (_req, res) => {
    const transactions = await prisma_1.prisma.transaction.findMany({
        orderBy: { createdAt: 'desc' },
        take: 300,
        include: {
            senderAccount: { include: { user: { select: { firstName: true, lastName: true, email: true, phone: true } } } },
            receiverAccount: { include: { user: { select: { firstName: true, lastName: true, email: true, phone: true } } } }
        }
    });
    res.json(transactions.map((tx) => ({
        id: tx.id,
        amount: Number(tx.amount),
        currency: tx.currency,
        type: tx.type,
        status: tx.status,
        category: tx.category,
        comment: tx.comment,
        createdAt: tx.createdAt,
        sender: tx.senderAccount?.user || null,
        receiver: tx.receiverAccount?.user || null
    })));
});
exports.adminRouter.get('/support-tickets', async (_req, res) => {
    const tickets = await prisma_1.prisma.supportTicket.findMany({
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { firstName: true, lastName: true, email: true, phone: true } } }
    });
    res.json(tickets);
});
exports.adminRouter.patch('/support-tickets/:id', async (req, res) => {
    const body = zod_1.z.object({ status: zod_1.z.enum(['OPEN', 'IN_PROGRESS', 'CLOSED']) }).parse(req.body);
    const ticket = await prisma_1.prisma.supportTicket.update({ where: { id: req.params.id }, data: { status: body.status } });
    res.json(ticket);
});
exports.adminRouter.get('/statistics', async (_req, res) => {
    const [users, activeUsers, cards, activeCards, transactions, tickets, openTickets] = await Promise.all([
        prisma_1.prisma.user.count(),
        prisma_1.prisma.user.count({ where: { status: 'ACTIVE' } }),
        prisma_1.prisma.card.count(),
        prisma_1.prisma.card.count({ where: { status: 'ACTIVE' } }),
        prisma_1.prisma.transaction.count(),
        prisma_1.prisma.supportTicket.count(),
        prisma_1.prisma.supportTicket.count({ where: { status: 'OPEN' } })
    ]);
    const amounts = await prisma_1.prisma.transaction.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true }
    });
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const today = await prisma_1.prisma.transaction.count({ where: { createdAt: { gte: todayStart } } });
    res.json({
        users,
        activeUsers,
        cards,
        activeCards,
        transactions,
        transactionsToday: today,
        tickets,
        openTickets,
        turnover: Number(amounts._sum.amount || new client_1.Prisma.Decimal(0))
    });
});
