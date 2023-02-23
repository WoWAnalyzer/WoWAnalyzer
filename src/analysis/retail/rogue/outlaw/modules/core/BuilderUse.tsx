import Analyzer, { Options } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { BadColor, GoodColor } from 'interface/guide';
import { ResourceLink, SpellLink } from 'interface';
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
        tooltip: (
          <div>
            Builders casted at or above {this.finishers.recommendedFinisherPoints()} CPs, this
            doesn't include:
            <ul>
              <li>
                {' '}
                <SpellLink id={SPELLS.SINISTER_STRIKE.id} /> casted at 6cp without{' '}
                <SpellLink id={SPELLS.BROADSIDE.id} /> buff up
              </li>
              <li>
                {' '}
                <SpellLink id={SPELLS.AMBUSH.id} /> casted at 6cp with{' '}
                <SpellLink id={SPELLS.OUTLAW_ROGUE_TIER_28_2P_SET_BONUS.id} /> buff up
              </li>
              <li>
                {' '}
                <SpellLink id={talents.GHOSTLY_STRIKE_TALENT.id} /> casted at 6cp without{' '}
                <SpellLink id={SPELLS.BROADSIDE.id} /> buff up
              </li>
            </ul>
          </div>
        ),
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

  private IsBuilderCPEfficient(event: CastEvent) {
    const cpUpdate = this.comboPointTracker.resourceUpdates.at(-1);
    const spellID = event.ability.guid;

    if (!cpUpdate) {
      console.log('NO CP UPDATE', this.owner.formatTimestamp(event.timestamp, 1), event, cpUpdate);
      return;
    }

    //Some events seems to have a changeWaste instead, need to find out why and when this happen
    if (!cpUpdate.change) {
      console.log('NO CP CHANGE', this.owner.formatTimestamp(event.timestamp, 1), event, cpUpdate);
      return true;
    }

    const cpAtCast = this.comboPointTracker.current - cpUpdate.change;

    if (cpAtCast > this.finishers.recommendedFinisherPoints()) {
      console.log(
        'At',
        this.owner.formatTimestamp(event.timestamp, 1),
        ' Cast at max cp ',
        event.ability.name,
      );
      return false;
    } else if (cpAtCast === this.finishers.recommendedFinisherPoints()) {
      //this is neutral
      if (
        !(
          spellID === SPELLS.SINISTER_STRIKE.id &&
          !this.selectedCombatant.hasBuff(SPELLS.BROADSIDE.id) &&
          // Ambushes at 6cp with tier are correct
          spellID === SPELLS.AMBUSH.id &&
          this.selectedCombatant.hasBuff(SPELLS.OUTLAW_ROGUE_TIER_28_2P_SET_BONUS.id, null, 200) &&
          // GS debuff maintainance is more important than cp overcap if the debuff is down
          spellID === talents.GHOSTLY_STRIKE_TALENT.id
        )
      ) {
        // try to find a way to make this work at some point&& target.getRemainingBuffTimeAtTimestamp(talents.GHOSTLY_STRIKE_TALENT.id, 10000, 13000,event.timestamp)<=1))
        console.log(
          'At',
          this.owner.formatTimestamp(event.timestamp, 1),
          ' Cast at 6 cp ',
          event.ability.name,
        );
        return false;
      }
    }
    return true;
  }
}
