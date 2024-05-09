import indexById from 'common/indexById';
import { Covenant } from 'parser/core/Events';

const COVENANTS = {
  KYRIAN: {
    name: 'Kyrian',
    description:
      'The kyrian are steadfast guardians of the afterlife who bear the souls of the dead into the Shadowlands. Eternally devoted to duty and service, only the worthy may enter their ranks.',
    id: 1,
    spellID: 321076,
    icon: 'ui_sigil_kyrian',
  },
  VENTHYR: {
    name: 'Venthyr',
    description:
      'The venthyr are aristocratic overseers of souls burdened with excessive pride and wickedness. They guide troubled souls upon the rigorous path to atonement, harvesting anima to keep their realm strong.',
    id: 2,
    spellID: 321079,
    icon: 'ui_sigil_venthyr',
  },
  NIGHT_FAE: {
    name: 'Night Fae',
    description:
      'The night fae tend to fallen nature spirits who slumber within the tranquil forest. Those with a deep bond to nature may join their cause, ensuring that the rejuvenated spirits can one day rejoin the eternal cycle.',
    id: 3,
    spellID: 321077,
    icon: 'ui_sigil_nightfae',
  },
  NECROLORD: {
    name: 'Necrolord',
    description:
      'Among the necrolords, strength is rewarded and weakness cast aside. The souls of the ambitious and contentious are forged into an immortal army charged with the defense of the Shadowlands.',
    id: 4,
    spellID: 321078,
    icon: 'ui_sigil_necrolord',
  },
} satisfies Record<string, Covenant>;

export default indexById<Covenant, typeof COVENANTS>(COVENANTS);
