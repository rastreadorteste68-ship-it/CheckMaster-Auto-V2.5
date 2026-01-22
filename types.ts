
export type VehicleType = 'Carro' | 'Moto' | 'Caminhão' | 'Máquina' | 'Barco' | 'Avião' | 'Outros';

export interface VehicleOption {
  brand: string;
  models: string[];
}

export type FieldType = 
  | 'SELECT_SIMPLE' 
  | 'SELECT_PRICE' 
  | 'MULTI_SELECT' 
  | 'BOOLEAN' 
  | 'TEXT' 
  | 'NUMBER' 
  | 'DATE' 
  | 'PHOTO' 
  | 'AI_PLATE' 
  | 'AI_VEHICLE' 
  | 'AI_IMEI'
  | 'MANUAL_PRICE';

export type AutoFillType = 'TIPOS' | 'CARROS' | 'MARCAS' | 'SERVIÇOS' | 'NONE';

export interface ChecklistField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  specializedAutoFill?: AutoFillType;
  options?: { id: string; label: string; price?: number }[];
  value?: any;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  fields: ChecklistField[];
  companyId: string;
  isFavorite?: boolean;
  includeVehicleInfo: boolean;
}

export interface Inspection {
  id: string;
  templateId: string;
  templateName: string;
  date: string;
  companyId: string;
  companyName: string;
  clientId: string;
  clientName: string;
  professionalId: string;
  vehicleType: VehicleType;
  brand: string;
  model: string;
  plate: string;
  imei?: string;
  fields: ChecklistField[];
  totalValue: number;
  paymentMethod: 'Dinheiro' | 'Cartão' | 'PIX' | 'Faturado';
  status: 'Pendente' | 'Concluída';
}

export interface Company {
  id: string;
  name: string;
}

export interface Client {
  id: string;
  name: string;
  companyId: string;
}
