import { GuideProps, Section } from 'interface/guide';

import { useAnalyzer } from 'interface/guide';
import TALENTS from 'common/TALENTS/evoker';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import SPELLS from 'common/SPELLS/evoker';
import { GapHighlight } from 'parser/ui/CooldownBar';
import CombatLogParser from '../../CombatLogParser';
import { SpellLink } from 'interface';

export function CooldownSection({ modules, info }: GuideProps<typeof CombatLogParser>) {
  const castEfficiency = useAnalyzer(CastEfficiency);
  if (!info || !castEfficiency) {
    return null;
  }

  //const hasFontTalent = info.combatant.hasTalent(TALENTS.FONT_OF_MAGIC_AUGMENTATION_TALENT);

  return (
    <Section title="Cooldowns">
      <p>
        These cooldowns are essential for maximizing your damage output. Top performing Evokers are
        able to acheive 100% efficiency with <SpellLink spell={TALENTS.BREATH_OF_EONS_TALENT} />,{' '}
        <SpellLink spell={SPELLS.FIRE_BREATH} />, and <SpellLink spell={TALENTS.UPHEAVAL_TALENT} />.
        If talented into <SpellLink spell={TALENTS.TIME_SKIP_TALENT} /> aim for 90% efficiency.
      </p>
      <p>
        Legend
        <ul>
          <li>Gray - Spell was available</li>
          <li>Yellow - Spell was on cooldown</li>
          <li>Red - Spell was available and potentially affected your effieciency</li>
        </ul>
      </p>
      <CastEfficiencyBar
        spellId={TALENTS.BREATH_OF_EONS_TALENT.id}
        gapHighlightMode={GapHighlight.All}
      />
      <CastEfficiencyBar
        spellId={SPELLS.FIRE_BREATH_FONT.id}
        gapHighlightMode={GapHighlight.FullCooldown}
      />
      <CastEfficiencyBar
        spellId={SPELLS.UPHEAVAL_FONT.id}
        gapHighlightMode={GapHighlight.FullCooldown}
      />
      <CastEfficiencyBar
        spellId={TALENTS.BLISTERING_SCALES_TALENT.id}
        gapHighlightMode={GapHighlight.FullCooldown}
      />
      {info.combatant.hasTalent(TALENTS.TIME_SKIP_TALENT) && (
        <CastEfficiencyBar
          spellId={TALENTS.TIME_SKIP_TALENT.id}
          gapHighlightMode={GapHighlight.All}
        />
      )}
    </Section>
  );
}
