import { GuideProps, Section, SubSection } from 'interface/guide';

import { useAnalyzer } from 'interface/guide';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import CombatLogParser from 'analysis/retail/hunter/survival/CombatLogParser';
import { SpellLink } from 'interface';
import TALENTS from 'common/TALENTS/hunter';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
export default function CooldownSection({ modules, info }: GuideProps<typeof CombatLogParser>) {
  const castEfficiency = useAnalyzer(CastEfficiency);
  if (!info || !castEfficiency) {
    return null;
  }

  return (
    <Section title="Cooldowns">
      <p>
        These cooldowns are essential for maximizing your damage output.
        <SpellLink spell={TALENTS.COORDINATED_ASSAULT_TALENT} />, and{' '}
        <SpellLink spell={TALENTS.SPEARHEAD_TALENT} /> should be layered together whenever possible
        to maximise damage in Single Target. If using{' '}
        <SpellLink spell={TALENTS.SENTINEL_WATCH_TALENT} /> then do not delay either cooldown for
        the other. If using <SpellLink spell={TALENTS.RELENTLESS_PRIMAL_FEROCITY_TALENT} /> then
        ensure every other cast of Spearhead is right away in order to keep the cooldowns lined up.
        Keep in mind that the cast efficiency does not take into account fight timings, or specific
        strategies that may require you to hold cooldowns.
      </p>
      <div>
        Legend
        <ul>
          <li>Gray - Spell was available</li>
          <li>Yellow - Spell was on cooldown</li>
        </ul>
      </div>
      <CastEfficiencyBar
        spellId={TALENTS.COORDINATED_ASSAULT_TALENT.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        slimLines
        useThresholds
      />
      {info.combatant.hasTalent(TALENTS.SPEARHEAD_TALENT) && (
        <CastEfficiencyBar
          spellId={TALENTS.SPEARHEAD_TALENT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
        />
      )}

      <SubSection title="Trinket Cooldowns">
        {info.combatant.hasTrinket(ITEMS.SKARDYNS_GRACE.id) && (
          <>
            <p>
              Skardyn's Grace should always be used with{' '}
              <SpellLink spell={TALENTS.COORDINATED_ASSAULT_TALENT} /> when
              <strong> NOT</strong> using <SpellLink spell={TALENTS.SENTINEL_WATCH_TALENT} />. If
              using
              <SpellLink spell={TALENTS.SENTINEL_WATCH_TALENT} /> then use them together when both
              are available, but do not delay one for the other if it will cost you casts later.
            </p>
            <CastEfficiencyBar
              spellId={SPELLS.SPEED_OF_THOUGHT.id}
              gapHighlightMode={GapHighlight.FullCooldown}
            />
          </>
        )}
        {info.combatant.hasTrinket(ITEMS.MAD_QUEENS_MANDATE.id) && (
          <>
            <p>
              Queen's Mandate should be used when the target us under the 10% Damage from{' '}
              <SpellLink spell={TALENTS.LUNAR_STORM_TALENT} />. The last cast in a fight should
              occur as late as possible to maximise the execute damage.
            </p>
            <CastEfficiencyBar
              spellId={SPELLS.ABYSSAL_GLUTTONY.id}
              gapHighlightMode={GapHighlight.FullCooldown}
            />
          </>
        )}
      </SubSection>
    </Section>
  );
}
