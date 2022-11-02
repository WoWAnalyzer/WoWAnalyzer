import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { CooldownBar, GapHighlight } from 'parser/ui/CooldownBar';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import { formatPercentage } from 'common/format';
import Spell from 'common/SPELLS/Spell';
import { SpellLink } from 'interface/index';
import { useAnalyzer } from 'interface/guide/index';
import Abilities from 'parser/core/modules/Abilities';

/**
 * A rounded panel showing a spell's cast efficiency stats and a minimal cast / CD timeline
 * @param spell the spell to show stats for
 * @param useSpellLink iff true, the spell's name in the panel will be a spell link instead of plaintext
 */
export default function CastEfficiencyPanel({
  spell,
  useSpellLink,
}: {
  spell: Spell;
  useSpellLink?: boolean;
}) {
  const castEfficObj = useAnalyzer(CastEfficiency)!.getCastEfficiencyForSpellId(spell.id);
  const spellName = useSpellLink ? <SpellLink id={spell} /> : spell.name;
  const ability = useAnalyzer(Abilities)!.getAbility(spell.id);
  const hasCharges = ability && ability.charges > 1;
  const gapHighlightMode = hasCharges ? GapHighlight.All : GapHighlight.FullCooldown;
  return (
    <RoundedPanel>
      <div>
        {!castEfficObj ? (
          <>
            {spellName}: <i>Error getting Cast Efficiency data</i>
          </>
        ) : (
          <>
            {spellName} on cooldown{' '}
            <strong>{formatPercentage(castEfficObj.efficiency || 0, 1)}</strong>% of the encounter (
            <strong>{castEfficObj.casts}</strong> of <strong>{castEfficObj.maxCasts}</strong>{' '}
            possible casts)
          </>
        )}
      </div>
      <div>
        <strong>Cooldown Timeline</strong>
        <small>
          {hasCharges ? (
            <>
              {' '}
              - yellow when cooling down, red when all charges available, white lines show casts.
            </>
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
    </RoundedPanel>
  );
}
