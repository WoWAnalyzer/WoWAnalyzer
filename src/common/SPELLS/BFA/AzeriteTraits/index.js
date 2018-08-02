import safeMerge from 'common/safeMerge';
import General from './General';
import Hunter from './Hunter';
import Paladin from './Paladin';
import Shaman from './Shaman';
import Warlock from './Warlock';
import Monk from './Monk';

export default safeMerge(General, Hunter, Paladin, Shaman, Warlock, Monk);
