export const currentUser = {
    id: 'u1',
    firstName: 'Иван',
    lastName: 'Петров',
    email: 'ivan@gmw.local',
    phone: '+7 900 123-45-67',
    role: 'CLIENT',
    score: 742
};
export const accounts = [
    { id: 'a1', accountNumber: 'GMW-40817810000000000123', balance: 125430, currency: 'RUB', status: 'ACTIVE' },
    { id: 'a2', accountNumber: 'GMW-SAVE-00000000000456', balance: 32000, currency: 'RUB', status: 'ACTIVE' }
];
export const cards = [
    { id: 'c1', maskedNumber: '**** 4582', holder: 'IVAN PETROV', expiry: '08/29', status: 'ACTIVE', dailyLimit: 150000, monthlyLimit: 750000 }
];
export const transactions = [
    { id: 't1', title: 'Пополнение счёта', amount: 10000, type: 'TOP_UP', status: 'SUCCESS', category: 'Доход', createdAt: '2026-05-25' },
    { id: 't2', title: 'Перевод Анне', amount: -2500, type: 'TRANSFER', status: 'SUCCESS', category: 'Переводы', createdAt: '2026-05-25' },
    { id: 't3', title: 'Кафе Green Cup', amount: -650, type: 'PAYMENT', status: 'SUCCESS', category: 'Кафе', createdAt: '2026-05-24' },
    { id: 't4', title: 'Магазин техники', amount: -15000, type: 'PAYMENT', status: 'SUCCESS', category: 'Покупки', createdAt: '2026-05-23' },
    { id: 't5', title: 'Бонус G.M.W', amount: 150, type: 'CASHBACK', status: 'SUCCESS', category: 'Кешбэк', createdAt: '2026-05-22' }
];
export const expenseChart = [
    { name: 'Кафе', value: 8200 },
    { name: 'Транспорт', value: 4300 },
    { name: 'Продукты', value: 17400 },
    { name: 'Подписки', value: 2500 },
    { name: 'Покупки', value: 22100 }
];
export const monthlyChart = [
    { month: 'Янв', income: 78000, expenses: 52000 },
    { month: 'Фев', income: 82000, expenses: 48000 },
    { month: 'Мар', income: 76000, expenses: 56000 },
    { month: 'Апр', income: 90000, expenses: 61000 },
    { month: 'Май', income: 84000, expenses: 54500 }
];
