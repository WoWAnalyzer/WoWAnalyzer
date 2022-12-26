import { GuideProps, Section } from 'interface/guide';

import { useAnalyzer } from 'interface/guide';
import { TALENTS_EVOKER } from 'common/TALENTS';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import SPELLS from 'common/SPELLS';
import { GapHighlight } from 'parser/ui/CooldownBar';
import CombatLogParser from 'parser/core/CombatLogParser';
import { SpellLink } from 'interface';

export function CooldownSection({ modules, info }: GuideProps<typeof CombatLogParser>) {
  const castEfficiency = useAnalyzer(CastEfficiency);
  if (!info || !castEfficiency) {
    return null;
  }

  const hasFontTalent = info.combatant.hasTalent(TALENTS_EVOKER.FONT_OF_MAGIC_TALENT);

  return (
    <Section title="Cooldowns">
      <p>
        These cooldowns are essential for maximizing your damage output. Top performing Evokers are
        able to acheive 100% efficiency with <SpellLink id={TALENTS_EVOKER.DRAGONRAGE_TALENT.id} />,{' '}
        <SpellLink id={SPELLS.FIRE_BREATH.id} />, and <SpellLink id={SPELLS.ETERNITY_SURGE.id} />.
      </p>
      <p>
        Legend
        <ul>
          <li>Gray - Spell was available</li>
          <li>Yellow - Spell was on cooldown</li>
          <li>Red - Spell was available and potentially contributed to efficiency</li>
        </ul>
        Simply put, Red is bad if efficiency is not 100%.
      </p>
      <CastEfficiencyBar
        spellId={TALENTS_EVOKER.DRAGONRAGE_TALENT.id}
        gapHighlightMode={GapHighlight.All}
      />
      <CastEfficiencyBar
        spellId={hasFontTalent ? SPELLS.FIRE_BREATH_FONT.id : SPELLS.FIRE_BREATH.id}
        gapHighlightMode={GapHighlight.FullCooldown}
      />
      <CastEfficiencyBar
        spellId={hasFontTalent ? SPELLS.ETERNITY_SURGE_FONT.id : SPELLS.ETERNITY_SURGE.id}
        gapHighlightMode={GapHighlight.FullCooldown}
      />

      <CastEfficiencyBar
        spellId={TALENTS_EVOKER.SHATTERING_STAR_TALENT.id}
        gapHighlightMode={GapHighlight.All}
      />
    </Section>
  );
}
