import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { CooldownBar, GapHighlight } from 'parser/ui/CooldownBar';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import { formatPercentage } from 'common/format';
import Spell from 'common/SPELLS/Spell';
import { SpellLink } from 'interface/index';
import { BadColor, GoodColor, MediocreColor, OkColor, useAnalyzer } from 'interface/guide/index';
import Abilities from 'parser/core/modules/Abilities';

/**
 * A rounded panel showing cast efficiency stats and a minimal cast/cooldown timeline.
 *
 * @param spell - The spell to show stats for
 * @param useSpellLink - If true, spell name will be a clickable SpellLink. Default: false
 * @param useThresholds - If true, efficiency percentage will be color-coded based on ability thresholds. Default: false
 */
export default function CastEfficiencyPanel({
  spell,
  useSpellLink,
  useThresholds,
}: {
  spell: Spell;
  useSpellLink?: boolean;
  useThresholds?: boolean;
}) {
  const spellName = useSpellLink ? <SpellLink spell={spell} /> : spell.name;
  return (
    <RoundedPanel>
      <div>
        {spellName} - <CastEfficiencyStatElement spell={spell} useThresholds={useThresholds} />
      </div>
      <CastEfficiencyBarElement spell={spell} />
    </RoundedPanel>
  );
}

/**
 * Shows only the cast efficiency percentage and cast count text.
 *
 * @param spell - The spell to show stats for
 * @param useThresholds - If true, efficiency percentage will be color-coded based on ability thresholds. Default: false
 */
export function CastEfficiencyStatElement({
  spell,
  useThresholds,
}: {
  spell: Spell;
  useThresholds?: boolean;
}) {
  const castEfficObj = useAnalyzer(CastEfficiency)!.getCastEfficiencyForSpellId(spell.id);
  let textColor: string | undefined;
  if (useThresholds && castEfficObj && castEfficObj.efficiency) {
    const effectiveUtil =
      castEfficObj.casts === castEfficObj.maxCasts ? 1 : castEfficObj.efficiency;
    if (effectiveUtil < castEfficObj.majorIssueEfficiency) {
      textColor = BadColor;
    } else if (effectiveUtil < castEfficObj.averageIssueEfficiency) {
      textColor = MediocreColor;
    } else if (effectiveUtil < castEfficObj.recommendedEfficiency) {
      textColor = OkColor;
    } else {
      textColor = GoodColor;
    }
  }
  return (
    <>
      {!castEfficObj ? (
        <>
          <i>Error getting Cast Efficiency data</i>
        </>
      ) : (
        <>
          <span style={{ color: textColor, fontSize: 16 }}>
            <strong>{formatPercentage(castEfficObj.efficiency || 0, 0)}%</strong>
          </span>{' '}
          cast efficiency (<strong>{castEfficObj.casts}</strong> of{' '}
          <strong>{castEfficObj.maxCasts}</strong> possible casts)
        </>
      )}
    </>
  );
}

/**
 * Shows only the cooldown timeline bar with explanatory text.
 * Displays when spell was on cooldown, available, and when it was cast.
 *
 * @param spell - The spell to show cooldown timeline for
 */
export function CastEfficiencyBarElement({ spell }: { spell: Spell }) {
  const ability = useAnalyzer(Abilities)!.getAbility(spell.id);
  const hasCharges = ability && ability.charges > 1;
  const gapHighlightMode = hasCharges ? GapHighlight.All : GapHighlight.FullCooldown;
  return (
    <div>
      <strong>Cooldown Timeline</strong>
      <small>
        {hasCharges ? (
          <> - yellow when cooling down, red when all charges available, white lines show casts.</>
        ) : (
          <>
            {' '}
            - yellow when on cooldown, grey when available, white lines show casts.
            <br />
            Red highlights available times you could have fit a whole extra use of the ability.
          </>
        )}
      </small>
      <div className="flex-main chart" style={{ padding: 5 }}>
        <CooldownBar spellId={spell.id} gapHighlightMode={gapHighlightMode} minimizeIcons />
      </div>
    </div>
  );
}
