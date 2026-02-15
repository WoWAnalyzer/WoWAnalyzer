import { GuideProps, Section } from 'interface/guide';

import { useAnalyzer } from 'interface/guide';
import { TALENTS_EVOKER } from 'common/TALENTS';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import SPELLS from 'common/SPELLS';
import { GapHighlight } from 'parser/ui/CooldownBar';
import CombatLogParser from '../../CombatLogParser';
import { SpellLink } from 'interface';
import TALENTS from 'common/TALENTS/evoker';

export function CooldownSection({ modules, info }: GuideProps<typeof CombatLogParser>) {
  const castEfficiency = useAnalyzer(CastEfficiency);
  if (!info || !castEfficiency) {
    return null;
  }

  const hasFontTalent = info.combatant.hasTalent(TALENTS_EVOKER.FONT_OF_MAGIC_DEVASTATION_TALENT);

  return (
    <Section title="Cooldowns">
      <p>
        These cooldowns are essential for maximizing your damage output. Top performing Evokers are
        able to acheive 100% efficiency with <SpellLink spell={TALENTS_EVOKER.DRAGONRAGE_TALENT} />,{' '}
        <SpellLink spell={SPELLS.FIRE_BREATH} />, and <SpellLink spell={SPELLS.ETERNITY_SURGE} />.
      </p>
      <div>
        Legend
        <ul>
          <li>Gray - Spell was available</li>
          <li>Yellow - Spell was on cooldown</li>
          <li>Red - Spell was available and potentially affected your effieciency</li>
        </ul>
      </div>
      <CastEfficiencyBar spell={TALENTS.DRAGONRAGE_TALENT} gapHighlightMode={GapHighlight.All} />
      <CastEfficiencyBar
        spell={hasFontTalent ? SPELLS.FIRE_BREATH_FONT : SPELLS.FIRE_BREATH}
        gapHighlightMode={GapHighlight.FullCooldown}
      />
      <CastEfficiencyBar
        spell={hasFontTalent ? SPELLS.ETERNITY_SURGE_FONT : SPELLS.ETERNITY_SURGE}
        gapHighlightMode={GapHighlight.FullCooldown}
      />
      <CastEfficiencyBar
        spell={
          info.combatant.hasTalent(TALENTS.MANEUVERABILITY_TALENT)
            ? SPELLS.DEEP_BREATH_SCALECOMMANDER
            : SPELLS.DEEP_BREATH
        }
        gapHighlightMode={GapHighlight.All}
      />
    </Section>
  );
}
