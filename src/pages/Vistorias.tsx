
import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { ChecklistTemplate, Inspection } from '../types';
import { Link, useNavigate } from 'react-router-dom';

const Vistorias: React.FC = () => {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'MODELOS' | 'HISTORICO'>('MODELOS');
  const [showDeleteModal, setShowDeleteModal] = useState<{ id: string, type: 'TEMPLATE' | 'INSPECTION' } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = () => {
    setTemplates(storage.getTemplates());
    setInspections(storage.getInspections());
  };

  const handleDelete = () => {
    if (!showDeleteModal) return;
    if (showDeleteModal.type === 'TEMPLATE') {
        storage.deleteTemplate(showDeleteModal.id);
    } else {
        storage.deleteInspection(showDeleteModal.id);
    }
    setShowDeleteModal(null);
    loadData();
  };

  const handleDuplicate = (id: string) => {
    storage.duplicateTemplate(id);
    loadData();
  };

  const handleToggleFavorite = (id: string) => {
    storage.toggleFavorite(id);
    loadData();
  };

  const filteredInspections = inspections.filter(ins => {
    const term = searchTerm.toLowerCase();
    return (
        ins.companyName?.toLowerCase().includes(term) ||
        ins.clientName?.toLowerCase().includes(term) ||
        ins.plate?.toLowerCase().includes(term) ||
        ins.brand?.toLowerCase().includes(term) ||
        ins.model?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-black text-[#1e293b] tracking-tight">Vistorias</h1>
          <div className="flex gap-6 mt-6">
              <button 
                onClick={() => setActiveTab('MODELOS')}
                className={`text-sm font-black tracking-widest uppercase pb-2 transition-all border-b-4 ${activeTab === 'MODELOS' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-300'}`}
              >
                  Meus Modelos
              </button>
              <button 
                onClick={() => setActiveTab('HISTORICO')}
                className={`text-sm font-black tracking-widest uppercase pb-2 transition-all border-b-4 ${activeTab === 'HISTORICO' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-300'}`}
              >
                  Histórico Realizado
              </button>
          </div>
        </div>
        <button 
          onClick={() => navigate('/vistorias/novo')}
          className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-indigo-100 hover:scale-110 active:scale-90 transition-all"
        >
            <span className="material-symbols-outlined font-bold text-3xl">add</span>
        </button>
      </header>

      {activeTab === 'MODELOS' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {templates.map((template) => (
            <div key={template.id} className="bg-white rounded-[48px] p-10 shadow-sm border border-slate-50 flex flex-col justify-between h-[520px] hover:shadow-2xl transition-all group relative">
                
                <div className="flex justify-between items-center">
                    <div className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase">
                        {template.fields?.length || 0} ITENS
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button 
                        onClick={() => navigate(`/vistorias/editar/${template.id}`)} 
                        className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                        >
                            <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                        <button 
                        onClick={() => handleDuplicate(template.id)} 
                        className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                        >
                            <span className="material-symbols-outlined text-xl">content_copy</span>
                        </button>
                        <button 
                        onClick={() => setShowDeleteModal({ id: template.id, type: 'TEMPLATE' })} 
                        className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                        >
                            <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                        <button 
                            onClick={() => handleToggleFavorite(template.id)}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm ${template.isFavorite ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-slate-300 hover:text-amber-500'}`}
                        >
                            <span className={`material-symbols-outlined text-2xl ${template.isFavorite ? 'fill-1' : ''}`}>star</span>
                        </button>
                    </div>
                </div>

                <div className="space-y-6 flex-1 flex flex-col justify-center">
                    <h3 className="text-3xl font-black text-slate-800 leading-tight text-center px-4">{template.name}</h3>
                    <div className="w-full h-40 border-2 border-dashed border-slate-100 rounded-[32px] flex items-center justify-center text-slate-100 group-hover:text-indigo-50 group-hover:border-indigo-50 transition-colors">
                        <span className="material-symbols-outlined text-7xl">checklist</span>
                    </div>
                </div>

                <Link 
                    to={`/vistorias/executar/${template.id}`}
                    className="w-full bg-[#0f172a] text-white py-6 rounded-[28px] font-black text-xs tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl hover:bg-slate-800 transition-all uppercase mt-4"
                >
                    <span className="material-symbols-outlined text-xl">check_circle</span>
                    Iniciar Vistoria Pro
                </Link>
            </div>
            ))}

            <button 
            onClick={() => navigate('/vistorias/novo')}
            className="border-4 border-dashed border-slate-100 rounded-[48px] h-[520px] flex flex-col items-center justify-center gap-4 text-slate-200 hover:text-indigo-400 hover:border-indigo-100 transition-all group"
            >
                <div className="w-20 h-20 rounded-full border-4 border-dashed border-current flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-5xl">add</span>
                </div>
                <span className="font-black text-xs tracking-widest uppercase">Criar Novo Modelo</span>
            </button>
        </div>
      ) : (
        <div className="space-y-6">
            <div className="relative group max-w-xl">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                    <span className="material-symbols-outlined text-2xl">search</span>
                </div>
                <input 
                    type="text" 
                    placeholder="Buscar por Empresa (V4, SAS...), Cliente ou Placa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-slate-100 rounded-3xl pl-16 pr-8 py-5 font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-50 transition-all shadow-sm placeholder:text-slate-300"
                />
            </div>

            <div className="bg-white rounded-[44px] border border-slate-100 shadow-sm overflow-hidden p-2">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/30">
                            <th className="px-10 py-6 text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">CLIENTE / VEÍCULO</th>
                            <th className="px-10 py-6 text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase text-center">DATA</th>
                            <th className="px-10 py-6 text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase text-center">VALOR</th>
                            <th className="px-10 py-6 text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase text-right">AÇÕES</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredInspections.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-10 py-32 text-center text-slate-300 italic font-bold uppercase tracking-widest">Nenhuma vistoria encontrada para "{searchTerm}"</td>
                            </tr>
                        ) : (
                            filteredInspections.map(ins => (
                                <tr key={ins.id} className="hover:bg-slate-50/50 transition-all group">
                                    <td className="px-10 py-8">
                                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-1.5 leading-none">{ins.companyName || 'EMPRESA MATRIZ'}</p>
                                        <p className="font-black text-slate-900 text-xl leading-none uppercase">{ins.clientName}</p>
                                        <div className="mt-3">
                                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest bg-slate-50 border border-slate-100/50 px-3 py-1.5 rounded-lg inline-flex items-center gap-2">
                                            {ins.brand} {ins.model} <span className="w-1 h-1 rounded-full bg-slate-200"></span> {ins.plate}
                                        </span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-center">
                                        <span className="text-sm font-bold text-slate-500 tracking-tight">{new Date(ins.date).toLocaleDateString()}</span>
                                    </td>
                                    <td className="px-10 py-8 text-center font-black text-emerald-600 text-xl tracking-tight">
                                        R$ {ins.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <button 
                                                onClick={() => navigate(`/vistorias/ver/${ins.id}`)}
                                                className="w-12 h-12 bg-indigo-50 text-indigo-400 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm flex items-center justify-center group/btn"
                                                title="Ver e Editar"
                                            >
                                                <span className="material-symbols-outlined">visibility</span>
                                            </button>
                                            <button 
                                                onClick={() => setShowDeleteModal({ id: ins.id, type: 'INSPECTION' })}
                                                className="w-12 h-12 bg-red-50 text-red-400 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm flex items-center justify-center group/btn"
                                            >
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[52px] p-14 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner">
              <span className="material-symbols-outlined text-6xl">warning</span>
            </div>
            <h3 className="text-3xl font-black text-slate-900 text-center mb-4">Excluir {showDeleteModal.type === 'TEMPLATE' ? 'Modelo' : 'Vistoria'}?</h3>
            <p className="text-slate-400 text-center mb-12 font-bold leading-relaxed">Esta ação não pode ser desfeita e os dados serão removidos permanentemente.</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 px-8 py-5 rounded-2xl bg-slate-50 text-slate-500 font-black text-xs tracking-widest uppercase hover:bg-slate-100 transition-all"
              >
                Manter
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 px-8 py-5 rounded-2xl bg-red-600 text-white font-black text-xs tracking-widest uppercase hover:bg-red-700 shadow-xl shadow-red-200 transition-all"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vistorias;
