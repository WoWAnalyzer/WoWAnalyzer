import safeMerge from 'common/safeMerge';

import DeOtherSide from './deotherside';
import HallsOfAtonement from './hallsofatonement';
import MistsOfTirnaScithe from './mistsoftirnascithe';
import NecroticWake from './necroticwake';
import Plaguefall from './plaguefall';
import SanguineDepths from './sanguinedepths';
import SpiresOfAscension from './spiresofascension';
import Tazavesh from './tazavesh';
import TheatorOfPain from './theaterofpain';
import Thorgast from './thorgast';

const items = safeMerge(
  DeOtherSide,
  HallsOfAtonement,
  MistsOfTirnaScithe,
  NecroticWake,
  Plaguefall,
  SanguineDepths,
  SpiresOfAscension,
  TheatorOfPain,
  Thorgast,
  Tazavesh,
);
export default items;
