import React from 'react';
import { Heart } from 'lucide-react';

const districts = [
    { name: 'Quận 1', price: '1,00.00 $/m²', total: '12.130,41 m²', code: '123.534.125', img: 'https://images.unsplash.com/photo-1545641203-7d072a14e3b2?w=300' },
    { name: 'Quận Bình Thạnh', price: '1,00.00 $/m²', total: '12.130,41 m²', code: '123.534.125', img: 'https://images.unsplash.com/photo-1565514020176-8f3521360699?w=300' },
    { name: 'Thành phố Thủ Đức', price: '1,00.00 $/m²', total: '12.130,41 m²', code: '123.534.125', img: 'https://images.unsplash.com/photo-1596280624009-85834872172a?w=300' },
];

export default function DistrictSidebar() {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-gray-900">Districts</h3>
      {districts.map((d, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="h-32 w-full relative">
                <img src={d.img} alt={d.name} className="w-full h-full object-cover" />
                <button className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full hover:bg-white hover:text-red-500 transition-colors">
                    <Heart className="w-4 h-4" />
                </button>
            </div>
            <div className="p-3">
                <h4 className="font-bold text-gray-900 text-sm mb-2">{d.name}</h4>
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-red-600 font-bold text-xs">{d.price}</p>
                        <p className="text-gray-500 text-[10px] flex items-center gap-1 mt-0.5">
                            <span className="w-3 h-3 rounded-full bg-gray-200 flex items-center justify-center text-[8px]">👤</span>
                            {d.code}
                        </p>
                    </div>
                    <span className="text-red-600 font-bold text-xs">{d.total}</span>
                </div>
            </div>
        </div>
      ))}
    </div>
  );
}