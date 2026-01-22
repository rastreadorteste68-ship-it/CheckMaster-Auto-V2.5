
import { VehicleType, VehicleOption } from './types';

export const VEHICLE_CONFIG: Record<VehicleType, { icon: string, color: string, lightColor: string }> = {
  'Carro': { icon: 'directions_car', color: 'bg-blue-600', lightColor: 'bg-blue-50 text-blue-600' },
  'Moto': { icon: 'two_wheeler', color: 'bg-orange-500', lightColor: 'bg-orange-50 text-orange-500' },
  'Caminhão': { icon: 'local_shipping', color: 'bg-red-600', lightColor: 'bg-red-50 text-red-600' },
  'Máquina': { icon: 'construction', color: 'bg-amber-600', lightColor: 'bg-amber-50 text-amber-600' },
  'Barco': { icon: 'sailing', color: 'bg-cyan-600', lightColor: 'bg-cyan-50 text-cyan-600' },
  'Avião': { icon: 'flight', color: 'bg-sky-500', lightColor: 'bg-sky-50 text-sky-500' },
  'Outros': { icon: 'more_horiz', color: 'bg-slate-600', lightColor: 'bg-slate-50 text-slate-600' }
};

export const VEHICLE_DATA: Record<VehicleType, VehicleOption[]> = {
  'Carro': [
    { brand: 'Hyundai', models: ['HB20', 'HB20S', 'Creta', 'Tucson', 'I30', 'Ix35', 'Santa Fe', 'Azera'] },
    { brand: 'Toyota', models: ['Corolla', 'Corolla Cross', 'Hilux', 'SW4', 'Yaris Hatch', 'Yaris Sedan', 'Etios', 'Rav4', 'Camry'] },
    { brand: 'Volkswagen', models: ['Gol', 'Polo', 'Virtus', 'T-Cross', 'Nivus', 'Taos', 'Amarok', 'Jetta', 'Tiguan', 'Saveiro', 'Up!'] },
    { brand: 'Ford', models: ['Ka', 'Ka Sedan', 'Ranger', 'EcoSport', 'Fiesta', 'Focus', 'Fusion', 'Territory', 'Maverick', 'Mustang'] },
    { brand: 'Fiat', models: ['Uno', 'Palio', 'Mobi', 'Argo', 'Cronos', 'Toro', 'Pulse', 'Fastback', 'Strada', 'Siena', 'Fiorino', 'Ducato'] },
    { brand: 'Chevrolet', models: ['Onix', 'Onix Plus', 'Prisma', 'Tracker', 'S10', 'Cruze', 'Spin', 'Montana', 'Equinox', 'Trailblazer', 'Camaro'] },
    { brand: 'Honda', models: ['Civic', 'City Hatch', 'City Sedan', 'HR-V', 'WR-V', 'CR-V', 'Fit', 'Accord'] },
    { brand: 'Jeep', models: ['Renegade', 'Compass', 'Commander', 'Grand Cherokee', 'Wrangler', 'Gladiator'] },
    { brand: 'Renault', models: ['Kwid', 'Sandero', 'Logan', 'Duster', 'Oroch', 'Captur', 'Master', 'Stepway'] },
    { brand: 'Nissan', models: ['Kicks', 'Versa', 'Sentra', 'Frontier', 'March', 'Leaf'] },
    { brand: 'Mitsubishi', models: ['L200 Triton', 'Pajero Sport', 'Pajero Full', 'ASX', 'Eclipse Cross', 'Outlander'] },
    { brand: 'BMW', models: ['320i', 'X1', 'X3', 'X5', 'X6', 'M3', 'M5', 'Série 1'] },
    { brand: 'Mercedes-Benz', models: ['Classe C', 'Classe A', 'GLA', 'GLC', 'GLE', 'CLA', 'Sprinter'] },
    { brand: 'Audi', models: ['A3 Sedan', 'Q3', 'Q5', 'A4', 'Q7', 'E-Tron', 'TT'] },
    { brand: 'Kia', models: ['Sportage', 'Sorento', 'Cerato', 'Stonic', 'Niro', 'Carnival', 'Bongo'] },
    { brand: 'Peugeot', models: ['208', '2008', '3008', '5008', 'Partner', 'Expert'] },
    { brand: 'Citroën', models: ['C3', 'C3 Aircross', 'C4 Cactus', 'Jumpy', 'Jumper'] },
    { brand: 'Caoa Chery', models: ['Tiggo 5x', 'Tiggo 7', 'Tiggo 8', 'Arrizo 6', 'Icar'] },
    { brand: 'Volvo', models: ['XC40', 'XC60', 'XC90', 'C40'] },
    { brand: 'Land Rover', models: ['Range Rover Evoque', 'Discovery Sport', 'Defender', 'Range Rover Velar'] }
  ],
  'Moto': [
    { brand: 'Honda', models: ['CG 160 Fan', 'CG 160 Titan', 'Biz 125', 'Biz 110i', 'NXR 160 Bros', 'CB 250F Twister', 'CB 300F Twister', 'XRE 300', 'CB 500X', 'NC 750X', 'PCX', 'Elite 125', 'Africa Twin'] },
    { brand: 'Yamaha', models: ['Fazer FZ25', 'Factor 150', 'Lander 250', 'MT-03', 'MT-07', 'MT-09', 'NMAX 160', 'Crosser 150', 'R3', 'Ténéré 700', 'Fluo'] },
    { brand: 'BMW', models: ['G 310 R', 'G 310 GS', 'F 850 GS', 'R 1250 GS', 'S 1000 RR', 'S 1000 XR'] },
    { brand: 'Kawasaki', models: ['Ninja 400', 'Ninja 650', 'Z400', 'Z650', 'Versys 650', 'Z900', 'Vulcan S'] },
    { brand: 'Suzuki', models: ['V-Strom 650', 'V-Strom 1050', 'GSX-S750', 'Hayabusa', 'Burgman'] },
    { brand: 'Triumph', models: ['Tiger 900', 'Tiger 1200', 'Tiger Sport 660', 'Street Triple 765', 'Trident 660', 'Bonneville T120'] },
    { brand: 'Harley-Davidson', models: ['Iron 883', 'Fat Boy', 'Low Rider S', 'Heritage Classic', 'Pan America 1250'] },
    { brand: 'Ducati', models: ['Monster', 'Multistrada V4', 'Scrambler', 'Panigale V4 S', 'Diavel 1260'] },
    { brand: 'Royal Enfield', models: ['Himalayan', 'Interceptor 650', 'Meteor 350', 'Classic 350', 'Continental GT 650'] }
  ],
  'Caminhão': [
    { brand: 'Volvo', models: ['FH 540', 'FH 460', 'VM 270', 'VM 330', 'FM 380', 'FMX'] },
    { brand: 'Mercedes-Benz', models: ['Actros 2651', 'Axor 2544', 'Atego 2426', 'Accelo 1016', 'Atron'] },
    { brand: 'Scania', models: ['R 450', 'R 500', 'R 540', 'P 310', 'G 420', 'S 500'] },
    { brand: 'Volkswagen', models: ['Constellation 24.280', 'Constellation 17.190', 'Delivery 9.170', 'Delivery 11.180', 'Meteor 28.460'] },
    { brand: 'Iveco', models: ['Daily 35S14', 'Tector 240E28', 'Hi-Way 440', 'Stralis'] },
    { brand: 'DAF', models: ['XF 105', 'XF 530', 'CF 85'] },
    { brand: 'MAN', models: ['TGX 28.440', 'TGX 29.480'] }
  ],
  'Máquina': [
    { brand: 'Caterpillar', models: ['320 Next Gen', '924K', 'D6', '416F2', '120K', '336'] },
    { brand: 'JCB', models: ['3CX', 'JS220', '540-170', '422ZX'] },
    { brand: 'John Deere', models: ['6100J', '7J Series', '8R Series', 'S430', '310L', '350G'] },
    { brand: 'Case IH', models: ['Magnum', 'Steiger', 'Puma', 'Farmall', '721E', '580N'] },
    { brand: 'New Holland', models: ['T6.180', 'T7.245', 'T8.385', 'W130', 'B95B'] },
    { brand: 'Komatsu', models: ['PC200', 'PC210', 'D61EX', 'WA320'] },
    { brand: 'Massey Ferguson', models: ['MF 4707', 'MF 6713', 'MF 7722', 'MF 8737'] }
  ],
  'Barco': [
    { brand: 'FS Yachts', models: ['FS 265', 'FS 290', 'FS 215'] },
    { brand: 'Schaefer Yachts', models: ['Schaefer 303', 'Schaefer 375', 'Phantom 303'] },
    { brand: 'Focker', models: ['Focker 242', 'Focker 215', 'Focker 272'] },
    { brand: 'Generic', models: ['Lancha', 'Iate', 'Veleiro', 'Jet Ski'] }
  ],
  'Avião': [
    { brand: 'Embraer', models: ['Phenom 100', 'Phenom 300', 'Legacy 600', 'E175', 'E195'] },
    { brand: 'Cessna', models: ['172 Skyhawk', '182 Skylane', 'Citation M2'] },
    { brand: 'Beechcraft', models: ['King Air C90', 'Baron G58', 'Bonanza G36'] },
    { brand: 'Cirrus', models: ['SR20', 'SR22', 'Vision Jet'] }
  ],
  'Outros': [
    { brand: 'Reboque', models: ['Prancha', 'Baú', 'Sider', 'Grade Baixa'] },
    { brand: 'Implemento', models: ['Munck', 'Caçamba', 'Betoneira'] },
    { brand: 'N/A', models: ['N/A'] }
  ]
};

export const SERVICES_BY_TYPE: Record<VehicleType, string[]> = {
  'Carro': ['Instalação', 'Retirada', 'Manutenção', 'Troca', 'Acessórios', 'Revisão'],
  'Moto': ['Instalação', 'Manutenção', 'Revisão', 'Troca'],
  'Caminhão': ['Tacógrafo', 'Rastreador', 'Sensor de Fadiga', 'Câmera de Fadiga', 'Telemetria'],
  'Máquina': ['Telemetria', 'Manutenção Corretiva', 'Horímetro'],
  'Barco': ['Manutenção Preventiva', 'GPS', 'Sonar'],
  'Avião': ['Inspeção de Voo', 'Rádio', 'Transponder'],
  'Outros': ['Diversos', 'Serviço Geral']
};
