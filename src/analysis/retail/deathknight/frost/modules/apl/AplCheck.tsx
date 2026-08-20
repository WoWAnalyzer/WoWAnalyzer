import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/deathknight';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Section, useInfo } from 'interface/guide';
import { AplSectionData } from 'interface/guide/components/Apl';
import SpellLink from 'interface/SpellLink';
import { suggestion } from 'parser/core/Analyzer';
import { AnyEvent } from 'parser/core/Events';
import aplCheck, { Apl, build, CheckResult, PlayerInfo, Rule } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import {
  and,
  buffPresent,
  buffStacks,
  debuffMissing,
  hasResource,
  not,
  or,
  spellSpecific,
  spellFractionalCharges,
  targetDebuffStacks,
  targetsHit,
} from 'parser/shared/metrics/apl/conditions';
import { RUNIC_POWER_SCALE_FACTOR } from '../../constants';
import { OPENER_DURATION_MS } from './Opener';

/**
 * Stable rule IDs are intentionally independent of display text and spell IDs.
 * Keep them stable so source mappings and future APL update tooling can diff rules.
 */
export const FROST_APL_RULE_IDS = {
  erwCap: 'frost.cooldown.erw-cap',
  markPillar: 'frost.cooldown.mark-pillar',
  pillar: 'frost.cooldown.pillar',
  breath: 'frost.cooldown.breath',
  frostwyrm: 'frost.cooldown.frostwyrm',
  mark: 'frost.cooldown.reapers-mark',
  highProcSpend: 'frost.common.high-proc-spend',
  frostFever: 'frost.common.frost-fever',
  procSpend: 'frost.common.proc-spend',
  erwLowResources: 'frost.cooldown.erw-low-resources',
  aoeRp: 'frost.aoe.rp-spender',
  stRp: 'frost.st.rp-spender',
  aoeRunes: 'frost.aoe.rune-spender',
  stRunes: 'frost.st.rune-spender',
  pillarHowlingBlast: 'frost.common.pillar-howling-blast',
  fallbackHowlingBlast: 'frost.common.fallback-howling-blast',
} as const;

const runesAtLeast = (amount: number) => hasResource(RESOURCE_TYPES.RUNES, { atLeast: amount }, 6);
const runesAtMost = (amount: number) => hasResource(RESOURCE_TYPES.RUNES, { atMost: amount }, 6);
// Warcraft Logs reports Runic Power in tenths.
const runicPowerAtLeast = (amount: number) =>
  hasResource(
    RESOURCE_TYPES.RUNIC_POWER,
    { atLeast: amount / RUNIC_POWER_SCALE_FACTOR },
    { displayScaleFactor: RUNIC_POWER_SCALE_FACTOR },
  );
const runicPowerAtMost = (amount: number) =>
  hasResource(
    RESOURCE_TYPES.RUNIC_POWER,
    { atMost: amount / RUNIC_POWER_SCALE_FACTOR },
    { displayScaleFactor: RUNIC_POWER_SCALE_FACTOR },
  );

const frostscytheTargets = () => targetsHit({ atLeast: 2 });
const glacialAdvanceTargets = () => targetsHit({ atLeast: 3 });

/**
 * Patch 12.1 core-build APL.
 *
 * Target-count rules are deliberately positive-only: they recognize an AoE
 * cast from its linked damage but never infer that an uncast AoE spell would
 * have hit the same targets. This avoids false recommendations from WCL data.
 */
