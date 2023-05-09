import { Talent } from 'common/TALENTS/types';
import Spell from 'common/SPELLS/Spell';
import { SpellLink } from 'interface';
import { SubSection, useAnalyzer, useInfo } from 'interface/guide';
import TALENTS from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS/priest';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { CooldownWindow, fromExecuteRange, GapHighlight } from 'parser/ui/CooldownBar';
import { Trans } from '@lingui/macro';
import Voidbolt from '../spells/Voidbolt';
import ShadowWordDeath from '../spells/ShadowWordDeath';

type Cooldown = {
  talent: Talent;
  extraTalents?: Talent[];
};

type SpellCooldown = {
  spell: Spell;
  activeWindows?: CooldownWindow[];
};

const coreCooldowns: SpellCooldown[] = [
  { spell: SPELLS.MIND_BLAST },
  { spell: TALENTS.SHADOW_WORD_DEATH_TALENT },
];

const coreCooldownsVB: SpellCooldown[] = [
  { spell: SPELLS.MIND_BLAST },
  { spell: SPELLS.VOID_BOLT },
  { spell: TALENTS.SHADOW_WORD_DEATH_TALENT },
];

const shortCooldowns: Cooldown[] = [
  { talent: TALENTS.SHADOW_CRASH_TALENT },
  { talent: TALENTS.VOID_TORRENT_TALENT },
  { talent: TALENTS.MINDGAMES_TALENT },
];

const longCooldowns: Cooldown[] = [
  { talent: TALENTS.POWER_INFUSION_TALENT },
  { talent: TALENTS.DARK_ASCENSION_TALENT },
  { talent: TALENTS.VOID_ERUPTION_TALENT },
  { talent: TALENTS.MINDBENDER_SHADOW_TALENT }, //add regular pet here
];

const CoreCooldownsGraph = () => {
  const VoidboltAnalyzer = useAnalyzer(Voidbolt);
  const ShadowWordDeathAnalyzer = useAnalyzer(ShadowWordDeath);

  let coreCooldown = coreCooldowns;

  let message = (
    <Trans id="guide.priest.shadow.sections.corecooldowns.graphNOVB">
      <strong>Core Spells</strong> - <SpellLink id={SPELLS.MIND_BLAST.id} /> is a core spell that
      should be keept on cooldown as much as possible. The same is true for{' '}
      <SpellLink id={TALENTS.SHADOW_WORD_DEATH_TALENT.id} /> only during execute. These spells
      should also both be used when <SpellLink id={TALENTS.MINDBENDER_SHADOW_TALENT.id} /> is active
      with <SpellLink id={TALENTS.INESCAPABLE_TORMENT_TALENT.id} /> talented.
    </Trans>
  );

  const info = useInfo();
  if (info!.combatant.hasTalent(TALENTS.VOID_ERUPTION_TALENT)) {
    coreCooldown = coreCooldownsVB;
    // not the prettiest solution, but functional
    coreCooldown.find((cd) => cd.spell.id === SPELLS.VOID_BOLT.id)!.activeWindows =
      VoidboltAnalyzer?.executeRanges.map(fromExecuteRange);

    message = (
      <Trans id="guide.priest.shadow.sections.corecooldowns.graphVB">
        <strong>Core Spells</strong> - <SpellLink id={SPELLS.MIND_BLAST.id} /> is a core spell that
        should be keept on cooldown as much as possible. The same is true for{' '}
        <SpellLink id={TALENTS.SHADOW_WORD_DEATH_TALENT.id} /> only during execute. These spells
        should also both be used when <SpellLink id={TALENTS.MINDBENDER_SHADOW_TALENT.id} /> is
        active with <SpellLink id={TALENTS.INESCAPABLE_TORMENT_TALENT.id} /> talented.
        <br />
        During <SpellLink id={SPELLS.VOIDFORM.id} /> you gain access to{' '}
        <SpellLink id={SPELLS.VOID_BOLT.id} />, a powerful spell that should be cast when available.
      </Trans>
    );
  }

  coreCooldown.find((cd) => cd.spell.id === TALENTS.SHADOW_WORD_DEATH_TALENT.id)!.activeWindows =
    ShadowWordDeathAnalyzer?.executeRanges.map(fromExecuteRange);

  // If the found Ranges overlap, the graph visuals stack.
  // This happens often for SW:D because every enemy below the threshold creates a highlight
  // to fix this, we combine overlaping regions
  // In order to combine them, we have to sort them (I do not know why the timestamps are not in order)
  // This could instead be done in CastEfficencyBar, but I am not confiedent enough that this works universally to do so.

  const cdIndex = coreCooldown.findIndex(
    (cd) => cd.spell.id === TALENTS.SHADOW_WORD_DEATH_TALENT.id,
  );
  const highlights = ShadowWordDeathAnalyzer?.executeRanges.map(fromExecuteRange);

  highlights?.sort((a, b) => a.startTime - b.startTime);

  if (highlights != null && highlights.length > 0) {
    const combined = [highlights[0]];
    for (let i = 1; i < highlights.length; i = i + 1) {
      const currentRange = combined[combined.length - 1];
      const nextRange = highlights[i];
      if (nextRange.startTime <= currentRange.endTime) {
        currentRange.endTime = Math.max(currentRange.endTime, nextRange.endTime);
      } else {
        combined.push(nextRange);
      }
    }
    coreCooldown[cdIndex].activeWindows = combined;
  }
  return CoreCooldownGraphSubsection(coreCooldown, message);
};

