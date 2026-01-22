
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storage } from '../services/storage';
import { geminiService } from '../services/gemini';
import { VEHICLE_DATA, VEHICLE_CONFIG } from '../constants';
import { Inspection, VehicleType, ChecklistField, ChecklistTemplate } from '../types';

const ExecuteInspection: React.FC = () => {
  const { templateId, inspectionId } = useParams();
  const navigate = useNavigate();
  
  const [template, setTemplate] = useState<ChecklistTemplate | undefined>(undefined);
  const [vehicleType, setVehicleType] = useState<VehicleType>('Carro');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [plate, setPlate] = useState('');
  const [totalValue, setTotalValue] = useState(0);
  const [clientName, setClientName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  
  const plateInputRef = useRef<HTMLInputElement>(null);
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Form fields state
  const [fields, setFields] = useState<ChecklistField[]>([]);

  useEffect(() => {
    if (inspectionId) {
        // Mode: View/Edit History
        const existingInspec = storage.getInspections().find(i => i.id === inspectionId);
        if (existingInspec) {
            const associatedTemplate = storage.getTemplates().find(t => t.id === existingInspec.templateId);
            setTemplate(associatedTemplate);
            setVehicleType(existingInspec.vehicleType);
            setBrand(existingInspec.brand);
            setModel(existingInspec.model);
            setPlate(existingInspec.plate);
            setClientName(existingInspec.clientName);
            setCompanyName(existingInspec.companyName);
            setFields(existingInspec.fields);
            setTotalValue(existingInspec.totalValue);
        }
    } else if (templateId) {
        // Mode: New Inspection
        const associatedTemplate = storage.getTemplates().find(t => t.id === templateId);
        setTemplate(associatedTemplate);
        
        // Default company name from global storage, but can be overridden
        const currentStoredCompany = storage.getCurrentCompany();
        setCompanyName(currentStoredCompany.name);

        if (associatedTemplate) {
            const initialFields = (associatedTemplate.fields || []).map(f => ({
                ...f,
                value: f.type === 'MULTI_SELECT' ? [] : (f.type === 'BOOLEAN' ? null : '')
            }));
            setFields(initialFields);
        }
    }
  }, [templateId, inspectionId]);

  // Recalculate total value
  useEffect(() => {
    let calculatedTotal = 0;
    fields.forEach(field => {
        if (field.type === 'SELECT_PRICE' && field.value) {
            const selectedOpt = field.options?.find(o => o.id === field.value);
            if (selectedOpt?.price) calculatedTotal += selectedOpt.price;
        } else if (field.type === 'MULTI_SELECT' && Array.isArray(field.value)) {
            field.value.forEach(valId => {
                const opt = field.options?.find(o => o.id === valId);
                if (opt?.price) calculatedTotal += opt.price;
            });
        } else if (field.type === 'MANUAL_PRICE' && field.value) {
            calculatedTotal += parseFloat(field.value) || 0;
        }
    });
    setTotalValue(calculatedTotal);
  }, [fields]);

  const handleAIAutoFill = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingAI(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const data = await geminiService.extractVehicleInfo(base64);
      
      if (data.plate) setPlate(data.plate);
      if (data.brand) setBrand(data.brand);
      if (data.model) setModel(data.model);
      setIsProcessingAI(false);
    };
    reader.readAsDataURL(file);
  };

  const updateFieldValue = (fieldId: string, value: any) => {
    setFields(prev => prev.map(f => f.id === fieldId ? { ...f, value } : f));
  };

  const handleFinish = () => {
    // Basic validation for vehicle info only if enabled
    if (template?.includeVehicleInfo !== false) {
        if (!plate) {
          alert("A placa do veículo é obrigatória.");
          plateInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          plateInputRef.current?.focus();
          return;
        }
    }

    // Validation for checklist fields
    const missingField = fields.find(f => f.required && (f.value === null || f.value === '' || (Array.isArray(f.value) && f.value.length === 0)));
    
    if (missingField) {
        alert(`O campo "${missingField.label}" é obrigatório.`);
        const element = fieldRefs.current[missingField.id];
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('ring-4', 'ring-rose-500/20');
            setTimeout(() => element.classList.remove('ring-4', 'ring-rose-500/20'), 3000);
        }
        return;
    }

    const currentCompany = storage.getCurrentCompany();

    const newInspec: Inspection = {
      id: inspectionId || Math.random().toString(36).substr(2, 9),
      templateId: template?.id || '',
      templateName: template?.name || '',
      date: new Date().toISOString(),
      companyId: currentCompany.id,
      companyName: companyName.toUpperCase().trim() || currentCompany.name,
      clientId: 'temp-id',
      clientName: clientName || 'Consumidor Final',
      professionalId: 'prof-1',
      vehicleType,
      brand,
      model,
      plate,
      fields,
      totalValue,
      paymentMethod: 'PIX',
      status: 'Concluída'
    };

    storage.saveInspection(newInspec);
    navigate('/vistorias');
  };

  // Helper to get brands for current type
  const availableBrands = VEHICLE_DATA[vehicleType] || [];
  const availableModels = availableBrands.find(v => v.brand === brand)?.models || [];

  return (
    <div className="max-w-[1000px] mx-auto space-y-10 pb-32">
      {/* Header Compacto conforme screenshot */}
      <header className="flex justify-between items-center bg-white/95 backdrop-blur-md p-4 px-6 md:px-8 rounded-full border border-slate-100 shadow-xl sticky top-6 z-40">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-slate-50 rounded-full text-slate-400 hover:bg-indigo-50 transition-all flex items-center justify-center border border-slate-100 shadow-sm">
              <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight leading-none uppercase">{template?.name || 'Vistoria'}</h2>
              <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mt-0.5 block">
                {inspectionId ? 'Visualizando Histórico' : 'Execução V2.5 • Em Tempo Real'}
              </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 text-emerald-600 px-6 py-2.5 rounded-full font-black text-sm shadow-inner border border-emerald-100/50">
              <span className="text-[10px] uppercase mr-2 opacity-50">Total</span>
              R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </header>

      {/* Identificação do Veículo - Condicional com base no template */}
      {template?.includeVehicleInfo !== false && (
        <section className="bg-white p-8 md:p-12 rounded-[40px] border border-slate-50 shadow-sm space-y-10">
          <div className="text-center">
              <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-2">Fase 01</h3>
              <h4 className="text-xl font-black text-slate-800 tracking-tight">Identificação do Veículo</h4>
          </div>

          {/* Realístic Plate Section */}
          <div className="flex flex-col items-center justify-center space-y-4">
              <div 
                  onClick={() => plateInputRef.current?.focus()}
                  className="relative w-full max-w-[320px] aspect-[2/1] bg-white border-[6px] border-[#1e293b] rounded-[24px] shadow-2xl overflow-hidden group cursor-text transition-all"
              >
                  <div className="bg-[#0033a0] h-[22%] flex items-center justify-center">
                      <span className="text-white font-black text-[10px] tracking-[0.4em] uppercase">Brasil</span>
                  </div>
                  <div className="h-[78%] flex items-center justify-center">
                      <input 
                          ref={plateInputRef}
                          type="text" 
                          value={plate} 
                          onChange={e => setPlate(e.target.value.toUpperCase())}
                          className="w-full text-center bg-transparent border-none outline-none font-black text-5xl text-slate-800 tracking-tighter uppercase placeholder:text-slate-100" 
                          placeholder="HDS1D23"
                      />
                  </div>
              </div>
              <button className="text-[8px] font-black text-slate-300 uppercase tracking-widest hover:text-indigo-400">Confirmar / Escrever Dado</button>
          </div>

          {/* Form Inputs Grid conforme screenshot */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-50">
              <div className="space-y-3">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Empresa / Contratante (ex: V4, SAS...)</label>
                  <input 
                      type="text" 
                      value={companyName} 
                      onChange={e => setCompanyName(e.target.value)}
                      className="w-full bg-slate-50/50 rounded-2xl border border-slate-100 px-6 py-4 font-bold text-indigo-600 outline-none focus:bg-white transition-all text-sm uppercase" 
                      placeholder="NOME DA EMPRESA"
                  />
              </div>

              <div className="space-y-3">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Nome do Cliente</label>
                  <input 
                      type="text" 
                      value={clientName} 
                      onChange={e => setClientName(e.target.value)}
                      className="w-full bg-slate-50/50 rounded-2xl border border-slate-100 px-6 py-4 font-bold text-slate-700 outline-none focus:bg-white transition-all text-sm uppercase" 
                      placeholder="NOME DO CLIENTE"
                  />
              </div>

              <div className="space-y-3">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Tipo de Veículo</label>
                  <div className="flex flex-wrap gap-2">
                      {(Object.keys(VEHICLE_CONFIG) as VehicleType[]).map(type => {
                          const isSelected = vehicleType === type;
                          return (
                              <button 
                                  key={type}
                                  onClick={() => {
                                    setVehicleType(type);
                                    setBrand('');
                                    setModel('');
                                  }}
                                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-[9px] font-black tracking-widest uppercase ${isSelected ? 'bg-indigo-600 text-white border-transparent shadow-lg' : 'bg-white border-slate-100 text-slate-300 hover:border-slate-200'}`}
                              >
                                  <span className="material-symbols-outlined text-sm">{VEHICLE_CONFIG[type].icon}</span>
                                  {type}
                              </button>
                          );
                      })}
                  </div>
              </div>

              <div className="space-y-3 grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Marca</label>
                    <input 
                        type="text" 
                        value={brand} 
                        onChange={e => setBrand(e.target.value)}
                        list="brands-list"
                        className="w-full bg-slate-50/50 rounded-2xl border border-slate-100 px-6 py-4 font-bold text-slate-700 outline-none focus:bg-white transition-all text-sm" 
                        placeholder="Ex: Fiat"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Modelo</label>
                    <input 
                        type="text" 
                        value={model} 
                        onChange={e => setModel(e.target.value)}
                        list="models-list"
                        className="w-full bg-slate-50/50 rounded-2xl border border-slate-100 px-6 py-4 font-bold text-slate-700 outline-none focus:bg-white transition-all text-sm" 
                        placeholder="Ex: Palio"
                    />
                  </div>
                  <datalist id="brands-list">
                      {availableBrands.map(v => <option key={v.brand} value={v.brand} />)}
                  </datalist>
                  <datalist id="models-list">
                      {availableModels.map(m => <option key={m} value={m} />)}
                  </datalist>
              </div>
          </div>
        </section>
      )}

      {/* Checklist Sections conforme screenshot */}
      <section className="space-y-6">
        <div className="text-center py-4">
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">Itens do Checklist Técnico</span>
        </div>

        <div className="space-y-6">
            {fields.map((field) => (
                <div 
                    key={field.id} 
                    ref={el => fieldRefs.current[field.id] = el}
                    className="bg-white p-6 md:p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-8 animate-in slide-in-from-bottom-4 duration-500"
                >
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-inner">
                            <span className="material-symbols-outlined text-xl">
                                {field.type === 'AI_PLATE' ? 'tag' : field.type === 'PHOTO' ? 'photo_camera' : field.type === 'BOOLEAN' ? 'check_box' : (field.type === 'DATE' ? 'calendar_month' : 'list_alt')}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <h4 className="font-black text-slate-800 text-lg tracking-tight uppercase">{field.label}</h4>
                            {field.required && <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest mt-1">+ Campo Obrigatório</span>}
                        </div>
                    </div>

                    <div className="px-0 md:px-14">
                        {/* Render conforme screenshot */}
                        {field.type === 'BOOLEAN' && (
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => updateFieldValue(field.id, true)}
                                    className={`flex-1 flex items-center justify-center gap-3 py-6 rounded-[24px] border-2 transition-all font-black text-[10px] tracking-widest uppercase ${field.value === true ? 'border-emerald-400 bg-emerald-50 text-emerald-600 shadow-lg' : 'border-slate-50 bg-slate-50 text-slate-300'}`}
                                >
                                    <span className="material-symbols-outlined text-2xl">check_circle</span> 
                                    Item OK
                                </button>
                                <button 
                                    onClick={() => updateFieldValue(field.id, false)}
                                    className={`flex-1 flex items-center justify-center gap-3 py-6 rounded-[24px] border-2 transition-all font-black text-[10px] tracking-widest uppercase ${field.value === false ? 'border-red-400 bg-red-50 text-red-600 shadow-lg' : 'border-slate-50 bg-slate-50 text-slate-300'}`}
                                >
                                    <span className="material-symbols-outlined text-2xl">cancel</span> 
                                    Falha
                                </button>
                            </div>
                        )}

                        {(field.type === 'SELECT_SIMPLE' || field.type === 'SELECT_PRICE') && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {field.options?.map(opt => (
                                    <button 
                                        key={opt.id}
                                        onClick={() => updateFieldValue(field.id, opt.id)}
                                        className={`p-6 rounded-[24px] border-2 transition-all text-left flex justify-between items-center ${field.value === opt.id ? 'border-indigo-400 bg-indigo-50 text-indigo-900 shadow-md' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
                                    >
                                        <span className="font-black uppercase tracking-widest text-[11px]">{opt.label}</span>
                                        {opt.price ? <span className="text-[9px] font-black text-indigo-400 bg-white px-3 py-1 rounded-lg shadow-sm border border-indigo-50">R$ {opt.price}</span> : null}
                                    </button>
                                ))}
                            </div>
                        )}

                        {field.type === 'MULTI_SELECT' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {field.options?.map(opt => {
                                    const isSelected = Array.isArray(field.value) && field.value.includes(opt.id);
                                    return (
                                        <button 
                                            key={opt.id}
                                            onClick={() => {
                                                const current = Array.isArray(field.value) ? field.value : [];
                                                const next = isSelected ? current.filter(v => v !== opt.id) : [...current, opt.id];
                                                updateFieldValue(field.id, next);
                                            }}
                                            className={`p-6 rounded-[24px] border-2 transition-all text-left flex justify-between items-center ${isSelected ? 'border-indigo-400 bg-indigo-50 text-indigo-900 shadow-md' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
                                        >
                                            <span className="font-black uppercase tracking-widest text-[11px]">{opt.label}</span>
                                            {opt.price ? <span className="text-[9px] font-black text-indigo-400 bg-white px-3 py-1 rounded-lg shadow-sm border border-indigo-50">R$ {opt.price}</span> : null}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {field.type === 'PHOTO' && (
                            <div className="w-full">
                                <label className="aspect-video bg-slate-50 rounded-[28px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 text-slate-300 hover:text-indigo-500 hover:border-indigo-200 transition-all cursor-pointer group">
                                    <span className="material-symbols-outlined text-4xl mb-2">photo_camera</span>
                                    <span className="text-[9px] font-black uppercase tracking-widest">Anexar Evidência</span>
                                    <input type="file" accept="image/*" className="hidden" />
                                </label>
                            </div>
                        )}

                        {(field.type === 'TEXT' || field.type === 'NUMBER') && (
                            <input 
                                type={field.type.toLowerCase()}
                                value={field.value}
                                onChange={e => updateFieldValue(field.id, e.target.value)}
                                className="w-full bg-slate-50 rounded-2xl border border-slate-100 px-8 py-5 font-bold text-slate-700 outline-none focus:bg-white transition-all text-lg"
                                placeholder="Clique para escrever..."
                            />
                        )}

                        {field.type === 'DATE' && (
                            <div className="relative group">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none group-focus-within:text-indigo-600 transition-colors">
                                    <span className="material-symbols-outlined">calendar_month</span>
                                </div>
                                <input 
                                    type="datetime-local"
                                    value={field.value}
                                    onChange={e => updateFieldValue(field.id, e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-16 pr-8 py-5 font-bold text-slate-700 outline-none focus:bg-white transition-all text-lg appearance-none cursor-pointer"
                                />
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                                    <span className="material-symbols-outlined">schedule</span>
                                </div>
                            </div>
                        )}

                        {field.type === 'MANUAL_PRICE' && (
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-indigo-400">R$</span>
                                <input 
                                    type="number"
                                    value={field.value}
                                    onChange={e => updateFieldValue(field.id, e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-8 py-6 font-black text-3xl text-indigo-600 outline-none focus:bg-white transition-all shadow-inner"
                                    placeholder="0,00"
                                />
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
      </section>

      {/* Action Footer conforme screenshot */}
      <div className="pt-20 flex flex-col items-center gap-6">
        <button 
            onClick={handleFinish}
            className="w-full max-w-2xl bg-[#1e293b] text-white py-10 rounded-[44px] font-black text-lg tracking-[0.4em] uppercase flex items-center justify-center gap-4 shadow-2xl hover:bg-slate-800 transition-all active:scale-[0.98] group"
        >
            <span className="material-symbols-outlined text-3xl group-hover:rotate-12 transition-transform">verified</span>
            {inspectionId ? 'Atualizar Vistoria Histórica' : 'Finalizar Vistoria Pro'}
        </button>
        <p className="text-[10px] font-black text-slate-300 tracking-[0.3em] uppercase">CheckMaster Auto • Vistoria Confiável</p>
      </div>
    </div>
  );
};

export default ExecuteInspection;
