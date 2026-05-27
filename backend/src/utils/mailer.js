"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmailVerificationCode = sendEmailVerificationCode;
const nodemailer_1 = __importDefault(require("nodemailer"));
function smtpConfigured() {
    return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS);
}
async function sendEmailVerificationCode(to, code) {
    if (!smtpConfigured()) {
        console.log(`[G.M.W DEV EMAIL] To: ${to}; verification code: ${code}`);
        return {
            sent: false,
            provider: 'dev',
            message: 'SMTP не настроен. Код показан в терминале backend и в devCode.',
            devCode: code
        };
    }
    const transporter = nodemailer_1.default.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
    await transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.SMTP_USER,
        to,
        subject: 'Код подтверждения G.M.W Bank',
        html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a">
        <h2>Подтверждение почты G.M.W Bank</h2>
        <p>Ваш код подтверждения:</p>
        <div style="font-size:28px;font-weight:800;letter-spacing:4px;background:#f1f5f9;padding:16px;border-radius:12px;display:inline-block">${code}</div>
        <p>Код действует 15 минут. Если вы не регистрировались в G.M.W Bank, просто проигнорируйте письмо.</p>
      </div>
    `
    });
    return { sent: true, provider: 'smtp', message: 'Код подтверждения отправлен на почту.' };
}
