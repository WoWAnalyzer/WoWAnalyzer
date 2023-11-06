import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, EventType, RefreshBuffEvent } from 'parser/core/Events';
import AmalgamsSeventhSpine from 'parser/retail/modules/items/dragonflight/AmalgamsSeventhSpine';
import DonutChart from 'parser/ui/DonutChart';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';
import { SPELL_COLORS } from '../../../constants';
import { SpellLink } from 'interface';
import { getFragileEchoSourceSpell } from '../../../normalizers/CastLinkNormalizer';

interface AmalgamsSeventhSpineSourceMap {
  total: number;
  refreshes: number;
}

class AmalgamsSeventhSpineSources extends AmalgamsSeventhSpine {
  spineSourceMap: Map<number, AmalgamsSeventhSpineSourceMap> = new Map<
    number,
    AmalgamsSeventhSpineSourceMap
  >();

  constructor(options: Options) {
    super(options);
    const trinket = this.selectedCombatant.getTrinket(ITEMS.AMALGAMS_SEVENTH_SPINE.id);
    this.active = trinket !== undefined;

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(ITEMS.FRAGILE_ECHO),
      this.tallySource,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(ITEMS.FRAGILE_ECHO),
      this.tallySource,
    );
  }

  tallySource(event: ApplyBuffEvent | RefreshBuffEvent) {
    const spellId = getFragileEchoSourceSpell(event);
    if (spellId !== -1) {
      const current = this.spineSourceMap.get(spellId);
      if (current) {
        current.total += 1;
        current.refreshes += event.type === EventType.RefreshBuff ? 1 : 0;
      } else {
        this.spineSourceMap.set(spellId, {
          total: event.type === EventType.RefreshBuff ? 0 : 1,
          refreshes: event.type === EventType.RefreshBuff ? 1 : 0,
        });
      }
    }
  }

  sourceChart() {
    const items = [
      {
        color: SPELL_COLORS.ENVELOPING_MIST,
        label: 'Enveloping Mist',
        spellId: TALENTS_MONK.ENVELOPING_MIST_TALENT.id,
        value: this.spineSourceMap.get(TALENTS_MONK.ENVELOPING_MIST_TALENT.id)?.total || 0,
        valueTooltip: (
          <>
            Refreshed:{' '}
            {this.spineSourceMap.get(TALENTS_MONK.ENVELOPING_MIST_TALENT.id)?.refreshes || 0}
          </>
        ),
      },
      {
        color: SPELL_COLORS.VIVIFY,
        label: 'Vivify',
        spellId: SPELLS.VIVIFY.id,
        value: this.spineSourceMap.get(SPELLS.VIVIFY.id)?.total || 0,
        valueTooltip: <>Refreshed: {this.spineSourceMap.get(SPELLS.VIVIFY.id)?.refreshes || 0}</>,
      },
    ];
    return <DonutChart items={items} />;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(9)}
        size="flexible"
        category={STATISTIC_CATEGORY.THEORYCRAFT}
        tooltip={super.tooltip()}
      >
        <div className="pad">
          <label>
            <SpellLink spell={SPELLS.FRAGILE_ECHO_ENERGIZE}>Fragile Echo</SpellLink> source
            breakdown
          </label>
          {this.sourceChart()}
        </div>
      </Statistic>
    );
  }
}

export default AmalgamsSeventhSpineSources;
