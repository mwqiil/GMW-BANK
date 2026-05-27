"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const prisma_1 = require("../utils/prisma");
const security_1 = require("../utils/security");
exports.usersRouter = (0, express_1.Router)();
exports.usersRouter.get('/recipient-lookup', auth_1.auth, async (req, res) => {
    const schema = zod_1.z.object({ query: zod_1.z.string().min(3) });
    const { query } = schema.parse(req.query);
    const key = query.includes('@') ? query.trim().toLowerCase() : (0, security_1.normalizePhone)(query.trim());
    const user = await prisma_1.prisma.user.findFirst({
        where: {
            AND: [
                { id: { not: req.user.id } },
                { status: 'ACTIVE' },
                { OR: [{ email: key }, { phone: key }] }
            ]
        },
        include: { accounts: { where: { status: 'ACTIVE' }, take: 1 } }
    });
    if (!user || user.accounts.length === 0)
        return res.status(404).json({ message: 'Получатель не найден' });
    res.json({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: (0, security_1.maskEmail)(user.email),
        phone: (0, security_1.maskPhone)(user.phone),
        canReceive: true
    });
});
exports.usersRouter.get('/registered-count', auth_1.auth, async (_req, res) => {
    const count = await prisma_1.prisma.user.count({ where: { status: 'ACTIVE' } });
    res.json({ count });
});
