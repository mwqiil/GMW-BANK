import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
export function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', repeat: '' });
    const [message, setMessage] = useState('');
    const [devCodes, setDevCodes] = useState(null);
    function setField(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }
    async function submit(event) {
        event.preventDefault();
        setMessage('');
        setDevCodes(null);
        if (form.password !== form.repeat)
            return setMessage('Пароли не совпадают');
        try {
            const response = await api.post('/auth/register', {
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                phone: form.phone,
                password: form.password
            });
            localStorage.setItem('gmw_token', response.data.token);
            setMessage('Аккаунт создан.');
            if (response.data.verification?.devEmailCode || response.data.verification?.devPhoneCode) {
                setDevCodes({ email: response.data.verification.devEmailCode, phone: response.data.verification.devPhoneCode });
            }
        }
        catch (error) {
            setMessage(error.response?.data?.message || 'Ошибка регистрации');
        }
    }
    return (<div className="grid min-h-screen place-items-center bg-gmw-soft p-5">
      <form onSubmit={submit} className="w-full max-w-2xl rounded-[2rem] bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-black">Открыть счёт G.M.W</h1>
        <p className="mt-2 text-slate-500">После регистрации будет создан виртуальный счёт и карта.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Field label="Имя" value={form.firstName} onChange={(v) => setField('firstName', v)}/>
          <Field label="Фамилия" value={form.lastName} onChange={(v) => setField('lastName', v)}/>
          <Field label="Email" value={form.email} onChange={(v) => setField('email', v)}/>
          <Field label="Телефон" value={form.phone} onChange={(v) => setField('phone', v)}/>
          <Field label="Пароль" type="password" value={form.password} onChange={(v) => setField('password', v)}/>
          <Field label="Повтор пароля" type="password" value={form.repeat} onChange={(v) => setField('repeat', v)}/>
        </div>
        {message && <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">{message}</p>}
        {devCodes && (<div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-black">!</p>
            {devCodes.email && <p>Email: {devCodes.email}</p>}
            {devCodes.phone && <p>Телефон: {devCodes.phone}</p>}
          </div>)}
        <button className="mt-6 w-full rounded-2xl bg-gmw-dark p-4 font-black text-white">Создать аккаунт</button>
        {(message || devCodes) && <button type="button" onClick={() => navigate('/profile')} className="mt-3 w-full rounded-2xl bg-gmw-accent p-4 font-black text-gmw-dark">Перейти к подтверждению</button>}
        <p className="mt-5 text-center text-sm text-slate-500">Уже есть аккаунт? <Link to="/login" className="font-bold text-gmw-dark">Войти</Link></p>
      </form>
    </div>);
}
function Field({ label, value, onChange, type = 'text' }) {
    return <div><label className="text-sm font-bold">{label}</label><input value={value} onChange={(e) => onChange(e.target.value)} type={type} className="mt-2 w-full rounded-2xl border border-slate-200 p-4 outline-none focus:border-gmw-accent"/></div>;
}