export function frostApl(info: PlayerInfo): Apl {
  const combatant = info.combatant;
  const isDeathbringer = combatant.hasTalent(TALENTS.REAPERS_MARK_TALENT);
  const hasBreath = combatant.hasTalent(TALENTS.BREATH_OF_SINDRAGOSA_TALENT);
  const hasFrostscythe = combatant.hasTalent(TALENTS.FROSTSCYTHE_TALENT);
  const hasFrostbane = combatant.hasTalent(TALENTS.FROSTBANE_TALENT);
  const hasShatteringBlade = combatant.hasTalent(TALENTS.SHATTERING_BLADE_TALENT);

  const rules: Rule[] = [
    {
      id: FROST_APL_RULE_IDS.erwCap,
      spell: TALENTS.EMPOWER_RUNE_WEAPON_TALENT,
      condition: spellFractionalCharges(TALENTS.EMPOWER_RUNE_WEAPON_TALENT, { atLeast: 2 }),
    },
  ];

  // Wowhead and Method differ on whether Mark or Pillar is pressed first in
  // some supported openers. Treat either ordering as valid while both are ready.
  if (isDeathbringer) {
    rules.push({
      id: FROST_APL_RULE_IDS.markPillar,
      spell: [TALENTS.REAPERS_MARK_TALENT, TALENTS.PILLAR_OF_FROST_TALENT],
      condition: runesAtLeast(2),
      description: (
        <>
          Start the cooldown window with <SpellLink spell={TALENTS.REAPERS_MARK_TALENT} /> and{' '}
          <SpellLink spell={TALENTS.PILLAR_OF_FROST_TALENT} />. Both source-supported orderings are
          accepted.
        </>
      ),
    });
  }

  rules.push({
    id: FROST_APL_RULE_IDS.pillar,
    spell: TALENTS.PILLAR_OF_FROST_TALENT,
    description: (
      <>
        Use <SpellLink spell={TALENTS.PILLAR_OF_FROST_TALENT} /> on cooldown.
      </>
    ),
  });

  if (hasBreath) {
    rules.push({
      id: FROST_APL_RULE_IDS.breath,
      spell: TALENTS.BREATH_OF_SINDRAGOSA_TALENT,
      condition: and(buffPresent(TALENTS.PILLAR_OF_FROST_TALENT), runicPowerAtLeast(60)),
    });
  }

  if (combatant.hasTalent(TALENTS.FROSTWYRMS_FURY_TALENT)) {
    rules.push({
      id: FROST_APL_RULE_IDS.frostwyrm,
      spell: TALENTS.FROSTWYRMS_FURY_TALENT,
      condition: hasBreath
        ? or(
            buffPresent(TALENTS.BREATH_OF_SINDRAGOSA_TALENT),
            buffPresent(TALENTS.PILLAR_OF_FROST_TALENT),
          )
        : buffPresent(TALENTS.PILLAR_OF_FROST_TALENT),
    });
  }

  if (isDeathbringer) {
    rules.push({
      id: FROST_APL_RULE_IDS.mark,
      spell: TALENTS.REAPERS_MARK_TALENT,
      condition: runesAtLeast(2),
    });
  }

  const highProcAlternatives: Parameters<typeof spellSpecific>[0] = [];
  if (hasFrostbane) {
    highProcAlternatives.push({
      spell: TALENTS.FROST_STRIKE_TALENT,
      condition: and(buffPresent(TALENTS.FROSTBANE_TALENT), runicPowerAtLeast(35)),
    });
  }
  if (hasFrostscythe) {
    highProcAlternatives.push({
      spell: TALENTS.FROSTSCYTHE_TALENT,
      condition: and(
        or(
          buffStacks(SPELLS.KILLING_MACHINE, { atLeast: 2 }),
          buffPresent(SPELLS.EXTERMINATE_BUFF),
        ),
        frostscytheTargets(),
      ),
    });
  }
  highProcAlternatives.push({
    spell: TALENTS.OBLITERATE_TALENT,
    condition: or(
      buffStacks(SPELLS.KILLING_MACHINE, { atLeast: 2 }),
      buffPresent(SPELLS.EXTERMINATE_BUFF),
    ),
  });
  rules.push({
    id: FROST_APL_RULE_IDS.highProcSpend,
    spell: highProcAlternatives.map(({ spell }) => spell),
    condition: spellSpecific(highProcAlternatives),
  });

  rules.push({
    id: FROST_APL_RULE_IDS.frostFever,
    spell: TALENTS.HOWLING_BLAST_TALENT,
    condition: debuffMissing(SPELLS.FROST_FEVER),
  });

  const procAlternatives: Parameters<typeof spellSpecific>[0] = [];
  if (hasFrostscythe) {
    procAlternatives.push({
      spell: TALENTS.FROSTSCYTHE_TALENT,
      condition: and(buffPresent(SPELLS.KILLING_MACHINE), frostscytheTargets()),
    });
  }
  procAlternatives.push(
    {
      spell: TALENTS.OBLITERATE_TALENT,
      condition: buffPresent(SPELLS.KILLING_MACHINE),
    },
    {
      spell: TALENTS.HOWLING_BLAST_TALENT,
      condition: buffPresent(SPELLS.RIME),
    },
    {
      spell: TALENTS.FROST_STRIKE_TALENT,
      condition: runicPowerAtLeast(75),
    },
    {
      spell: SPELLS.GLACIAL_ADVANCE,
      condition: and(runicPowerAtLeast(75), glacialAdvanceTargets()),
    },
  );
  if (hasShatteringBlade) {
    procAlternatives.push({
      spell: TALENTS.FROST_STRIKE_TALENT,
      condition: and(targetDebuffStacks(SPELLS.RAZORICE, { atLeast: 5 }), runicPowerAtLeast(35)),
    });
  }
  rules.push({
    id: FROST_APL_RULE_IDS.procSpend,
    spell: procAlternatives.map(({ spell }) => spell),
    condition: spellSpecific(procAlternatives),
  });

  rules.push({
    id: FROST_APL_RULE_IDS.erwLowResources,
    spell: TALENTS.EMPOWER_RUNE_WEAPON_TALENT,
    condition: and(
      runicPowerAtMost(34),
      or(runesAtMost(1), not(buffPresent(SPELLS.KILLING_MACHINE))),
    ),
  });

  rules.push({
    id: FROST_APL_RULE_IDS.aoeRp,
    spell: SPELLS.GLACIAL_ADVANCE,
    condition: and(runicPowerAtLeast(30), glacialAdvanceTargets()),
  });

  rules.push({
    id: FROST_APL_RULE_IDS.stRp,
    spell: TALENTS.FROST_STRIKE_TALENT,
    condition: runicPowerAtLeast(35),
  });

  if (hasFrostscythe) {
    rules.push({
      id: FROST_APL_RULE_IDS.aoeRunes,
      spell: TALENTS.FROSTSCYTHE_TALENT,
      condition: and(runesAtLeast(2), frostscytheTargets()),
    });
  }

  rules.push(
    {
      id: FROST_APL_RULE_IDS.stRunes,
      spell: TALENTS.OBLITERATE_TALENT,
      condition: runesAtLeast(2),
    },
    {
      id: FROST_APL_RULE_IDS.pillarHowlingBlast,
      spell: TALENTS.HOWLING_BLAST_TALENT,
      condition: and(
        buffPresent(TALENTS.PILLAR_OF_FROST_TALENT),
        not(buffPresent(SPELLS.KILLING_MACHINE)),
      ),
    },
    {
      id: FROST_APL_RULE_IDS.fallbackHowlingBlast,
      spell: TALENTS.HOWLING_BLAST_TALENT,
      description: (
        <>
          Use <SpellLink spell={TALENTS.HOWLING_BLAST_TALENT} /> only as the final fallback when no
          higher-priority action is available.
        </>
      ),
    },
  );

  return { ...build(rules), checkDelay: OPENER_DURATION_MS };
}

export const check = (events: AnyEvent[], info: PlayerInfo): CheckResult =>
  aplCheck(frostApl(info))(events, info);

export function AplSection() {
  const info = useInfo();
  if (!info) {
    return null;
  }

  const apl = frostApl(info);
  return (
    <Section title="Action Priority List">
      <p>
        This checker covers the shared core of the patch 12.1 Deathbringer and Rider priorities. It
        accepts source-supported ordering variants. Multi-target alternatives are only judged when
        the combat log proves how many targets the cast hit.
      </p>
      <AplSectionData checker={check} apl={apl} />
    </Section>
  );
}

export default suggestion((events, info) => {
  const { violations } = check(events, info);
  annotateTimeline(violations);
  return undefined;
});
