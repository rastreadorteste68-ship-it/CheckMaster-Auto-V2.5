
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storage } from '../services/storage';
import { VEHICLE_DATA, SERVICES_BY_TYPE } from '../constants';
import { ChecklistTemplate, ChecklistField, FieldType, AutoFillType } from '../types';

interface ComponentType {
  label: string;
  type: FieldType;
  icon: string;
  category: string;
}

const COMPONENTS: ComponentType[] = [
  { label: 'SELEÇÃO SIMPLES', type: 'SELECT_SIMPLE', icon: 'list_alt', category: 'SELECT' },
  { label: 'SELEÇÃO (+ PREÇO)', type: 'SELECT_PRICE', icon: 'inventory_2', category: 'PRICE' },
  { label: 'MÚLTIPLA (+ PREÇO)', type: 'MULTI_SELECT', icon: 'checklist', category: 'PRICE' },
  { label: 'VEÍCULO', type: 'AI_VEHICLE', icon: 'directions_car', category: 'IA' },
  { label: 'PLACA (SCANNER)', type: 'AI_PLATE', icon: 'tag', category: 'IA' },
  { label: 'FOTO', type: 'PHOTO', icon: 'photo_camera', category: 'MEDIA' },
  { label: 'DATA/HORA', type: 'DATE', icon: 'calendar_today', category: 'TIME' },
  { label: 'OK / FALHA', type: 'BOOLEAN', icon: 'check_circle', category: 'BOOLEAN' },
  { label: 'TEXTO', type: 'TEXT', icon: 'description', category: 'TEXT' },
  { label: 'NÚMERO', type: 'NUMBER', icon: '123', category: 'TEXT' },
  { label: 'IMEI (IA)', type: 'AI_IMEI', icon: 'screenshot_tablet', category: 'IA' },
  { label: 'PREÇO MANUAL', type: 'MANUAL_PRICE', icon: 'attach_money', category: 'PRICE' },
];

const AUTOFILL_CONFIG: Record<string, { color: string, icon: string, activeColor: string }> = {
  'TIPOS': { color: 'text-indigo-600 border-indigo-100 bg-indigo-50/30', activeColor: 'bg-indigo-600 text-white border-transparent shadow-lg shadow-indigo-100', icon: 'grid_view' },
  'CARROS': { color: 'text-blue-600 border-blue-100 bg-blue-50/30', activeColor: 'bg-blue-600 text-white border-transparent shadow-lg shadow-blue-100', icon: 'directions_car' },
  'MARCAS': { color: 'text-emerald-600 border-emerald-100 bg-emerald-50/30', activeColor: 'bg-emerald-600 text-white border-transparent shadow-lg shadow-emerald-100', icon: 'verified' },
  'SERVIÇOS': { color: 'text-rose-600 border-rose-100 bg-rose-50/30', activeColor: 'bg-rose-600 text-white border-transparent shadow-lg shadow-rose-100', icon: 'settings' }
};

