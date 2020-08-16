import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, DamageEvent, RefreshBuffEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import React from 'react';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import SPELLS from 'common/SPELLS';
import ItemDamageDone from 'interface/ItemDamageDone';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import { BRUTAL_PROJECTILES_RAMP_DAMAGE } from 'parser/hunter/marksmanship/constants';

/**
 * Your auto attacks have a 10% chance to cause your next Rapid Fire to deal 1.0% increased damage for each shot.
 *
 * Example log
 *
 * TODO: If the buff goes live with 15 seconds despite Rapid Fire being 20 seconds cooldown, make some check for unlucky procs(?)
 * TODO: Verify these two buffs work like indicated in the spell data
 * Maybe even add a Binom chart to this, even it ends up being impactful?
 *
 */
class BrutalProjectiles extends Analyzer {

  conduitRank: number = 0;
  addedDamage: number = 0;
  currentTick: number = 0;
  procs: number = 0;
  overwrittenProcs: number = 0;

  constructor(options: any) {
    super(options);
    this.active = false;
    if (!this.active) {
      return;
    }

    this.conduitRank = 1; //TODO: Find out the proper way of parsing conduit ranks

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.RAPID_FIRE_DAMAGE), this.onRapidFireDamage);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.RAPID_FIRE), this.onRapidFireCast);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.BRUTAL_PROJECTILES_NEXT_RF_BUFF), this.onApplyBrutalProjectiles);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.BRUTAL_PROJECTILES_NEXT_RF_BUFF), this.onRefreshBrutalProjectiles);
  }

  onApplyBrutalProjectiles(event: ApplyBuffEvent) {
    this.procs += 1;
  }

  onRefreshBrutalProjectiles(event: RefreshBuffEvent) {
    this.procs += 1;
    this.overwrittenProcs += 1;
  }

  onRapidFireCast(event: CastEvent) {
    this.currentTick = 0;
  }

  onRapidFireDamage(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.BRUTAL_PROJECTILES_DURING_RF_BUFF.id)) {
      return;
    }
    this.addedDamage += calculateEffectiveDamage(event, (BRUTAL_PROJECTILES_RAMP_DAMAGE[this.conduitRank] * this.currentTick));
    this.currentTick += 1;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={(
          <>
            You overwrote the Brutal Projectiles buff {this.overwrittenProcs} times.
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.BRUTAL_PROJECTILES_CONDUIT}>
          <>
            <ItemDamageDone amount={this.addedDamage} />
            {this.procs} <small>procs</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default BrutalProjectiles;
