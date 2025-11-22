import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { subscribeToVotes } from '../services/voteService';
import { COLORS_LIST } from '../constants';
import { VoteCounts, DashboardData } from '../types';

const DashboardScreen: React.FC = () => {
  const [data, setData] = useState<DashboardData[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    // Transform static list into initial chart data
    const initialData = COLORS_LIST.map(c => ({
      colorId: c.id,
      name: c.name,
      count: 0,
      fill: c.hex
    }));
    setData(initialData);

    // Subscribe to real-time updates
    const unsubscribe = subscribeToVotes((counts: VoteCounts) => {
      let total = 0;
      const chartData = COLORS_LIST.map(c => {
        const count = counts[c.id] || 0;
        total += count;
        return {
          colorId: c.id,
          name: c.name,
          count: count,
          fill: c.hex
        };
      });
      setData(chartData);
      setTotalVotes(total);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-3xl font-bold text-dark">Live Stats</h2>
          <p className="text-gray-500">Real-time team distribution</p>
        </div>
        <div className="text-right">
          <span className="block text-sm text-gray-400 uppercase tracking-wide">Total Participants</span>
          <span className="text-4xl font-mono font-bold text-primary">{totalVotes}</span>
        </div>
      </div>

      {/* Desktop/Tablet Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[400px] mb-8 hidden md:block">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#6B7280', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#6B7280' }} 
            />
            <Tooltip 
              cursor={{ fill: '#F9FAFB' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]} animationDuration={1000}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Mobile List View (Charts can be cramped on mobile) */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {data.map((item) => (
          <div key={item.colorId} className="bg-white p-4 rounded-xl shadow-sm border-l-8 flex justify-between items-center" style={{ borderLeftColor: item.fill }}>
            <div>
              <h3 className="font-bold text-gray-700">{item.name}</h3>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {item.count}
            </div>
          </div>
        ))}
      </div>

      {/* Legend / Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
        {data.map((item) => (
          <div key={item.colorId} className="text-center p-4 bg-white rounded-lg shadow-sm border border-gray-50">
            <div 
              className="w-3 h-3 rounded-full mx-auto mb-2" 
              style={{ backgroundColor: item.fill }}
            ></div>
            <div className="text-xs text-gray-400 uppercase font-semibold">Team</div>
            <div className="font-semibold text-sm truncate">{item.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardScreen;
