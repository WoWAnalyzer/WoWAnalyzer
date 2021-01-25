import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, DamageEvent, RefreshBuffEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import React from 'react';
import SPELLS from 'common/SPELLS';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import { BRUTAL_PROJECTILES_RAMP_DAMAGE } from '@wowanalyzer/hunter-marksmanship/src/constants';
import ConduitSpellText from 'parser/ui/ConduitSpellText';

/**
 * Your auto attacks have a 10% chance to cause your next Rapid Fire to deal 1.0% increased damage for each shot.
 *
 * Example log
 *
 * TODO: If the buff goes live with 15 seconds despite Rapid Fire being 20 seconds cooldown, make some check for unlucky procs(?)
 * TODO: Verify these two buffs work like indicated in the spell data
 * TODO: Maybe even add a Binom chart to this, even it ends up being impactful?
 *
 */
class BrutalProjectiles extends Analyzer {

  conduitRank = 0;
  addedDamage = 0;
  currentTick = 0;
  procs = 0;
  overwrittenProcs = 0;
  usedProcs = 0;

  constructor(options: Options) {
    super(options);
    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.BRUTAL_PROJECTILES_CONDUIT.id);
    if (!this.conduitRank) {
      this.active = false;
      return;
    }

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
    if (this.selectedCombatant.hasBuff(SPELLS.BRUTAL_PROJECTILES_NEXT_RF_BUFF.id)) {
      this.usedProcs += 1;
    }
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
            You used {this.usedProcs} out of {this.procs} gained.
            You overwrote the Brutal Projectiles buff {this.overwrittenProcs} times.
          </>
        )}
      >
        <ConduitSpellText spell={SPELLS.BRUTAL_PROJECTILES_CONDUIT} rank={this.conduitRank}>
          <>
            <ItemDamageDone amount={this.addedDamage} />
          </>
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default BrutalProjectiles;
