import { LegendarySpell, SpellList } from "common/SPELLS/Spell";
//https://www.raidbots.com/static/data/live/bonuses.json
const legendaries: SpellList<LegendarySpell> = {
  //region Enhancement

  //endregion

  //region Elemental

  //endregion

  //region Restoration
  JONATS_NATURAL_FOCUS: {
    id: 335893,
    name: 'Jonat\'s Natural Focus',
    icon: 'spell_nature_healingwavegreater',
    bonusID: 6997,
  },
  JONATS_NATURAL_FOCUS_BUFF: {
    id: 335894,
    name: 'Jonat\'s Natural Focus',
    icon: 'spell_nature_healingwavegreater',
  },
  PRIMAL_TIDE_CORE: {
    id: 335889,
    name: 'Primal Tide Core',
    icon: 'ability_shaman_repulsiontotem',
    bonusID: 6999,
  },
  //endregion

  //region Shared

  //endregion
};
export default legendaries;
