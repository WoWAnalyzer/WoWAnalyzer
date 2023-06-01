import { TALENTS_SHAMAN } from 'common/TALENTS';
import { suggestion } from 'parser/core/Analyzer';
import { AnyEvent } from 'parser/core/Events';
import aplCheck, { Apl, build, CheckResult, PlayerInfo, Rule } from 'parser/shared/metrics/apl';
import {
  and,
  buffPresent,
  or,
  buffStacks,
  debuffMissing,
  spellCharges,
  describe,
  buffMissing,
  lastSpellCast,
} from 'parser/shared/metrics/apl/conditions';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import { TIERS } from 'game/TIERS';
import { SpellLink } from 'interface';
import spells from 'common/SPELLS/shaman';
import {
  chainLightningWithCracklingThunder,
  sunderingToActivateEarthenMight,
} from '../tiersets/RunesOfTheCinderwolf';

/**
 * Based on https://www.icy-veins.com/wow/enhancement-shaman-pve-dps-guide
 */

export const apl = (info: PlayerInfo): Apl => {
  const rotation: Rule[] = [];

  // common priority to all builds
  rotation.push(
    {
      spell: TALENTS_SHAMAN.PRIMORDIAL_WAVE_TALENT,
      condition: debuffMissing(spells.FLAME_SHOCK),
    },
    TALENTS_SHAMAN.FERAL_SPIRIT_TALENT,
    TALENTS_SHAMAN.ASCENDANCE_ENHANCEMENT_TALENT,
    TALENTS_SHAMAN.DOOM_WINDS_TALENT,
  );

  if (info.combatant.has2PieceByTier(TIERS.T30)) {
    rotation.push(sunderingToActivateEarthenMight());
  }

  if (info.combatant.hasTalent(TALENTS_SHAMAN.HOT_HAND_TALENT)) {
    rotation.push(...elementalistCore(info));
  } else {
    rotation.push(...stormCore(info));
  }

  rotation.push({
    spell: spells.FLAME_SHOCK,
    condition: describe(
      debuffMissing(spells.FLAME_SHOCK, { duration: 18, timeRemaining: 18 }),
      () => <></>,
      '',
    ),
  });

  return build(rotation);
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

const elementalistCore = (info: PlayerInfo) => {
  const result: Rule[] = [];

  result.push(
    spells.WINDSTRIKE_CAST,
    {
      spell: TALENTS_SHAMAN.LAVA_LASH_TALENT,
      condition: buffPresent(spells.HOT_HAND_BUFF),
    },
    {
      spell: TALENTS_SHAMAN.ELEMENTAL_BLAST_TALENT,
      condition: or(
        and(
          buffStacks(spells.MAELSTROM_WEAPON_BUFF, { atLeast: 5 }),
          spellCharges(TALENTS_SHAMAN.ELEMENTAL_BLAST_TALENT, { atLeast: 2, atMost: 2 }),
        ),
        describe(
          or(
            buffPresent(spells.ELEMENTAL_SPIRITS_BUFF_CRACKLING_SURGE),
            buffPresent(spells.ELEMENTAL_SPIRITS_BUFF_MOLTEN_WEAPON),
            buffPresent(spells.ELEMENTAL_SPIRITS_BUFF_ICY_EDGE),
          ),
          () => (
            <>
              <SpellLink spell={TALENTS_SHAMAN.ELEMENTAL_SPIRITS_TALENT} /> are active
            </>
          ),
          '',
        ),
      ),
    },
    {
      spell: spells.LIGHTNING_BOLT,
      condition: and(
        buffStacks(spells.MAELSTROM_WEAPON_BUFF, { atLeast: 5 }),
        buffPresent(TALENTS_SHAMAN.PRIMORDIAL_WAVE_TALENT),
      ),
    },
  );

  if (info.combatant.has4PieceByTier(TIERS.T30)) {
    result.push(chainLightningWithCracklingThunder());
  }

  result.push(
    {
      spell: TALENTS_SHAMAN.CHAIN_LIGHTNING_TALENT,
      condition: buffStacks(spells.MAELSTROM_WEAPON_BUFF, { atLeast: 5 }),
    },
    TALENTS_SHAMAN.PRIMORDIAL_WAVE_TALENT,
    {
      spell: TALENTS_SHAMAN.LAVA_LASH_TALENT,
      condition: buffStacks(TALENTS_SHAMAN.ASHEN_CATALYST_TALENT, { atLeast: 6 }),
    },
    TALENTS_SHAMAN.ICE_STRIKE_TALENT,
    {
      spell: TALENTS_SHAMAN.FROST_SHOCK_TALENT,
      condition: buffPresent(TALENTS_SHAMAN.HAILSTORM_TALENT),
    },
    TALENTS_SHAMAN.LAVA_LASH_TALENT,
    TALENTS_SHAMAN.STORMSTRIKE_TALENT,
    TALENTS_SHAMAN.FROST_SHOCK_TALENT,
    TALENTS_SHAMAN.CRASH_LIGHTNING_TALENT,
  );

  return result;
};

const stormCore = (info: PlayerInfo) => {
  const result: Rule[] = [];

  result.push(
    {
      spell: spells.WINDSTRIKE_CAST,
      condition: describe(
        and(
          buffPresent(TALENTS_SHAMAN.ASCENDANCE_ENHANCEMENT_TALENT),
          or(
            lastSpellCast(spells.LIGHTNING_BOLT),
            lastSpellCast(TALENTS_SHAMAN.CHAIN_LIGHTNING_TALENT),
          ),
        ),
        () => <></>,
        '',
      ),
    },
    {
      spell: TALENTS_SHAMAN.STORMSTRIKE_TALENT,
      condition: describe(
        buffMissing(TALENTS_SHAMAN.ASCENDANCE_ENHANCEMENT_TALENT),
        () => <></>,
        '',
      ),
    },
    {
      spell: TALENTS_SHAMAN.ICE_STRIKE_TALENT,
      condition: buffPresent(TALENTS_SHAMAN.DOOM_WINDS_TALENT),
    },
    {
      spell: TALENTS_SHAMAN.ELEMENTAL_BLAST_TALENT,
      condition: and(
        buffStacks(spells.MAELSTROM_WEAPON_BUFF, { atLeast: 5 }),
        spellCharges(TALENTS_SHAMAN.ELEMENTAL_BLAST_TALENT, { atLeast: 2, atMost: 2 }),
      ),
    },
  );

  if (info.combatant.has4PieceByTier(TIERS.T30)) {
    result.push(chainLightningWithCracklingThunder());
  }

  result.push(
    {
      spell: TALENTS_SHAMAN.ELEMENTAL_BLAST_TALENT,
      condition: buffStacks(spells.MAELSTROM_WEAPON_BUFF, { atLeast: 5 }),
    },
    {
      spell: spells.LIGHTNING_BOLT,
      condition: buffStacks(spells.MAELSTROM_WEAPON_BUFF, { atLeast: 5 }),
    },
    {
      spell: TALENTS_SHAMAN.CRASH_LIGHTNING_TALENT,
      condition: buffPresent(TALENTS_SHAMAN.DOOM_WINDS_TALENT),
    },
    {
      spell: spells.FLAME_SHOCK,
      condition: debuffMissing(spells.FLAME_SHOCK),
    },
  );
  result.push(
    TALENTS_SHAMAN.LAVA_LASH_TALENT,
    TALENTS_SHAMAN.ICE_STRIKE_TALENT,
    TALENTS_SHAMAN.FROST_SHOCK_TALENT,
  );

  return result;
};
