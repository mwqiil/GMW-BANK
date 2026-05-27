import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
export function Login() {
    const navigate = useNavigate();
    const [identifier, setIdentifier] = useState('client@gmw.bank');
    const [password, setPassword] = useState('12345678');
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
    const [message, setMessage] = useState('');
    async function submit(event) {
        event.preventDefault();
        setMessage('');
        try {
            const response = await api.post('/auth/login', { identifier, password, twoFactorCode: twoFactorCode || undefined });
            if (response.data.requiresTwoFactor) {
                setRequiresTwoFactor(true);
                setMessage(response.data.message);
                return;
            }
            localStorage.setItem('gmw_token', response.data.token);
            navigate('/dashboard');
        }
        catch (error) {
            setMessage(error.response?.data?.message || 'Ошибка входа');
        }
    }
    return (<div className="grid min-h-screen place-items-center bg-gmw-soft p-5">
      <form onSubmit={submit} className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-black">Вход в G.M.W</h1>
        <p className="mt-2 text-slate-500">Можно войти по email или телефону. Если включена 2FA, понадобится код из Google Authenticator.</p>
        <label className="mt-8 block text-sm font-bold">Email или телефон</label>
        <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 p-4 outline-none focus:border-gmw-accent" placeholder="client@gmw.bank"/>
        <label className="mt-4 block text-sm font-bold">Пароль</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="mt-2 w-full rounded-2xl border border-slate-200 p-4 outline-none focus:border-gmw-accent" placeholder="••••••••"/>
        {requiresTwoFactor && (<>
            <label className="mt-4 block text-sm font-bold">Код Google Authenticator</label>
            <input value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 p-4 outline-none focus:border-gmw-accent" placeholder="123456"/>
          </>)}
        {message && <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">{message}</p>}
        <button className="mt-6 w-full rounded-2xl bg-gmw-dark p-4 font-black text-white">Войти</button>
        <p className="mt-5 text-center text-sm text-slate-500">Нет аккаунта? <Link to="/register" className="font-bold text-gmw-dark">Открыть счёт</Link></p>
      </form>
    </div>);
}