const ShortCooldownsGraph = () => {
  const message = (
    <Trans id="guide.priest.shadow.sections.shortcooldowns.graph">
      <strong>Short Cooldowns</strong> - this graph shows when you used your cooldowns and how long
      you waited to use them again. Try to use these spells on cooldown.
    </Trans>
  );
  return CooldownGraphSubsection(shortCooldowns, message);
};

const LongCooldownsGraph = () => {
  const message = (
    <Trans id="guide.priest.shadow.sections.longcooldowns.graph">
      <strong>Major Cooldowns</strong> - this graph shows when you used your cooldowns and how long
      you waited to use them again. You should use these cooldowns together when possible to
      maximize the damage they can deal.
    </Trans>
  );
  return CooldownGraphSubsection(longCooldowns, message);
};

const CooldownGraphSubsection = (cooldownsToCheck: Cooldown[], message: JSX.Element) => {
  const info = useInfo();
  const castEfficiency = useAnalyzer(CastEfficiency);
  if (!info || !castEfficiency) {
    return null;
  }

  const cooldowns = cooldownsToCheck.filter((cooldown) => {
    const hasTalent = info.combatant.hasTalent(cooldown.talent);
    const hasExtraTalents =
      cooldown.extraTalents?.reduce(
        (acc, talent) => acc && info.combatant.hasTalent(talent),
        true,
      ) ?? true;
    return hasTalent && hasExtraTalents;
  });
  const hasTooManyCasts = cooldowns.some((cooldown) => {
    const casts = castEfficiency.getCastEfficiencyForSpell(cooldown.talent)?.casts ?? 0;
    return casts >= 10;
  });

  return (
    <SubSection>
      {message}

      {cooldowns.map((cooldownCheck) => (
        <CastEfficiencyBar
          key={cooldownCheck.talent.id}
          spellId={cooldownCheck.talent.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          minimizeIcons={hasTooManyCasts}
          useThresholds
        />
      ))}
    </SubSection>
  );
};

const CoreCooldownGraphSubsection = (cooldownsToCheck: SpellCooldown[], message: JSX.Element) => {
  const info = useInfo();
  const castEfficiency = useAnalyzer(CastEfficiency);
  if (!info || !castEfficiency) {
    return null;
  }
  const cooldowns = cooldownsToCheck;

  const hasTooManyCasts = cooldowns.some((cooldown) => {
    const casts = castEfficiency.getCastEfficiencyForSpell(cooldown.spell)?.casts ?? 0;
    return casts >= 10;
  });

  return (
    <SubSection>
      {message}

      {cooldowns.map((cooldownCheck) => (
        <CastEfficiencyBar
          key={cooldownCheck.spell.id}
          spellId={cooldownCheck.spell.id}
          gapHighlightMode={GapHighlight.None}
          minimizeIcons={hasTooManyCasts}
          activeWindows={cooldownCheck.activeWindows}
        />
      ))}
    </SubSection>
  );
};

export default { CoreCooldownsGraph, ShortCooldownsGraph, LongCooldownsGraph };
