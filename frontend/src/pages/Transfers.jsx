import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { accounts as mockAccounts } from '../api/mockData';
export function Transfers() {
    const [accounts, setAccounts] = useState(mockAccounts);
    const [senderAccountId, setSenderAccountId] = useState(mockAccounts[0].id);
    const [recipient, setRecipient] = useState('anna@gmw.bank');
    const [foundRecipient, setFoundRecipient] = useState(null);
    const [amount, setAmount] = useState('1000');
    const [comment, setComment] = useState('Перевод внутри G.M.W');
    const [message, setMessage] = useState('');
    useEffect(() => {
        api.get('/accounts')
            .then((response) => {
            setAccounts(response.data);
            if (response.data[0])
                setSenderAccountId(response.data[0].id);
        })
            .catch(() => undefined);
    }, []);
    async function lookupRecipient() {
        setMessage('');
        setFoundRecipient(null);
        try {
            const response = await api.get('/users/recipient-lookup', { params: { query: recipient } });
            setFoundRecipient(response.data);
            setMessage(`Получатель найден: ${response.data.firstName} ${response.data.lastName}`);
        }
        catch (error) {
            setMessage(error.response?.data?.message || 'Получатель не найден');
        }
    }
    async function submit(event) {
        event.preventDefault();
        setMessage('');
        try {
            const response = await api.post('/transactions/transfer-recipient', {
                senderAccountId,
                recipient,
                amount: Number(amount),
                comment
            });
            setMessage(`Перевод выполнен. Получатель: ${response.data.receiver.firstName} ${response.data.receiver.lastName}`);
            setFoundRecipient(null);
        }
        catch (error) {
            setMessage(error.response?.data?.message || 'Ошибка перевода');
        }
    }
    return (<div>
      <h1 className="text-4xl font-black">Переводы</h1>
      <p className="mt-2 text-slate-500">Все зарегистрированные клиенты G.M.W хранятся в базе данных. Перевод можно отправить по email или телефону.</p>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <form onSubmit={submit} className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">Новый перевод</h2>
          <div className="mt-6 grid gap-4">
            <select value={senderAccountId} onChange={(e) => setSenderAccountId(e.target.value)} className="rounded-2xl border border-slate-200 p-4">
              {accounts.map((account) => (<option key={account.id} value={account.id}>{account.accountNumber} · {Number(account.balance).toLocaleString('ru-RU')} ₽</option>))}
            </select>
            <div className="flex gap-3">
              <input value={recipient} onChange={(e) => { setRecipient(e.target.value); setFoundRecipient(null); }} className="w-full rounded-2xl border border-slate-200 p-4" placeholder="Email или телефон получателя"/>
              <button type="button" onClick={lookupRecipient} className="rounded-2xl bg-slate-100 px-5 py-3 font-bold">Проверить</button>
            </div>
            {foundRecipient && (<div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">
                <p className="font-black">{foundRecipient.firstName} {foundRecipient.lastName}</p>
                <p>{foundRecipient.email} · {foundRecipient.phone}</p>
              </div>)}
            <input value={amount} onChange={(e) => setAmount(e.target.value)} className="rounded-2xl border border-slate-200 p-4" placeholder="Сумма" type="number"/>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="min-h-28 rounded-2xl border border-slate-200 p-4" placeholder="Комментарий"/>
          </div>
          {message && <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">{message}</p>}
          <button className="mt-6 rounded-2xl bg-gmw-dark px-6 py-4 font-black text-white">Подтвердить перевод</button>
        </form>
        <div className="rounded-3xl bg-gmw-dark p-6 text-white">
          <h3 className="text-xl font-black">Как работает база клиентов</h3>
          <ul className="mt-5 space-y-3 text-white/70">
            <li>• При регистрации пользователь сохраняется в таблице User</li>
            <li>• Email и телефон уникальны</li>
            <li>• Поиск получателя идёт по User.email или User.phone</li>
            <li>• Деньги поступают на первый активный счёт получателя</li>
            <li>• Переводы разрешены только после подтверждения контактов</li>
            <li>• Все операции сохраняются в таблице Transaction</li>
          </ul>
        </div>
      </div>
    </div>);
}
