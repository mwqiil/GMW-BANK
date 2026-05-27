import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, CreditCard, LockKeyhole, PieChart } from 'lucide-react';
export function Landing() {
    return (<div className="min-h-screen bg-gmw-dark text-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between p-6">
        <div>
          <div className="text-3xl font-black">G.M.W</div>
          <div className="text-xs uppercase tracking-[0.4em] text-white/50">Grow Manage Win</div>
        </div>
        <div className="flex gap-3">
          <Link to="/login" className="rounded-2xl px-5 py-3 text-white/80 hover:bg-white/10">Войти</Link>
          <Link to="/register" className="rounded-2xl bg-gmw-accent px-5 py-3 font-bold text-gmw-dark">Открыть счёт</Link>
        </div>
      </header>
      <main className="mx-auto grid max-w-7xl items-center gap-12 p-6 py-20 lg:grid-cols-2">
        <section>
          <div className="mb-5 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm text-gmw-accent">Цифровой банк нового поколения</div>
          <h1 className="text-5xl font-black leading-tight md:text-7xl">Банк, который всегда с тобой</h1>
          <p className="mt-6 max-w-xl text-lg text-white/65">Управляй виртуальными счетами, картами, переводами, лимитами и аналитикой расходов в одном современном интерфейсе.</p>
          <div className="mt-8 flex gap-4">
            <Link to="/register" className="flex items-center gap-2 rounded-2xl bg-gmw-accent px-6 py-4 font-black text-gmw-dark">Начать <ArrowRight size={18}/></Link>
            <Link to="/dashboard" className="rounded-2xl bg-white/10 px-6 py-4 font-bold">Демо кабинет</Link>
          </div>
        </section>
        <section className="rounded-[2.5rem] bg-white/10 p-6 backdrop-blur">
          <div className="gradient-card rounded-[2rem] p-8">
            <p className="text-white/60">Общий баланс</p>
            <h2 className="mt-2 text-5xl font-black">125 430 ₽</h2>
            <div className="mt-16 text-3xl font-black tracking-widest">**** 4582</div>
            <div className="mt-10 flex justify-between text-sm text-white/70"><span>IVAN PETROV</span><span>08/29</span></div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4">
            {[['Безопасность', LockKeyhole], ['Карты', CreditCard], ['Аналитика', PieChart], ['Кешбэк', BadgeCheck]].map(([label, Icon]) => <div key={label} className="rounded-3xl bg-white p-5 text-gmw-dark"><Icon /><p className="mt-3 font-bold">{label}</p></div>)}
          </div>
        </section>
      </main>
    </div>);
}
