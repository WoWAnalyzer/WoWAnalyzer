import Base from './TooltipProviderBase';
import Wowdb from './TooltipProviderWowdb';
import Wowhead from './TooltipProviderWowhead';

let TooltipProvider: typeof Base;
if (process.env.REACT_APP_WOW_DATABASE === 'wowhead') {
  TooltipProvider = Wowhead;
} else if (process.env.REACT_APP_WOW_DATABASE === 'wowdb') {
  TooltipProvider = Wowdb;
} else {
  throw new Error('Unknown WoW database.');
}

export default TooltipProvider;
