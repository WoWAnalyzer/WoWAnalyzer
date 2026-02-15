import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, ResourceChangeEvent } from 'parser/core/Events';
import { ResourceLink } from 'interface';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { HOLY_POWER_BUILDERS, SPELL_COLORS } from '../../constants';
import SPELLS from 'common/SPELLS/paladin';
import TALENTS from 'common/TALENTS/paladin';

export default class BuilderUse extends Analyzer {
  wastedBuilderCasts = 0;
  totalBuilderCasts = 0;

  judgmentBuilderCasts = 0;
  hammerOfWrathBuilderCasts = 0;
  divineTollBuilderCasts = 0;
  crusaderStrikeBuilderCasts = 0;
  holyShockBuilderCasts = 0;
  secondSunriseBuilderCasts = 0;

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
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.DIVINE_TOLL_TALENT),
      this.onDivineTollCast,
    );
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(TALENTS.HOLY_SHOCK_TALENT),
      this.onHolyShockCast,
    );
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.SECOND_SUNRISE_HOLY_POWER),
      this.onSecondSunrise,
    );
  }

  get effectiveBuilderCasts() {
    return this.totalBuilderCasts - this.wastedBuilderCasts;
  }

  get chart() {
    const items = [
      {
        color: SPELL_COLORS.JUDGMENT,
        label: SPELLS.JUDGMENT_CAST_HOLY.name,
        spellId: SPELLS.JUDGMENT_CAST_HOLY.id,
        value: this.judgmentBuilderCasts,
      },
      {
        color: SPELL_COLORS.HAMMER_OF_WRATH,
        label: TALENTS.HAMMER_OF_WRATH_TALENT.name,
        spellId: TALENTS.HAMMER_OF_WRATH_TALENT.id,
        value: this.hammerOfWrathBuilderCasts,
      },
      {
        color: SPELL_COLORS.DIVINE_TOLL,
        label: TALENTS.DIVINE_TOLL_TALENT.name,
        spellId: TALENTS.DIVINE_TOLL_TALENT.id,
        value: this.divineTollBuilderCasts,
      },
      {
        color: SPELL_COLORS.CRUSADER_STRIKE,
        label: SPELLS.CRUSADER_STRIKE.name,
        spellId: SPELLS.CRUSADER_STRIKE.id,
        value: this.crusaderStrikeBuilderCasts,
      },
      {
        color: SPELL_COLORS.HOLY_SHOCK,
        label: TALENTS.HOLY_SHOCK_TALENT.name,
        spellId: TALENTS.HOLY_SHOCK_TALENT.id,
        value: this.holyShockBuilderCasts,
      },
      {
        color: SPELL_COLORS.SECOND_SUNRISE,
        label: TALENTS.SECOND_SUNRISE_TALENT.name,
        spellId: TALENTS.SECOND_SUNRISE_TALENT.id,
        value: this.secondSunriseBuilderCasts,
      },
      {
        color: '#A93226',
        label: 'Wasted',
        value: this.wastedBuilderCasts,
      },
    ];

    const sortedItems = [...items].sort((a, b) => {
      if (a.label === 'Wasted') {
        return 1; // Wasted Builders should be last
      } else if (b.label === 'Wasted') {
        return -1; // Wasted Builders should be last
      } else {
        return b.value - a.value; // Sort by value in descending order
      }
    });

    return <DonutChart items={sortedItems.filter((item) => item.value !== 0)} />;
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
  private onDivineTollCast(event: CastEvent) {
    this.divineTollBuilderCasts += 1;
    if (event._linkedEvents) {
      this.holyShockBuilderCasts -= event._linkedEvents.length;
    }
  }
  private onHolyShockCast(event: ResourceChangeEvent) {
    this.holyShockBuilderCasts += 1;
  }
  private onSecondSunrise(event: ResourceChangeEvent) {
    this.secondSunriseBuilderCasts += 1;
  }
}
