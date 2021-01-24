import { Soulbind } from 'parser/core/Events';
import indexById from 'common/indexById';

const SOULBINDS: {
  [key: string]: Soulbind,
  [id: number]: Soulbind,
} = {
  NIYA: {
    name: 'Niya',
    id: 1,
    covenantID: 3,
    garrisonTalentTreeId: 276,
  },
  DREAMWEAVER: {
    name: 'Dreamweaver',
    id: 2,
    covenantID: 3,
    garrisonTalentTreeId: 275,
  },
  GENERAL_DRAVEN: {
    name: 'General Draven',
    id: 3,
    covenantID: 2,
    garrisonTalentTreeId: 304,
  },
  PLAGUE_DEVISER_MARILETH: {
    name: 'Plague Deviser Marileth',
    id: 4,
    covenantID: 4,
    garrisonTalentTreeId: 325,
  },
  EMENI: {
    name: 'Emeni',
    id: 5,
    covenantID: 4,
    garrisonTalentTreeId: 330,
  },
  KORAYN: {
    name: 'Korayn',
    id: 6,
    covenantID: 3,
    garrisonTalentTreeId: 334,
  },
  PELAGOS: {
    name: 'Pelagos',
    id: 7,
    covenantID: 1,
    garrisonTalentTreeId: 357,
  },
  NADJIA_THE_MISTBLADE: {
    name: 'Nadjia the Mistblade',
    id: 8,
    covenantID: 2,
    garrisonTalentTreeId: 368,
  },
  THEOTAR_THE_MAD_DUKE: {
    name: 'Theotar the Mad Duke',
    id: 9,
    covenantID: 2,
    garrisonTalentTreeId: 392,
  },
  BONESMITH_HEIRMIR: {
    name: 'Bonesmith Heirmir',
    id: 10,
    covenantID: 4,
    garrisonTalentTreeId: 349,
  },
  KLEIA: {
    name: 'Kleia',
    id: 13,
    covenantID: 1,
    garrisonTalentTreeId: 360,
  },
  FORGELITE_PRIME_MIKANIKOS: {
    name: 'Forgelite Prime Mikanikos',
    id: 18,
    covenantID: 1,
    garrisonTalentTreeId: 365,
  },
};
export default indexById(SOULBINDS);
