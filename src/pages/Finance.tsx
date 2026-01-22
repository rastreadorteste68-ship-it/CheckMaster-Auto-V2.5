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
  const [activeTab, setActiveTab] = useState<'EMPRESAS' | 'LANCAMENTOS'>('EMPRESAS');
  const [reports, setReports] = useState<CompanyReport[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

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

  const handleExport = async (type: 'EXCEL' | 'PDF' | 'PRINT') => {
    setExporting(type === 'EXCEL' ? 'Excel Inteligente' : 'Relatório PDF Pro');
    setProgress(0);

    // Simulação de animação de processamento "Arquitetando"
    const steps = 10;
    for (let i = 1; i <= steps; i++) {
        await new Promise(resolve => setTimeout(resolve, 150));
        setProgress((i / steps) * 100);
    }

    const companyName = selectedCompany || "Geral";
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR');
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const fileName = `CheckMaster_Financeiro_${companyName}_${now.toISOString().split('T')[0]}`;

    const targetInspections = selectedCompany 
        ? inspections.filter(ins => (ins.companyName || 'EMPRESA MATRIZ').toUpperCase().trim() === selectedCompany)
        : inspections;

    const totalAmount = targetInspections.reduce((sum, ins) => sum + ins.totalValue, 0);

    if (type === 'EXCEL') {
      // Geração de HTML formatado para Excel (Conforme Mockup)
      let htmlContent = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="UTF-8">
        <style>
          .header { font-family: 'Segoe UI', Arial; font-weight: bold; font-size: 16pt; color: #0033a0; padding: 10px; border-bottom: 2px solid #0033a0; }
          .meta { font-family: 'Segoe UI', Arial; font-size: 10pt; color: #64748b; }
          .th { background-color: #0033a0; color: #ffffff; font-family: 'Segoe UI', Arial; font-weight: bold; text-align: center; border: 1px solid #ffffff; }
          .td { font-family: 'Segoe UI', Arial; font-size: 10pt; border-bottom: 1px solid #f1f5f9; padding: 5px; }
          .price { color: #10b981; font-weight: bold; text-align: right; }
          .total { background-color: #f8fafc; font-weight: 900; color: #0033a0; font-size: 12pt; }
        </style>
        </head>
        <body>
          <table>
            <tr><td colspan="6" class="header">RELATÓRIO DE FATURAMENTO - CHECKMASTER AUTO</td></tr>
            <tr><td colspan="6" class="meta">CLIENTE: ${companyName}</td></tr>
            <tr><td colspan="6" class="meta">DATA DE EMISSÃO: ${dateStr} às ${timeStr}</td></tr>
            <tr><td colspan="6"></td></tr>
            <tr>
              <td class="th" style="width: 120px;">DATA</td>
              <td class="th" style="width: 100px;">HORA</td>
              <td class="th" style="width: 120px;">PLACA</td>
              <td class="th" style="width: 250px;">VEÍCULO</td>
              <td class="th" style="width: 250px;">SERVIÇO</td>
              <td class="th" style="width: 150px;">VALOR</td>
            </tr>
      `;

      targetInspections.forEach(ins => {
        const d = new Date(ins.date);
        htmlContent += `
          <tr>
            <td class="td">${d.toLocaleDateString()}</td>
            <td class="td">${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
            <td class="td" style="text-transform: uppercase; font-weight: bold;">${ins.plate || '-'}</td>
            <td class="td">${ins.brand} ${ins.model}</td>
            <td class="td">${ins.templateName}</td>
            <td class="td price">R$ ${ins.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
          </tr>
        `;
      });

      htmlContent += `
            <tr>
              <td colspan="5" class="td total" style="text-align: right;">TOTAL GERAL</td>
              <td class="td total price" style="text-align: right;">R$ ${totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            </tr>
          </table>
        </body>
        </html>
      `;

      downloadFile(htmlContent, `${fileName}.xls`, "application/vnd.ms-excel");
    } else {
      // Aciona o modo de impressão configurado no index.html
      window.print();
    }

    setExporting(null);
  };

  const renderSelectedCompanyDetail = () => {
    const companyInspections = inspections.filter(ins => (ins.companyName || 'EMPRESA MATRIZ').toUpperCase().trim() === selectedCompany);
    const companyTotal = companyInspections.reduce((acc, curr) => acc + curr.totalValue, 0);

    return (
      <div className="space-y-8 animate-in fade-in zoom-in duration-500">
        
        {/* Layout de Impressão (Visível apenas no PDF/Print) */}
        <div className="hidden print:block print-container bg-white">
            <div className="flex justify-between items-start border-b-8 border-[#0033a0] pb-8 mb-10 print-header-gradient p-6 rounded-t-3xl">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter">Relatório Financeiro</h1>
                    <p className="font-bold opacity-80 uppercase text-xs tracking-[0.3em] mt-2">CheckMaster Auto V2.5 • Inteligência Pericial</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Emissão em</p>
                    <p className="font-black text-lg">{new Date().toLocaleDateString()} às {new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-10 mb-12 px-6">
                <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Empresa / Cliente</p>
                    <p className="text-2xl font-black text-slate-900 uppercase tracking-tight">{selectedCompany}</p>
                </div>
                <div className="bg-[#0033a0] p-8 rounded-[32px] text-white shadow-xl shadow-blue-900/10">
                    <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-2">Total Consolidado</p>
                    <p className="text-3xl font-black tracking-tighter">R$ {companyTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
            </div>

            <div className="px-6">
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
                                <td className="font-black text-slate-900 uppercase">{ins.plate || '-'}</td>
                                <td>{ins.brand} {ins.model}</td>
                                <td>{ins.templateName}</td>
                                <td className="text-right font-black text-[#10b981]">R$ {ins.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                            </tr>
                        ))}
                        <tr className="print-total-row">
                            <td colSpan={5} className="text-right uppercase tracking-widest">Saldo a Liquidar</td>
                            <td className="text-right font-black">R$ {companyTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div className="mt-32 pt-10 border-t border-slate-100 text-center px-6">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.6em]">Documento Gerencial Autenticado por CheckMaster Auto Engine</p>
            </div>
        </div>

        {/* Interface de Tela */}
        <div className="print:hidden space-y-8">
            <header className="flex justify-between items-center mb-4">
                <button 
                onClick={() => setSelectedCompany(null)}
                className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all shadow-sm border border-slate-100 group"
                >
                <span className="material-symbols-outlined font-bold group-hover:scale-110">close</span>
                </button>
                <span className="bg-indigo-50 text-indigo-600 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Vista Detalhada</span>
            </header>

            <div className="bg-white rounded-[56px] p-12 shadow-2xl shadow-slate-200/50 border border-slate-50 text-center space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <span className="material-symbols-outlined text-[180px]">corporate_fare</span>
                </div>
                <div className="relative z-10 space-y-3">
                    <p className="text-[11px] font-black text-slate-300 tracking-[0.5em] uppercase leading-none">Relatório Consolidado</p>
                    <h2 className="text-7xl font-black text-slate-900 tracking-tighter uppercase leading-none">{selectedCompany}</h2>
                </div>
                
                <div className="inline-flex bg-indigo-50 text-indigo-500 px-10 py-4 rounded-full font-black text-xs tracking-widest uppercase shadow-inner border border-indigo-100/50">
                    {companyInspections.length} Serviços em Aberto / Concluídos
                </div>
            </div>

            <div className="bg-[#0f172a] rounded-[48px] p-16 text-center shadow-2xl shadow-slate-900/30 transform hover:scale-[1.01] transition-transform">
                <p className="text-[12px] font-black text-indigo-300 tracking-[0.6em] uppercase mb-8 opacity-60">Total Bruto de Lançamentos</p>
                <h3 className="text-9xl font-black text-white tracking-tighter flex items-center justify-center">
                    <span className="text-3xl text-slate-500 mr-5 font-black">R$</span>
                    {companyTotal.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button 
                    disabled={!!exporting}
                    onClick={() => handleExport('PDF')}
                    className="relative overflow-hidden bg-[#ff4d6d] hover:bg-[#ff1f4b] text-white p-12 rounded-[44px] font-black text-xs tracking-[0.3em] uppercase flex flex-col items-center justify-center gap-5 transition-all hover:-translate-y-2 active:scale-95 group glow-red shadow-xl"
                >
                    <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center mb-1 group-hover:rotate-6 transition-transform shadow-lg">
                        <span className="material-symbols-outlined text-4xl fill-1">picture_as_pdf</span>
                    </div>
                    Gerar PDF Pro
                </button>
                
                <button 
                    disabled={!!exporting}
                    onClick={() => handleExport('EXCEL')}
                    className="relative overflow-hidden bg-[#10b981] hover:bg-[#059669] text-white p-12 rounded-[44px] font-black text-xs tracking-[0.3em] uppercase flex flex-col items-center justify-center gap-5 transition-all hover:-translate-y-2 active:scale-95 group glow-green shadow-xl"
                >
                    <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center mb-1 group-hover:scale-110 transition-transform shadow-lg">
                        <span className="material-symbols-outlined text-4xl fill-1">table_view</span>
                    </div>
                    Exportar Excel
                </button>

                <button 
                    disabled={!!exporting}
                    onClick={() => handleExport('PRINT')}
                    className="col-span-1 md:col-span-2 bg-[#0f172a] hover:bg-black text-white py-12 rounded-[48px] font-black text-sm tracking-[0.5em] uppercase flex items-center justify-center gap-6 shadow-2xl transition-all hover:-translate-y-2 active:scale-95 group border-2 border-transparent hover:border-indigo-500/30"
                >
                    <span className="material-symbols-outlined text-4xl group-hover:animate-pulse">print</span>
                    Imprimir Comprovante
                </button>
            </div>
        </div>

        {/* Global Animated Loader Overlay */}
        {exporting && (
            <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/98 backdrop-blur-3xl animate-in fade-in duration-500 no-print">
                <div className="relative mb-16">
                    <div className="w-48 h-48 border-[16px] border-slate-100 border-t-indigo-600 rounded-full animate-spin shadow-2xl shadow-indigo-100"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="material-symbols-outlined text-indigo-600 text-6xl animate-bounce">rocket_launch</span>
                    </div>
                </div>
                <div className="text-center space-y-6">
                    <h4 className="font-black text-5xl text-slate-900 tracking-tighter uppercase animate-pulse">
                        {exporting}
                    </h4>
                    <p className="text-slate-400 font-black text-sm tracking-[0.8em] uppercase ml-2">Processando Metadados Financeiros</p>
                </div>
                <div className="mt-16 w-80 h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-gradient-to-right from-indigo-500 to-blue-600 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="mt-4 text-indigo-600 font-black text-xs">{progress.toFixed(0)}% CONCLUÍDO</p>
            </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700 print:hidden">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">Financeiro</h1>
          <p className="text-slate-500 font-bold tracking-widest text-[11px] mt-3 uppercase opacity-60">Gestão Consolidada de Fluxo e Faturamento</p>
        </div>
        
        <div className="bg-white p-2 rounded-[24px] border border-slate-100 shadow-xl flex gap-2 w-full md:w-auto">
            <button 
                onClick={() => setActiveTab('EMPRESAS')}
                className={`flex-1 md:px-10 py-4 rounded-2xl text-[11px] font-black tracking-[0.2em] transition-all uppercase ${activeTab === 'EMPRESAS' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 scale-105' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
            >
                Por Empresa
            </button>
            <button 
                onClick={() => setActiveTab('LANCAMENTOS')}
                className={`flex-1 md:px-10 py-4 rounded-2xl text-[11px] font-black tracking-[0.2em] transition-all uppercase ${activeTab === 'LANCAMENTOS' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 scale-105' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
            >
                Lançamentos
            </button>
        </div>
      </header>

      <div className="relative overflow-hidden bg-slate-900 rounded-[64px] p-20 text-white shadow-2xl shadow-slate-300/50 group">
          <div className="absolute top-0 right-0 p-20 opacity-10 group-hover:opacity-20 transition-opacity" style={{ transform: 'rotate(15deg)' }}>
              <span className="material-symbols-outlined text-[280px] select-none text-indigo-400">monitoring</span>
          </div>
          <div className="relative z-10 flex flex-col items-center text-center space-y-8">
              <div className="bg-indigo-500/20 px-8 py-3 rounded-full border border-indigo-500/30 backdrop-blur-md">
                <p className="text-[12px] font-black text-indigo-300 tracking-[0.5em] uppercase">Receita Bruta Acumulada</p>
              </div>
              <h2 className="text-[120px] font-black tracking-tighter leading-none">
                <span className="text-4xl text-slate-500 mr-4 font-black">R$</span>
                {grandTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h2>
              <div className="bg-white/10 px-10 py-4 rounded-[24px] text-xs font-black tracking-widest text-slate-300 uppercase border border-white/5 backdrop-blur-lg flex items-center gap-4">
                  <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
                  {inspections.length} VISTORIAS INTEGRADAS AO CAIXA
              </div>
          </div>
      </div>

      <section className="space-y-10">
          <div className="flex items-center gap-6 px-4">
              <div className="h-px flex-1 bg-slate-200/60"></div>
              <p className="text-slate-300 font-black uppercase text-[12px] tracking-[0.6em]">Consolidação por Cliente</p>
              <div className="h-px flex-1 bg-slate-200/60"></div>
          </div>

          {reports.length === 0 ? (
              <div className="py-40 flex flex-col items-center justify-center text-slate-200 bg-white rounded-[64px] border-4 border-dashed border-slate-50">
                  <span className="material-symbols-outlined text-9xl mb-8 opacity-20">analytics</span>
                  <p className="font-black tracking-[0.5em] text-sm uppercase opacity-40">Aguardando dados transacionais</p>
              </div>
          ) : (
              <div className="grid grid-cols-1 gap-8">
                  {reports.map((report, idx) => {
                      const percentage = grandTotal > 0 ? (report.total / grandTotal) * 100 : 0;
                      return (
                        <button 
                          key={idx} 
                          onClick={() => setSelectedCompany(report.name)}
                          className="w-full text-left group bg-white p-10 md:p-12 rounded-[56px] border border-slate-100 hover:border-indigo-400 transition-all hover:shadow-3xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-10 animate-in slide-in-from-bottom-8 duration-700" 
                          style={{ animationDelay: `${idx * 150}ms` }}
                        >
                            <div className="flex items-center gap-10 w-full md:w-auto">
                                <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center text-indigo-600 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:scale-110">
                                    <span className="material-symbols-outlined text-5xl">domain</span>
                                </div>
                                <div className="text-left space-y-2">
                                    <p className="text-[11px] font-black text-indigo-500 tracking-[0.4em] uppercase mb-1">Entidade Pagadora</p>
                                    <h3 className="font-black text-slate-900 text-4xl tracking-tighter uppercase leading-none">{report.name}</h3>
                                    <div className="flex items-center gap-5 pt-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">{report.count} OPERAÇÕES</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-500" style={{ width: `${percentage}%` }}></div>
                                            </div>
                                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{percentage.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="text-center md:text-right w-full md:w-auto bg-slate-50 group-hover:bg-[#0f172a] group-hover:text-white p-10 rounded-[44px] transition-all border border-slate-100 shadow-inner">
                                <p className="text-[11px] font-black text-slate-400 group-hover:text-indigo-300 tracking-[0.3em] uppercase mb-2">Montante Liquidado</p>
                                <p className="text-5xl font-black text-slate-900 group-hover:text-white tracking-tighter">
                                    <span className="text-xl text-slate-400 mr-2 font-black">R$</span>
                                    {report.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        </button>
                      );
                  })}
              </div>
          )}
      </section>

      <div className="pt-20 border-t border-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-8 px-10 opacity-30">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.6em]">CheckMaster Auto v2.5 • Módulo Financeiro Consolidado</p>
          <div className="flex gap-4">
              <span className="material-symbols-outlined text-4xl">verified_user</span>
              <span className="material-symbols-outlined text-4xl">cloud_done</span>
          </div>
      </div>
    </div>
  );
};

export default Finance;