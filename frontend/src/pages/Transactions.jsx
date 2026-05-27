import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { transactions as mockTransactions } from '../api/mockData';
import { TransactionList } from '../components/TransactionList';
export function Transactions() {
    const [transactions, setTransactions] = useState(mockTransactions);
    const [query, setQuery] = useState('');
    const [type, setType] = useState('ALL');
    useEffect(() => {
        api.get('/transactions').then((response) => setTransactions(response.data)).catch(() => undefined);
    }, []);
    const filtered = useMemo(() => transactions.filter((tx) => {
        const text = `${tx.comment || ''} ${tx.category} ${tx.type}`.toLowerCase();
        const queryOk = text.includes(query.toLowerCase());
        const typeOk = type === 'ALL' || tx.type === type;
        return queryOk && typeOk;
    }), [transactions, query, type]);
    return (<div>
      <h1 className="text-4xl font-black">История операций</h1>
      <p className="mt-2 text-slate-500">Операции загружаются из PostgreSQL для текущего пользователя.</p>
      <div className="mt-6 grid gap-3 rounded-3xl bg-white p-5 shadow-sm md:grid-cols-3">
        <input value={query} onChange={(e) => setQuery(e.target.value)} className="rounded-2xl bg-slate-50 p-4" placeholder="Поиск"/>
        <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-2xl bg-slate-50 p-4"><option value="ALL">Все типы</option><option value="TOP_UP">Пополнение</option><option value="TRANSFER">Перевод</option><option value="PAYMENT">Оплата</option><option value="CASHBACK">Кешбэк</option></select>
        <button onClick={() => { setQuery(''); setType('ALL'); }} className="rounded-2xl bg-gmw-dark p-4 font-black text-white">Сбросить</button>
      </div>
      <div className="mt-6"><TransactionList items={filtered}/></div>
    </div>);
}
