"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountsRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const prisma_1 = require("../utils/prisma");
const security_1 = require("../utils/security");
exports.accountsRouter = (0, express_1.Router)();
exports.accountsRouter.get('/', auth_1.auth, async (req, res) => {
    const accounts = await prisma_1.prisma.account.findMany({ where: { userId: req.user.id } });
    res.json(accounts);
});
exports.accountsRouter.post('/', auth_1.auth, async (req, res) => {
    const account = await prisma_1.prisma.account.create({ data: { userId: req.user.id, accountNumber: (0, security_1.generateAccountNumber)(), balance: 0 } });
    res.status(201).json(account);
});
