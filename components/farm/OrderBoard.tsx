import React from 'react';
import { FarmOrder, FarmItem } from '../../types';
import { Truck, X, RefreshCw, Coins, Zap } from 'lucide-react';
import { playSFX } from '../../utils/sound';
import { Avatar } from '../Avatar';

interface OrderBoardProps {
  orders: FarmOrder[];
  items: FarmItem[]; // Changed from Crop[] to FarmItem[] to support Products
  inventory: any;
  onDeliver: (order: FarmOrder) => void;
  onRefresh: () => void;
  onClose: () => void;
}

export const OrderBoard: React.FC<OrderBoardProps> = ({ orders, items, inventory, onDeliver, onRefresh, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-[2.5rem] w-full max-w-sm relative border-8 border-orange-100 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
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
                        return (
                            <div key={order.id} className="bg-white border-4 border-white rounded-[2rem] p-4 shadow-sm hover:border-orange-200 transition-colors">
                                <div className="flex justify-between items-center mb-4 border-b border-orange-50 pb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-black text-[10px] shadow-inner">{order.npcName.charAt(0)}</div>
                                        <span className="font-black text-slate-800 text-xs uppercase tracking-tighter">{order.npcName}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex items-center gap-1 text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100"><Coins size={10} fill="currentColor"/> {order.rewardCoins}</div>
                                        <div className="flex items-center gap-1 text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-100"><Zap size={10} fill="currentColor"/> {order.rewardExp}</div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-wrap gap-4 flex-1">
                                        {order.requirements.map(req => {
                                            const item = items.find(c => c.id === req.cropId);
                                            const has = inventory[req.cropId] || 0;
                                            return (
                                                <div key={req.cropId} className="flex items-center gap-2">
                                                    <span className="text-3xl filter drop-shadow-sm select-none">{item?.emoji}</span>
                                                    <div className={`text-[10px] font-black px-2 py-0.5 rounded-lg border-2 ${has >= req.amount ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                                        {has}/{req.amount}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <button 
                                        onClick={() => canDeliver ? onDeliver(order) : playSFX('wrong')}
                                        className={`ml-2 px-5 py-3 rounded-2xl font-black text-[10px] uppercase shadow-md transition-all active:scale-90 ${canDeliver ? 'bg-green-500 text-white shadow-green-200 hover:bg-green-600' : 'bg-slate-100 text-slate-400 border-2 border-slate-200 shadow-none grayscale cursor-not-allowed'}`}
                                    >
                                        Giao
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