const EditTemplate: React.FC = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [includeVehicleInfo, setIncludeVehicleInfo] = useState(true);
  const [fields, setFields] = useState<ChecklistField[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    const loadTemplate = () => {
      if (templateId) {
        const templates = storage.getTemplates();
        const t = templates.find(t => t.id === templateId);
        if (t) {
          setName(t.name);
          setIncludeVehicleInfo(t.includeVehicleInfo !== false);
          setFields((t.fields || []).map(f => ({
            ...f,
            options: f.options || []
          })));
        }
      }
      setIsLoading(false);
    };
    loadTemplate();
  }, [templateId]);

  const handleAddComponent = (comp: ComponentType) => {
    const newField: ChecklistField = {
      id: Math.random().toString(36).substr(2, 9),
      label: comp.label,
      type: comp.type,
      required: false,
      specializedAutoFill: 'NONE',
      options: []
    };
    setFields(prev => [...prev, newField]);
  };

  const updateField = useCallback((id: string, updates: Partial<ChecklistField>) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  }, []);

  const removeField = (id: string) => {
    setFields(prev => prev.filter(f => f.id !== id));
  };

  const getCatalogItems = (type: AutoFillType): string[] => {
    if (type === 'TIPOS') return ['Carro', 'Moto', 'Caminhão', 'Máquina', 'Barco', 'Avião', 'Outros'];
    if (type === 'MARCAS') {
        const brands = Object.values(VEHICLE_DATA).flat().map(v => v.brand);
        return Array.from(new Set(brands));
    }
    if (type === 'SERVIÇOS') {
        const services = Object.values(SERVICES_BY_TYPE).flat();
        return Array.from(new Set(services));
    }
    if (type === 'CARROS') {
        const cars = VEHICLE_DATA['Carro'].flatMap(v => v.models);
        return cars.slice(0, 20);
    }
    return [];
  };

  const toggleCatalogItem = (fieldId: string, label: string) => {
    setFields(prev => prev.map(f => {
        if (f.id !== fieldId) return f;
        const options = f.options || [];
        const index = options.findIndex(o => o.label === label);
        if (index >= 0) {
            return { ...f, options: options.filter((_, i) => i !== index) };
        } else {
            const newOpt = { id: Math.random().toString(36).substr(2, 6), label, price: 0 };
            return { ...f, options: [...options, newOpt] };
        }
    }));
  };

  const selectAllFromCatalog = (fieldId: string, type: AutoFillType) => {
    const items = getCatalogItems(type);
    setFields(prev => prev.map(f => {
        if (f.id !== fieldId) return f;
        const currentLabels = (f.options || []).map(o => o.label);
        const newOptions = [...(f.options || [])];
        items.forEach(item => {
            if (!currentLabels.includes(item)) {
                newOptions.push({ id: Math.random().toString(36).substr(2, 6), label: item, price: 0 });
            }
        });
        return { ...f, options: newOptions };
    }));
  };

  const clearOptions = (fieldId: string) => {
    updateField(fieldId, { options: [], specializedAutoFill: 'NONE' });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newFields = [...fields];
    const draggedItem = newFields[draggedIndex];
    newFields.splice(draggedIndex, 1);
    newFields.splice(index, 0, draggedItem);
    setDraggedIndex(index);
    setFields(newFields);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('Por favor, informe o nome da empresa/contratante.');
      return;
    }
    const company = storage.getCurrentCompany();
    const existingTemplates = storage.getTemplates();
    const existing = templateId ? existingTemplates.find(t => t.id === templateId) : null;
    const cleanedFields = fields.filter(f => !!f).map(f => ({
      ...f,
      options: f.options?.map(o => ({ ...o })) || []
    }));
    const template: ChecklistTemplate = {
      id: templateId || Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      fields: cleanedFields,
      companyId: company.id,
      isFavorite: existing ? existing.isFavorite : false,
      includeVehicleInfo
    };
    try {
      storage.saveTemplate(template);
      navigate('/vistorias');
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Houve um erro ao salvar o modelo. Tente novamente.");
    }
  };

  if (isLoading) return <div className="p-20 text-center font-bold text-slate-300 tracking-[0.3em] animate-pulse uppercase">Arquitetando Interface...</div>;

  return (
    <div className="max-w-[1600px] mx-auto pb-32 px-4 md:px-8">
      <header className="flex flex-col md:flex-row justify-between items-center bg-white/95 backdrop-blur-md p-4 md:p-6 px-6 md:px-8 rounded-[32px] md:rounded-[52px] border border-slate-100 shadow-xl sticky top-6 z-40 gap-4 mb-10">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button onClick={() => navigate(-1)} className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center justify-center border border-slate-100 group flex-shrink-0 shadow-sm">
            <span className="material-symbols-outlined font-bold group-hover:-translate-x-1 transition-transform">arrow_back</span>
          </button>
          <div className="text-left min-w-0">
            <span className="text-[9px] md:text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] block mb-0.5 truncate">Editor de Estrutura Digital</span>
            <h2 className="text-base md:text-lg font-black text-slate-800 tracking-tight truncate">{name || 'Novo Modelo Digital'}</h2>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          <button onClick={handleSave} className="bg-[#6366f1] text-white px-8 md:px-14 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs tracking-widest uppercase shadow-2xl shadow-indigo-100 hover:scale-[1.03] active:scale-95 transition-all">
            Salvar Modelo
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
        <div className="lg:col-span-5 xl:col-span-4 space-y-8 lg:sticky lg:top-36">
          <section className="bg-white/60 backdrop-blur-sm p-8 md:p-10 rounded-[40px] border border-slate-50 shadow-sm space-y-6">
            <label className="text-[10px] md:text-[11px] font-black text-indigo-400 uppercase tracking-[0.3em] ml-2">Título do Checklist / Nome da Empresa</label>
            <div className="bg-white rounded-[28px] md:rounded-[36px] p-2 border border-slate-100 ring-offset-2 focus-within:ring-4 focus-within:ring-indigo-50/50 transition-all shadow-sm">
              <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-transparent border-none px-6 md:px-8 py-5 md:py-6 text-xl md:text-2xl font-black text-slate-800 outline-none placeholder:text-slate-200"
                  placeholder="Ex: V4, SAS, Frota Norte..."
              />
            </div>
          </section>

          <section className="bg-white/60 backdrop-blur-sm p-8 md:p-10 rounded-[40px] border border-slate-50 shadow-sm space-y-8">
            <h3 className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] text-center">Configurações do Fluxo</h3>
            <button 
                onClick={() => setIncludeVehicleInfo(!includeVehicleInfo)}
                className={`w-full p-6 rounded-[28px] border-2 transition-all flex items-center gap-4 text-left ${includeVehicleInfo ? 'bg-indigo-50/20 border-indigo-100' : 'bg-white border-slate-100 hover:border-slate-200'}`}
            >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${includeVehicleInfo ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-300'}`}>
                    <span className="material-symbols-outlined">{includeVehicleInfo ? 'directions_car' : 'no_crash'}</span>
                </div>
                <div className="flex-1">
                    <p className={`font-black text-[10px] uppercase tracking-widest ${includeVehicleInfo ? 'text-indigo-900' : 'text-slate-400'}`}>Dados do Veículo (Fase 01)</p>
                    <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase leading-tight">Incluir campos automáticos de placa e modelo</p>
                </div>
            </button>
          </section>

          <section className="bg-white/60 backdrop-blur-sm p-8 md:p-10 rounded-[40px] border border-slate-50 shadow-sm space-y-10">
            <h3 className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] text-center">Inserir Novo Componente</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
              {COMPONENTS.map(comp => (
                <button 
                  key={comp.type}
                  onClick={() => handleAddComponent(comp)}
                  className="group bg-white border border-slate-100 p-4 md:p-6 rounded-[28px] flex flex-col items-center justify-center gap-3 hover:shadow-2xl hover:border-indigo-100 transition-all active:scale-95 h-full"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all shadow-inner">
                    <span className="material-symbols-outlined text-xl md:text-2xl">{comp.icon}</span>
                  </div>
                  <span className="text-[8px] md:text-[9px] font-black text-slate-400 group-hover:text-indigo-900 tracking-widest text-center leading-tight uppercase px-1">
                    {comp.label}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-7 xl:col-span-8 space-y-8">
          <div className="flex justify-center items-center gap-4">
             <div className="h-px flex-1 bg-slate-200/50"></div>
             <span className="bg-slate-50 border border-slate-100 text-slate-400 px-8 py-2.5 rounded-full text-[9px] md:text-[10px] font-black tracking-[0.4em] uppercase shadow-sm">Arquitetura Técnica</span>
             <div className="h-px flex-1 bg-slate-200/50"></div>
          </div>

          <div className="space-y-8 md:space-y-10 min-h-[500px]">
            {fields.map((field, idx) => {
              const compMeta = COMPONENTS.find(c => c.type === field.type);
              const isPriceField = field.type === 'SELECT_PRICE' || field.type === 'MULTI_SELECT';
              const isDragging = draggedIndex === idx;
              const activeAutoFill = field.specializedAutoFill || 'NONE';
              const catalogItems = activeAutoFill !== 'NONE' ? getCatalogItems(activeAutoFill) : [];
              const selectedLabels = (field.options || []).map(o => o.label);

              return (
                <div 
                  key={field.id} 
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={`bg-white p-6 md:p-12 rounded-[44px] md:rounded-[52px] border border-slate-100 shadow-xl shadow-slate-200/20 space-y-10 group relative transition-all duration-300 ${isDragging ? 'opacity-40 scale-95 border-indigo-200 ring-8 ring-indigo-50/50' : 'opacity-100'}`}
                >
                  <div className="flex justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4 md:gap-6">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50/80 rounded-2xl flex items-center justify-center text-slate-300 cursor-move hover:bg-indigo-50 hover:text-indigo-400 transition-colors shadow-sm">
                        <span className="material-symbols-outlined text-xl">drag_indicator</span>
                      </div>
                      <div className="flex items-center gap-4 md:gap-5">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-[#6366f1] text-white rounded-full flex items-center justify-center font-black text-xs md:text-sm shadow-xl shadow-indigo-100 flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <h4 className="font-black text-slate-800 tracking-tight uppercase text-sm md:text-lg truncate">{field.label || compMeta?.label}</h4>
                          <span className="text-[9px] md:text-[10px] font-black text-indigo-400 tracking-widest uppercase mt-0.5">{compMeta?.type.replace('_', ' ') || 'INPUT'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <button className="w-10 h-10 md:w-11 md:h-11 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-indigo-100">
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button onClick={() => removeField(field.id)} className="w-10 h-10 md:w-11 md:h-11 bg-white border border-slate-100 text-slate-300 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all shadow-sm">
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Rótulo / Pergunta Técnica</label>
                    <div className="bg-slate-50/50 rounded-[28px] md:rounded-[36px] p-1 border border-slate-100 focus-within:bg-white focus-within:border-indigo-100 transition-all shadow-inner">
                      <input 
                        type="text"
                        value={field.label}
                        onChange={e => updateField(field.id, { label: e.target.value })}
                        className="w-full bg-transparent border-none px-6 md:px-8 py-5 md:py-8 text-xl md:text-3xl font-black text-slate-800 outline-none placeholder:text-slate-200"
                        placeholder="Qual o item a ser verificado?"
                      />
                    </div>
                  </div>

                  {['SELECT_SIMPLE', 'SELECT_PRICE', 'MULTI_SELECT'].includes(field.type) && (
                    <div className="space-y-10 bg-slate-50/30 p-8 md:p-14 rounded-[44px] md:rounded-[56px] border border-slate-100">
                      <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 space-y-8">
                          <div className="flex justify-between items-center">
                              <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Resumo de Opções Disponíveis</label>
                              <div className="flex gap-3">
                                  {activeAutoFill !== 'NONE' && (
                                    <button 
                                        onClick={() => selectAllFromCatalog(field.id, activeAutoFill)}
                                        className="bg-indigo-50 text-indigo-600 hover:bg-indigo-500 hover:text-white px-5 py-2.5 rounded-xl text-[9px] font-black tracking-widest uppercase transition-all flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">done_all</span>
                                        Marcar Todos
                                    </button>
                                  )}
                                  <button 
                                      onClick={() => clearOptions(field.id)}
                                      className="bg-red-50 text-red-400 hover:bg-red-500 hover:text-white px-5 py-2.5 rounded-xl text-[9px] font-black tracking-widest uppercase transition-all flex items-center gap-2"
                                  >
                                      <span className="material-symbols-outlined text-[14px]">delete_sweep</span>
                                      Desmarcar Todos
                                  </button>
                              </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-3 min-h-[140px] items-start content-start">
                              {activeAutoFill === 'NONE' ? (
                                  <div className="w-full flex flex-col items-center justify-center py-10 opacity-30">
                                      <span className="material-symbols-outlined text-4xl mb-2">auto_awesome</span>
                                      <p className="text-[10px] font-bold italic uppercase tracking-[0.2em]">Selecione uma categoria abaixo para ver o catálogo</p>
                                  </div>
                              ) : (
                                  catalogItems.map(item => {
                                      const isSelected = selectedLabels.includes(item);
                                      return (
                                          <button 
                                              key={item}
                                              onClick={() => toggleCatalogItem(field.id, item)}
                                              className={`pl-5 pr-3 py-3 rounded-2xl text-[10px] font-black uppercase flex items-center gap-3 transition-all border shadow-sm ${isSelected ? 'bg-indigo-600 text-white border-transparent shadow-indigo-200' : 'bg-white text-slate-400 border-slate-100 hover:border-indigo-200'}`}
                                          >
                                              {item}
                                              {isSelected && <span className="material-symbols-outlined text-[16px] animate-in zoom-in">close</span>}
                                          </button>
                                      );
                                  })
                              )}
                          </div>
                      </div>

                      <div className="space-y-6">
                          <label className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Selecione uma Categoria de Auto-preenchimento</label>
                          <div className="flex flex-wrap gap-3 md:gap-4">
                          {(['TIPOS', 'CARROS', 'MARCAS', 'SERVIÇOS'] as AutoFillType[]).map(type => {
                              const isSelected = field.specializedAutoFill === type;
                              const config = AUTOFILL_CONFIG[type];
                              return (
                              <button 
                                  key={type}
                                  onClick={() => updateField(field.id, { specializedAutoFill: type })}
                                  className={`px-8 py-4 md:px-12 md:py-6 rounded-2xl md:rounded-[32px] font-black text-[10px] md:text-[12px] tracking-widest uppercase border transition-all flex items-center gap-4 shadow-sm hover:scale-[1.02] active:scale-[0.98] ${isSelected ? config.activeColor : `${config.color} bg-white hover:bg-slate-50`}`}
                              >
                                  <span className="material-symbols-outlined text-xl md:text-2xl">{config.icon}</span>
                                  {type}
                              </button>
                              );
                          })}
                          </div>
                      </div>

                      <div className="space-y-8 pt-6 border-t border-slate-100/50">
                         <div className="flex justify-between items-center px-2">
                            <label className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Opções Configuradas (Defina os Preços Aqui)</label>
                            <button 
                              onClick={() => {
                                const newOpt = { id: Math.random().toString(36).substr(2, 6), label: `Nova Opção`, price: 0 };
                                updateField(field.id, { options: [...(field.options || []), newOpt] });
                              }}
                              className="bg-[#6366f1] text-white px-10 py-5 rounded-2xl font-black text-[10px] md:text-[11px] tracking-widest uppercase shadow-2xl shadow-indigo-100 flex items-center gap-3 hover:scale-105 active:scale-95 transition-all"
                            >
                              <span className="material-symbols-outlined text-lg font-black">add</span> Add Opção Manual
                            </button>
                         </div>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                            {field.options?.map((opt, oIdx) => (
                              <div key={opt.id} className="bg-white/80 backdrop-blur-sm p-4 md:p-5 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4 transition-all hover:border-indigo-100 group/opt animate-in slide-in-from-left-4 duration-300">
                                <div className="flex-1 bg-slate-50/50 rounded-2xl p-1 border border-slate-100 focus-within:bg-white focus-within:border-indigo-200 transition-all">
                                  <input 
                                    type="text"
                                    value={opt.label}
                                    onChange={e => {
                                      const newOpts = [...(field.options || [])];
                                      newOpts[oIdx].label = e.target.value;
                                      updateField(field.id, { options: newOpts });
                                    }}
                                    className="w-full bg-transparent border-none font-bold text-sm text-slate-700 outline-none px-4 py-3"
                                    placeholder="Nome da Opção"
                                  />
                                </div>

                                {isPriceField && (
                                  <div className="w-28 md:w-32 flex items-center bg-indigo-50/30 rounded-2xl px-3 py-2 border border-indigo-100 gap-2 focus-within:bg-white transition-colors">
                                    <span className="text-[10px] font-black text-indigo-600">R$</span>
                                    <input 
                                      type="number"
                                      value={opt.price === 0 ? '' : opt.price}
                                      onChange={e => {
                                        const newOpts = [...(field.options || [])];
                                        newOpts[oIdx].price = parseFloat(e.target.value) || 0;
                                        updateField(field.id, { options: newOpts });
                                      }}
                                      className="w-full bg-transparent border-none font-black text-sm text-indigo-600 outline-none placeholder:text-indigo-200 text-right"
                                      placeholder="0,00"
                                    />
                                  </div>
                                )}

                                <button 
                                  onClick={() => {
                                    const newOpts = field.options?.filter(o => o.id !== opt.id);
                                    updateField(field.id, { options: newOpts });
                                  }}
                                  className="w-10 h-10 flex-shrink-0 flex items-center justify-center text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                >
                                  <span className="material-symbols-outlined text-lg">close</span>
                                </button>
                              </div>
                            ))}
                         </div>
                      </div>
                    </div>
                  )}

                  <button 
                     onClick={() => updateField(field.id, { required: !field.required })}
                     className={`w-full p-8 md:p-10 rounded-[40px] md:rounded-[52px] flex items-center gap-6 transition-all border-2 text-left shadow-sm ${field.required ? 'bg-indigo-50/20 border-indigo-100 shadow-inner' : 'bg-slate-50/20 border-slate-50 hover:border-slate-200'}`}
                  >
                      <div className={`w-12 h-12 md:w-16 md:h-16 rounded-[24px] md:rounded-[28px] flex items-center justify-center transition-all flex-shrink-0 shadow-lg ${field.required ? 'bg-[#6366f1] text-white shadow-indigo-200' : 'bg-white text-slate-200 border border-slate-100'}`}>
                          <span className="material-symbols-outlined text-2xl md:text-4xl">{field.required ? 'check' : 'radio_button_unchecked'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                          <p className={`font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-[11px] md:text-[13px] ${field.required ? 'text-indigo-900' : 'text-slate-400'}`}>Este campo é obrigatório</p>
                          <p className="text-slate-400 text-[10px] md:text-[11px] font-bold mt-2 tracking-tight leading-relaxed">O perito não poderá finalizar a vistoria sem este dado preenchido.</p>
                      </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="pt-24 border-t border-slate-200/50 text-center">
        <p className="text-[10px] md:text-[12px] font-black text-slate-300 uppercase tracking-[0.4em] flex items-center justify-center gap-3">
          <span className="material-symbols-outlined text-[14px] md:text-[18px]">verified</span>
          Arquitetura de Vistoria Versão 2.5 • CheckMaster Auto
        </p>
      </div>
    </div>
  );
};

export default EditTemplate;
