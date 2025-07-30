import spells from './spell-list_Hunter_Survival.classic';
import genAbilities from 'parser/core/modules/genAbilities';

const rotational = [
  spells.KILL_SHOT,
  spells.COBRA_SHOT,
  spells.EXPLOSIVE_SHOT,
  spells.BLACK_ARROW,
  spells.EXPLOSIVE_TRAP,
  spells.EXPLOSIVE_TRAP_TRAP_LAUNCHER,
  spells.ARCANE_SHOT,
  spells.SERPENT_STING,
  spells.FERVOR_TALENT,
  spells.MULTI_SHOT,
  spells.GLAIVE_TOSS_TALENT,
];

const cooldowns = [spells.STAMPEDE, spells.RAPID_FIRE, spells.A_MURDER_OF_CROWS_TALENT];

const defensives = [spells.DETERRENCE];

export const Abilities = genAbilities({
  allSpells: Object.values(spells),
  rotational,
  cooldowns,
  defensives,
});
