
import React, { useState, useEffect } from 'react';
import { FarmOrder, FarmItem } from '../../types';
import { Truck, X, RefreshCw, Coins, Zap, Clock, Info, Star, CheckCircle, Crown, Gift } from 'lucide-react';
import { playSFX } from '../../utils/sound';
import { Avatar } from '../Avatar';
import { CROPS, ANIMALS, RECIPES, MACHINES, PRODUCTS } from '../../data/farmData';

interface OrderBoardProps {
  orders: FarmOrder[];
  items: FarmItem[];
  inventory: any;
  onDeliver: (order: FarmOrder, e: React.MouseEvent) => void;
  onRefresh: () => void;
  onClose: () => void;
  onShowAlert: (msg: string, type: 'INFO' | 'DANGER') => void;
}

export const OrderBoard: React.FC<OrderBoardProps> = ({ orders, items, inventory, onDeliver, onRefresh, onClose, onShowAlert }) => {
  // Local state to force re-render every minute for countdowns
  const [now, setNow] = useState(Date.now());
  const [deliveringId, setDeliveringId] = useState<string | null>(null);

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

  const handleDeliverClick = (order: FarmOrder, e: React.MouseEvent) => {
      if (deliveringId) return; // Prevent double clicks

      setDeliveringId(order.id);
      
      // Call parent to trigger effects immediately when clicked
      onDeliver(order, e);

      // Wait for animation to finish before actually removing the order ID locally (visual consistency)
      setTimeout(() => {
          setDeliveringId(null);
      }, 2500); 
  };

  const handleItemClick = (item: FarmItem) => {
      playSFX('click');
      let msg = "";
      
      // 1. Check Crop
      const crop = CROPS.find(c => c.id === item.id);
      if (crop) {
          msg = `🌱 ${item.name} là Nông sản. Bé hãy mua hạt giống và trồng trên đất nhé!`;
      } else {
          // 2. Check Animal Product
          const animal = ANIMALS.find(a => a.produceId === item.id);
          if (animal) {
              msg = `🐮 ${item.name} được thu hoạch từ ${animal.name}. Bé hãy nuôi và cho ${animal.name} ăn nhé!`;
          } else {
              // 3. Check Machine Product
              const recipe = RECIPES.find(r => r.outputId === item.id);
              if (recipe) {
                  const machine = MACHINES.find(m => m.id === recipe.machineId);
                  if (machine) {
                      msg = `🏭 ${item.name} được làm từ ${machine.name}. Bé hãy lắp máy này nhé!`;
                  }
              }
          }
      }

      if (msg) {
          onShowAlert(msg, 'INFO');
      } else {
          onShowAlert(`Bé hãy tìm ${item.name} trong Nông trại nhé!`, 'INFO');
      }
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
                        const isDelivering = deliveringId === order.id;

                        // RENDER SUCCESS STATE
                        if (isDelivering) {
                            return (
                                <div key={order.id} className="bg-green-50 border-4 border-green-400 rounded-[2rem] p-6 shadow-lg flex flex-col items-center justify-center animate-bounce min-h-[200px] relative overflow-hidden">
                                    <div className="absolute inset-0 bg-green-100/50 animate-pulse"></div>
                                    <div className="text-green-600 mb-2 animate-ping relative z-10"><CheckCircle size={56} /></div>
                                    <h4 className="text-2xl font-black text-green-700 uppercase tracking-tight mb-4 relative z-10">Thành Công!</h4>
                                    
                                    <div className="grid grid-cols-2 gap-3 w-full relative z-10">
                                        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-sm border border-amber-200">
                                            <Coins size={24} className="text-amber-500 fill-amber-500"/>
                                            <span className="font-black text-slate-700 text-lg">+{order.rewardCoins}</span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-sm border border-blue-200">
                                            <Crown size={24} className="text-blue-500 fill-blue-500"/>
                                            <span className="font-black text-slate-700 text-lg">+{order.rewardExp} XP</span>
                                        </div>
                                        {(order.rewardStars || 0) > 0 && (
                                            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-sm border border-purple-200">
                                                <Star size={24} className="text-purple-500 fill-purple-500"/>
                                                <span className="font-black text-slate-700 text-lg">+{order.rewardStars}</span>
                                            </div>
                                        )}
                                        {(order.rewardFertilizer || 0) > 0 && (
                                            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-sm border border-indigo-200">
                                                <Zap size={24} className="text-indigo-500 fill-indigo-500"/>
                                                <span className="font-black text-slate-700 text-lg">+{order.rewardFertilizer}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        }

                        // RENDER NORMAL CARD
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
                                    <div className="flex gap-1.5 flex-wrap justify-end max-w-[60%]">
                                        <div className="flex items-center gap-1 text-[10px] font-black text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100"><Coins size={10} fill="currentColor"/> {order.rewardCoins}</div>
                                        <div className="flex items-center gap-1 text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100" title="Kinh nghiệm"><Crown size={10} fill="currentColor"/> {order.rewardExp}</div>
                                        {(order.rewardStars || 0) > 0 && (
                                            <div className="flex items-center gap-1 text-[10px] font-black text-purple-700 bg-purple-50 px-2 py-1 rounded-lg border border-purple-100"><Star size={10} fill="currentColor"/> {order.rewardStars}</div>
                                        )}
                                        {(order.rewardFertilizer || 0) > 0 && (
                                            <div className="flex items-center gap-1 text-[10px] font-black text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100" title="Phân bón"><Zap size={10} fill="currentColor"/> {order.rewardFertilizer}</div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-wrap gap-2 flex-1">
                                        {order.requirements.map(req => {
                                            const item = items.find(c => c.id === req.cropId);
                                            const has = inventory[req.cropId] || 0;
                                            const isEnough = has >= req.amount;
                                            
                                            if (!item) return null;

                                            return (
                                                <div 
                                                    key={req.cropId} 
                                                    onClick={() => handleItemClick(item)}
                                                    className="flex flex-col items-center bg-slate-50 p-2 rounded-xl border border-slate-100 min-w-[60px] cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors group relative"
                                                >
                                                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"><Info size={10} className="text-blue-400"/></div>
                                                    <div className="relative">
                                                        <span className="text-2xl filter drop-shadow-sm select-none">{item.emoji}</span>
                                                        <div className={`absolute -bottom-1 -right-2 text-[9px] font-black px-1.5 py-0.5 rounded-md border shadow-sm ${isEnough ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-700 border-red-300'}`}>
                                                            {has}/{req.amount}
                                                        </div>
                                                    </div>
                                                    <span className="text-[8px] font-bold text-slate-500 mt-1 max-w-[50px] truncate">{item.name}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <button 
                                        onClick={(e) => {
                                            if (isExpired) return;
                                            if (canDeliver) {
                                                handleDeliverClick(order, e);
                                            } else {
                                                playSFX('wrong');
                                                onShowAlert("Bé chưa đủ hàng trong Kho nông sản để giao nhé!", "DANGER");
                                            }
                                        }}
                                        disabled={isExpired || deliveringId !== null}
                                        className={`ml-2 h-12 px-4 rounded-2xl font-black text-[10px] uppercase shadow-md transition-all active:scale-90 flex items-center justify-center gap-1 ${canDeliver && !isExpired ? 'bg-green-500 text-white shadow-green-200 hover:bg-green-600' : 'bg-slate-100 text-slate-400 border-2 border-slate-200 shadow-none grayscale cursor-not-allowed'}`}
                                    >
                                        {isExpired ? 'Hết hạn' : <><Gift size={16}/> Giao</>}
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
                    disabled={deliveringId !== null}
                    className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-200 flex items-center justify-center gap-3 transition-all active:scale-95 text-xs uppercase tracking-widest disabled:opacity-70 disabled:grayscale"
                >
                    <RefreshCw size={18} /> THÊM ĐƠN (LÀM BÀI TẬP)
                </button>
            </div>
        </div>
    </div>
  );
};
