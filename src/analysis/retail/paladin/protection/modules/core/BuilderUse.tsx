import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ResourceChangeEvent } from 'parser/core/Events';
//import { BadColor, GoodColor } from 'interface/guide';
import { ResourceLink } from 'interface';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { HOLY_POWER_BUILDERS } from '../../constants';
import SPELLS from 'common/SPELLS/paladin';
import TALENTS from 'common/TALENTS/paladin';

export default class BuilderUse extends Analyzer {
  wastedBuilderCasts = 0;
  totalBuilderCasts = 0;
  judgmentBuilderCasts = 0;
  hammerOfWrathBuilderCasts = 0;
  divineTollBuilderCasts = 0;
  crusaderStrikeBuilderCasts = 0;
  hammerOfTheRighteousBuilderCasts = 0;
  blessedHammerBuilderCasts = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(HOLY_POWER_BUILDERS),
      this.onResourceChange,
    );
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.JUDGMENT_HP_ENERGIZE),
      this.onJudgmentCast,
    );
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(TALENTS.HAMMER_OF_WRATH_TALENT),
      this.onHammerOfWrathCast,
    );
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.CRUSADER_STRIKE),
      this.onCrusaderStrikeCast,
    );
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(TALENTS.HAMMER_OF_THE_RIGHTEOUS_TALENT),
      this.onHammerOfTheRighteousCast,
    );
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(TALENTS.BLESSED_HAMMER_TALENT),
      this.onBlessedHammerCast,
    );
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(TALENTS.DIVINE_TOLL_TALENT),
      this.onDivineTollCast,
    );
  }

  get effectiveBuilderCasts() {
    return this.totalBuilderCasts - this.wastedBuilderCasts;
  }

  get chart() {
    const items = [
      {
        color: '#F9DC5C',
        label: 'Judgment Builders',
        value: this.judgmentBuilderCasts,
      },
      {
        color: '#70C1B3',
        label: 'Hammer of Wrath Builders',
        value: this.hammerOfWrathBuilderCasts,
      },
      {
        color: '#3185fC',
        label: 'Divine Toll Builders',
        value: this.divineTollBuilderCasts,
      },
      {
        color: '#818479',
        label: 'Blessed Hammer Builders',
        value: this.blessedHammerBuilderCasts,
      },
      {
        color: '#818479',
        label: 'Crusader Strike Builders',
        value: this.crusaderStrikeBuilderCasts,
      },

      {
        color: '#818479',
        label: 'Hammer of the Righteous Builders',
        value: this.hammerOfTheRighteousBuilderCasts,
      },

      {
        color: '#BC3908',
        label: 'Wasted Builders',
        value: this.wastedBuilderCasts,
      },
    ];

    const sortedItems = [...items].sort((a, b) => {
      if (a.label === 'Wasted Builders') {
        return 1; // Wasted Builders should be last
      } else if (b.label === 'Wasted Builders') {
        return -1; // Wasted Builders should be last
      } else {
        return b.value - a.value; // Sort by value in descending order
      }
    });

    return <DonutChart items={sortedItems.filter((item) => item.value !== 0)} />;
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.CORE(5)}>
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
    this.totalBuilderCasts += 1;
    if (event.resourceChange - event.waste === 0) {
      this.wastedBuilderCasts += 1;
    }
  }
  private onJudgmentCast(event: ResourceChangeEvent) {
    this.judgmentBuilderCasts += 1;
  }
  private onHammerOfWrathCast(event: ResourceChangeEvent) {
    this.hammerOfWrathBuilderCasts += 1;
  }
  private onCrusaderStrikeCast(event: ResourceChangeEvent) {
    this.crusaderStrikeBuilderCasts += 1;
  }
  private onHammerOfTheRighteousCast(event: ResourceChangeEvent) {
    this.hammerOfTheRighteousBuilderCasts += 1;
  }
  private onBlessedHammerCast(event: ResourceChangeEvent) {
    this.blessedHammerBuilderCasts += 1;
  }
  private onDivineTollCast(event: ResourceChangeEvent) {
    this.divineTollBuilderCasts += 1;
  }

  private builderCast(ability: number) {
    switch (ability) {
      case SPELLS.JUDGMENT_CAST_PROTECTION.id:
        this.judgmentBuilderCasts += 1;
        break;
      case TALENTS.HAMMER_OF_WRATH_TALENT.id:
        this.judgmentBuilderCasts += 1;
        break;
      case TALENTS.DIVINE_TOLL_TALENT.id:
        this.judgmentBuilderCasts += 1;
        break;
      case SPELLS.CRUSADER_STRIKE.id:
        this.judgmentBuilderCasts += 1;
        break;
      case TALENTS.HAMMER_OF_THE_RIGHTEOUS_TALENT.id:
        this.judgmentBuilderCasts += 1;
        break;
      case TALENTS.BLESSED_HAMMER_TALENT.id:
        this.judgmentBuilderCasts += 1;
        break;
    }
  }
}
