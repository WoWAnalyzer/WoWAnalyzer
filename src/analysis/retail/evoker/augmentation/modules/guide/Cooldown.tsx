import { GuideProps, Section, SubSection } from 'interface/guide';

import { useAnalyzer } from 'interface/guide';
import TALENTS from 'common/TALENTS/evoker';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import SPELLS from 'common/SPELLS/evoker';
import { GapHighlight } from 'parser/ui/CooldownBar';
import CombatLogParser from '../../CombatLogParser';
import { SpellLink } from 'interface';

export function CooldownSection({ info }: GuideProps<typeof CombatLogParser>) {
  const castEfficiency = useAnalyzer(CastEfficiency);
  if (!info || !castEfficiency) {
    return null;
  }

  const hasFontTalent = info.combatant.hasTalent(TALENTS.FONT_OF_MAGIC_AUGMENTATION_TALENT);

  return (
    <Section title="Cooldowns">
      <SubSection>
        <SpellLink spell={TALENTS.BREATH_OF_EONS_TALENT} /> Module coming soon<sup>TM</sup>!
      </SubSection>
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
          spellId={hasFontTalent ? SPELLS.FIRE_BREATH_FONT.id : SPELLS.FIRE_BREATH.id}
          gapHighlightMode={GapHighlight.FullCooldown}
        />
        <CastEfficiencyBar
          spellId={hasFontTalent ? SPELLS.UPHEAVAL_FONT.id : SPELLS.UPHEAVAL.id}
          gapHighlightMode={GapHighlight.FullCooldown}
        />
      </SubSection>
    </Section>
  );
}
