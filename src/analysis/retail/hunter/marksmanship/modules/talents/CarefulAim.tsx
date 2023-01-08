import { CA_MODIFIER, CAREFUL_AIM_THRESHOLD } from 'analysis/retail/hunter/marksmanship/constants';
import { abbreviateBossNames } from 'common/abbreviateLongNames';
import { formatDuration, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_HUNTER } from 'common/TALENTS';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import ExecuteHelper from 'parser/shared/modules/helpers/ExecuteHelper';
import StatTracker from 'parser/shared/modules/StatTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Aimed Shot deals 50% bonus damage to targets who are above 70% health.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/9Ljy6fh1TtCDHXVB#fight=2&type=damage-done&source=25&ability=-19434
 *
 */
class CarefulAim extends ExecuteHelper {
  static dependencies = {
    ...ExecuteHelper.dependencies,
    statTracker: StatTracker,
    enemies: Enemies,
  };

  static executeSpells = [SPELLS.AIMED_SHOT];
  static executeSources = SELECTED_PLAYER;
  static upperThreshold = CAREFUL_AIM_THRESHOLD;
  static modifiesDamage = true;
  static damageModifier = CA_MODIFIER;

  caProcs = 0;
  bossIDs: number[] = [];
  carefulAimPeriods: {
    [key: string]: {
      aimedShotsInCA: number;
      timestampSub100: number;
      caDamage: number;
      timestampSub70: number;
    };
  } = {
    /*
    [bossName]: {
          caDamage: 0,
          aimedShotsInCA: count,
          timestampSub100: timestamp,
          timestampSub70: timestamp,
          },
        };
     */
    Adds: {
      caDamage: 0,
      aimedShotsInCA: 0,
      timestampSub100: 0,
      timestampSub70: 0,
    },
  };
  protected statTracker!: StatTracker;
  protected enemies!: Enemies;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_HUNTER.CAREFUL_AIM_TALENT);
    this.owner.report.enemies.forEach((enemy) => {
      enemy.fights.forEach((fight) => {
        if (fight.id === this.owner.fight.id && enemy.type === 'Boss') {
          this.bossIDs.push(enemy.id);
        }
      });
    });
    this.addEventListener(Events.fightend, this.calculateCarefulAimPeriods);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  onDamage(event: DamageEvent) {
    const spellId = event.ability.guid;
    const healthPercent =
      event.hitPoints && event.maxHitPoints && event.hitPoints / event.maxHitPoints;
    const targetID = event.targetID;
    let target: string;
    const outsideCarefulAim = healthPercent && healthPercent < CAREFUL_AIM_THRESHOLD;
    if (event.maxHitPoints && this.bossIDs.includes(targetID)) {
      // I believe we can assume this is not null because otherwise it wouldn't be in this.bossIDs?
      const enemy = this.enemies.getEntity(event)!;
      target = abbreviateBossNames(enemy.name);
      if (!this.carefulAimPeriods[target]) {
        this.carefulAimPeriods[target] = {
          caDamage: 0,
          aimedShotsInCA: 0,
          timestampSub100: 0,
          timestampSub70: 0,
        };
      }
      if (healthPercent && healthPercent > CAREFUL_AIM_THRESHOLD) {
        this.carefulAimPeriods[target].timestampSub100 =
          this.carefulAimPeriods[target].timestampSub100 || event.timestamp;
      }
      if (healthPercent && outsideCarefulAim) {
        this.carefulAimPeriods[target].timestampSub70 =
          this.carefulAimPeriods[target].timestampSub70 || event.timestamp;
      }
    } else {
      target = 'Adds';
    }
    if (spellId !== SPELLS.AIMED_SHOT.id || outsideCarefulAim) {
      return;
    }
    const damageFromCA = calculateEffectiveDamage(event, CA_MODIFIER);
    this.carefulAimPeriods[target].caDamage += damageFromCA;
    this.carefulAimPeriods[target].aimedShotsInCA += 1;
    this.caProcs += 1;
  }

  calculateCarefulAimPeriods() {
    Object.values(this.carefulAimPeriods).forEach((boss) => {
      boss.timestampSub100 = boss.timestampSub100 || this.owner.fight.start_time;
      boss.timestampSub70 = boss.timestampSub70 || this.owner.fight.end_time;
    });
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        dropdown={
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Boss</th>
                  <th>Damage</th>
                  <th>Hits</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(this.carefulAimPeriods).map((boss, index) => (
                  <tr key={index}>
                    <td>{boss[0]}</td>
                    <td>{formatNumber(boss[1].caDamage)}</td>
                    <td>{boss[1].aimedShotsInCA}</td>
                    <td>
                      {boss[0] === 'Adds'
                        ? 'N/A'
                        : formatDuration(boss[1].timestampSub70 - boss[1].timestampSub100)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        }
      >
        <BoringSpellValueText spellId={TALENTS_HUNTER.CAREFUL_AIM_TALENT.id}>
          <>
            <ItemDamageDone amount={this.damage} />
            <br />
            {this.caProcs} <small>hits for</small> ≈ {formatNumber(this.damage / this.caProcs)}{' '}
            <small>each</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default CarefulAim;
