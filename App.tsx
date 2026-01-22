
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Vistorias from './pages/Vistorias';
import ExecuteInspection from './pages/ExecuteInspection';
import EditTemplate from './pages/EditTemplate';
import Finance from './pages/Finance';

const Placeholder = ({ name }: { name: string }) => (
  <div className="p-10 text-center">
    <h1 className="text-2xl font-bold mb-4">{name}</h1>
    <p className="text-slate-50">Módulo em desenvolvimento conforme requisitos da V2.5</p>
  </div>
);

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/vistorias" element={<Vistorias />} />
          <Route path="/vistorias/novo" element={<EditTemplate />} />
          <Route path="/vistorias/editar/:templateId" element={<EditTemplate />} />
          <Route path="/vistorias/executar/:templateId" element={<ExecuteInspection />} />
          <Route path="/vistorias/ver/:inspectionId" element={<ExecuteInspection />} />
          <Route path="/financeiro" element={<Finance />} />
          <Route path="/agenda" element={<Placeholder name="Minha Agenda" />} />
          <Route path="/clientes" element={<Placeholder name="Clientes" />} />
          <Route path="/account" element={<Placeholder name="Minha Conta" />} />
          <Route path="/company" element={<Placeholder name="Configurações da Empresa" />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
