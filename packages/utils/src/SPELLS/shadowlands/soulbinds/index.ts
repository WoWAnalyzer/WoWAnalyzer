import BONESMITH_HEIRMIR from './bonesmithheirmir';
import DREAMWEAVER from './dreamweaver';
import EMENI from './emeni';
import FORGELITE_PRIME_MIKANIKOS from './forgeliteprimemikanikos';
import GENERAL_DRAVEN from './generaldraven';
import KLEIA from './kleia';
import KORAYN from './korayn';
import NADJIA_THE_MISTBLADE from './nadjiathemistblade';
import NIYA from './niya';
import PELAGOS from './pelagos';
import PLAGUE_DEVISER_MARILETH from './plaguedevisermarileth';
import THEOTAR_THE_MAD_DUKE from './theotarthemadduke';

const soulbinds = {
  ...BONESMITH_HEIRMIR,
  ...DREAMWEAVER,
  ...EMENI,
  ...FORGELITE_PRIME_MIKANIKOS,
  ...GENERAL_DRAVEN,
  ...KLEIA,
  ...KORAYN,
  ...NADJIA_THE_MISTBLADE,
  ...NIYA,
  ...PELAGOS,
  ...PLAGUE_DEVISER_MARILETH,
  ...THEOTAR_THE_MAD_DUKE,
} as const;

export default soulbinds;
