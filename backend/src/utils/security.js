"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
exports.createToken = createToken;
exports.maskCard = maskCard;
exports.generateAccountNumber = generateAccountNumber;
exports.generateCardNumber = generateCardNumber;
exports.generateVerificationCode = generateVerificationCode;
exports.normalizePhone = normalizePhone;
exports.maskEmail = maskEmail;
exports.maskPhone = maskPhone;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
async function hashPassword(password) {
    return bcrypt_1.default.hash(password, 12);
}
async function comparePassword(password, hash) {
    return bcrypt_1.default.compare(password, hash);
}
function createToken(payload) {
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
}
function maskCard(cardNumber) {
    return `**** ${cardNumber.slice(-4)}`;
}
function generateAccountNumber() {
    return `GMW-${Math.floor(100000000000000000 + Math.random() * 899999999999999999)}`;
}
function generateCardNumber() {
    return `2200${Math.floor(100000000000 + Math.random() * 899999999999)}`;
}
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
function normalizePhone(phone) {
    return phone.replace(/[\s()\-]/g, '');
}
function maskEmail(email) {
    const [name, domain] = email.split('@');
    return `${name.slice(0, 2)}***@${domain}`;
}
function maskPhone(phone) {
    return `${phone.slice(0, 2)}***${phone.slice(-4)}`;
}
