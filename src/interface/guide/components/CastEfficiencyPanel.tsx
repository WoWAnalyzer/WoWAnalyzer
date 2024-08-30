import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { CooldownBar, GapHighlight } from 'parser/ui/CooldownBar';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import { formatPercentage } from 'common/format';
import Spell from 'common/SPELLS/Spell';
import { SpellLink } from 'interface/index';
import { BadColor, GoodColor, MediocreColor, OkColor, useAnalyzer } from 'interface/guide/index';
import Abilities from 'parser/core/modules/Abilities';

/**
 * A rounded panel showing a spell's cast efficiency stats and a minimal cast / CD timeline
 * @param spell the spell to show stats for
 * @param useSpellLink iff true, the spell's name in the panel will be a spell link instead of plaintext
 * @param useThresholds iff true, the cast efficiency percentage will be color coded by performance
 *    using the abilities efficiency requirements.
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
 * A subcomponent of CastEfficiencyPanel including only the percentage and possible casts stats text.
 * @param spell the spell to show stats for
 * @param useThresholds iff true, the cast efficiency percentage will be color coded by performance
 *    using the abilities efficiency requirements.
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
 * A subcomponent of CastEfficiencyPanel including only the cooldown bar with its text explanation.
 * @param spell the spell to show stats for
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
