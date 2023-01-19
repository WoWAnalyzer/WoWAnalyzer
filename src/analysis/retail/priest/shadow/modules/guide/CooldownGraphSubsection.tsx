import { Talent } from 'common/TALENTS/types';
import Spell from 'common/SPELLS/Spell';

import { SubSection, useAnalyzer, useInfo } from 'interface/guide';
import TALENTS from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS/priest';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import { Trans } from '@lingui/macro';

type Cooldown = {
  talent: Talent;
  extraTalents?: Talent[];
};

type Cool = {
  spell: Spell;
};

const coreCooldowns: Cool[] = [
  { spell: SPELLS.MIND_BLAST },
  //{ talent: TALENTS.SHADOW_WORD_DEATH_TALENT },
];

const shortCooldowns: Cooldown[] = [
  { talent: TALENTS.SHADOW_CRASH_TALENT },
  { talent: TALENTS.VOID_TORRENT_TALENT },
  { talent: TALENTS.DAMNATION_TALENT },
  { talent: TALENTS.DARK_VOID_TALENT },
  { talent: TALENTS.MINDGAMES_TALENT },
];

const longCooldowns: Cooldown[] = [
  { talent: TALENTS.POWER_INFUSION_TALENT },
  { talent: TALENTS.DARK_ASCENSION_TALENT },
  { talent: TALENTS.VOID_ERUPTION_TALENT },
  { talent: TALENTS.MINDBENDER_SHADOW_TALENT },
];

const CoreCooldownsGraph = () => {
  const message = (
    <Trans id="guide.priest.shadow.sections.corecooldowns.graph">
      <strong>Core Graph</strong> - Spells such as these are your most important spells. Try to cast
      them as much as possible. TODO: Visualize and calculate correctly.
    </Trans>
  );
  return CoreCooldownGraphSubsection(coreCooldowns, message);
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
      you waited to use them again. You should use these cooldowns together to maximize the damage
      they can deal.
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
        />
      ))}
    </SubSection>
  );
};

const CoreCooldownGraphSubsection = (cooldownsToCheck: Cool[], message: JSX.Element) => {
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
          gapHighlightMode={GapHighlight.FullCooldown}
          minimizeIcons={hasTooManyCasts}
        />
      ))}
    </SubSection>
  );
};

export default { CoreCooldownsGraph, ShortCooldownsGraph, LongCooldownsGraph };
