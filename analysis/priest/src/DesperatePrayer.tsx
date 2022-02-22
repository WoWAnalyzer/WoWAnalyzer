import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import { When } from 'parser/core/ParseResults';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

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
  deathsWithDPReady: number = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.DESPERATE_PRAYER),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.heal.to(SELECTED_PLAYER).spell(SPELLS.DESPERATE_PRAYER),
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
    if (!this.selectedCombatant.hasBuff(SPELLS.DESPERATE_PRAYER.id)) {
      return;
    }

    this.lastDesperatePrayerUsage.damageTaken += event.amount + (event.absorbed || 0);
  }

  onDeath() {
    if (!this.spellUsable.isOnCooldown(SPELLS.DESPERATE_PRAYER.id)) {
      this.deathsWithDPReady += 1;
    }
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
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
        <BoringSpellValueText spellId={SPELLS.DESPERATE_PRAYER.id}>
          {this.desperatePrayerUsages.length} Casts
        </BoringSpellValueText>
      </Statistic>
    );
  }

  suggestions(when: When) {
    const boss = this.owner.boss;
    if (!boss || !boss.fight.disableDeathSuggestion) {
      when(this.deathsWithDPReady)
        .isGreaterThan(0)
        .addSuggestion((suggest) =>
          suggest(
            <>
              You died with <SpellLink id={SPELLS.DESPERATE_PRAYER.id} /> available.
            </>,
          )
            .icon(SPELLS.DESPERATE_PRAYER.icon)
            .actual(
              t({
                id: 'priest.shared.suggestions.DesperatePrayer.efficiency',
                message: `You died ${this.deathsWithDPReady} time(s) with Desperate Prayer available.`,
              }),
            )
            .recommended(`0 is recommended`),
        );
    }
  }
}

export default DesperatePrayer;
