export function StatCard({ title, value, hint, icon }) {
    return (<div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h3 className="mt-2 text-2xl font-black text-gmw-dark">{value}</h3>
          {hint && <p className="mt-2 text-sm text-slate-500">{hint}</p>}
        </div>
        <div className="rounded-2xl bg-gmw-soft p-3 text-gmw-dark">{icon}</div>
      </div>
    </div>);
}
