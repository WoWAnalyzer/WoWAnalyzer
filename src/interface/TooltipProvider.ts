import Wowhead from './TooltipProviderWowhead';
import Wowdb from './TooltipProviderWowdb';
import Base from './TooltipProviderBase';

let TooltipProvider: typeof Base;
if (process.env.REACT_APP_WOW_DATABASE === 'wowhead') {
  TooltipProvider = Wowhead;
} else if (process.env.REACT_APP_WOW_DATABASE === 'wowdb') {
  TooltipProvider = Wowdb;
} else {
  throw new Error('Unknown WoW database.');
}

export default TooltipProvider;
