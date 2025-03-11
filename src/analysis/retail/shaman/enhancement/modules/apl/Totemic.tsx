import Combatant from 'parser/core/Combatant';
import { Apl, build, Rule } from 'parser/shared/metrics/apl';
import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import { and, buffPresent, debuffMissing, hasTalent } from 'parser/shared/metrics/apl/conditions';
import { minimumMaelstromWeaponStacks } from './Conditions';

export function totemic(combatant: Combatant): Apl {
  const rules: Rule[] = [
    SPELLS.SURGING_TOTEM,
    {
      spell: SPELLS.FLAME_SHOCK,
      condition: debuffMissing(SPELLS.FLAME_SHOCK),
    },
    {
      spell: TALENTS.LAVA_LASH_TALENT,
      condition: buffPresent(SPELLS.HOT_HAND_BUFF),
    },
    TALENTS.SUNDERING_TALENT,
    {
      spell: TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT,
      condition: minimumMaelstromWeaponStacks(10),
    },
    {
      spell: SPELLS.LIGHTNING_BOLT,
      condition: minimumMaelstromWeaponStacks(10),
    },
    TALENTS.LAVA_LASH_TALENT,
    {
      spell: TALENTS.CRASH_LIGHTNING_TALENT,
      condition: and(
        hasTalent(TALENTS.UNRELENTING_STORMS_TALENT),
        buffPresent(SPELLS.TWW_S2_ELECTROSTATIC_WAGER),
      ),
    },
    SPELLS.STORMSTRIKE_CAST,
    SPELLS.VOLTAIC_BLAZE_CAST,
    TALENTS.CRASH_LIGHTNING_TALENT,
    TALENTS.FROST_SHOCK_TALENT,
    SPELLS.FLAME_SHOCK,
  ];

  return build(rules);
}
