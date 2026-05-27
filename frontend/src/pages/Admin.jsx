import { useEffect, useState } from 'react';
import { Shield, Users, WalletCards, Headphones } from 'lucide-react';
import { api } from '../api/client';
import { StatCard } from '../components/StatCard';
export function Admin() {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [tab, setTab] = useState('users');
    const [message, setMessage] = useState('');
    async function load() {
        try {
            const [s, u, t, support] = await Promise.all([
                api.get('/admin/statistics'),
                api.get('/admin/users'),
                api.get('/admin/transactions'),
                api.get('/admin/support-tickets')
            ]);
            setStats(s.data);
            setUsers(u.data);
            setTransactions(t.data);
            setTickets(support.data);
        }
        catch (error) {
            setMessage(error.response?.data?.message || 'Админ-панель доступна только пользователю с ролью ADMIN');
        }
    }
    useEffect(() => { load(); }, []);
    async function toggleUser(user) {
        await api.patch(`/admin/users/${user.id}/${user.status === 'ACTIVE' ? 'block' : 'unblock'}`);
        await load();
    }
    async function setTicketStatus(id, status) {
        await api.patch(`/admin/support-tickets/${id}`, { status });
        await load();
    }
    if (message)
        return <div className="rounded-3xl bg-white p-8 font-bold text-red-600 shadow-sm">{message}</div>;
    return (<div>
      <h1 className="text-4xl font-black">Админ-панель G.M.W</h1>
      <p className="mt-2 text-slate-500">Данные загружаются напрямую из PostgreSQL: пользователи, переводы, аналитика и обращения поддержки.</p>
      <div className="mt-8 grid gap-5 md:grid-cols-4">
        <StatCard title="Пользователей" value={String(stats?.users ?? 0)} hint={`Активных: ${stats?.activeUsers ?? 0}`} icon={<Users />}/>
        <StatCard title="Активных карт" value={String(stats?.activeCards ?? 0)} hint={`Всего карт: ${stats?.cards ?? 0}`} icon={<WalletCards />}/>
        <StatCard title="Операций" value={String(stats?.transactions ?? 0)} hint={`Сегодня: ${stats?.transactionsToday ?? 0}`} icon={<Shield />}/>
        <StatCard title="Поддержка" value={String(stats?.openTickets ?? 0)} hint="Открытых заявок" icon={<Headphones />}/>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button onClick={() => setTab('users')} className={`rounded-2xl px-5 py-3 font-black ${tab === 'users' ? 'bg-gmw-dark text-white' : 'bg-white'}`}>Пользователи</button>
        <button onClick={() => setTab('transactions')} className={`rounded-2xl px-5 py-3 font-black ${tab === 'transactions' ? 'bg-gmw-dark text-white' : 'bg-white'}`}>История переводов</button>
        <button onClick={() => setTab('support')} className={`rounded-2xl px-5 py-3 font-black ${tab === 'support' ? 'bg-gmw-dark text-white' : 'bg-white'}`}>Поддержка</button>
      </div>

      {tab === 'users' && (<div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">Реально зарегистрированные пользователи</h2>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead><tr className="text-slate-500"><th className="p-3">Клиент</th><th>Email</th><th>Телефон</th><th>Верификация</th><th>Баланс</th><th>Статус</th><th></th></tr></thead>
              <tbody>{users.map((u) => <tr key={u.id} className="border-t border-slate-100">
                <td className="p-3 font-bold">{u.firstName} {u.lastName}<br /><span className="text-xs text-slate-400">{u.role}</span></td>
                <td>{u.email}</td><td>{u.phone}</td>
                <td>{u.emailVerified ? 'Email ✓' : 'Email —'} · {u.phoneVerified ? 'Тел. ✓' : 'Тел. —'} · {u.twoFactorEnabled ? '2FA ✓' : '2FA —'}</td>
                <td className="font-black">{Number(u.balance || 0).toLocaleString('ru-RU')} ₽</td>
                <td>{u.status}</td>
                <td><button onClick={() => toggleUser(u)} className="rounded-xl bg-slate-100 px-4 py-2 font-bold">{u.status === 'ACTIVE' ? 'Блок' : 'Разблок'}</button></td>
              </tr>)}</tbody>
            </table>
          </div>
        </div>)}

      {tab === 'transactions' && (<div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">Реальная история переводов и операций</h2>
          <div className="mt-5 space-y-3">
            {transactions.map((tx) => <div key={tx.id} className="rounded-2xl bg-slate-50 p-4">
              <div className="flex justify-between gap-4"><p className="font-black">{tx.type} · {tx.category}</p><p className="font-black">{Number(tx.amount).toLocaleString('ru-RU')} ₽</p></div>
              <p className="mt-1 text-sm text-slate-500">{new Date(tx.createdAt).toLocaleString('ru-RU')} · {tx.status}</p>
              <p className="mt-1 text-sm">От: {tx.sender ? `${tx.sender.firstName} ${tx.sender.lastName} (${tx.sender.email})` : '—'} → Кому: {tx.receiver ? `${tx.receiver.firstName} ${tx.receiver.lastName} (${tx.receiver.email})` : '—'}</p>
              {tx.comment && <p className="mt-1 text-sm text-slate-500">{tx.comment}</p>}
            </div>)}
          </div>
        </div>)}

      {tab === 'support' && (<div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">Заявки поддержки из базы данных</h2>
          <div className="mt-5 space-y-3">
            {tickets.map((ticket) => <div key={ticket.id} className="rounded-2xl bg-slate-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-black">{ticket.subject}</p><p className="text-sm text-slate-500">{ticket.user.firstName} {ticket.user.lastName} · {ticket.user.email} · {new Date(ticket.createdAt).toLocaleString('ru-RU')}</p></div><select value={ticket.status} onChange={(e) => setTicketStatus(ticket.id, e.target.value)} className="rounded-xl bg-white p-2 font-bold"><option value="OPEN">OPEN</option><option value="IN_PROGRESS">IN_PROGRESS</option><option value="CLOSED">CLOSED</option></select></div>
              <p className="mt-3 text-sm">{ticket.message}</p>
            </div>)}
          </div>
        </div>)}
    </div>);
}
