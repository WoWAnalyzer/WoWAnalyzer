import { formatNth, formatDuration } from 'common/format';
import { SpellLink, SpecIcon } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import { SpellInfo } from 'parser/core/EventFilter';
import Events, { CastEvent, EventType, HealEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Combatants from 'parser/shared/modules/Combatants';
import BoringValue from 'parser/ui/BoringValueText';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import SPELLS from 'common/SPELLS/classic/shaman';

const CHAIN_HEAL_TARGET_EFFICIENCY = 0.97;
const HEAL_WINDOW_MS = 250;

interface ChainHealInfo {
  target: {
    id: number | undefined;
    name: string;
    specIcon: string;
    specClassName: string;
  };
  timestamp: number;
  castNo: number;
  hits: number;
}

class ChainHeal extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    combatants: Combatants,
  };

  protected abilityTracker!: AbilityTracker;
  protected combatants!: Combatants;

  buffer: Array<HealEvent | CastEvent> = [];
  chainHealHistory: ChainHealInfo[] = [];
  castIndex = 0;
  chainHealTimestamp = 0;
  maxTargets = 3;
  suggestedTargets = 0;

  constructor(options: Options) {
    super(options);

    this.active = true;
    this.suggestedTargets = this.maxTargets * CHAIN_HEAL_TARGET_EFFICIENCY;

    const chainHealSpells: SpellInfo[] = [SPELLS.CHAIN_HEAL.id, ...SPELLS.CHAIN_HEAL.lowRanks].map(
      (spell) => ({ id: spell }),
    );

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(chainHealSpells), this.chainHeal);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(chainHealSpells), this.chainHeal);
  }

  chainHeal(event: HealEvent | CastEvent) {
    if (!this.chainHealTimestamp || event.timestamp - this.chainHealTimestamp > HEAL_WINDOW_MS) {
      this.processBuffer();
      this.chainHealTimestamp = event.timestamp;
    }

    this.buffer.push({
      ...event,
    });
  }

  processBuffer() {
    if (this.buffer.length === 0) {
      return;
    }
    this.castIndex += 1;
    const currentCast = this.buffer.find((event) => event.type === EventType.Cast);
    if (!currentCast) {
      return;
    }
    const combatant = this.combatants.getEntity(currentCast);
    if (!combatant) {
      return;
    }
    this.chainHealHistory[this.castIndex] = {
      target: {
        id: currentCast.targetID,
        name: combatant.name,
        specIcon: combatant.player.icon,
        specClassName: combatant.player.type,
      },
      timestamp: currentCast.timestamp,
      castNo: this.castIndex,
      hits: this.buffer.filter((event) => event.type === EventType.Heal).length,
    };
    this.buffer = [];
  }

  suggestions(when: When) {
    const suggestedThreshold = this.suggestionThreshold;
    if (this.casts === 0) {
      return;
    }
    when(suggestedThreshold.actual)
      .isLessThan(suggestedThreshold.isLessThan.minor)
      .addSuggestion((suggest, _actual, _recommended) =>
        suggest(
          <>
            Try to always cast <SpellLink id={SPELLS.CHAIN_HEAL.id} /> on groups of people, so that
            it heals all {this.maxTargets} potential targets.
          </>,
        )
          .icon('spell_nature_healingwavegreater')
          .actual(`${suggestedThreshold.actual.toFixed(2)} ${`average targets healed`}`)
          .recommended(`${suggestedThreshold.isLessThan.minor} ${`average targets healed`}`)
          .regular(suggestedThreshold.isLessThan.average)
          .major(suggestedThreshold.isLessThan.major),
      );
  }

  get avgHits() {
    const chainHeals: number[] = [SPELLS.CHAIN_HEAL.id, ...SPELLS.CHAIN_HEAL.lowRanks];
    const chStats = chainHeals.reduce(
      (stats, spell) => {
        const ability = this.abilityTracker.getAbility(spell);
        stats.casts += ability.casts;
        stats.hits += ability.healingHits;

        return stats;
      },
      { casts: 0, hits: 0 },
    );
    return chStats.hits / chStats.casts || 0;
  }

  get casts() {
    const chainHeals: number[] = [SPELLS.CHAIN_HEAL.id, ...SPELLS.CHAIN_HEAL.lowRanks];
    return chainHeals.reduce((casts, spell) => {
      casts += this.abilityTracker.getAbility(spell).casts;

      return casts;
    }, 0);
  }

  get suggestionThreshold() {
    return {
      actual: this.avgHits,
      isLessThan: {
        minor: this.suggestedTargets, //Missed 1 target
        average: this.suggestedTargets - 0.65, //Missed 2 targets
        major: this.suggestedTargets - 1.3, //Missed more than 3 targets
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  statistic() {
    if (this.casts === 0) {
      return false;
    }

    const singleHits = this.chainHealHistory.filter((cast) => cast.hits === 1);

    const items = [
      {
        color: 'rgb(172, 31, 57)',
        label: '1 Target',
        value: singleHits.length,
      },
      {
        color: 'rgb(255, 128, 0)',
        label: '2 Targets',
        value: this.chainHealHistory.filter((cast) => cast.hits === 2).length,
      },
      {
        color: 'rgb(112, 181, 112)',
        label: '3 Targets',
        value: this.chainHealHistory.filter((cast) => cast.hits === 3).length,
      },
    ];

    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(70)}
        tooltip={
          <>
            The average number of targets healed by Chain Heal out of the maximum amount of targets.
            You cast a total of {this.casts} Chain Heals, which healed an average of{' '}
            {this.avgHits.toFixed(2)} out of {this.maxTargets} targets.
          </>
        }
        dropdown={
          singleHits.length > 0 && (
            <>
              <div className="pad">
                <>
                  Below are the casts that only hit the initial target. A large list indicates that
                  target selection is an area for improvement.
                </>
              </div>
              <table className="table table-condensed">
                <thead>
                  <tr>
                    <th>
                      <>Cast</>
                    </th>
                    <th>
                      <>Time</>
                    </th>
                    <th>
                      <>Target</>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {this.chainHealHistory
                    .filter((cast) => cast.hits === 1)
                    .map((cast) => (
                      <tr key={cast.timestamp}>
                        <th scope="row">{formatNth(cast.castNo)}</th>
                        <td>{formatDuration(cast.timestamp - this.owner.fight.start_time, 0)}</td>
                        <td className={cast.target.specClassName.replace(' ', '')}>
                          {' '}
                          <SpecIcon icon={cast.target.specIcon} /> {cast.target.name}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </>
          )
        }
      >
        <BoringValue label={<SpellLink id={SPELLS.CHAIN_HEAL.id} />}>
          {this.avgHits.toFixed(2)}{' '}
          <small>
            <>Average Chain Heal targets</>
          </small>
        </BoringValue>
        <div className="pad">
          <DonutChart items={items} />
        </div>
      </Statistic>
    );
  }
}

export default ChainHeal;
