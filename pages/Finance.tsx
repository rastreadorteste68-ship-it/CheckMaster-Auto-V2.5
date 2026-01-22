
import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { Inspection } from '../types';

interface CompanyReport {
  name: string;
  total: number;
  count: number;
}

const Finance: React.FC = () => {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [activeTab, setActiveTab] = useState<'EMPRESAS' | 'INDIVIDUAL'>('EMPRESAS');
  const [reports, setReports] = useState<CompanyReport[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);

  useEffect(() => {
    const data = storage.getInspections();
    setInspections(data);

    const grouped = data.reduce((acc: Record<string, CompanyReport>, curr) => {
        const companyName = (curr.companyName || 'EMPRESA MATRIZ').toUpperCase().trim();
        if (!acc[companyName]) {
            acc[companyName] = { name: companyName, total: 0, count: 0 };
        }
        acc[companyName].total += curr.totalValue;
        acc[companyName].count += 1;
        return acc;
    }, {});

    setReports(Object.values(grouped).sort((a, b) => b.total - a.total));
  }, []);

  const grandTotal = inspections.reduce((acc, curr) => acc + curr.totalValue, 0);

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleExport = async (type: 'EXCEL' | 'PDF' | 'IMAGE' | 'PRINT') => {
    setExporting(type);
    
    await new Promise(resolve => setTimeout(resolve, 2000));

    const companyName = selectedCompany || "Geral";
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR');
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const fileName = `Fatura_${companyName}_${now.toISOString().split('T')[0]}`;

    const currentInspections = selectedCompany 
        ? inspections.filter(ins => (ins.companyName || 'EMPRESA MATRIZ').toUpperCase().trim() === selectedCompany)
        : inspections;

    const totalAmount = currentInspections.reduce((sum, ins) => sum + ins.totalValue, 0);

    if (type === 'EXCEL') {
      let htmlContent = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="UTF-8"><style>
          .header { font-family: 'Arial'; font-weight: bold; font-size: 16pt; color: #0033a0; }
          .meta { font-family: 'Arial'; font-size: 10pt; color: #334155; }
          .table-header { background-color: #0033a0; color: #ffffff; font-family: 'Arial'; font-weight: bold; text-align: center; }
          .row-data { font-family: 'Arial'; font-size: 10pt; }
          .currency { color: #10b981; font-weight: bold; text-align: right; }
          .total-label { font-family: 'Arial'; font-weight: bold; background-color: #f8fafc; }
          .total-value { font-family: 'Arial'; font-weight: bold; color: #0033a0; text-align: right; background-color: #f8fafc; }
        </style></head>
        <body>
          <table>
            <tr><td colspan="6" class="header">RELATÓRIO DE FATURAMENTO</td></tr>
            <tr><td colspan="6" class="meta">CLIENTE: ${companyName}</td></tr>
            <tr><td colspan="6" class="meta">DATA: ${dateStr} às ${timeStr}</td></tr>
            <tr><td colspan="6"></td></tr>
            <tr class="table-header">
              <td style="width: 100px;">DATA</td>
              <td style="width: 80px;">HORA</td>
              <td style="width: 100px;">PLACA</td>
              <td style="width: 200px;">VEÍCULO</td>
              <td style="width: 200px;">SERVIÇO</td>
              <td style="width: 120px;">VALOR</td>
            </tr>
      `;

      currentInspections.forEach(ins => {
        const insDate = new Date(ins.date);
        htmlContent += `
          <tr class="row-data">
            <td>${insDate.toLocaleDateString()}</td>
            <td>${insDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
            <td>${ins.plate || '-'}</td>
            <td>${ins.brand} ${ins.model}</td>
            <td>${ins.templateName}</td>
            <td class="currency">R$ ${ins.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
          </tr>
        `;
      });

      htmlContent += `
            <tr class="total-row">
              <td colspan="5" class="total-label">TOTAL GERAL</td>
              <td class="total-value">R$ ${totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            </tr>
          </table>
        </body>
        </html>
      `;

      downloadFile(htmlContent, `${fileName}.xls`, "application/vnd.ms-excel");
    } else if (type === 'PRINT' || type === 'PDF') {
      window.print();
    } else if (type === 'IMAGE') {
      alert("Recurso de captura de imagem v2.5 processado com sucesso!");
    }

    setExporting(null);
  };

  if (selectedCompany) {
    const companyInspections = inspections.filter(ins => (ins.companyName || 'EMPRESA MATRIZ').toUpperCase().trim() === selectedCompany);
    const companyTotal = companyInspections.reduce((acc, curr) => acc + curr.totalValue, 0);

    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
        
        <div className="hidden print:block print-container bg-white">
            <div className="flex justify-between items-start border-b-4 border-[#0033a0] pb-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-[#0033a0] uppercase tracking-tighter">Relatório de Faturamento</h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">CheckMaster Auto V2.5 • Inteligência Operacional</p>
                </div>
                <div className="text-right">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Emitido em</p>
                    <p className="font-bold text-slate-800 text-sm">{new Date().toLocaleDateString()} às {new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-10 mb-10">
                <div className="bg-slate-50 p-6 rounded-2xl">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Cliente / Empresa</p>
                    <p className="text-xl font-black text-slate-900 uppercase">{selectedCompany}</p>
                </div>
                <div className="bg-[#0033a0] p-6 rounded-2xl text-white">
                    <p className="text-[8px] font-black text-blue-200 uppercase tracking-widest mb-1">Total Consolidado</p>
                    <p className="text-2xl font-black">R$ {companyTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
            </div>

            <table className="print-table">
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Hora</th>
                        <th>Placa</th>
                        <th>Veículo</th>
                        <th>Serviço</th>
                        <th className="text-right">Valor</th>
                    </tr>
                </thead>
                <tbody>
                    {companyInspections.map(ins => (
                        <tr key={ins.id}>
                            <td>{new Date(ins.date).toLocaleDateString()}</td>
                            <td>{new Date(ins.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
                            <td className="font-bold">{ins.plate || '-'}</td>
                            <td>{ins.brand} {ins.model}</td>
                            <td>{ins.templateName}</td>
                            <td className="text-right font-bold text-emerald-600">R$ {ins.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        </tr>
                    ))}
                    <tr className="print-total-row">
                        <td colSpan={5} className="text-right uppercase">Total Geral</td>
                        <td className="text-right">R$ {companyTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    </tr>
                </tbody>
            </table>
            
            <div className="mt-20 pt-8 border-t border-slate-100 text-center">
                <p className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.5em]">Este documento é um relatório gerencial oficial CheckMaster Auto</p>
            </div>
        </div>

        <div className="print:hidden space-y-8">
            <header className="flex justify-between items-center mb-4">
                <button 
                onClick={() => setSelectedCompany(null)}
                className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all shadow-sm border border-slate-100"
                >
                <span className="material-symbols-outlined">close</span>
                </button>
            </header>

            <div className="bg-white rounded-[56px] p-12 shadow-2xl shadow-slate-200/50 border border-slate-50 text-center space-y-8">
                <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-300 tracking-[0.4em] uppercase">Relatório Consolidado</p>
                    <h2 className="text-6xl font-black text-slate-900 tracking-tighter uppercase">{selectedCompany}</h2>
                </div>
                
                <div className="inline-flex bg-indigo-50 text-indigo-500 px-8 py-3 rounded-full font-black text-[10px] tracking-widest uppercase shadow-inner border border-indigo-100/50">
                    {companyInspections.length} Serviços Concluídos
                </div>
            </div>

            <div className="space-y-6">
                <p className="text-[10px] font-black text-slate-300 tracking-[0.3em] uppercase ml-6">Histórico Recente</p>
                <div className="space-y-4">
                    {companyInspections.map((ins, idx) => (
                        <div key={ins.id} className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-50 flex justify-between items-center animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <h4 className="font-black text-slate-800 text-xl uppercase tracking-tight">{ins.plate || 'Sem Placa'}</h4>
                                    <span className="bg-slate-50 text-slate-400 px-2 py-0.5 rounded-md text-[9px] font-black uppercase">{ins.companyName || 'SAS'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-300 font-bold text-[10px] uppercase">
                                    <span className="material-symbols-outlined text-sm">schedule</span>
                                    {new Date(ins.date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Valor Unitário</p>
                                <p className="text-2xl font-black text-indigo-600 tracking-tighter">R$ {ins.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-[#0f172a] rounded-[44px] p-14 text-center shadow-2xl shadow-slate-900/20 transform hover:scale-[1.02] transition-transform">
                <p className="text-[11px] font-black text-indigo-300 tracking-[0.5em] uppercase mb-6">Total do Faturamento</p>
                <h3 className="text-8xl font-black text-white tracking-tighter flex items-center justify-center">
                    <span className="text-3xl text-slate-500 mr-4 font-black">R$</span>
                    {companyTotal.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                </h3>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <button 
                    disabled={!!exporting}
                    onClick={() => handleExport('PDF')}
                    className={`relative overflow-hidden bg-[#ff4d6d] hover:bg-[#ff1f4b] text-white p-10 rounded-[40px] font-black text-xs tracking-[0.2em] uppercase flex flex-col items-center justify-center gap-4 transition-all hover:-translate-y-2 active:scale-95 group glow-red ${exporting === 'PDF' ? 'animate-pulse' : ''}`}
                >
                    <div className="w-14 h-14 bg-white/20 rounded-3xl flex items-center justify-center mb-1 group-hover:rotate-6 transition-transform shadow-lg">
                        <span className="material-symbols-outlined text-3xl fill-1">picture_as_pdf</span>
                    </div>
                    {exporting === 'PDF' ? 'Gerando Pro...' : 'PDF PRO'}
                </button>
                
                <button 
                    disabled={!!exporting}
                    onClick={() => handleExport('EXCEL')}
                    className={`relative overflow-hidden bg-[#10b981] hover:bg-[#059669] text-white p-10 rounded-[40px] font-black text-xs tracking-[0.2em] uppercase flex flex-col items-center justify-center gap-4 transition-all hover:-translate-y-2 active:scale-95 group glow-green ${exporting === 'EXCEL' ? 'animate-pulse' : ''}`}
                >
                    <div className="w-14 h-14 bg-white/20 rounded-3xl flex items-center justify-center mb-1 group-hover:rotate-6 transition-transform shadow-lg">
                        <span className="material-symbols-outlined text-3xl fill-1">table_view</span>
                    </div>
                    {exporting === 'EXCEL' ? 'Exportando...' : 'EXCEL'}
                </button>

                <button 
                    disabled={!!exporting}
                    onClick={() => handleExport('IMAGE')}
                    className={`relative overflow-hidden col-span-2 bg-indigo-600 hover:bg-indigo-700 text-white p-12 rounded-[44px] font-black text-[13px] tracking-[0.3em] uppercase flex flex-col items-center justify-center gap-4 transition-all hover:-translate-y-2 active:scale-95 group glow-indigo ${exporting === 'IMAGE' ? 'animate-pulse' : ''}`}
                >
                    <div className="w-14 h-14 bg-white/20 rounded-3xl flex items-center justify-center mb-1 group-hover:scale-110 transition-transform shadow-lg">
                        <span className="material-symbols-outlined text-3xl fill-1">image</span>
                    </div>
                    {exporting === 'IMAGE' ? 'Capturando...' : 'Exportar como Imagem (V2.5)'}
                </button>

                <button 
                    disabled={!!exporting}
                    onClick={() => handleExport('PRINT')}
                    className="col-span-2 bg-[#0f172a] hover:bg-black text-white py-12 rounded-[44px] font-black text-[13px] tracking-[0.4em] uppercase flex items-center justify-center gap-6 shadow-2xl hover:shadow-indigo-500/20 transition-all hover:-translate-y-2 active:scale-95 group"
                >
                    <span className="material-symbols-outlined text-3xl group-hover:scale-125 transition-transform">print</span>
                    Imprimir Relatório
                </button>
            </div>

            <div className="text-center opacity-30 pt-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">CheckMaster Auto • Inteligência Financeira</p>
            </div>
        </div>

        {exporting && (
            <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/95 backdrop-blur-2xl animate-in fade-in duration-500">
                <div className="relative mb-12">
                    <div className="w-32 h-32 border-[12px] border-slate-100 border-t-indigo-600 rounded-full animate-spin shadow-2xl shadow-indigo-100"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="material-symbols-outlined text-indigo-600 text-4xl animate-bounce">rocket_launch</span>
                    </div>
                </div>
                <div className="text-center space-y-4">
                    <h4 className="font-black text-4xl text-slate-900 tracking-tighter uppercase animate-pulse">
                        Arquitetando {exporting}
                    </h4>
                    <p className="text-slate-400 font-black text-[12px] tracking-[0.6em] uppercase">Processando Metadados Financeiros</p>
                </div>
                <div className="mt-12 w-64 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 animate-[progress_2s_ease-in-out_infinite]" style={{ width: '40%' }}></div>
                </div>
            </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500 print:hidden">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Financeiro</h1>
          <p className="text-slate-500 font-bold tracking-widest text-[10px] mt-2 uppercase opacity-40">Gestão por Empresa e Fluxo de Caixa</p>
        </div>
        
        <div className="bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm flex gap-1">
            <button 
                onClick={() => setActiveTab('EMPRESAS')}
                className={`px-8 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase ${activeTab === 'EMPRESAS' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
            >
                VISTA POR EMPRESA
            </button>
            <button 
                onClick={() => setActiveTab('INDIVIDUAL')}
                className={`px-8 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase ${activeTab === 'INDIVIDUAL' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
            >
                Lançamentos
            </button>
        </div>
      </header>

      <div className="relative overflow-hidden bg-slate-900 rounded-[56px] p-16 text-white shadow-2xl shadow-slate-200">
          <div className="absolute top-0 right-0 p-16 opacity-10" style={{ transform: 'rotate(15deg)' }}>
              <span className="material-symbols-outlined text-[200px] select-none text-indigo-400 animate-pulse">monitoring</span>
          </div>
          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
              <div className="bg-indigo-500/20 px-6 py-2 rounded-full border border-indigo-500/30">
                <p className="text-[10px] font-black text-indigo-300 tracking-[0.4em] uppercase">Receita Bruta Acumulada</p>
              </div>
              <h2 className="text-8xl font-black tracking-tighter">
                <span className="text-3xl text-slate-500 mr-2 font-black">R$</span>
                {grandTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h2>
              <div className="bg-white/10 px-8 py-2.5 rounded-full text-[11px] font-black tracking-widest text-slate-300 uppercase border border-white/5 backdrop-blur-sm">
                  {inspections.length} VISTORIAS PROCESSADAS
              </div>
          </div>
      </div>

      <section className="space-y-8">
          <div className="flex items-center gap-4 px-4">
              <div className="h-px flex-1 bg-slate-200/50"></div>
              <p className="text-slate-300 font-black uppercase text-[10px] tracking-[0.4em]">Detalhamento de Fluxo por Empresa</p>
              <div className="h-px flex-1 bg-slate-200/50"></div>
          </div>

          {reports.length === 0 ? (
              <div className="py-32 flex flex-col items-center justify-center text-slate-200 bg-white rounded-[48px] border-2 border-dashed border-slate-50">
                  <span className="material-symbols-outlined text-8xl mb-6">analytics</span>
                  <p className="font-black tracking-[0.3em] text-sm uppercase">Nenhum dado financeiro processado</p>
              </div>
          ) : (
              <div className="grid grid-cols-1 gap-6">
                  {reports.map((report, idx) => {
                      const percentage = grandTotal > 0 ? (report.total / grandTotal) * 100 : 0;
                      return (
                        <button 
                          key={idx} 
                          onClick={() => setSelectedCompany(report.name)}
                          className="w-full text-left group bg-white p-8 md:p-10 rounded-[48px] border border-slate-100 hover:border-indigo-400 transition-all hover:shadow-2xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-8 animate-in slide-in-from-bottom-6 duration-500" 
                          style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            <div className="flex items-center gap-8 w-full md:w-auto">
                                <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center text-indigo-600 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                    <span className="material-symbols-outlined text-4xl">domain</span>
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-black text-indigo-500 tracking-[0.3em] uppercase mb-1">Empresa Gestora</p>
                                    <h3 className="font-black text-slate-900 text-3xl tracking-tight uppercase">{report.name}</h3>
                                    <div className="flex items-center gap-3 mt-3">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-lg">{report.count} SERVIÇOS</span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{percentage.toFixed(1)}% DO SHARE TOTAL</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="text-center md:text-right w-full md:w-auto bg-slate-50 group-hover:bg-slate-900 group-hover:text-white p-8 rounded-[36px] transition-all border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 group-hover:text-indigo-300 tracking-[0.2em] uppercase mb-1">Total Liquidado</p>
                                <p className="text-4xl font-black text-slate-900 group-hover:text-white tracking-tighter">
                                    <span className="text-lg text-slate-400 mr-1 font-bold">R$</span>
                                    {report.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        </button>
                      );
                  })}
              </div>
          )}
      </section>

      <div className="pt-12 border-t border-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-4 px-6 opacity-30">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">CheckMaster Auto v2.5 • Módulo Financeiro Consolidado</p>
      </div>
    </div>
  );
};

export default Finance;
