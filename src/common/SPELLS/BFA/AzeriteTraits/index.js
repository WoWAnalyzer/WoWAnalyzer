import safeMerge from 'common/safeMerge';
import General from './General';
import Hunter from './Hunter';
import Paladin from './Paladin';
import Shaman from './Shaman';
import Warlock from './Warlock';

export default safeMerge(General, Hunter, Paladin, Shaman, Warlock);
