import { Covenant } from 'parser/core/Events';
import indexById from 'common/indexById';

const COVENANTS: {
  [key: string]: Covenant,
  [id: number]: Covenant,
} = {
  KYRIAN: {
    name: 'Kyrian',
    description: 'The kyrian are steadfast guardians of the afterlife who bear the souls of the dead into the Shadowlands. Eternally devoted to duty and service, only the worthy may enter their ranks.',
    id: 1,
  },
  VENTHYR: {
    name: 'Venthyr',
    description: 'The venthyr are aristocratic overseers of souls burdened with excessive pride and wickedness. They guide troubled souls upon the rigorous path to atonement, harvesting anima to keep their realm strong.',
    id: 2,
  },
  NIGHT_FAE: {
    name: 'Night Fae',
    description: 'The night fae tend to fallen nature spirits who slumber within the tranquil forest. Those with a deep bond to nature may join their cause, ensuring that the rejuvenated spirits can one day rejoin the eternal cycle.',
    id: 3,
  },
  NECROLORD: {
    name: 'Necrolord',
    description: 'Among the necrolords, strength is rewarded and weakness cast aside. The souls of the ambitious and contentious are forged into an immortal army charged with the defense of the Shadowlands.',
    id: 4,
  },
};
export default indexById(COVENANTS);


export function getCovenantById(id: number){
  if(id < 1 || id > 4){
    throw new Error("Invalid convenant selection");
  }

  switch(id){
    case 1: 
      return COVENANTS.KYRIAN;
    case 2:
      return COVENANTS.VENTHYR;
    case 3:
      return COVENANTS.NIGHT_FAE;
    case 4:
      return COVENANTS.NECROLORD;
  }
}