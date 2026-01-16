
import React from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'DANGER' | 'INFO';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
    isOpen, message, onConfirm, onCancel, confirmText = "Đồng ý", cancelText = "Hủy", type = 'INFO' 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-[2rem] w-full max-w-sm p-6 shadow-2xl border-4 border-slate-100 flex flex-col items-center text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${type === 'DANGER' ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'}`}>
                {type === 'DANGER' ? <AlertTriangle size={32} /> : <Check size={32} />}
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2">Thông báo</h3>
            <p className="text-slate-500 font-bold mb-6">{message}</p>
            
            <div className="flex gap-3 w-full">
                <button 
                    onClick={onCancel} 
                    className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                    {cancelText}
                </button>
                <button 
                    onClick={onConfirm} 
                    className={`flex-1 py-3 text-white rounded-xl font-bold shadow-lg transition-transform active:scale-95 ${type === 'DANGER' ? 'bg-red-500 shadow-red-200' : 'bg-blue-500 shadow-blue-200'}`}
                >
                    {confirmText}
                </button>
            </div>
        </div>
    </div>
  );
};
