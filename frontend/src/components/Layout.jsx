import { NavLink, Outlet } from 'react-router-dom';
import { BarChart3, CreditCard, Headphones, Home, Shield, User, WalletCards } from 'lucide-react';
const links = [
    { to: '/dashboard', label: 'Главная', icon: Home },
    { to: '/cards', label: 'Карты', icon: CreditCard },
    { to: '/transfers', label: 'Переводы', icon: WalletCards },
    { to: '/transactions', label: 'История', icon: BarChart3 },
    { to: '/analytics', label: 'Аналитика', icon: BarChart3 },
    { to: '/support', label: 'Поддержка', icon: Headphones },
    { to: '/profile', label: 'Профиль', icon: User },
    { to: '/admin', label: 'Админ', icon: Shield }
];
export function Layout() {
    return (<div className="min-h-screen bg-gmw-soft">
      <aside className="fixed left-0 top-0 hidden h-full w-72 bg-gmw-dark p-6 text-white lg:block">
        <div className="mb-10">
          <div className="text-3xl font-black tracking-tight">G.M.W</div>
          <div className="text-sm text-white/60">Grow. Manage. Win.</div>
        </div>
        <nav className="space-y-2">
          {links.map(({ to, label, icon: Icon }) => (<NavLink key={to} to={to} className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-4 py-3 transition ${isActive ? 'bg-white text-gmw-dark' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
              <Icon size={19}/> {label}
            </NavLink>))}
        </nav>
      </aside>
      <main className="lg:pl-72">
        <div className="mx-auto max-w-7xl p-5 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>);
}
