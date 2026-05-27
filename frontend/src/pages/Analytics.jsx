import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../api/client';
import { expenseChart, monthlyChart } from '../api/mockData';
import { StatCard } from '../components/StatCard';
import { ArrowDownLeft, ArrowUpRight, BadgePercent, Shield } from 'lucide-react';
export function Analytics() {
    const [summary, setSummary] = useState({ income: 0, expenses: 0, cashback: 0, score: 500, operations: 0 });
    const [categories, setCategories] = useState(expenseChart);
    const [monthly, setMonthly] = useState(monthlyChart);
    useEffect(() => {
        Promise.all([api.get('/analytics/summary'), api.get('/analytics/categories'), api.get('/analytics/monthly')])
            .then(([s, c, m]) => { setSummary(s.data); setCategories(c.data.length ? c.data : expenseChart); setMonthly(m.data.length ? m.data : monthlyChart); })
            .catch(() => undefined);
    }, []);
    return (<div>
      <h1 className="text-4xl font-black">Аналитика расходов</h1>
      <p className="mt-2 text-slate-500">Реальные категории, доходы и расходы рассчитываются по таблице Transaction.</p>
      <div className="mt-8 grid gap-5 md:grid-cols-4">
        <StatCard title="Доходы" value={`${Number(summary.income).toLocaleString('ru-RU')} ₽`} hint="Поступления" icon={<ArrowUpRight />}/>
        <StatCard title="Расходы" value={`${Number(summary.expenses).toLocaleString('ru-RU')} ₽`} hint="Списания" icon={<ArrowDownLeft />}/>
        <StatCard title="Кешбэк" value={`${Number(summary.cashback).toLocaleString('ru-RU')} ₽`} hint="Бонусы" icon={<BadgePercent />}/>
        <StatCard title="Score" value={String(summary.score)} hint={`${summary.operations} операций`} icon={<Shield />}/>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-black">Расходы по категориям</h2>
          <div className="h-80"><ResponsiveContainer><PieChart><Pie dataKey="value" data={categories} nameKey="name" outerRadius={110} label/><Tooltip /></PieChart></ResponsiveContainer></div>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-black">Доходы и расходы</h2>
          <div className="h-80"><ResponsiveContainer><BarChart data={monthly}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="month"/><YAxis /><Tooltip /><Bar dataKey="income"/><Bar dataKey="expenses"/></BarChart></ResponsiveContainer></div>
        </div>
      </div>
    </div>);
}
