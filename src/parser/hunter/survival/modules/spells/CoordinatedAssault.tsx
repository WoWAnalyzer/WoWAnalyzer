import React from 'react';

import Analyzer, { SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import { formatNumber, formatPercentage } from 'common/format';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import ItemDamageDone from 'interface/ItemDamageDone';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import UptimeIcon from 'interface/icons/Uptime';
import Events, { DamageEvent } from 'parser/core/Events';

/**
 * You and your pet attack as one, increasing all damage you both deal by 20% for 20 sec.
 * While Coordinated Assault is active, Kill Command's chance to reset is increased by 25%.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/dHcVrvbMX39xNAC8#fight=3&type=auras&source=66&ability=266779
 */

const CA_DMG_MODIFIER = 0.2;

class CoordinatedAssault extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  playerDamage = 0;
  petDamage = 0;

  protected spellUsable!: SpellUsable;

  constructor(options: any) {
    super(options);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onPlayerDamage);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onPetDamage);
  }

  get totalDamage() {
    return this.playerDamage + this.petDamage;
  }

  get percentUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.COORDINATED_ASSAULT.id) / this.owner.fightDuration;
  }

  onPetDamage(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.COORDINATED_ASSAULT.id)) {
      return;
    }
    this.petDamage += calculateEffectiveDamage(event, CA_DMG_MODIFIER);
  }

  onPlayerDamage(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.COORDINATED_ASSAULT.id)) {
      return;
    }
    this.playerDamage += calculateEffectiveDamage(event, CA_DMG_MODIFIER);

  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(17)}
        size="flexible"
        tooltip={(
          <>
            Over the course of the encounter you had Coordinated Assault up for a total of {(this.selectedCombatant.getBuffUptime(SPELLS.COORDINATED_ASSAULT.id) / 1000).toFixed(1)} seconds. <br />
            Total damage breakdown:
            <ul>
              <li>Player damage: {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.playerDamage))}% / {formatNumber(this.playerDamage / (this.owner.fightDuration / 1000))} DPS</li>
              <li>Pet damage: {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.petDamage))}% / {formatNumber(this.petDamage / (this.owner.fightDuration / 1000))} DPS</li>
            </ul>
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.COORDINATED_ASSAULT}>
          <>
            <ItemDamageDone amount={this.totalDamage} /> <br />
            <UptimeIcon /> {formatPercentage(this.percentUptime)}% <small>uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default CoordinatedAssault;
