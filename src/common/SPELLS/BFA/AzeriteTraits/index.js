import safeMerge from 'common/safeMerge';
import General from './General';
import Paladin from './Paladin';
import Hunter from './Hunter';

export default safeMerge(General, Paladin, Hunter);
