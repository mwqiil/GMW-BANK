"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const qrcode_1 = __importDefault(require("qrcode"));
const speakeasy_1 = __importDefault(require("speakeasy"));
const zod_1 = require("zod");
const prisma_1 = require("../utils/prisma");
const mailer_1 = require("../utils/mailer");
const security_1 = require("../utils/security");
const auth_1 = require("../middleware/auth");
exports.authRouter = (0, express_1.Router)();
const registerSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2),
    lastName: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().min(6),
    password: zod_1.z.string().min(6)
});
function verificationExpiry() {
    return new Date(Date.now() + 15 * 60 * 1000);
}
function userDto(user) {
    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        score: user.score,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        twoFactorEnabled: user.twoFactorEnabled
    };
}
exports.authRouter.post('/register', async (req, res) => {
    const data = registerSchema.parse(req.body);
    const email = data.email.toLowerCase().trim();
    const phone = (0, security_1.normalizePhone)(data.phone);
    const exists = await prisma_1.prisma.user.findFirst({ where: { OR: [{ email }, { phone }] } });
    if (exists)
        return res.status(409).json({ message: 'Пользователь с такой почтой или телефоном уже зарегистрирован' });
    const passwordHash = await (0, security_1.hashPassword)(data.password);
    const emailCode = (0, security_1.generateVerificationCode)();
    const phoneCode = (0, security_1.generateVerificationCode)();
    const user = await prisma_1.prisma.user.create({
        data: {
            firstName: data.firstName.trim(),
            lastName: data.lastName.trim(),
            email,
            phone,
            passwordHash,
            emailVerificationCode: emailCode,
            emailVerificationExpiresAt: verificationExpiry(),
            phoneVerificationCode: phoneCode,
            phoneVerificationExpiresAt: verificationExpiry()
        }
    });
    const account = await prisma_1.prisma.account.create({ data: { userId: user.id, accountNumber: (0, security_1.generateAccountNumber)(), balance: 10000 } });
    await prisma_1.prisma.card.create({
        data: {
            userId: user.id,
            accountId: account.id,
            cardNumber: (0, security_1.generateCardNumber)(),
            cardHolder: `${user.firstName} ${user.lastName}`.toUpperCase(),
            expiryDate: '08/29',
            cvvHash: await (0, security_1.hashPassword)('000')
        }
    });
    const mail = await (0, mailer_1.sendEmailVerificationCode)(user.email, emailCode);
    const token = (0, security_1.createToken)({ id: user.id, role: user.role });
    res.status(201).json({
        token,
        user: userDto(user),
        verification: {
            email: mail.message,
            phone: 'SMS-провайдер не подключён: код телефона показан в devPhoneCode для учебного проекта.',
            devEmailCode: mail.devCode,
            devPhoneCode: phoneCode
        }
    });
});
exports.authRouter.post('/login', async (req, res) => {
    const schema = zod_1.z.object({
        identifier: zod_1.z.string().min(3).optional(),
        email: zod_1.z.string().optional(),
        password: zod_1.z.string().min(1),
        twoFactorCode: zod_1.z.string().optional()
    });
    const data = schema.parse(req.body);
    const identifier = (data.identifier || data.email || '').trim();
    const normalized = identifier.includes('@') ? identifier.toLowerCase() : (0, security_1.normalizePhone)(identifier);
    const user = await prisma_1.prisma.user.findFirst({ where: { OR: [{ email: normalized }, { phone: normalized }] } });
    if (!user || !(await (0, security_1.comparePassword)(data.password, user.passwordHash)))
        return res.status(401).json({ message: 'Неверный логин или пароль' });
    if (user.status === 'BLOCKED')
        return res.status(403).json({ message: 'Аккаунт заблокирован' });
    if (user.twoFactorEnabled) {
        const code = (data.twoFactorCode || '').replace(/\s/g, '');
        if (!code)
            return res.status(202).json({ requiresTwoFactor: true, message: 'Введите код из Google Authenticator' });
        const valid = speakeasy_1.default.totp.verify({ secret: user.twoFactorSecret || '', encoding: 'base32', token: code, window: 1 });
        if (!valid)
            return res.status(401).json({ message: 'Неверный код 2FA' });
    }
    const token = (0, security_1.createToken)({ id: user.id, role: user.role });
    res.json({ token, user: userDto(user) });
});
exports.authRouter.get('/me', auth_1.auth, async (req, res) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
            score: true,
            status: true,
            emailVerified: true,
            phoneVerified: true,
            twoFactorEnabled: true
        }
    });
    if (!user)
        return res.status(404).json({ message: 'Пользователь не найден' });
    res.json(user);
});
exports.authRouter.post('/verification/request', auth_1.auth, async (req, res) => {
    const schema = zod_1.z.object({ channel: zod_1.z.enum(['email', 'phone']) });
    const { channel } = schema.parse(req.body);
    const code = (0, security_1.generateVerificationCode)();
    const user = await prisma_1.prisma.user.update({
        where: { id: req.user.id },
        data: channel === 'email'
            ? { emailVerificationCode: code, emailVerificationExpiresAt: verificationExpiry() }
            : { phoneVerificationCode: code, phoneVerificationExpiresAt: verificationExpiry() }
    });
    if (channel === 'email') {
        const mail = await (0, mailer_1.sendEmailVerificationCode)(user.email, code);
        return res.json({
            message: mail.sent ? `Код подтверждения отправлен на ${(0, security_1.maskEmail)(user.email)}` : `${mail.message} Получатель: ${(0, security_1.maskEmail)(user.email)}`,
            devCode: mail.devCode
        });
    }
    res.json({
        message: `Код подтверждения телефона создан для ${(0, security_1.maskPhone)(user.phone)}. В учебной версии без SMS-провайдера код показан ниже.`,
        devCode: code
    });
});
exports.authRouter.post('/verification/confirm', auth_1.auth, async (req, res) => {
    const schema = zod_1.z.object({ channel: zod_1.z.enum(['email', 'phone']), code: zod_1.z.string().min(4).max(10) });
    const { channel, code } = schema.parse(req.body);
    const user = await prisma_1.prisma.user.findUniqueOrThrow({ where: { id: req.user.id } });
    const validCode = channel === 'email' ? user.emailVerificationCode : user.phoneVerificationCode;
    const expiresAt = channel === 'email' ? user.emailVerificationExpiresAt : user.phoneVerificationExpiresAt;
    if (!validCode || code.trim() !== validCode)
        return res.status(400).json({ message: 'Неверный код подтверждения' });
    if (expiresAt && expiresAt.getTime() < Date.now())
        return res.status(400).json({ message: 'Код истёк. Запросите новый код.' });
    const updated = await prisma_1.prisma.user.update({
        where: { id: user.id },
        data: channel === 'email'
            ? { emailVerified: true, emailVerificationCode: null, emailVerificationExpiresAt: null }
            : { phoneVerified: true, phoneVerificationCode: null, phoneVerificationExpiresAt: null },
        select: { emailVerified: true, phoneVerified: true }
    });
    res.json({ message: channel === 'email' ? 'Почта подтверждена' : 'Телефон подтверждён', ...updated });
});
exports.authRouter.post('/2fa/setup', auth_1.auth, async (req, res) => {
    const user = await prisma_1.prisma.user.findUniqueOrThrow({ where: { id: req.user.id } });
    const secret = speakeasy_1.default.generateSecret({
        name: `G.M.W Bank (${user.email})`,
        issuer: 'G.M.W Bank',
        length: 20
    });
    const otpauthUrl = secret.otpauth_url;
    const qrCodeDataUrl = await qrcode_1.default.toDataURL(otpauthUrl, { errorCorrectionLevel: 'M', margin: 2, width: 220 });
    await prisma_1.prisma.user.update({ where: { id: user.id }, data: { twoFactorSecret: secret.base32, twoFactorEnabled: false } });
    res.json({ secret: secret.base32, otpauthUrl, qrCodeDataUrl, message: 'Отсканируйте QR-код в Google Authenticator и подтвердите кодом.' });
});
exports.authRouter.post('/2fa/enable', auth_1.auth, async (req, res) => {
    const schema = zod_1.z.object({ code: zod_1.z.string().min(6).max(12) });
    const { code } = schema.parse(req.body);
    const cleanCode = code.replace(/\s/g, '');
    const user = await prisma_1.prisma.user.findUniqueOrThrow({ where: { id: req.user.id } });
    if (!user.twoFactorSecret)
        return res.status(400).json({ message: 'Сначала нажмите «Подключить 2FA» и отсканируйте QR-код' });
    const valid = speakeasy_1.default.totp.verify({ secret: user.twoFactorSecret, encoding: 'base32', token: cleanCode, window: 1 });
    if (!valid)
        return res.status(400).json({ message: 'Неверный код Google Authenticator' });
    await prisma_1.prisma.user.update({ where: { id: user.id }, data: { twoFactorEnabled: true } });
    res.json({ message: '2FA включена', twoFactorEnabled: true });
});
exports.authRouter.post('/2fa/disable', auth_1.auth, async (req, res) => {
    const schema = zod_1.z.object({ code: zod_1.z.string().min(6).max(12) });
    const { code } = schema.parse(req.body);
    const cleanCode = code.replace(/\s/g, '');
    const user = await prisma_1.prisma.user.findUniqueOrThrow({ where: { id: req.user.id } });
    if (!user.twoFactorSecret || !speakeasy_1.default.totp.verify({ secret: user.twoFactorSecret, encoding: 'base32', token: cleanCode, window: 1 })) {
        return res.status(400).json({ message: 'Неверный код Google Authenticator' });
    }
    await prisma_1.prisma.user.update({ where: { id: user.id }, data: { twoFactorEnabled: false, twoFactorSecret: null } });
    res.json({ message: '2FA отключена', twoFactorEnabled: false });
});
