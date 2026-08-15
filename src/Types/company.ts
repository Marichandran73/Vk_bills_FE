export interface Company {
  id: string;
  legalName: string;
  tradeName?: string;
  gstin: string;
  state: string;
  stateCode: string;
  address: string;
  pan: string;
  cin?: string;
  isDefault?: boolean;
}

export const companies: Company[] = [
  {
    id: 'comp-1',
    legalName: 'VK-traders',
    tradeName: 'VK-traders',
    gstin: '22ABCDE1234F1Z5',
    state: 'TamilNadu',
    stateCode: '33',
    address: '101, BKC, Chennai - 600051',
    pan: 'ABCDE1234F',
    cin: 'U72900MH2019PTC123456',
    isDefault: true,
  },
  {
    id: 'comp-2',
    legalName: 'VK & brothers',
    tradeName: 'Vk & brothers',
    gstin: '29FGHIJ5678K1Z2',
    state: 'Karnataka',
    stateCode: '29',
    address: '#45, Indiranagar, Bangalore - 560038',
    pan: 'FGHIJ5678K',
    isDefault: false,
  },
  {
    id: 'comp-3',
    legalName: 'Vk & Co',
    tradeName: 'Vk & Co',
    gstin: '07LMNOP9012Q3Z4',
    state: 'Delhi',
    stateCode: '07',
    address: 'Plot 56, Okhla Phase-2, New Delhi - 110020',
    pan: 'LMNOP9012Q',
    cin: 'U63030DL2021PTC112233',
    isDefault: false,
  },
];