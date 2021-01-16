import React from 'react';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import { EMPOWERED_RELEASE_INCREASE_KS_DAMAGE, EMPOWERED_RELEASE_INCREASED_FLAYED_PROC_CHANCE, FLAYED_SHOT_RESET_CHANCE } from 'parser/hunter/shared/constants';
import Events, { DamageEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import ItemDamageDone from 'interface/ItemDamageDone';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import COVENANTS from 'game/shadowlands/COVENANTS';
import ConduitSpellText from 'interface/statistics/components/ConduitSpellText';

/**
 * Flayed Shot has an additional 5% chance to pro Flayer's Mark
 * Flayer's Mark increases the damage of your next Kill Shot by 5.0%.
 *
 * Example log:
 *
 */
class EmpoweredRelease extends Analyzer {

  flayersMarkProcs = 0;
  aggregatedContribution = 0;
  conduitRank = 0;
  addedDamage = 0;
  hadFlayersMarkActive = false;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasCovenant(COVENANTS.VENTHYR.id) && this.selectedCombatant.hasConduitBySpellID(SPELLS.EMPOWERED_RELEASE_CONDUIT.id);
    if (!this.active) {
      return;
    }

    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.EMPOWERED_RELEASE_CONDUIT.id);

    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.FLAYERS_MARK), this.flayedShotProc);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.FLAYERS_MARK), this.flayedShotProc);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.KILL_SHOT_SV, SPELLS.KILL_SHOT_MM_BM]), this.onKillShotDamage);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell([SPELLS.KILL_SHOT_SV, SPELLS.KILL_SHOT_MM_BM]), this.onKillShotCast);
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

  onKillShotCast() {
    this.hadFlayersMarkActive = this.selectedCombatant.hasBuff(SPELLS.EMPOWERED_RELEASE_BUFF.id);
  }

  onKillShotDamage(event: DamageEvent) {
    if (!this.hadFlayersMarkActive) {
      return;
    }
    this.hadFlayersMarkActive = false;
    this.addedDamage += calculateEffectiveDamage(event, EMPOWERED_RELEASE_INCREASE_KS_DAMAGE[this.conduitRank]);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <ConduitSpellText spell={SPELLS.EMPOWERED_RELEASE_CONDUIT} rank={this.conduitRank}>
          <>
            ≈ {this.averageContributionAbsolute} <small> additional procs </small>
            <br />
            <ItemDamageDone amount={this.addedDamage} />
          </>
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default EmpoweredRelease;
