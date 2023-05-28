import indexById, { asRestrictedTable } from 'common/indexById';
import { Soulbind } from 'parser/core/Events';

const SOULBINDS = asRestrictedTable<Soulbind>()({
  NIYA: {
    name: 'Niya',
    id: 1,
    covenantID: 3,
    garrisonTalentTreeId: 276,
    capstoneTraitID: 352503,
  },
  DREAMWEAVER: {
    name: 'Dreamweaver',
    id: 2,
    covenantID: 3,
    garrisonTalentTreeId: 275,
    capstoneTraitID: 352786,
  },
  GENERAL_DRAVEN: {
    name: 'General Draven',
    id: 3,
    covenantID: 2,
    garrisonTalentTreeId: 304,
    capstoneTraitID: 352417,
  },
  PLAGUE_DEVISER_MARILETH: {
    name: 'Plague Deviser Marileth',
    id: 4,
    covenantID: 4,
    garrisonTalentTreeId: 325,
    capstoneTraitID: 352110,
  },
  EMENI: {
    name: 'Emeni',
    id: 5,
    covenantID: 4,
    garrisonTalentTreeId: 330,
    capstoneTraitID: 351094,
  },
  KORAYN: {
    name: 'Korayn',
    id: 6,
    covenantID: 3,
    garrisonTalentTreeId: 334,
    capstoneTraitID: 352805,
  },
  PELAGOS: {
    name: 'Pelagos',
    id: 7,
    covenantID: 1,
    garrisonTalentTreeId: 357,
    capstoneTraitID: 351149,
  },
  NADJIA_THE_MISTBLADE: {
    name: 'Nadjia the Mistblade',
    id: 8,
    covenantID: 2,
    garrisonTalentTreeId: 368,
    capstoneTraitID: 352373,
  },
  THEOTAR_THE_MAD_DUKE: {
    name: 'Theotar the Mad Duke',
    id: 9,
    covenantID: 2,
    garrisonTalentTreeId: 392,
    capstoneTraitID: 351750,
  },
  BONESMITH_HEIRMIR: {
    name: 'Bonesmith Heirmir',
    id: 10,
    covenantID: 4,
    garrisonTalentTreeId: 349,
    capstoneTraitID: 350936,
  },
  KLEIA: {
    name: 'Kleia',
    id: 13,
    covenantID: 1,
    garrisonTalentTreeId: 360,
    capstoneTraitID: 351491,
  },
  FORGELITE_PRIME_MIKANIKOS: {
    name: 'Forgelite Prime Mikanikos',
    id: 18,
    covenantID: 1,
    garrisonTalentTreeId: 365,
    capstoneTraitID: 352188,
  },
});

export default indexById<Soulbind, typeof SOULBINDS>(SOULBINDS);
