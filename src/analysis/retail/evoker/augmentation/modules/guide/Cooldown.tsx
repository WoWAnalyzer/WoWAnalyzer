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

  //const hasFontTalent = info.combatant.hasTalent(TALENTS.FONT_OF_MAGIC_AUGMENTATION_TALENT);

  return (
    <Section title="Cooldowns">
      <SubSection>
        <p>
          <strong>Cooldown Graph</strong> - this graph shows when you used your cooldowns and how
          long you waited to use them again. Grey segments show when the spell was available, yellow
          segments show when the spell was cooling down. Red segments highlight times when you could
          have fit a whole extra use of the cooldown.
        </p>
        <CastEfficiencyBar
          spellId={TALENTS.BREATH_OF_EONS_TALENT.id}
          gapHighlightMode={GapHighlight.All}
        />
        {info.combatant.hasTalent(TALENTS.TIME_SKIP_TALENT) && (
          <CastEfficiencyBar
            spellId={TALENTS.TIME_SKIP_TALENT.id}
            gapHighlightMode={GapHighlight.All}
          />
        )}
        <CastEfficiencyBar
          spellId={TALENTS.BLISTERING_SCALES_TALENT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
        />
        <CastEfficiencyBar
          spellId={SPELLS.FIRE_BREATH_FONT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
        />
        <CastEfficiencyBar
          spellId={SPELLS.UPHEAVAL_FONT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
        />
      </SubSection>
    </Section>
  );
}
