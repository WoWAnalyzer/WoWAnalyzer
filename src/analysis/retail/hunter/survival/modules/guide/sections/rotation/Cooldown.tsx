import { GuideProps, Section } from 'interface/guide';

import { useAnalyzer } from 'interface/guide';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import CombatLogParser from 'analysis/retail/hunter/survival/CombatLogParser';
import { SpellLink } from 'interface';
import TALENTS from 'common/TALENTS/hunter';
import SPELLS from 'common/SPELLS/hunter';
export default function CooldownSection({ modules, info }: GuideProps<typeof CombatLogParser>) {
  const castEfficiency = useAnalyzer(CastEfficiency);
  if (!info || !castEfficiency) {
    return null;
  }

  return (
    <Section title="Cooldowns">
      <p>
        These cooldowns are essential for maximizing your damage output.
        <SpellLink spell={TALENTS.TAKEDOWN_TALENT} />.
      </p>
      <div>
        Legend
        <ul>
          <li>Gray - Spell was available</li>
          <li>Yellow - Spell was on cooldown</li>
        </ul>
      </div>
      <CastEfficiencyBar
        spell={SPELLS.TAKEDOWN_PLAYER}
        gapHighlightMode={GapHighlight.FullCooldown}
        slimLines
        useThresholds
      />
      {info.combatant.hasTalent(TALENTS.BOOMSTICK_TALENT) && (
        <CastEfficiencyBar
          spell={TALENTS.BOOMSTICK_TALENT}
          gapHighlightMode={GapHighlight.FullCooldown}
        />
      )}
      {info.combatant.hasTalent(TALENTS.FLAMEFANG_PITCH_TALENT) && (
        <CastEfficiencyBar
          spell={TALENTS.FLAMEFANG_PITCH_TALENT}
          gapHighlightMode={GapHighlight.FullCooldown}
        />
      )}
    </Section>
  );
}
