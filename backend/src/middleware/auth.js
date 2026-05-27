"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = auth;
exports.allowRoles = allowRoles;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function auth(req, res, next) {
    const header = req.headers.authorization;
    if (!header)
        return res.status(401).json({ message: 'Необходима авторизация' });
    try {
        const token = header.replace('Bearer ', '');
        req.user = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'dev_secret');
        next();
    }
    catch {
        res.status(401).json({ message: 'Недействительный токен' });
    }
}
function allowRoles(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Недостаточно прав' });
        }
        next();
    };
}
