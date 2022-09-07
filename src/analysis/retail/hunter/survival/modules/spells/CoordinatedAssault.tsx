import { COORDINATED_ASSAULT_DMG_MOD } from 'analysis/retail/hunter/survival/constants';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * You and your pet attack as one, increasing all damage you both deal by 20% for 20 sec.
 * While Coordinated Assault is active, Kill Command's chance to reset is increased by 25%.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/dHcVrvbMX39xNAC8#fight=3&type=auras&source=66&ability=266779
 */

class CoordinatedAssault extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  playerDamage = 0;
  petDamage = 0;

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onPlayerDamage);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onPetDamage);
  }

  get totalDamage() {
    return this.playerDamage + this.petDamage;
  }

  get percentUptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.COORDINATED_ASSAULT.id) / this.owner.fightDuration
    );
  }

  onPetDamage(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.COORDINATED_ASSAULT.id)) {
      return;
    }
    this.petDamage += calculateEffectiveDamage(event, COORDINATED_ASSAULT_DMG_MOD);
  }

  onPlayerDamage(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.COORDINATED_ASSAULT.id)) {
      return;
    }
    this.playerDamage += calculateEffectiveDamage(event, COORDINATED_ASSAULT_DMG_MOD);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(4)}
        size="flexible"
        tooltip={
          <>
            Over the course of the encounter you had Coordinated Assault up for a total of{' '}
            {(this.selectedCombatant.getBuffUptime(SPELLS.COORDINATED_ASSAULT.id) / 1000).toFixed(
              1,
            )}{' '}
            seconds.
            <br />
            Total damage breakdown:
            <ul>
              <li>
                Player damage:{' '}
                {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.playerDamage))}% /{' '}
                {formatNumber(this.playerDamage / (this.owner.fightDuration / 1000))} DPS
              </li>
              <li>
                Pet damage:{' '}
                {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.petDamage))}% /{' '}
                {formatNumber(this.petDamage / (this.owner.fightDuration / 1000))} DPS
              </li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.COORDINATED_ASSAULT.id}>
          <>
            <ItemDamageDone amount={this.totalDamage} />
            <br />
            <UptimeIcon /> {formatPercentage(this.percentUptime)}% <small>uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default CoordinatedAssault;
