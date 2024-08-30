import TALENTS from 'common/TALENTS/shaman';
import { suggestion } from 'parser/core/Analyzer';
import { AnyEvent } from 'parser/core/Events';
import aplCheck, { Apl, build, CheckResult, PlayerInfo, Rule } from 'parser/shared/metrics/apl';
import {
  and,
  buffPresent,
  debuffMissing,
  describe,
  or,
} from 'parser/shared/metrics/apl/conditions';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';
import { AtLeastFiveMSW, MaxStacksMSW, minimumMaelstromWeaponStacks } from './Conditions';
/**
 * Based on https://www.icy-veins.com/wow/enhancement-shaman-pve-dps-guide
 */

export const apl = (info: PlayerInfo): Apl => {
  const rules: Rule[] = [];

  rules.push(
    {
      spell: SPELLS.TEMPEST_CAST,
      condition: describe(and(buffPresent(SPELLS.TEMPEST_BUFF), MaxStacksMSW), () => (
        <>
          available and at 10 <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} /> stacks
        </>
      )),
    },
    {
      spell: SPELLS.LIGHTNING_BOLT,
      condition: MaxStacksMSW,
    },
    {
      spell: TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT,
      condition: and(
        minimumMaelstromWeaponStacks(8),
        describe(
          or(
            buffPresent(SPELLS.ELEMENTAL_SPIRITS_BUFF_MOLTEN_WEAPON),
            buffPresent(SPELLS.ELEMENTAL_SPIRITS_BUFF_ICY_EDGE),
            buffPresent(SPELLS.ELEMENTAL_SPIRITS_BUFF_CRACKLING_SURGE),
          ),
          () => (
            <>
              any <SpellLink spell={TALENTS.ELEMENTAL_SPIRITS_TALENT} /> active
            </>
          ),
        ),
      ),
    },
    {
      spell: SPELLS.FLAME_SHOCK,
      condition: debuffMissing(SPELLS.FLAME_SHOCK),
    },
    {
      spell: TALENTS.LAVA_LASH_TALENT,
      condition: buffPresent(SPELLS.HOT_HAND_BUFF),
    },
    {
      spell: SPELLS.LIGHTNING_BOLT,
      condition: AtLeastFiveMSW,
    },
    TALENTS.ICE_STRIKE_TALENT,
    {
      spell: TALENTS.FROST_SHOCK_TALENT,
      condition: buffPresent(SPELLS.HAILSTORM_BUFF),
    },
    TALENTS.LAVA_LASH_TALENT,
    TALENTS.STORMSTRIKE_TALENT,
    TALENTS.SUNDERING_TALENT,
    TALENTS.CRASH_LIGHTNING_TALENT,
    SPELLS.FLAME_SHOCK,
  );

  const apl = build(rules);

  return apl;
};

export const check = (events: AnyEvent[], info: PlayerInfo): CheckResult => {
  const check = aplCheck(apl(info));
  return check(events, info);
};

export default suggestion((events, info) => {
  const { violations } = check(events, info);
  annotateTimeline(violations);

  return undefined;
});
