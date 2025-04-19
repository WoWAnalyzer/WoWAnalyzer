import Analyzer, { Options } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { BadColor, GoodColor } from 'interface/guide';
import { ResourceLink } from 'interface';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { BUILDERS } from '../../constants';
import Finishers from '../features/Finishers';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/rogue';
import Enemies from 'parser/shared/modules/Enemies';
import ComboPointTracker from 'analysis/retail/rogue/shared/ComboPointTracker';

// TODO: Add a section to show commonly builders that were used poorly

export default class BuilderUse extends Analyzer {
  static dependencies = {
    finishers: Finishers,
    enemies: Enemies,
    comboPointTracker: ComboPointTracker,
  };
  protected finishers!: Finishers;
  protected enemies!: Enemies;
  protected comboPointTracker!: ComboPointTracker;

  totalBuilderCasts = 0;
  wastedBuilderCasts = 0;

  hasKeepItRolling = this.selectedCombatant.hasTalent(talents.KEEP_IT_ROLLING_TALENT);
  hasHiddenOpportunity = this.selectedCombatant.hasTalent(talents.HIDDEN_OPPORTUNITY_TALENT);

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.spell(BUILDERS), this.onCastBuilder);
  }

  get effectiveBuilderCasts() {
    return this.totalBuilderCasts - this.wastedBuilderCasts;
  }

  get chart() {
    const items = [
      {
        color: GoodColor,
        label: 'Effective Builders',
        value: this.effectiveBuilderCasts,
      },
      {
        color: BadColor,
        label: 'Wasted Builders',
        value: this.wastedBuilderCasts,
      },
    ];

    return <DonutChart items={items} />;
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.CORE(5)}>
        <div className="pad">
          <label>
            <ResourceLink id={RESOURCE_TYPES.COMBO_POINTS.id} /> builder usage
          </label>
          {this.chart}
        </div>
      </Statistic>
    );
  }

  private onCastBuilder(event: CastEvent) {
    this.totalBuilderCasts += 1;

    if (!this.IsBuilderCPEfficient(event)) {
      this.wastedBuilderCasts += 1;
    }
  }

  private pistolShotUsage(cpAtCast: number) {
    if (this.hasKeepItRolling) {
      return (this.selectedCombatant.hasBuff(SPELLS.BROADSIDE) && cpAtCast <= 1) || cpAtCast <= 3;
    }

    return cpAtCast <= 4;
  }

  private ambushUsage(cpAtCast: number) {
    if (this.hasHiddenOpportunity) {
      return (
        this.selectedCombatant.hasBuff(SPELLS.AUDACITY_TALENT_BUFF) ||
        (this.selectedCombatant.hasBuff(SPELLS.SUBTERFUGE_BUFF) && cpAtCast <= 4)
      );
    }

    return cpAtCast <= this.finishers.recommendedFinisherPoints();
  }

  private IsBuilderCPEfficient(event: CastEvent) {
    const cpUpdate = this.comboPointTracker.resourceUpdates.at(-1);
    const spellID = event.ability.guid;

    if (!cpUpdate) {
      console.log('NO CP UPDATE', this.owner.formatTimestamp(event.timestamp, 1), event, cpUpdate);
      return;
    }

    //Some events seems to have a changeWaste instead, need to find out why and when this happen
    if (!cpUpdate.change) {
      //console.log('NO CP CHANGE', this.owner.formatTimestamp(event.timestamp, 1), event, cpUpdate);
      return true;
    }

    const cpAtCast = this.comboPointTracker.current - cpUpdate.change;
    /* console.log(
      'At',
      this.owner.formatTimestamp(event.timestamp, 3),
      ' Cast at',
      cpAtCast,
      ' cp ',
      event.ability.name,
    ); */

    switch (spellID) {
      case SPELLS.PISTOL_SHOT.id:
        return this.pistolShotUsage(cpAtCast);
      case SPELLS.SINISTER_STRIKE.id:
        return cpAtCast <= 5;
      case SPELLS.AMBUSH.id:
      case SPELLS.AMBUSH_PROC.id:
        return this.ambushUsage(cpAtCast);
      case talents.GHOSTLY_STRIKE_TALENT.id:
        return true;
    }

    return cpAtCast <= this.finishers.recommendedFinisherPoints();
  }
}
