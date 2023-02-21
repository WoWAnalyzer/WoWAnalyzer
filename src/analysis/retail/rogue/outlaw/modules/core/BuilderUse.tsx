import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ResourceChangeEvent } from 'parser/core/Events';
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

export default class BuilderUse extends Analyzer {
  static dependencies = {
    finishers: Finishers,
    enemies: Enemies,
  };
  protected finishers!: Finishers;
  protected enemies!: Enemies;

  totalBuilderCasts = 0;
  wastedBuilderCasts = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(BUILDERS),
      this.onResourceChange,
    );
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

  private onResourceChange(event: ResourceChangeEvent) {
    this.totalBuilderCasts += 1;

    if(!this.IsBuilderCPEfficient(event)){
        this.wastedBuilderCasts +=1;
    }
  }

  public IsBuilderCPEfficient(event: ResourceChangeEvent) {
    const cpGain = event.resourceChange - event.waste;
    const cpAtEvent = this.finishers.maximumComboPoints - cpGain;
    const spellID = event.ability.guid;
    const target = this.enemies.getEntity(event);

    if (!target) {
      return false;
    }

    if(cpAtEvent > this.finishers.recommendedFinisherPoints())
    {
      return false;
    }
    else if (cpAtEvent == this.finishers.recommendedFinisherPoints())
    {
      //this is neutral
      if(!(spellID == SPELLS.SINISTER_STRIKE.id && this.selectedCombatant.hasBuff(SPELLS.BROADSIDE.id))
      // Ambushes at 6cp with tier are correct
      || !(spellID == SPELLS.AMBUSH.id && this.selectedCombatant.hasBuff(SPELLS.OUTLAW_ROGUE_TIER_28_2P_SET_BONUS.id, null, 200))
      // GS debuff maintainance is more important than cp overcap if the debuff is down
      || !(spellID == talents.GHOSTLY_STRIKE_TALENT.id && target.getRemainingBuffTimeAtTimestamp(talents.GHOSTLY_STRIKE_TALENT.id, 10000, 13000,event.timestamp)<=1))
      {
        return false;
      }
    }
    return true;
  }
}
