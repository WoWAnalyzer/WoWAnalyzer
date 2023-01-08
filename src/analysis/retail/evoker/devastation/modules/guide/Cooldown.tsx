import { GuideProps, Section } from 'interface/guide';

import { useAnalyzer } from 'interface/guide';
import { TALENTS_EVOKER } from 'common/TALENTS';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import SPELLS from 'common/SPELLS';
import { GapHighlight } from 'parser/ui/CooldownBar';
import CombatLogParser from '../../CombatLogParser';
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
        If talented into <SpellLink id={TALENTS_EVOKER.SHATTERING_STAR_TALENT.id} /> aim for 80%
        efficiency.
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
      {info.combatant.hasTalent(TALENTS_EVOKER.SHATTERING_STAR_TALENT) && (
        <CastEfficiencyBar
          spellId={TALENTS_EVOKER.SHATTERING_STAR_TALENT.id}
          gapHighlightMode={GapHighlight.All}
        />
      )}
      {info.combatant.hasTalent(TALENTS_EVOKER.FIRESTORM_TALENT) && (
        <CastEfficiencyBar
          spellId={TALENTS_EVOKER.FIRESTORM_TALENT.id}
          gapHighlightMode={GapHighlight.All}
        />
      )}
      {info.combatant.hasTalent(TALENTS_EVOKER.ONYX_LEGACY_TALENT) && (
        <CastEfficiencyBar spellId={SPELLS.DEEP_BREATH.id} gapHighlightMode={GapHighlight.All} />
      )}
    </Section>
  );
}
