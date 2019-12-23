import Wowhead from './Wowhead';
import Wowdb from './Wowdb';
import Base from './Base';

let TooltipProvider: typeof Base;
if (process.env.REACT_APP_WOW_DATABASE === 'wowhead') {
  TooltipProvider = Wowhead;
} else if (process.env.REACT_APP_WOW_DATABASE === 'wowdb') {
  TooltipProvider = Wowdb;
} else {
  throw new Error('Unknown WoW database.');
}

export default TooltipProvider;
