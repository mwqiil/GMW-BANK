import { useEffect, useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Bell, Wallet } from 'lucide-react';
import { api } from '../api/client';
import { accounts as mockAccounts, cards as mockCards, currentUser, transactions as mockTransactions } from '../api/mockData';
import { BankCard } from '../components/BankCard';
import { StatCard } from '../components/StatCard';
import { TransactionList } from '../components/TransactionList';
export function Dashboard() {
    const [user, setUser] = useState(currentUser);
    const [accounts, setAccounts] = useState(mockAccounts);
    const [cards, setCards] = useState(mockCards);
    const [transactions, setTransactions] = useState(mockTransactions);
    const [activeAction, setActiveAction] = useState(null);
    const [message, setMessage] = useState('');
    async function load() {
        try {
            const [me, acc, cardRes, tx] = await Promise.all([
                api.get('/auth/me'),
                api.get('/accounts'),
                api.get('/cards'),
                api.get('/transactions')
            ]);
            setUser(me.data);
            setAccounts(acc.data);
            setCards(cardRes.data);
            setTransactions(tx.data);
        }
        catch {
            // мок-данные остаются только как запасной режим интерфейса
        }
    }
    useEffect(() => { load(); }, []);
    const total = useMemo(() => accounts.reduce((sum, item) => sum + Number(item.balance), 0), [accounts]);
    const monthlyExpenses = useMemo(() => transactions.filter((t) => t.type === 'TRANSFER' || t.type === 'PAYMENT').reduce((s, t) => s + Number(t.amount), 0), [transactions]);
    const card = cards[0];
    const account = accounts[0];
    return (<div>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-slate-500">Добро пожаловать,</p>
          <h1 className="text-4xl font-black">{user.firstName} {user.lastName}</h1>
          <p className="mt-2 text-sm text-slate-500">Почта: {user.emailVerified ? 'подтверждена' : 'не подтверждена'} · Телефон: {user.phoneVerified ? 'подтверждён' : 'не подтверждён'}</p>
        </div>
        <button className="flex w-fit items-center gap-2 rounded-2xl bg-white px-5 py-3 font-bold shadow-sm"><Bell size={18}/> Уведомления</button>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        <StatCard title="Общий баланс" value={`${total.toLocaleString('ru-RU')} ₽`} hint="Все активные счета из PostgreSQL" icon={<Wallet />}/>
        <StatCard title="G.M.W Score" value={`${user.score || 500}`} hint="Реальное поле пользователя" icon={<ArrowUpRight />}/>
        <StatCard title="Расходы" value={`${monthlyExpenses.toLocaleString('ru-RU')} ₽`} hint="По реальным операциям" icon={<ArrowDownLeft />}/>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          {card && <BankCard card={card}/>}
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setActiveAction('transfer')} className="rounded-2xl bg-white p-5 font-black shadow-sm hover:bg-gmw-dark hover:text-white">Перевести</button>
            <button onClick={() => setActiveAction('topup')} className="rounded-2xl bg-white p-5 font-black shadow-sm hover:bg-gmw-dark hover:text-white">Пополнить</button>
            <button onClick={() => location.href = '/transactions'} className="rounded-2xl bg-white p-5 font-black shadow-sm hover:bg-gmw-dark hover:text-white">История</button>
            <button onClick={() => setActiveAction('limits')} className="rounded-2xl bg-white p-5 font-black shadow-sm hover:bg-gmw-dark hover:text-white">Лимиты</button>
          </div>
          {activeAction && account && card && (<QuickAction action={activeAction} account={account} card={card} onDone={async (msg) => { setMessage(msg); await load(); }}/>)}
          {message && <p className="rounded-2xl bg-white p-4 text-sm font-bold text-slate-700 shadow-sm">{message}</p>}
        </div>
        <TransactionList items={transactions.slice(0, 8)}/>
      </div>
    </div>);
}
function QuickAction({ action, account, card, onDone }) {
    const [recipient, setRecipient] = useState('anna@gmw.bank');
    const [amount, setAmount] = useState('1000');
    const [comment, setComment] = useState('Быстрый перевод');
    const [dailyLimit, setDailyLimit] = useState(String(card.dailyLimit || 150000));
    const [monthlyLimit, setMonthlyLimit] = useState(String(card.monthlyLimit || 750000));
    const [error, setError] = useState('');
    async function submit() {
        setError('');
        try {
            if (action === 'transfer') {
                const response = await api.post('/transactions/transfer-recipient', { senderAccountId: account.id, recipient, amount: Number(amount), comment });
                onDone(`Перевод выполнен: ${response.data.receiver.firstName} ${response.data.receiver.lastName}`);
            }
            if (action === 'topup') {
                await api.post('/transactions/top-up-card', { cardId: card.id, amount: Number(amount) });
                onDone('Карта пополнена, баланс обновлён');
            }
            if (action === 'limits') {
                await api.patch(`/cards/${card.id}/limits`, { dailyLimit: Number(dailyLimit), monthlyLimit: Number(monthlyLimit) });
                onDone('Лимиты карты обновлены');
            }
        }
        catch (err) {
            setError(err.response?.data?.message || 'Ошибка выполнения операции');
        }
    }
    return (<div className="rounded-3xl bg-white p-5 shadow-sm">
      <h3 className="text-xl font-black">{action === 'transfer' ? 'Быстрый перевод' : action === 'topup' ? 'Быстрое пополнение' : 'Изменить лимиты'}</h3>
      <div className="mt-4 grid gap-3">
        {action === 'transfer' && <input value={recipient} onChange={(e) => setRecipient(e.target.value)} className="rounded-2xl border border-slate-200 p-3" placeholder="Email или телефон получателя"/>}
        {(action === 'transfer' || action === 'topup') && <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" className="rounded-2xl border border-slate-200 p-3" placeholder="Сумма"/>}
        {action === 'transfer' && <input value={comment} onChange={(e) => setComment(e.target.value)} className="rounded-2xl border border-slate-200 p-3" placeholder="Комментарий"/>}
        {action === 'limits' && <input value={dailyLimit} onChange={(e) => setDailyLimit(e.target.value)} type="number" className="rounded-2xl border border-slate-200 p-3" placeholder="Дневной лимит"/>}
        {action === 'limits' && <input value={monthlyLimit} onChange={(e) => setMonthlyLimit(e.target.value)} type="number" className="rounded-2xl border border-slate-200 p-3" placeholder="Месячный лимит"/>}
      </div>
      {error && <p className="mt-3 rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-600">{error}</p>}
      <button onClick={submit} className="mt-4 rounded-2xl bg-gmw-dark px-5 py-3 font-black text-white">Выполнить</button>
    </div>);
}
