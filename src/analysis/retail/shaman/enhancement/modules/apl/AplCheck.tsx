import TALENTS from 'common/TALENTS/shaman';
import { suggestion } from 'parser/core/Analyzer';
import { AnyEvent } from 'parser/core/Events';
import aplCheck, {
  Apl,
  build,
  CheckResult,
  PlayerInfo,
  Rule,
  tenseAlt,
} from 'parser/shared/metrics/apl';
import {
  and,
  buffPresent,
  or,
  buffStacks,
  debuffMissing,
  spellCharges,
  describe,
  buffMissing,
  always,
  has2PieceByTier,
} from 'parser/shared/metrics/apl/conditions';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';
import { TIERS } from 'game/TIERS';

/**
 * Based on https://www.icy-veins.com/wow/enhancement-shaman-pve-dps-guide
 */

const commonTop = [
  TALENTS.FERAL_SPIRIT_TALENT,
  {
    spell: TALENTS.PRIMORDIAL_WAVE_TALENT,
    condition: debuffMissing(SPELLS.FLAME_SHOCK),
  },
  TALENTS.ASCENDANCE_ENHANCEMENT_TALENT,
  TALENTS.DOOM_WINDS_TALENT,
  {
    spell: TALENTS.SUNDERING_TALENT,
    condition: describe(
      has2PieceByTier(TIERS.T30),
      (_) => (
        <>
          to activate <SpellLink spell={SPELLS.EARTHEN_MIGHT_TIER_BUFF} />
        </>
      ),
      '',
    ),
  },
];

const commonEnd = [
  {
    spell: SPELLS.FLAME_SHOCK,
    condition: describe(
      debuffMissing(SPELLS.FLAME_SHOCK, { duration: 18, timeRemaining: 18 }),
      () => <></>,
      '',
    ),
  },
];

export const apl = (info: PlayerInfo): Apl => {
  if (info.combatant.hasTalent(TALENTS.HOT_HAND_TALENT)) {
    return build(elementalistCore(info));
  } else {
    return build(stormCore(info));
  }
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
  const apl: Rule[] = [
    ...commonTop,
    SPELLS.WINDSTRIKE_CAST,
    {
      spell: TALENTS.LAVA_LASH_TALENT,
      condition: buffPresent(SPELLS.HOT_HAND_BUFF),
    },
  ];

  if (info.combatant.has4PieceByTier(TIERS.T30)) {
    apl.push(
      {
        spell: TALENTS.ELEMENTAL_BLAST_TALENT,
        condition: and(
          buffStacks(SPELLS.MAELSTROM_WEAPON_BUFF, { atLeast: 5 }),
          spellCharges(TALENTS.ELEMENTAL_BLAST_TALENT, { atLeast: 2, atMost: 2 }),
        ),
      },
      {
        spell: SPELLS.LIGHTNING_BOLT,
        condition: and(
          buffStacks(SPELLS.MAELSTROM_WEAPON_BUFF, { atLeast: 5 }),
          buffPresent(SPELLS.PRIMORDIAL_WAVE_BUFF),
        ),
      },
      {
        spell: TALENTS.CHAIN_LIGHTNING_TALENT,
        condition: and(
          buffPresent(SPELLS.CRACKLING_THUNDER_TIER_BUFF),
          buffStacks(SPELLS.MAELSTROM_WEAPON_BUFF, { atLeast: 5 }),
        ),
      },
      {
        spell: TALENTS.ELEMENTAL_BLAST_TALENT,
        condition: and(
          buffStacks(SPELLS.MAELSTROM_WEAPON_BUFF, { atLeast: 5 }),
          describe(
            or(
              buffPresent(SPELLS.ELEMENTAL_SPIRITS_BUFF_CRACKLING_SURGE),
              buffPresent(SPELLS.ELEMENTAL_SPIRITS_BUFF_MOLTEN_WEAPON),
              buffPresent(SPELLS.ELEMENTAL_SPIRITS_BUFF_ICY_EDGE),
            ),
            () => (
              <>
                <SpellLink spell={TALENTS.ELEMENTAL_SPIRITS_TALENT} /> are active
              </>
            ),
            '',
          ),
        ),
      },
      {
        spell: SPELLS.LIGHTNING_BOLT,
        condition: buffStacks(SPELLS.MAELSTROM_WEAPON_BUFF, { atLeast: 5 }),
      },
    );
  } else {
    apl.push({
      spell: TALENTS.ELEMENTAL_BLAST_TALENT,
      condition: and(
        buffStacks(SPELLS.MAELSTROM_WEAPON_BUFF, { atLeast: 5 }),
        or(
          spellCharges(TALENTS.ELEMENTAL_BLAST_TALENT, { atLeast: 2, atMost: 2 }),
          describe(
            or(
              buffPresent(SPELLS.ELEMENTAL_SPIRITS_BUFF_CRACKLING_SURGE),
              buffPresent(SPELLS.ELEMENTAL_SPIRITS_BUFF_MOLTEN_WEAPON),
              buffPresent(SPELLS.ELEMENTAL_SPIRITS_BUFF_ICY_EDGE),
            ),
            () => (
              <>
                <SpellLink spell={TALENTS.ELEMENTAL_SPIRITS_TALENT} /> are active
              </>
            ),
            '',
          ),
        ),
      ),
    });

    if (info.combatant.hasTalent(TALENTS.STATIC_ACCUMULATION_TALENT)) {
      apl.push({
        spell: SPELLS.LIGHTNING_BOLT,
        condition: describe(buffStacks(SPELLS.MAELSTROM_WEAPON_BUFF, { atLeast: 5 }), (tense) => (
          <>
            you {tenseAlt(tense, 'have', 'had')} have at least 5 stacks of{' '}
            <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} />, with or without{' '}
            <SpellLink spell={TALENTS.PRIMORDIAL_WAVE_TALENT} />
          </>
        )),
      });
    } else {
      apl.push(
        {
          spell: SPELLS.LIGHTNING_BOLT,
          condition: and(
            buffStacks(SPELLS.MAELSTROM_WEAPON_BUFF, { atLeast: 5 }),
            buffPresent(SPELLS.PRIMORDIAL_WAVE_BUFF),
          ),
        },
        {
          spell: TALENTS.LAVA_BURST_TALENT,
          condition: buffStacks(SPELLS.MAELSTROM_WEAPON_BUFF, { atLeast: 5 }),
        },
        {
          spell: SPELLS.LIGHTNING_BOLT,
          condition: buffStacks(SPELLS.MAELSTROM_WEAPON_BUFF, { atLeast: 10, atMost: 10 }),
        },
      );
    }
  }

  apl.push(
    TALENTS.PRIMORDIAL_WAVE_TALENT,
    {
      spell: TALENTS.LAVA_LASH_TALENT,
      condition: buffStacks(SPELLS.ASHEN_CATALYST_BUFF, { atLeast: 6 }),
    },
    TALENTS.ICE_STRIKE_TALENT,
    {
      spell: TALENTS.FROST_SHOCK_TALENT,
      condition: buffPresent(TALENTS.HAILSTORM_TALENT),
    },
    TALENTS.LAVA_LASH_TALENT,
    TALENTS.STORMSTRIKE_TALENT,
  );

  if (!info.combatant.has2PieceByTier(TIERS.T30)) {
    apl.push(TALENTS.SUNDERING_TALENT);
  }

  if (!info.combatant.hasTalent(TALENTS.STATIC_ACCUMULATION_TALENT)) {
    apl.push({
      spell: SPELLS.LIGHTNING_BOLT,
      condition: buffStacks(SPELLS.MAELSTROM_WEAPON_BUFF, { atLeast: 5 }),
    });
  }

  apl.push(TALENTS.FROST_SHOCK_TALENT, TALENTS.CRASH_LIGHTNING_TALENT, ...commonEnd);

  return apl;
};

