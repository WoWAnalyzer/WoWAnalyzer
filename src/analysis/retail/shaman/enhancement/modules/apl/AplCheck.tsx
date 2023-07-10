import TALENTS from 'common/TALENTS/shaman';
import { suggestion } from 'parser/core/Analyzer';
import { AnyEvent } from 'parser/core/Events';
import aplCheck, { Apl, build, CheckResult, PlayerInfo, Rule } from 'parser/shared/metrics/apl';
import {
  and,
  buffPresent,
  buffStacks,
  debuffMissing,
  spellCharges,
  describe,
  buffMissing,
} from 'parser/shared/metrics/apl/conditions';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';

/**
 * Based on https://www.icy-veins.com/wow/enhancement-shaman-pve-dps-guide
 */

const atLeastFiveMSW = buffStacks(SPELLS.MAELSTROM_WEAPON_BUFF, { atLeast: 5 });
const maxStacksMSW = buffStacks(SPELLS.MAELSTROM_WEAPON_BUFF, { atLeast: 10, atMost: 10 });

export const apl = (info: PlayerInfo): Apl => {
  const combatant = info.combatant;
  const rules: Rule[] = [];

  if (combatant.hasTalent(TALENTS.LASHING_FLAMES_TALENT)) {
    rules.push({
      spell: SPELLS.FLAME_SHOCK,
      condition: debuffMissing(SPELLS.FLAME_SHOCK),
    });
  }

  rules.push({
    spell: SPELLS.WINDSTRIKE_CAST,
    condition: buffPresent(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT),
  });

  if (combatant.hasTalent(TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT)) {
    rules.push(TALENTS.STORMSTRIKE_TALENT);
  }

  rules.push(
    {
      spell: TALENTS.LAVA_LASH_TALENT,
      condition: buffPresent(SPELLS.HOT_HAND_BUFF),
    },
    {
      spell: TALENTS.ELEMENTAL_BLAST_TALENT,
      condition: and(
        atLeastFiveMSW,
        spellCharges(TALENTS.ELEMENTAL_BLAST_TALENT, { atLeast: 2, atMost: 2 }),
      ),
    },
    {
      spell: SPELLS.LIGHTNING_BOLT,
      condition: and(atLeastFiveMSW, buffPresent(SPELLS.PRIMORDIAL_WAVE_BUFF)),
    },
    {
      spell: TALENTS.CHAIN_LIGHTNING_TALENT,
      condition: and(atLeastFiveMSW, buffPresent(SPELLS.CRACKLING_THUNDER_TIER_BUFF)),
    },
    {
      spell: TALENTS.ELEMENTAL_BLAST_TALENT,
      condition: atLeastFiveMSW,
    },
  );

  if (!combatant.hasTalent(TALENTS.THORIMS_INVOCATION_TALENT)) {
    rules.push({
      spell: TALENTS.LAVA_BURST_TALENT,
      condition: atLeastFiveMSW,
    });
  }

  rules.push({
    spell: SPELLS.LIGHTNING_BOLT,
    condition: combatant.hasTalent(TALENTS.STATIC_ACCUMULATION_TALENT)
      ? atLeastFiveMSW
      : maxStacksMSW,
  });

  if (combatant.hasTalent(TALENTS.ICE_STRIKE_TALENT)) {
    rules.push({
      spell: TALENTS.ICE_STRIKE_TALENT,
      condition: buffPresent(TALENTS.DOOM_WINDS_TALENT),
    });
  }
  if (combatant.hasTalent(TALENTS.CRASH_LIGHTNING_TALENT)) {
    rules.push({
      spell: TALENTS.CRASH_LIGHTNING_TALENT,
      condition: buffPresent(TALENTS.DOOM_WINDS_TALENT),
    });
  }

  rules.push(
    {
      spell: SPELLS.FLAME_SHOCK,
      condition: debuffMissing(SPELLS.FLAME_SHOCK),
    },
    TALENTS.ICE_STRIKE_TALENT,
    {
      spell: TALENTS.FROST_SHOCK_TALENT,
      condition: buffPresent(SPELLS.HAILSTORM_BUFF),
    },
    TALENTS.LAVA_LASH_TALENT,
  );

  if (!combatant.hasTalent(TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT)) {
    rules.push(TALENTS.STORMSTRIKE_TALENT);
  }

  if (combatant.hasTalent(TALENTS.HAILSTORM_TALENT)) {
    rules.push({
      spell: SPELLS.LIGHTNING_BOLT,
      condition: describe(
        and(atLeastFiveMSW, buffMissing(TALENTS.HAILSTORM_TALENT)),
        () => (
          <>
            to proc <SpellLink spell={TALENTS.HAILSTORM_TALENT} />
          </>
        ),
        '',
      ),
    });
  }

  rules.push(TALENTS.FROST_SHOCK_TALENT);

  if (combatant.hasTalent(TALENTS.CRASH_LIGHTNING_TALENT)) {
    rules.push(TALENTS.CRASH_LIGHTNING_TALENT);
  }

  if (!combatant.hasTalent(TALENTS.STATIC_ACCUMULATION_TALENT)) {
    rules.push({
      spell: SPELLS.LIGHTNING_BOLT,
      condition: atLeastFiveMSW,
    });
  }

  return build(rules);
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
