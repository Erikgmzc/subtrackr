'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface Subscription {
    category: string;
    price: number;
}

export default function ExpensesChart({ subscriptions }: { subscriptions: Subscription[] }) {

  const dataMap = subscriptions.reduce((acc, sub) => {
    const category = sub.category.toLowerCase();
    acc[category] = (acc[category] || 0) + Number(sub.price);
    return acc;
  }, {} as Record<string, number>);

  const data = Object.keys(dataMap).map((key) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: dataMap[key],
  }));

  const COLORS: Record<string, string> = {
    Streaming: '#EF4444',
    Gym: '#22c55e',
    Software: '#A855F7',
    Otros: '#64748B',
  };

  if (data.length === 0) return null;

  return (
    /* 1. Añadimos dark:bg-slate-900 y dark:border-slate-800 al contenedor */
    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center items-center h-full min-h-[250px] transition-colors duration-300">
      <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest w-full text-left mb-2">
        Desglose por Categoría
      </p>
      
      <div className="w-full h-64 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart style={{ outline: 'none' }}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              style={{ outline: 'none' }}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[entry.name] || COLORS.Otros} 
                  style={{ outline: 'none', cursor: 'default' }}
                />
              ))}
            </Pie>
            
            <Tooltip 
              formatter={(value: any, name: any) => [`${Number(value).toFixed(2)} €`, name]}
              /* 2. Ajustamos el Tooltip para que no use colores fijos que choquen con el darkmode */
              contentStyle={{ 
                borderRadius: '1rem', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                backgroundColor: 'var(--background)', // Usa la variable de tu globals.css
                color: 'var(--foreground)' 
              }}
              itemStyle={{ fontWeight: 'bold' }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Total en el centro del "Donut" */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* 3. Cambiamos el color del texto central para darkmode */}
          <span className="text-xl font-black text-slate-800 dark:text-slate-100">
            {data.reduce((a, b) => a + b.value, 0).toFixed(0)}€
          </span>
        </div>
      </div>
    </div>
  );
}