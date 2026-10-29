import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ResourceChangeEvent } from 'parser/core/Events';
import { ResourceLink } from 'interface';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { HOLY_POWER_BUILDERS } from '../../constants';
import SPELLS from 'common/SPELLS/paladin';
import TALENTS from 'common/TALENTS/paladin';
import Spell from 'common/SPELLS/Spell';

interface BuilderSource {
  spell: Spell;
  label: string;
  color: string;
}

const BUILDER_SOURCES: BuilderSource[] = [
  { spell: SPELLS.JUDGMENT_HP_ENERGIZE, label: 'Judgment / Hammer of Wrath', color: '#F9DC5C' },
  { spell: TALENTS.DIVINE_TOLL_TALENT, label: 'Divine Toll', color: '#3185fC' },
  { spell: TALENTS.BLESSED_HAMMER_TALENT, label: 'Blessed Hammer', color: '#818479' },
  { spell: SPELLS.CRUSADER_STRIKE, label: 'Crusader Strike', color: '#A23B72' },
  {
    spell: TALENTS.HAMMER_OF_THE_RIGHTEOUS_TALENT,
    label: 'Hammer of the Righteous',
    color: '#8FB339',
  },
  {
    spell: SPELLS.GLORY_OF_THE_VANGUARD_HOLY_POWER,
    label: 'Glory of the Vanguard',
    color: '#9B5DE5',
  },
];

interface BuilderTotals {
  casts: number;
  gained: number;
  wasted: number;
}

export default class BuilderUse extends Analyzer {
  totals: Record<number, BuilderTotals> = {};

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(HOLY_POWER_BUILDERS),
      this.onResourceChange,
    );
  }

  get totalGained() {
    return Object.values(this.totals).reduce((sum, totals) => sum + totals.gained, 0);
  }

  get totalWasted() {
    return Object.values(this.totals).reduce((sum, totals) => sum + totals.wasted, 0);
  }

  get chart() {
    const items = BUILDER_SOURCES.map(({ spell, label, color }) => {
      const { casts, gained } = this.totals[spell.id] ?? { casts: 0, gained: 0 };
      return {
        color,
        label,
        value: gained,
        valueTooltip: `${gained} Holy Power from ${casts} uses`,
      };
    }).sort((a, b) => b.value - a.value);

    items.push({
      color: '#BC3908',
      label: 'Wasted',
      value: this.totalWasted,
      valueTooltip: `${this.totalWasted} Holy Power wasted`,
    });

    return <DonutChart items={items.filter((item) => item.value !== 0)} />;
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.CORE(5)} size="flexible">
        <div className="pad">
          <label>
            <ResourceLink id={RESOURCE_TYPES.HOLY_POWER.id} /> builder usage
          </label>
          {this.chart}
        </div>
      </Statistic>
    );
  }

  private onResourceChange(event: ResourceChangeEvent) {
    if (event.resourceChangeType !== RESOURCE_TYPES.HOLY_POWER.id) {
      return;
    }
    const totals = (this.totals[event.ability.guid] ??= { casts: 0, gained: 0, wasted: 0 });
    totals.casts += 1;
    totals.gained += event.resourceChange - event.waste;
    totals.wasted += event.waste;
  }
}
