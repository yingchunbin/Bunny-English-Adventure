
import React, { useState, useEffect } from 'react';
import { FarmOrder, FarmItem } from '../../types';
import { Truck, X, RefreshCw, Coins, Zap, Clock } from 'lucide-react';
import { playSFX } from '../../utils/sound';
import { Avatar } from '../Avatar';

interface OrderBoardProps {
  orders: FarmOrder[];
  items: FarmItem[];
  inventory: any;
  onDeliver: (order: FarmOrder) => void;
  onRefresh: () => void;
  onClose: () => void;
  onShowAlert: (msg: string, type: 'INFO' | 'DANGER') => void;
}

export const OrderBoard: React.FC<OrderBoardProps> = ({ orders, items, inventory, onDeliver, onRefresh, onClose, onShowAlert }) => {
  // Local state to force re-render every minute for countdowns
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
      const interval = setInterval(() => setNow(Date.now()), 60000);
      return () => clearInterval(interval);
  }, []);

  const getRemainingTime = (expiresAt: number) => {
      const diff = expiresAt - now;
      if (diff <= 0) return "Hết hạn";
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) return `${hours}h ${minutes}p`;
      return `${minutes} phút`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-[2.5rem] w-full max-w-md relative border-8 border-orange-100 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            <div className="bg-gradient-to-r from-orange-400 to-orange-600 p-6 text-white text-center relative flex flex-col items-center">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"><X size={24}/></button>
                <div className="mb-2"><Avatar emoji="🐢" bgGradient="bg-white/20" size="sm" /></div>
                <h3 className="text-2xl font-black flex items-center justify-center gap-3 uppercase tracking-tighter">
                    <Truck size={32} /> Giao hàng cho làng
                </h3>
                <p className="text-[10px] font-black text-orange-100 mt-1 uppercase tracking-widest">Thầy Rùa giúp bé kết nối với dân làng!</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-orange-50/30">
                {orders.length === 0 ? (
                    <div className="text-center py-12 flex flex-col items-center">
                        <div className="text-6xl mb-4 grayscale opacity-30 select-none">🚚</div>
                        <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest italic">Hết đơn hàng rồi bé ơi!</p>
                    </div>
                ) : (
                    orders.map(order => {
                        const canDeliver = order.requirements.every(req => (inventory[req.cropId] || 0) >= req.amount);
                        const isExpired = order.expiresAt <= now;
                        const timeString = getRemainingTime(order.expiresAt);

                        return (
                            <div key={order.id} className={`bg-white border-4 border-white rounded-[2rem] p-4 shadow-sm transition-colors ${isExpired ? 'opacity-50 grayscale' : 'hover:border-orange-200'}`}>
                                <div className="flex justify-between items-center mb-4 border-b border-orange-50 pb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-black text-[10px] shadow-inner">{order.npcName.charAt(0)}</div>
                                        <div className="flex flex-col">
                                            <span className="font-black text-slate-800 text-xs uppercase tracking-tighter">{order.npcName}</span>
                                            <span className={`text-[9px] font-bold flex items-center gap-1 ${isExpired ? 'text-red-500' : 'text-slate-400'}`}>
                                                <Clock size={8}/> {timeString}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex items-center gap-1 text-[10px] font-black text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full border border-amber-200"><Coins size={12} fill="currentColor"/> {order.rewardCoins}</div>
                                        <div className="flex items-center gap-1 text-[10px] font-black text-purple-700 bg-purple-100 px-3 py-1.5 rounded-full border border-purple-200"><Zap size={12} fill="currentColor"/> {order.rewardExp} XP</div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-wrap gap-2 flex-1">
                                        {order.requirements.map(req => {
                                            const item = items.find(c => c.id === req.cropId);
                                            const has = inventory[req.cropId] || 0;
                                            const isEnough = has >= req.amount;
                                            
                                            return (
                                                <div key={req.cropId} className="flex flex-col items-center bg-slate-50 p-2 rounded-xl border border-slate-100 min-w-[70px]">
                                                    <div className="relative">
                                                        <span className="text-3xl filter drop-shadow-sm select-none">{item?.emoji}</span>
                                                        <div className={`absolute -bottom-1 -right-1 text-[9px] font-black px-1.5 py-0.5 rounded-md border ${isEnough ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-700 border-red-300'}`}>
                                                            {has}/{req.amount}
                                                        </div>
                                                    </div>
                                                    <span className="text-[9px] font-bold text-slate-600 mt-1 max-w-[60px] truncate">{item?.name}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <button 
                                        onClick={() => {
                                            if (isExpired) return;
                                            if (canDeliver) {
                                                onDeliver(order);
                                            } else {
                                                playSFX('wrong');
                                                onShowAlert("Bé chưa đủ hàng trong Kho nông sản để giao nhé!", "DANGER");
                                            }
                                        }}
                                        disabled={isExpired}
                                        className={`ml-2 h-12 px-5 rounded-2xl font-black text-[10px] uppercase shadow-md transition-all active:scale-90 flex items-center justify-center ${canDeliver && !isExpired ? 'bg-green-500 text-white shadow-green-200 hover:bg-green-600' : 'bg-slate-100 text-slate-400 border-2 border-slate-200 shadow-none grayscale cursor-not-allowed'}`}
                                    >
                                        {isExpired ? 'Hết hạn' : 'Giao Hàng'}
                                    </button>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            <div className="p-4 bg-white border-t border-slate-100">
                <button 
                    onClick={onRefresh}
                    className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-200 flex items-center justify-center gap-3 transition-all active:scale-95 text-xs uppercase tracking-widest"
                >
                    <RefreshCw size={18} /> THÊM ĐƠN (LÀM BÀI TẬP)
                </button>
            </div>
        </div>
    </div>
  );
};
