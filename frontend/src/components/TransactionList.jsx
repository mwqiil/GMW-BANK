function title(tx) {
    if (tx.title)
        return tx.title;
    if (tx.comment)
        return tx.comment;
    const map = {
        TOP_UP: 'Пополнение',
        TRANSFER: 'Перевод',
        PAYMENT: 'Оплата',
        CASHBACK: 'Кешбэк',
        FEE: 'Комиссия',
        REFUND: 'Возврат'
    };
    return map[tx.type] || 'Операция';
}
export function TransactionList({ items }) {
    return (<div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-black">Последние операции</h2>
        <span className="text-sm text-slate-500">{items.length} операций</span>
      </div>
      <div className="space-y-3">
        {items.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-slate-500">Операций пока нет</p>}
        {items.map((tx) => {
            const amount = Number(tx.amount);
            const positive = tx.type === 'TOP_UP' || tx.type === 'CASHBACK' || tx.type === 'REFUND';
            return (<div key={tx.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
              <div>
                <p className="font-bold">{title(tx)}</p>
                <p className="text-sm text-slate-500">{tx.category} · {new Date(tx.createdAt).toLocaleString('ru-RU')}</p>
              </div>
              <div className={`text-right text-lg font-black ${positive ? 'text-emerald-500' : 'text-gmw-dark'}`}>
                {positive ? '+' : '-'}{amount.toLocaleString('ru-RU')} ₽
              </div>
            </div>);
        })}
      </div>
    </div>);
}
