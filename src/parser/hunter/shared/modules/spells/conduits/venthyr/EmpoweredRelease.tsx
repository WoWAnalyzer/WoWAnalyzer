import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import { EMPOWERED_RELEASE_INCREASE_KS_DAMAGE, EMPOWERED_RELEASE_INCREASED_FLAYED_PROC_CHANCE, FLAYED_SHOT_RESET_CHANCE } from 'parser/hunter/shared/constants';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import SPELLS from 'common/SPELLS';
import ItemDamageDone from 'interface/ItemDamageDone';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

/**
 * Flayed Shot has an additional 5% chance to pro Flayer's Mark
 * Flayer's Mark increases the damage of your next Kill Shot by 5.0%.
 *
 * Example log:
 *
 */
class EmpoweredRelease extends Analyzer {

  flayersMarkProcs: number = 0;
  aggregatedContribution: number = 0;
  conduitRank: number = 0;
  addedDamage: number = 0;

  constructor(options: any) {
    super(options);
    this.active = false;
    if (!this.active) {
      return;
    }

    this.conduitRank = 1; //TODO: Find out the proper way of parsing conduit ranks

    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.FLAYERS_MARK), this.flayedShotProc);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.FLAYERS_MARK), this.flayedShotProc);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.KILL_SHOT_SV, SPELLS.KILL_SHOT_MM_BM]), this.onKillShotDamage);
  }

  get averageContributionPercentage() {
    return this.aggregatedContribution / this.flayersMarkProcs;
  }

  get averageContributionAbsolute() {
    return Math.round(this.averageContributionPercentage * this.flayersMarkProcs);
  }

  flayedShotProc() {
    this.aggregatedContribution += EMPOWERED_RELEASE_INCREASED_FLAYED_PROC_CHANCE / (FLAYED_SHOT_RESET_CHANCE + EMPOWERED_RELEASE_INCREASED_FLAYED_PROC_CHANCE);
    this.flayersMarkProcs += 1;
  }

  onKillShotDamage(event: DamageEvent) {
    if(!this.selectedCombatant.hasBuff(SPELLS.EMPOWERED_RELEASE_BUFF.id)) {
      return;
    }
    this.addedDamage += calculateEffectiveDamage(event, EMPOWERED_RELEASE_INCREASE_KS_DAMAGE[this.conduitRank]);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <BoringSpellValueText spell={SPELLS.EMPOWERED_RELEASE_CONDUIT}>
          <>
            ≈ {this.averageContributionAbsolute} <small> additional procs </small>
            <ItemDamageDone amount={this.addedDamage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default EmpoweredRelease;
