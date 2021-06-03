import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, DamageEvent, RefreshBuffEvent } from 'parser/core/Events';
import CrossIcon from 'interface/icons/Cross';
import UptimeIcon from 'interface/icons/Uptime';
import ConvokeSpiritsFeral from './ConvokeSpiritsFeral';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import React from 'react';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';
import { SpellIcon } from 'interface';

const BUFFER_MS = 50;

/**
 * **Apex Predator's Craving**
 * Runecarving Legendary
 *
 * Rip damage has a 4% chance to make your next Ferocious Bite free and deal the maximum damage.
 */
class ApexPredatorsCraving extends Analyzer {
  static dependencies = {
    convokeSpirits: ConvokeSpiritsFeral,
  };

  protected convokeSpirits!: ConvokeSpiritsFeral;

  buffsGained: number = 0;
  buffsUsed: number = 0;
  buffsOverwritten: number = 0;

  damageDone: number = 0;
  // TODO energy restored with SOTF?

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasLegendaryByBonusID(
      SPELLS.APEX_PREDATORS_CRAVING.bonusID,
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.APEX_PREDATORS_CRAVING_BUFF),
      this.onBuffApply,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.APEX_PREDATORS_CRAVING_BUFF),
      this.onBuffRefresh,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FEROCIOUS_BITE),
      this.onFbDamage,
    );
  }

  onBuffApply(_: ApplyBuffEvent) {
    this.buffsGained += 1;
  }

  onBuffRefresh(_: RefreshBuffEvent) {
    this.buffsGained += 1;
    this.buffsOverwritten += 1;
  }

  onFbDamage(event: DamageEvent) {
    if (
      !this.convokeSpirits.isConvoking() &&
      this.selectedCombatant.hasBuff(
        SPELLS.APEX_PREDATORS_CRAVING_BUFF.id,
        event.timestamp,
        BUFFER_MS,
      )
    ) {
      this.buffsUsed += 1;
      this.damageDone += event.amount + (event.absorbed || 0);
    }
  }

  get buffsActive() {
    return this.selectedCombatant.hasBuff(SPELLS.APEX_PREDATORS_CRAVING_BUFF.id) ? 1 : 0;
  }

  get buffsExpired() {
    return this.buffsGained - this.buffsUsed - this.buffsActive - this.buffsOverwritten;
  }

  get buffsGainedPerMinute() {
    return this.buffsGained / (this.owner.fightDuration / 1000 / 60);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={
          <>
            This is the damage done by the free Ferocious Bites procced by Apex Predator's Craving.
            You gained <strong>{this.buffsGainedPerMinute.toFixed(1)} procs per minute</strong>, for
            a total of <strong>{this.buffsGained} procs</strong>:
            <ul>
              <li><SpellIcon id={SPELLS.FEROCIOUS_BITE.id} /> Used: <strong>{this.buffsUsed}</strong></li>
              <li><CrossIcon /> Overwritten: <strong>{this.buffsOverwritten}</strong></li>
              <li><UptimeIcon /> Expired: <strong>{this.buffsExpired}</strong></li>
              {this.buffsActive > 0 && (
                <li>
                  Still active at fight end: <strong>{this.buffsActive}</strong>
                </li>
              )}
            </ul>
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.APEX_PREDATORS_CRAVING}>
          <ItemPercentDamageDone amount={this.damageDone} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ApexPredatorsCraving;
