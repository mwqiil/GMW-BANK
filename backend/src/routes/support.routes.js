"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supportRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const prisma_1 = require("../utils/prisma");
exports.supportRouter = (0, express_1.Router)();
exports.supportRouter.get('/', auth_1.auth, async (req, res) => {
    const tickets = await prisma_1.prisma.supportTicket.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } });
    res.json(tickets);
});
exports.supportRouter.post('/', auth_1.auth, async (req, res) => {
    const body = zod_1.z.object({ subject: zod_1.z.string().min(3), message: zod_1.z.string().min(10) }).parse(req.body);
    const ticket = await prisma_1.prisma.supportTicket.create({ data: { userId: req.user.id, ...body } });
    res.status(201).json(ticket);
});
