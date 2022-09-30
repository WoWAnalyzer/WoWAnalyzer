import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import { TALENTS_DRUID } from 'common/TALENTS';
import Events, { CastEvent, DamageEvent, HealEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { formatNumber, formatPercentage } from 'common/format';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import { SINGLE_TARGET_HEALING } from 'analysis/retail/druid/restoration/constants';
import { SpellLink } from 'interface';

// separate class for Resto because it converts healing to damage rather than other way around
/**
 * **Nature's Vigil**
 * Class Talent
 *
 * All single target healing also damages a nearby enemy target for 20% of the healing done.
 */
class NaturesVigil extends Analyzer {
  /** Trackers for info about each cast */
  nvTracker: NaturesVigilCast[] = [];
  /** Mapping by number of the contributions to NV's damage */
  stHealingDuringNv: { [spellId: number]: { id: number; amount: number } } = {};

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.NATURES_VIGIL_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_DRUID.NATURES_VIGIL_TALENT),
      this.onNvCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.NATURES_VIGIL_DAMAGE),
      this.onNvDamage,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SINGLE_TARGET_HEALING),
      this.onStHeal,
    );
  }

  onNvCast(event: CastEvent) {
    this.nvTracker.push({
      timestamp: event.timestamp,
      damage: 0,
    });
  }

  onNvDamage(event: DamageEvent) {
    const currTracker = this.nvTracker.at(-1);
    if (currTracker) {
      currTracker.damage += event.amount + (event.absorbed || 0);
    }
  }

  onStHeal(event: HealEvent) {
    if (this.selectedCombatant.hasBuff(TALENTS_DRUID.NATURES_VIGIL_TALENT.id)) {
      const spellId = event.ability.guid;
      const rawHealing = event.amount + (event.absorbed || 0) + (event.overheal || 0);
      const entry = this.stHealingDuringNv[spellId];
      if (entry) {
        entry.amount += rawHealing;
      } else {
        this.stHealingDuringNv[spellId] = { id: spellId, amount: rawHealing };
      }
    }
  }

  get totalDamage() {
    return this.nvTracker.reduce((acc, t) => acc + t.damage, 0);
  }

  statistic() {
    // calculations about NV contribution
    const stHealingInDescendingOrder = Object.values(this.stHealingDuringNv).sort(
      (a, b) => b.amount - a.amount,
    );
    const totalAmount = stHealingInDescendingOrder.reduce((acc, a) => a.amount + acc, 0);
    const totalDps = (this.totalDamage / this.owner.fightDuration) * 1000;

    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(0)} // number based on talent row
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Breakdown of damage contributions:
            <ul>
              {stHealingInDescendingOrder.map((item) => {
                const itemPercent = item.amount / totalAmount;
                const itemDps = itemPercent * totalDps;
                return (
                  <li key={item.id}>
                    <SpellLink id={item.id} /> - {formatNumber(itemDps)} DPS (
                    {formatPercentage(itemPercent, 1)}%)
                  </li>
                );
              })}
            </ul>
          </>
        }
        dropdown={
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Cast</th>
                  <th>Timestamp</th>
                  <th>Damage</th>
                </tr>
              </thead>
              <tbody>
                {this.nvTracker.map((nv, index) => (
                  <tr key={index}>
                    <th scope="row">{index + 1}</th>
                    <td>{this.owner.formatTimestamp(nv.timestamp)}</td>
                    <td>{formatNumber(nv.damage)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        }
      >
        <BoringSpellValueText spellId={TALENTS_DRUID.NATURES_VIGIL_TALENT.id}>
          <ItemDamageDone amount={this.totalDamage} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default NaturesVigil;

interface NaturesVigilCast {
  /** Cast's timestamp */
  timestamp: number;
  /** Damage caused by the cast */
  damage: number;
  // TODO track contribution by heal
}
