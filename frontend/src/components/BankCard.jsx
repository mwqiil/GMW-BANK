import { Lock, ShieldCheck } from 'lucide-react';
export function BankCard({ card }) {
    const number = card.cardNumber || card.maskedNumber || '**** 0000';
    const holder = card.cardHolder || card.holder || 'GMW CLIENT';
    const expiry = card.expiryDate || card.expiry || '08/29';
    return (<div className="gradient-card card-glow rounded-[2rem] p-7 text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-white/60">G.M.W Black</p>
          <h2 className="mt-3 text-2xl font-black">Virtual Debit</h2>
        </div>
        {card.status === 'ACTIVE' ? <ShieldCheck className="text-gmw-accent"/> : <Lock className="text-red-300"/>}
      </div>
      <div className="mt-12 text-3xl font-black tracking-widest">{number}</div>
      <div className="mt-8 flex items-end justify-between">
        <div>
          <p className="text-xs text-white/50">CARD HOLDER</p>
          <p className="font-bold">{holder}</p>
        </div>
        <div>
          <p className="text-xs text-white/50">EXPIRES</p>
          <p className="font-bold">{expiry}</p>
        </div>
      </div>
    </div>);
}
