
import { Inspection, ChecklistTemplate, Company, ChecklistField } from '../types';

const STORAGE_KEYS = {
  INSPECTIONS: 'cm_inspections',
  TEMPLATES: 'cm_templates',
  COMPANIES: 'cm_companies',
  CLIENTS: 'cm_clients',
  CURRENT_COMPANY: 'cm_current_company'
};

const createDefaultFields = (count: number): ChecklistField[] => {
    return Array.from({ length: count }, (_, i) => ({
        id: Math.random().toString(36).substr(2, 9),
        label: `Item de Verificação ${i + 1}`,
        type: 'BOOLEAN',
        required: true,
        options: []
    }));
};

export const storage = {
  getInspections: (): Inspection[] => {
    const data = localStorage.getItem(STORAGE_KEYS.INSPECTIONS);
    return data ? JSON.parse(data) : [];
  },
  
  saveInspection: (inspection: Inspection) => {
    const all = storage.getInspections();
    const index = all.findIndex(i => i.id === inspection.id);
    if (index >= 0) {
      all[index] = inspection;
    } else {
      all.push(inspection);
    }
    localStorage.setItem(STORAGE_KEYS.INSPECTIONS, JSON.stringify(all));
  },

  deleteInspection: (id: string) => {
    const all = storage.getInspections();
    const filtered = all.filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.INSPECTIONS, JSON.stringify(filtered));
  },

  getTemplates: (): ChecklistTemplate[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    if (!data) {
        const defaults: ChecklistTemplate[] = [
            { 
              id: 'v4-template', 
              name: 'V4', 
              companyId: 'comp1', 
              isFavorite: true,
              includeVehicleInfo: true,
              fields: [
                { id: 'f1', label: 'Checklist de Entrada V4', type: 'BOOLEAN', required: true, options: [] },
                { id: 'f2', label: 'Fotos do Perímetro', type: 'PHOTO', required: false, options: [] }
              ] 
            },
            { 
              id: 'sas-template', 
              name: 'SAS', 
              companyId: 'comp1', 
              isFavorite: false,
              includeVehicleInfo: true,
              fields: [
                { id: 's1', label: 'Vistoria Padrão SAS', type: 'BOOLEAN', required: true, options: [] },
                { id: 's2', label: 'Leitura de Placa', type: 'AI_PLATE', required: true, options: [] }
              ] 
            }
        ];
        localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(defaults));
        return defaults;
    }
    return JSON.parse(data);
  },

  saveTemplate: (template: ChecklistTemplate) => {
    const all = storage.getTemplates();
    const index = all.findIndex(t => t.id === template.id);
    if (index >= 0) {
      all[index] = { ...template };
    } else {
      all.push({ ...template });
    }
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(all));
  },

  deleteTemplate: (id: string) => {
    const all = storage.getTemplates();
    const filtered = all.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(filtered));
  },

  duplicateTemplate: (id: string) => {
    const all = storage.getTemplates();
    const original = all.find(t => t.id === id);
    if (original) {
        const copy = { 
            ...original, 
            id: Math.random().toString(36).substr(2, 9), 
            name: `${original.name} (Cópia)`,
            isFavorite: false
        };
        all.push(copy);
        localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(all));
    }
  },

  toggleFavorite: (id: string) => {
    const all = storage.getTemplates();
    const index = all.findIndex(t => t.id === id);
    if (index >= 0) {
        all[index].isFavorite = !all[index].isFavorite;
        localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(all));
    }
  },

  getCurrentCompany: (): Company => {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_COMPANY);
    return data ? JSON.parse(data) : { id: 'comp1', name: 'Empresa Matriz' };
  }
};
