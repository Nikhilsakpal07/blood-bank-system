import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

const AnalyticsChart = ({ data = [] }) => {
  // --- CRITICAL SAFETY CHECK: Prevent the White Screen ---
  // If data is not an array or is empty, we show a friendly message instead of crashing
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card"
      style={{ 
        height: '350px', 
        marginTop: '30px', 
        padding: '24px', 
        background: 'white', 
        borderRadius: '16px', 
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        border: '1px solid #e2e8f0'
      }}
    >
      <h3 style={{ marginBottom: '20px', color: '#1e293b', fontWeight: 800 }}>
        Donation Trends (Last 7 Days)
      </h3>

      {hasData ? (
        <ResponsiveContainer width="100%" height="90%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorUnits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#64748b', fontSize: 12}} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#64748b', fontSize: 12}} 
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
            />
            <Area 
              type="monotone" 
              dataKey="units" 
              stroke="#4f46e5" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorUnits)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ 
            height: '80%', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: '#f8fafc', 
            borderRadius: '12px',
            border: '1px dashed #cbd5e1',
            color: '#94a3b8'
        }}>
            <BarChart3 size={40} style={{ marginBottom: '10px', opacity: 0.5 }} />
            <p style={{ fontWeight: 600, margin: 0 }}>No Data Points Yet</p>
            <span style={{ fontSize: '12px' }}>Analytics will generate after your first donation entry.</span>
        </div>
      )}
    </motion.div>
  );
};

export default AnalyticsChart;