const stormCore = (info: PlayerInfo): Rule[] => {
  const apl: Rule[] = [
    ...commonTop,
    {
      spell: SPELLS.WINDSTRIKE_CAST,
      condition: describe(
        always(buffPresent(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT)),
        () => <></>,
        '',
      ),
    },
    {
      spell: TALENTS.STORMSTRIKE_TALENT,
      condition: describe(buffMissing(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT), () => <></>, ''),
    },
  ];

  if (info.combatant.has4PieceByTier(TIERS.T30)) {
    apl.push(
      {
        spell: TALENTS.ELEMENTAL_BLAST_TALENT,
        condition: and(
          buffStacks(SPELLS.MAELSTROM_WEAPON_BUFF, { atLeast: 5 }),
          spellCharges(TALENTS.ELEMENTAL_BLAST_TALENT, { atLeast: 2, atMost: 2 }),
        ),
      },
      {
        spell: TALENTS.CHAIN_LIGHTNING_TALENT,
        condition: and(
          buffPresent(SPELLS.CRACKLING_THUNDER_TIER_BUFF),
          buffStacks(SPELLS.MAELSTROM_WEAPON_BUFF, { atLeast: 5 }),
        ),
      },
      {
        spell: TALENTS.ELEMENTAL_BLAST_TALENT,
        condition: buffStacks(SPELLS.MAELSTROM_WEAPON_BUFF, { atLeast: 5 }),
      },
    );
  } else {
    apl.push({
      spell: TALENTS.ELEMENTAL_BLAST_TALENT,
      condition: buffStacks(SPELLS.MAELSTROM_WEAPON_BUFF, { atLeast: 5 }),
    });
  }
  apl.push({
    spell: SPELLS.LIGHTNING_BOLT,
    condition: buffStacks(SPELLS.MAELSTROM_WEAPON_BUFF, { atLeast: 5 }),
  });

  if (info.combatant.hasTalent(TALENTS.ICE_STRIKE_TALENT)) {
    apl.push({
      spell: TALENTS.ICE_STRIKE_TALENT,
      condition: buffPresent(TALENTS.DOOM_WINDS_TALENT),
    });
  }

  if (info.combatant.hasTalent(TALENTS.CRASH_LIGHTNING_TALENT)) {
    apl.push({
      spell: TALENTS.CRASH_LIGHTNING_TALENT,
      condition: buffPresent(TALENTS.DOOM_WINDS_TALENT),
    });
  }

  apl.push(
    {
      spell: SPELLS.FLAME_SHOCK,
      condition: debuffMissing(SPELLS.FLAME_SHOCK),
    },
    TALENTS.LAVA_LASH_TALENT,
    TALENTS.ICE_STRIKE_TALENT,
    TALENTS.FROST_SHOCK_TALENT,
    ...commonEnd,
  );

  return apl;
};
