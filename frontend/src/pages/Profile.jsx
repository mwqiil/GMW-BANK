import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { currentUser } from '../api/mockData';
export function Profile() {
    const [user, setUser] = useState({ ...currentUser, emailVerified: false, phoneVerified: false, twoFactorEnabled: false });
    const [emailCode, setEmailCode] = useState('');
    const [phoneCode, setPhoneCode] = useState('');
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [message, setMessage] = useState('');
    async function loadMe() {
        try {
            const response = await api.get('/auth/me');
            setUser(response.data);
        }
        catch {
            // демо-интерфейс продолжит работать на мок-данных
        }
    }
    useEffect(() => {
        loadMe();
    }, []);
    async function requestCode(channel) {
        setMessage('');
        try {
            const response = await api.post('/auth/verification/request', { channel });
            setMessage(`${response.data.message}. Демо-код: ${response.data.devCode}`);
        }
        catch (error) {
            setMessage(error.response?.data?.message || 'Ошибка отправки кода');
        }
    }
    async function confirmCode(channel) {
        setMessage('');
        try {
            const response = await api.post('/auth/verification/confirm', { channel, code: channel === 'email' ? emailCode : phoneCode });
            setMessage(response.data.message);
            await loadMe();
        }
        catch (error) {
            setMessage(error.response?.data?.message || 'Ошибка подтверждения');
        }
    }
    async function setup2FA() {
        setMessage('');
        try {
            const response = await api.post('/auth/2fa/setup');
            setQrCode(response.data.qrCodeDataUrl);
            setSecret(response.data.secret);
            setMessage(response.data.message);
        }
        catch (error) {
            setMessage(error.response?.data?.message || 'Ошибка настройки 2FA');
        }
    }
    async function enable2FA() {
        setMessage('');
        try {
            const response = await api.post('/auth/2fa/enable', { code: twoFactorCode });
            setMessage(response.data.message);
            await loadMe();
        }
        catch (error) {
            setMessage(error.response?.data?.message || 'Ошибка включения 2FA');
        }
    }
    async function disable2FA() {
        setMessage('');
        try {
            const response = await api.post('/auth/2fa/disable', { code: twoFactorCode });
            setMessage(response.data.message);
            setQrCode('');
            setSecret('');
            await loadMe();
        }
        catch (error) {
            setMessage(error.response?.data?.message || 'Ошибка отключения 2FA');
        }
    }
    return (<div>
      <h1 className="text-4xl font-black">Профиль</h1>
      <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black">Личные данные</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Field label="Имя" value={user.firstName}/>
          <Field label="Фамилия" value={user.lastName}/>
          <Field label="Email" value={user.email}/>
          <Field label="Телефон" value={user.phone}/>
        </div>

        <h2 className="mt-8 text-2xl font-black">Подтверждение контактов</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <VerificationCard title="Почта" value={user.email} verified={Boolean(user.emailVerified)} code={emailCode} setCode={setEmailCode} request={() => requestCode('email')} confirm={() => confirmCode('email')}/>
          <VerificationCard title="Телефон" value={user.phone} verified={Boolean(user.phoneVerified)} code={phoneCode} setCode={setPhoneCode} request={() => requestCode('phone')} confirm={() => confirmCode('phone')}/>
        </div>

        <h2 className="mt-8 text-2xl font-black">Google Authenticator 2FA</h2>
        <div className="mt-4 rounded-3xl bg-slate-50 p-5">
          <p className="font-bold">Статус: {user.twoFactorEnabled ? 'включена' : 'выключена'}</p>
          <p className="mt-2 text-sm text-slate-500">Отсканируйте QR-код в Google Authenticator, затем введите 6-значный код для включения защиты входа.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={setup2FA} className="rounded-2xl bg-gmw-dark px-5 py-3 font-bold text-white">Подключить 2FA</button>
            <input value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value)} className="rounded-2xl border border-slate-200 p-3" placeholder="Код 2FA"/>
            <button onClick={enable2FA} className="rounded-2xl bg-gmw-accent px-5 py-3 font-bold text-gmw-dark">Подтвердить</button>
            {user.twoFactorEnabled && <button onClick={disable2FA} className="rounded-2xl bg-red-50 px-5 py-3 font-bold text-red-600">Отключить</button>}
          </div>
          {qrCode && <img src={qrCode} alt="QR-код для Google Authenticator" className="mt-5 h-48 w-48 rounded-2xl bg-white p-3"/>}
          {secret && <p className="mt-3 text-sm text-slate-500">Ручной ключ: <span className="font-mono font-bold text-gmw-dark">{secret}</span></p>}
        </div>

        {message && <p className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">{message}</p>}

        <div className="mt-8 flex flex-wrap gap-3">
          <button className="rounded-2xl bg-gmw-dark px-5 py-3 font-bold text-white">Изменить пароль</button>
          <button onClick={() => { localStorage.removeItem('gmw_token'); location.href = '/login'; }} className="rounded-2xl bg-red-50 px-5 py-3 font-bold text-red-600">Выйти</button>
        </div>
      </div>
    </div>);
}
function Field({ label, value }) {
    return <div><label className="text-sm font-bold text-slate-500">{label}</label><input className="mt-2 w-full rounded-2xl bg-slate-50 p-4" value={value} readOnly/></div>;
}
function VerificationCard({ title, value, verified, code, setCode, request, confirm }) {
    return (<div className="rounded-3xl bg-slate-50 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="font-black">{value}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-bold ${verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{verified ? 'Подтверждено' : 'Нужно подтвердить'}</span>
      </div>
      {!verified && <div className="mt-4 flex gap-3"><input value={code} onChange={(e) => setCode(e.target.value)} className="w-full rounded-2xl border border-slate-200 p-3" placeholder="6-значный код"/><button onClick={confirm} className="rounded-2xl bg-gmw-dark px-4 py-3 font-bold text-white">OK</button></div>}
      {!verified && <button onClick={request} className="mt-3 rounded-2xl bg-white px-4 py-3 font-bold">Получить код</button>}
    </div>);
}
