import { GuideProps, Section, SubSection } from 'interface/guide';

import { useAnalyzer } from 'interface/guide';
import TALENTS from 'common/TALENTS/evoker';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import SPELLS from 'common/SPELLS/evoker';
import { GapHighlight } from 'parser/ui/CooldownBar';
import CombatLogParser from '../../CombatLogParser';

export function CooldownSection({ modules, info }: GuideProps<typeof CombatLogParser>) {
  const castEfficiency = useAnalyzer(CastEfficiency);
  if (!info || !castEfficiency) {
    return null;
  }

  const hasFontTalent = info.combatant.hasTalent(TALENTS.FONT_OF_MAGIC_AUGMENTATION_TALENT);

  return (
    <Section title="Cooldowns">
      {modules.breathOfEonsRotational.guideSubsection()}
      <SubSection>
        <p>
          <strong>Cooldown Graph</strong> - this graph shows when you used your cooldowns and how
          long you waited to use them again. Grey segments show when the spell was available, yellow
          segments show when the spell was cooling down. Red segments highlight times when you could
          have fit a whole extra use of the cooldown.
        </p>
        {info.combatant.hasTalent(TALENTS.BREATH_OF_EONS_TALENT) && (
          <CastEfficiencyBar
            spell={
              info.combatant.hasTalent(TALENTS.MANEUVERABILITY_TALENT)
                ? SPELLS.BREATH_OF_EONS_SCALECOMMANDER
                : TALENTS.BREATH_OF_EONS_TALENT
            }
            gapHighlightMode={GapHighlight.FullCooldown}
          />
        )}
        {!info.combatant.hasTalent(TALENTS.BREATH_OF_EONS_TALENT) && (
          <CastEfficiencyBar
            spell={
              info.combatant.hasTalent(TALENTS.MANEUVERABILITY_TALENT)
                ? SPELLS.DEEP_BREATH_SCALECOMMANDER
                : SPELLS.DEEP_BREATH
            }
            gapHighlightMode={GapHighlight.FullCooldown}
          />
        )}
        {info.combatant.hasTalent(TALENTS.TIME_SKIP_TALENT) &&
          !info.combatant.hasTalent(TALENTS.INTERWOVEN_THREADS_TALENT) && (
            <CastEfficiencyBar
              spell={TALENTS.TIME_SKIP_TALENT}
              gapHighlightMode={GapHighlight.FullCooldown}
            />
          )}
        {info.combatant.hasTalent(TALENTS.PRESCIENCE_TALENT) && (
          <CastEfficiencyBar
            spell={TALENTS.PRESCIENCE_TALENT}
            gapHighlightMode={GapHighlight.All}
            minimizeIcons
          />
        )}
        <CastEfficiencyBar
          spell={hasFontTalent ? SPELLS.FIRE_BREATH_FONT : SPELLS.FIRE_BREATH}
          gapHighlightMode={GapHighlight.FullCooldown}
          minimizeIcons
        />
        {info.combatant.hasTalent(TALENTS.UPHEAVAL_TALENT) && (
          <CastEfficiencyBar
            spell={hasFontTalent ? SPELLS.UPHEAVAL_FONT : SPELLS.UPHEAVAL}
            gapHighlightMode={GapHighlight.FullCooldown}
            minimizeIcons
          />
        )}
      </SubSection>
    </Section>
  );
}
