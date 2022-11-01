import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { CooldownBar } from 'parser/ui/CooldownBar';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import { AnyEvent } from 'parser/core/Events';
import { Info } from 'parser/core/metric';
import { formatPercentage } from 'common/format';
import Spell from 'common/SPELLS/Spell';
import { SpellLink } from 'interface/index';

export default function CastEfficiencyPanel({
  spell,
  useSpellLink,
  castEfficiencyModule,
  events,
  info,
}: {
  spell: Spell;
  useSpellLink?: boolean;
  castEfficiencyModule: CastEfficiency;
  events: AnyEvent[];
  info: Info;
}) {
  const castEfficObj = castEfficiencyModule.getCastEfficiencyForSpellId(spell.id);
  const spellName = useSpellLink ? <SpellLink id={spell} /> : spell.name;
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
          {' '}
          - yellow when cooling down, red when all charges available, white lines show casts.
          Mouseover for timestamps.
        </small>
        <div className="flex-main chart" style={{ padding: 5 }}>
          <CooldownBar spellId={spell.id} events={events} info={info} highlightGaps minimizeIcons />
        </div>
      </div>
    </RoundedPanel>
  );
}
