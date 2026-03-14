import { formatPercentage } from 'common/format';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { TALENTS_PRIEST } from 'common/TALENTS';

interface DesperatePrayerUsage {
  damageTaken: number;
  originalHealth: number;
  originalMaxHealth: number;
}

class DesperatePrayer extends Analyzer {
  get lastDesperatePrayerUsage() {
    return this.desperatePrayerUsages[this.desperatePrayerUsages.length - 1];
  }

  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  desperatePrayerUsages: DesperatePrayerUsage[] = [];
  deathsWithDPReady = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS_PRIEST.DESPERATE_PRAYER_TALENT),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.heal.to(SELECTED_PLAYER).spell(TALENTS_PRIEST.DESPERATE_PRAYER_TALENT),
      this.onHeal,
    );
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
    this.addEventListener(Events.death.to(SELECTED_PLAYER), this.onDeath);
  }

  onApplyBuff() {
    this.desperatePrayerUsages.push({
      damageTaken: 0,
      originalHealth: 0,
      originalMaxHealth: 0,
    });
  }

  onHeal(event: HealEvent) {
    this.lastDesperatePrayerUsage.originalHealth = event.hitPoints - event.amount;
    this.lastDesperatePrayerUsage.originalMaxHealth = event.maxHitPoints;
  }

  onDamageTaken(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(TALENTS_PRIEST.DESPERATE_PRAYER_TALENT.id)) {
      return;
    }

    this.lastDesperatePrayerUsage.damageTaken += event.amount + (event.absorbed || 0);
  }

  onDeath() {
    if (!this.spellUsable.isOnCooldown(TALENTS_PRIEST.DESPERATE_PRAYER_TALENT.id)) {
      this.deathsWithDPReady += 1;
    }
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        dropdown={
          <table className="table table-condensed">
            <thead>
              <tr>
                <th>Cast</th>
                <th>Damage Taken</th>
                <th>Health When Used</th>
              </tr>
            </thead>
            <tbody>
              {this.desperatePrayerUsages.map((dp, index) => (
                <tr key={index}>
                  <th scope="row">{index + 1}</th>
                  <td>{formatPercentage(dp.damageTaken / dp.originalMaxHealth)} %</td>
                  <td>{formatPercentage(dp.originalHealth / dp.originalMaxHealth)} %</td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      >
        <BoringSpellValueText spell={TALENTS_PRIEST.DESPERATE_PRAYER_TALENT}>
          {this.desperatePrayerUsages.length} Casts
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DesperatePrayer;
