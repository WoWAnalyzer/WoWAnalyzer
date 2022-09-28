import fetchWcl from 'common/fetchWclApi';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { WCLDamageTaken, WCLDamageTakenTableResponse } from 'common/WCL_TYPES';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Combatant from 'parser/core/Combatant';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { CastEvent, EventType, HealEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import BoringValue from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const IRONBARK_BASE_DR = 0.2;
const IRONBARK_HOT_BOOST = 0.2;

// TODO the healing increase during Ironbark is now part of a separate talent, Stonebark.
//      Need to properly handle that, and probably also handle Regenrative Heartwood.
/**
 * Ironbark -
 * The target's skin becomes as tough as Ironwood, reducing damage taken by 20%
 * and increasing healing from your heal over time effects by 20% for 12 sec.
 */
class Ironbark extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  ironbarkCount = 0;
  damageTakenDuringIronbark = 0;
  boostedIronbarkHealing = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.IRONBARK), this.onCast);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onAnyHeal);
    this.loadDamageTakenDuringIronbark();
  }

  onCast(event: CastEvent) {
    this.ironbarkCount += 1;
  }

  /**
   * Check if heal was with one of our HoTs AND on target with our Ironbark - add to tally if so
   */
  onAnyHeal(event: HealEvent) {
    if (!event.tick) {
      return;
    }
    const healTarget: Combatant | null = this.combatants.getEntity(event);
    if (
      healTarget !== null &&
      healTarget.hasBuff(
        SPELLS.IRONBARK.id,
        undefined,
        undefined,
        undefined,
        this.selectedCombatant.id,
      )
    ) {
      this.boostedIronbarkHealing += calculateEffectiveHealing(event, IRONBARK_HOT_BOOST);
    }
  }

  /** We need the damage taken by the target during Ironbark in order to calculate the damage
   *  reduction, which isn't present in the main event stream we have. This forms and sends the
   *  required custom query */
  loadDamageTakenDuringIronbark() {
    fetchWcl(`report/tables/damage-taken/${this.owner.report.code}`, {
      start: this.owner.fight.start_time,
      end: this.owner.fight.end_time,
      filter: `(IN RANGE FROM type='${EventType.ApplyBuff}' AND ability.id=${SPELLS.IRONBARK.id} AND source.name='${this.selectedCombatant.name}' TO type='${EventType.RemoveBuff}' AND ability.id=${SPELLS.IRONBARK.id} AND source.name='${this.selectedCombatant.name}' GROUP BY target ON target END)`,
    })
      .then((json) => {
        json = json as WCLDamageTakenTableResponse;
        this.damageTakenDuringIronbark = (json.entries as WCLDamageTaken[]).reduce(
          (damageTaken: number, entry: { total: number }) => damageTaken + entry.total,
          0,
        );
      })
      .catch((err) => {
        throw err;
      });
  }

  get damageReduced() {
    return (this.damageTakenDuringIronbark / (1 - IRONBARK_BASE_DR)) * IRONBARK_BASE_DR;
  }

  get damageReducedPerCast() {
    return this.damageReduced / this.ironbarkCount;
  }

  get healBoostedPerCast() {
    return this.boostedIronbarkHealing / this.ironbarkCount;
  }

  statistic() {
    if (this.ironbarkCount > 0) {
      return (
        <Statistic
          position={STATISTIC_ORDER.OPTIONAL(5)} // number based on talent row
          size="flexible"
          tooltip={
            <>
              Ironbark both mitigates damage the target takes and increases your healing on the
              target. The displayed number is the average amount of damage both mitigated and healed
              per Ironbark cast. The healing counted is only the amount boosted by Ironbark. You
              cast Ironbark <strong>{this.ironbarkCount}</strong> times over the encounter.
              <ul>
                <li>
                  <strong>{formatNumber(this.damageReducedPerCast)}</strong> damage reduced per cast
                </li>
                <li>
                  <strong>{formatNumber(this.healBoostedPerCast)}</strong> healing boosted per cast
                </li>
              </ul>
              The total damage prevented + healed over the all casts was{' '}
              <strong>{formatNumber(this.damageReduced + this.boostedIronbarkHealing)}</strong>{' '}
              While this amount is not counted in your healing done, this is equivalent to{' '}
              <strong>
                {formatPercentage(
                  this.owner.getPercentageOfTotalHealingDone(
                    this.damageReduced + this.boostedIronbarkHealing,
                  ),
                )}
                %
              </strong>{' '}
              of your total healing.
            </>
          }
        >
          <BoringValue
            label={
              <>
                <SpellIcon id={SPELLS.IRONBARK.id} /> Average Ironbark mitigated and healed
              </>
            }
          >
            <>
              {formatNumber(
                (this.damageReduced + this.boostedIronbarkHealing) / this.ironbarkCount,
              )}
            </>
          </BoringValue>
        </Statistic>
      );
    } else {
      return '';
    }
  }
}

export default Ironbark;
