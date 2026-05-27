import { useEffect, useState } from 'react';
import { api } from '../api/client';
export function Support() {
    const [tickets, setTickets] = useState([]);
    const [subject, setSubject] = useState('Вопрос по переводу');
    const [messageText, setMessageText] = useState('Опишите проблему подробнее, чтобы поддержка могла обработать заявку.');
    const [message, setMessage] = useState('');
    async function load() {
        try {
            const response = await api.get('/support');
            setTickets(response.data);
        }
        catch {
            undefined;
        }
    }
    useEffect(() => { load(); }, []);
    async function submit(event) {
        event.preventDefault();
        setMessage('');
        try {
            await api.post('/support', { subject, message: messageText });
            setMessage('Заявка создана и уже видна в админ-панели');
            setSubject('');
            setMessageText('');
            await load();
        }
        catch (error) {
            setMessage(error.response?.data?.message || 'Ошибка создания заявки');
        }
    }
    return (<div>
      <h1 className="text-4xl font-black">Поддержка</h1>
      <p className="mt-2 text-slate-500">Все обращения сохраняются в базе и отображаются в админ-панели.</p>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <form onSubmit={submit} className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">Создать обращение</h2>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-6 w-full rounded-2xl border border-slate-200 p-4" placeholder="Тема обращения"/>
          <textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} className="mt-4 min-h-40 w-full rounded-2xl border border-slate-200 p-4" placeholder="Опишите проблему"/>
          <button className="mt-4 rounded-2xl bg-gmw-dark px-6 py-4 font-black text-white">Отправить</button>
          {message && <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-700">{message}</p>}
        </form>
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">Мои заявки</h2>
          {tickets.length === 0 && <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-slate-500">Заявок пока нет</p>}
          {tickets.map((x) => <div key={x.id} className="mt-4 rounded-2xl bg-slate-50 p-4"><p className="font-bold">{x.subject}</p><p className="mt-1 text-sm text-slate-500">Статус: {x.status} · {new Date(x.createdAt).toLocaleString('ru-RU')}</p><p className="mt-2 text-sm">{x.message}</p></div>)}
        </div>
      </div>
    </div>);
}
