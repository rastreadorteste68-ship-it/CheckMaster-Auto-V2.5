
import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { Inspection, ChecklistTemplate } from '../types';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [favorites, setFavorites] = useState<ChecklistTemplate[]>([]);
  
  useEffect(() => {
    setInspections(storage.getInspections());
    setFavorites(storage.getTemplates().filter(t => t.isFavorite));
  }, []);

  const totalRevenue = inspections.reduce((acc, curr) => acc + (curr.totalValue || 0), 0);
  const todayCount = inspections.filter(i => new Date(i.date).toDateString() === new Date().toDateString()).length;

  return (
    <div className="space-y-14">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Dashboard Pro</h1>
          <p className="text-slate-400 font-medium mt-1">Bem-vindo ao seu painel administrativo</p>
        </div>
        <Link 
          to="/vistorias" 
          className="bg-gradient-to-r from-[#6366f1] to-[#4f46e5] text-white px-10 py-4 rounded-2xl shadow-2xl shadow-indigo-300 hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center gap-3 font-bold text-lg"
        >
            <span className="material-symbols-outlined font-bold">add_circle</span>
            Novo Modelo
        </Link>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {[
          { label: 'VISTORIAS HOJE', value: todayCount, icon: 'assignment', color: 'bg-indigo-50 text-indigo-500' },
          { label: 'RECEITA TOTAL', value: `R$ ${totalRevenue.toLocaleString()}`, icon: 'trending_up', color: 'bg-emerald-50 text-emerald-500' },
          { label: 'EMPRESAS ATIVAS', value: '1', icon: 'corporate_fare', color: 'bg-amber-50 text-amber-500' },
        ].map((card, idx) => (
          <div key={idx} className="bg-white p-10 rounded-[40px] border border-slate-50 shadow-sm flex flex-col items-start gap-6 transition-all hover:shadow-xl hover:-translate-y-1">
            <div className={`p-5 rounded-[22px] ${card.color} flex items-center justify-center`}>
              <span className="material-symbols-outlined text-4xl">{card.icon}</span>
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 tracking-[0.25em] mb-2">{card.label}</p>
              <h3 className="text-4xl font-black text-slate-900">{card.value}</h3>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-10">
        <div className="flex justify-between items-center px-2">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-4">
                <span className="material-symbols-outlined text-amber-500 font-bold text-3xl">bolt</span>
                Modelos Rápidos
            </h2>
            <Link to="/vistorias" className="text-sm font-black text-indigo-600 tracking-widest uppercase hover:underline">VER TODOS</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {favorites.length === 0 ? (
                <div className="col-span-3 py-20 bg-slate-50 rounded-[48px] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300">
                    <span className="material-symbols-outlined text-6xl mb-4">star_rate</span>
                    <p className="font-bold">NENHUM MODELO FAVORITADO</p>
                    <Link to="/vistorias" className="text-indigo-600 font-black text-xs tracking-widest uppercase mt-4 hover:underline">Explorar Modelos</Link>
                </div>
            ) : favorites.slice(0, 3).map((template, idx) => (
                <Link 
                    key={template.id} 
                    to={`/vistorias/executar/${template.id}`}
                    className={`group relative p-12 rounded-[52px] text-white transition-all hover:scale-[1.04] flex flex-col justify-between h-[360px] overflow-hidden ${
                        idx === 0 ? 'bg-[#6366f1] shadow-[0_20px_50px_rgba(99,102,241,0.3)]' : 
                        idx === 1 ? 'bg-[#10b981] shadow-[0_20px_50px_rgba(16,185,129,0.3)]' : 
                        'bg-[#f59e0b] shadow-[0_20px_50px_rgba(245,158,11,0.3)]'
                    }`}
                >
                    <div className="flex justify-between items-start z-10">
                        <div className="bg-white/20 backdrop-blur-md w-12 h-12 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl fill-1">star</span>
                        </div>
                    </div>
                    
                    <div className="z-10">
                        <h3 className="text-3xl font-black leading-tight mb-3 drop-shadow-sm">{template.name}</h3>
                        <p className="text-white/80 text-xs font-black tracking-[0.2em] uppercase">
                            {template.fields?.length || 0} ITENS DE VISTORIA
                        </p>
                    </div>

                    <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-500"></div>
                </Link>
            ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
