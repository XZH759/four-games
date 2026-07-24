export type CharacterAsset = {
  id: string;
  role: 'researcher' | 'programmer' | 'engineer';
  gender: 'female' | 'male';
  displayNameCn: string;
  displayNameEn: string;
  sheet: string;
  canvas: { width: number; height: number };
  anchor: { type: 'foot_center'; x: number; y: number };
  layerOrder: string[];
  status: 'reference_sheet';
};

export const characterAssets: CharacterAsset[] = [
  {
    id: 'researcher_female',
    role: 'researcher',
    gender: 'female',
    displayNameCn: '研究员·女',
    displayNameEn: 'Researcher · Female',
    sheet: 'assets/reference_sheets/researcher/female/sheet.png',
    canvas: { width: 1024, height: 1536 },
    anchor: { type: 'foot_center', x: 512, y: 1216 },
    layerOrder: ['body','outfit','hairBack','face','eyes','hairFront','accessory'],
    status: 'reference_sheet',
  },
  {
    id: 'researcher_male',
    role: 'researcher',
    gender: 'male',
    displayNameCn: '研究员·男',
    displayNameEn: 'Researcher · Male',
    sheet: 'assets/reference_sheets/researcher/male/sheet.png',
    canvas: { width: 1024, height: 1536 },
    anchor: { type: 'foot_center', x: 512, y: 1216 },
    layerOrder: ['body','outfit','hairBack','face','eyes','hairFront','accessory'],
    status: 'reference_sheet',
  },
  {
    id: 'programmer_female',
    role: 'programmer',
    gender: 'female',
    displayNameCn: '程序员·女',
    displayNameEn: 'Programmer · Female',
    sheet: 'assets/reference_sheets/programmer/female/sheet.png',
    canvas: { width: 1024, height: 1536 },
    anchor: { type: 'foot_center', x: 512, y: 1216 },
    layerOrder: ['body','outfit','hairBack','face','eyes','hairFront','accessory'],
    status: 'reference_sheet',
  },
  {
    id: 'programmer_male',
    role: 'programmer',
    gender: 'male',
    displayNameCn: '程序员·男',
    displayNameEn: 'Programmer · Male',
    sheet: 'assets/reference_sheets/programmer/male/sheet.png',
    canvas: { width: 1024, height: 1536 },
    anchor: { type: 'foot_center', x: 512, y: 1216 },
    layerOrder: ['body','outfit','hairBack','face','eyes','hairFront','accessory'],
    status: 'reference_sheet',
  },
  {
    id: 'engineer_female',
    role: 'engineer',
    gender: 'female',
    displayNameCn: '工程师·女',
    displayNameEn: 'Engineer · Female',
    sheet: 'assets/reference_sheets/engineer/female/sheet.png',
    canvas: { width: 1024, height: 1536 },
    anchor: { type: 'foot_center', x: 512, y: 1216 },
    layerOrder: ['body','outfit','hairBack','face','eyes','hairFront','accessory'],
    status: 'reference_sheet',
  },
  {
    id: 'engineer_male',
    role: 'engineer',
    gender: 'male',
    displayNameCn: '工程师·男',
    displayNameEn: 'Engineer · Male',
    sheet: 'assets/reference_sheets/engineer/male/sheet.png',
    canvas: { width: 1024, height: 1536 },
    anchor: { type: 'foot_center', x: 512, y: 1216 },
    layerOrder: ['body','outfit','hairBack','face','eyes','hairFront','accessory'],
    status: 'reference_sheet',
  },
];
