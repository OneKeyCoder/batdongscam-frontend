import React from 'react';
import { DollarSign, Wallet } from 'lucide-react';

const SalaryCard = ({ label, value }: any) => (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col justify-center h-28">
        <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500 font-medium">{label}</span>
        </div>
        <p className="text-lg font-bold text-red-600">{value}</p>
    </div>
);

export default function AgentSalaryTab() {
  return (
    <div className="space-y-8">
        {/* Nút Pay nằm góc phải của section này */}
        <div className="relative">
             <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-gray-900 text-sm">Current month salary</h3>
                 <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-colors">
                    <Wallet className="w-3 h-3" /> Pay
                 </button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 <SalaryCard label="Total salary" value="45.000.000 VNĐ" />
                 <SalaryCard label="Paid" value="0.000 VNĐ" />
                 <SalaryCard label="Unpaid" value="45.000.000 VNĐ" />
                 <SalaryCard label="Bonus" value="0.000 VNĐ" />
             </div>
        </div>

        <div>
             <h3 className="font-bold text-gray-900 mb-4 text-sm">All career salary</h3>
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 <SalaryCard label="Total salary" value="890.000.000 VNĐ" />
                 <SalaryCard label="Paid" value="835.000.000 VNĐ" />
                 <SalaryCard label="Unpaid" value="45.000.000 VNĐ" />
                 <SalaryCard label="Bonus" value="20.000.000 VNĐ" />
             </div>
        </div>
    </div>
  );
}