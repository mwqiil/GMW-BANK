import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { cards as mockCards } from '../api/mockData';
import { BankCard } from '../components/BankCard';
export function Cards() {
    const [cards, setCards] = useState(mockCards);
    const [amount, setAmount] = useState('5000');
    const [dailyLimit, setDailyLimit] = useState('150000');
    const [monthlyLimit, setMonthlyLimit] = useState('750000');
    const [message, setMessage] = useState('');
    const card = cards[0];
    async function load() {
        try {
            const response = await api.get('/cards');
            setCards(response.data);
            if (response.data[0]) {
                setDailyLimit(String(response.data[0].dailyLimit));
                setMonthlyLimit(String(response.data[0].monthlyLimit));
            }
        }
        catch {
            undefined;
        }
    }
    useEffect(() => { load(); }, []);
    async function topUp() {
        setMessage('');
        try {
            await api.post('/transactions/top-up-card', { cardId: card.id, amount: Number(amount) });
            setMessage('Карта успешно пополнена. Баланс счёта обновлён.');
        }
        catch (error) {
            setMessage(error.response?.data?.message || 'Ошибка пополнения карты');
        }
    }
    async function toggleBlock() {
        setMessage('');
        try {
            await api.patch(`/cards/${card.id}/${card.status === 'ACTIVE' ? 'block' : 'unblock'}`);
            setMessage(card.status === 'ACTIVE' ? 'Карта заблокирована' : 'Карта разблокирована');
            await load();
        }
        catch (error) {
            setMessage(error.response?.data?.message || 'Ошибка изменения статуса карты');
        }
    }
    async function saveLimits() {
        setMessage('');
        try {
            await api.patch(`/cards/${card.id}/limits`, { dailyLimit: Number(dailyLimit), monthlyLimit: Number(monthlyLimit) });
            setMessage('Лимиты карты обновлены');
            await load();
        }
        catch (error) {
            setMessage(error.response?.data?.message || 'Ошибка изменения лимитов');
        }
    }
    if (!card)
        return <div>Карта не найдена</div>;
    return (<div>
      <h1 className="text-4xl font-black">Мои карты</h1>
      <p className="mt-2 text-slate-500">Управление виртуальными картами G.M.W. Все изменения сохраняются в PostgreSQL.</p>
      <div className="mt-8 grid gap-8 lg:grid-cols-[420px_1fr]">
        <BankCard card={card}/>
        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black">Настройки карты</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Info label="Статус" value={card.status === 'ACTIVE' ? 'Активна' : 'Заблокирована'}/>
              <Info label="Дневной лимит" value={`${Number(card.dailyLimit).toLocaleString('ru-RU')} ₽`}/>
              <Info label="Месячный лимит" value={`${Number(card.monthlyLimit).toLocaleString('ru-RU')} ₽`}/>
              <Info label="Тип карты" value="G.M.W Black Virtual"/>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={toggleBlock} className="rounded-2xl bg-red-50 px-5 py-3 font-bold text-red-600">{card.status === 'ACTIVE' ? 'Заблокировать' : 'Разблокировать'}</button>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black">Изменить лимиты</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <input value={dailyLimit} onChange={(e) => setDailyLimit(e.target.value)} type="number" className="rounded-2xl border border-slate-200 p-4" placeholder="Дневной лимит"/>
              <input value={monthlyLimit} onChange={(e) => setMonthlyLimit(e.target.value)} type="number" className="rounded-2xl border border-slate-200 p-4" placeholder="Месячный лимит"/>
              <button onClick={saveLimits} className="rounded-2xl bg-gmw-dark px-6 py-4 font-black text-white">Сохранить</button>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black">Пополнить карту</h2>
            <p className="mt-2 text-slate-500">Виртуальное пополнение. Требуется подтверждённая почта и телефон.</p>
            <div className="mt-5 flex gap-3">
              <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" className="w-full rounded-2xl border border-slate-200 p-4" placeholder="Сумма"/>
              <button onClick={topUp} className="rounded-2xl bg-gmw-accent px-6 py-4 font-black text-gmw-dark">Пополнить</button>
            </div>
            {message && <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">{message}</p>}
          </div>
        </div>
      </div>
    </div>);
}
function Info({ label, value }) {
    return <div className="rounded-2xl bg-slate-50 p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-lg font-black">{value}</p></div>;
}
