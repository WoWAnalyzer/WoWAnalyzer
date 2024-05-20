import { useWaSelector } from 'interface/utils/useWaSelector';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

const itemRelative = (id: number, details: any): string => {
  const base = `item=${id}`;
  if (!details) {
    return base;
  } else {
    const queryString = [base];
    if (details.gems && details.gems.length > 0) {
      queryString.push(`gems=${details.gems.map((gem: any) => gem.id).join(':')}`);
    }
    if (details.permanentEnchant) {
      queryString.push(`ench=${details.permanentEnchant}`);
    }
    if (details.bonusIDs && details.bonusIDs.length > 0) {
      queryString.push(`bonus=${details.bonusIDs.join(':')}`);
    }
    if (details.setItemIDs && details.setItemIDs.length > 0) {
      queryString.push(`pcs=${details.setItemIDs.join(':')}`);
    }
    return queryString.join('&');
  }
};

const itemSetRelative = (id: number): string => {
  return `item-set=${id}`;
};

const npcRelative = (id: number): string => {
  return `npc=${id}`;
};

const resourceRelative = (id: number): string => {
  return RESOURCE_TYPES[id].url;
};

const spellRelative = (id: number, details: any): string => {
  const base = `spell=${id}`;
  if (!details) {
    return base;
  } else {
    const queryString = [base];
    if (details.ilvl) {
      queryString.push(`ilvl=${details.ilvl}`);
    }
    if (details.rank) {
      // We usually see rank 1 as 1, but wowhead starts at 0
      // AS OF 2023 MAY 11, IT APPEARS THAT WOWHEAD NOW STARTS AT 1
      queryString.push(`rank=${details.rank}`);
    }
    if (details.def) {
      queryString.push(`def=${details.def}`);
    }
    return queryString.join('&');
  }
};

interface TooltipHelpers {
  item: (...args: [number, any]) => string;
  itemSet: (id: number) => string;
  npc: (id: number) => string;
  resource: (...args: [number]) => string;
  spell: (...args: [number, any]) => string;
}

const useTooltip = (): TooltipHelpers => {
  const baseUrl = useWaSelector((state) => state.tooltips.baseUrl);

  return {
    item: (...args) => `${baseUrl}${itemRelative(...args)}`,
    itemSet: (id) => `${baseUrl}${itemSetRelative(id)}`,
    npc: (id) => `${baseUrl}${npcRelative(id)}`,
    resource: (...args) => `${baseUrl}${resourceRelative(...args)}`,
    spell: (...args) => `${baseUrl}${spellRelative(...args)}`,
  };
};

export default useTooltip;
