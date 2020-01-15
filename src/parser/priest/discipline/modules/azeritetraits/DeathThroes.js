import React from "react";

import SPELLS from "common/SPELLS/index";
import { calculateAzeriteEffects } from "common/stats";
import Analyzer from "parser/core/Analyzer";
import StatTracker from "parser/shared/modules/StatTracker";
import TraitStatisticBox, {
  STATISTIC_ORDER,
} from "interface/others/TraitStatisticBox";
import ItemDamageDone from "interface/ItemDamageDone";
import { formatNumber, formatPercentage } from "common/format";
import SpellLink from "common/SpellLink";
import ItemHealingDone from "interface/ItemHealingDone";
import { DISC_PRIEST_DAMAGE_REDUCTION } from "../../constants";
import AtonementAnalyzer from "../core/AtonementAnalyzer";

const debug = false;

const deathThroesStats = traits =>
  Object.values(traits).reduce(
    (obj, rank) => {
      const [damage] = calculateAzeriteEffects(SPELLS.DEATH_THROES.id, rank);
      obj.damage += damage;
      return obj;
    },
    {
      damage: 0,
    },
  );

/**
 * Death Throes
 * Shadow Word: Pain deals an additional 1424 damage. When an enemy dies while afflicted by your Shadow Word: Pain, you gain 5 Insanity.
 * This is specifically the Disc version of PtW. The Shadow version is different.
 * Example log: /report/kq6T4Rd3v1nmbNHK/3-Heroic+Taloc+-+Kill+(4:46)/17-Budgiechrist
 */
class DeathThroes extends Analyzer {
  static dependencies = {
    atonementAnalyzer: AtonementAnalyzer,
    statTracker: StatTracker,
  };

  damageValue = 0; // Damage done by each death throes tick
  damageDone = 0; // Total damage done by death throes
  atonementHealing = {
    effective: 0,
    over: 0,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.DEATH_THROES.id);
    if (!this.active) {
      return;
    }

    const { damage } = deathThroesStats(
      this.selectedCombatant.traitsBySpellId[SPELLS.DEATH_THROES.id],
    );

    this.damageValue = damage * (1 - DISC_PRIEST_DAMAGE_REDUCTION);
    this.addEventListener(
      this.atonementAnalyzer.atonementEventFilter,
      this.atonementHandler,
    );
    this.addEventListener(
      this.atonementAnalyzer.atonementDamageSourceFilter,
      this.handleDeathThroesDamage,
    );
  }

  /**
   * Determines if a damage event is suitable to be parsed by this module
   *
   * @param {Object} damageEvent A damage event
   */
  static validTriggerEvent(damageEvent) {
    const spellId = damageEvent.ability.guid;
    return (
      (spellId === SPELLS.SHADOW_WORD_PAIN.id ||
        spellId === SPELLS.PURGE_THE_WICKED_BUFF.id) &&
      damageEvent.tick
    );
  }

  /**
   * Calculates the damage assignable to Death Throes from a given PTW/SWP event
   *
   * @param {Object} damageEvent
   * @returns {Number}
   */
  calculateDeathThroesDamage(damageEvent) {
    const versatility = 1 + this.statTracker.currentVersatilityPercentage;

    const totalDamageAmount = damageEvent.amount + damageEvent.absorbed;
    const damageRatio = totalDamageAmount / damageEvent.unmitigatedAmount;
    const dtContribution = this.damageValue * damageRatio * versatility;

    return dtContribution;
  }

  /**
   * Processing this here ensures that the damage event is only considered once,
   * so we don't get super inflated values for damage contribution
   *
   * @param {Object} damageEvent A damage event
   */
  handleDeathThroesDamage(damageEvent) {
    if (!DeathThroes.validTriggerEvent(damageEvent)) return;

    this.damageDone += this.calculateDeathThroesDamage(damageEvent);
  }

  /**
   * Handles Atonement for Death Throes traits
   * @param {Object} EventContainer
   * @param {Object} EventContainer.healEvent The atonement healing event
   * @param {Object} EventContainer.damageEvent The damage source event
   * @param {String} EventContainer.type The type of the event
   * @param {Number} EventContainer.sourceID The source ID
   */
  atonementHandler({ healEvent, damageEvent }) {
    if (!DeathThroes.validTriggerEvent(damageEvent)) return;

    /**
     * We calculate the damage contribution ratio of DT, and apply that to the
     * healing value from atonement, this lets us derive the correct value
     * regardless of damage/healing buffs or debuffs.
     */
    const totalDamageAmount = damageEvent.amount + damageEvent.absorbed;
    const dtContribution = this.calculateDeathThroesDamage(damageEvent);
    const dtContributionRatio = dtContribution / totalDamageAmount;

    const amountHealed =
      ((healEvent.amount || 0) + (healEvent.absorbed || 0)) *
      dtContributionRatio;

    // Calculate how much overhealing should be attributed to DT.
    const amountOverhealed = Math.min(healEvent.overheal || 0);

    // Calculate the effective healing done.If it was a full overheal, just say it was 0.
    const effectiveAmountHealed = Math.max(amountHealed - amountOverhealed, 0);

    if (debug) {
      console.log("Death Throes proc'd an atonement", {
        fullHeal: (healEvent.amount || 0) + (healEvent.absorbed || 0),
        swp_damage: damageEvent.amount + damageEvent.absorbed,
        dtContributionRatio: Math.floor(dtContributionRatio * 100) + "%",
        dtDamage: dtContribution,
        amountHealed,
        amountOverhealed,
        effectiveAmountHealed,
      });
    }

    this.atonementHealing.effective += effectiveAmountHealed;
    this.atonementHealing.over += amountOverhealed;
  }

  /**
   * The percentage of overhealing done by Death Throes
   */
  get percentOverHealing() {
    return (
      this.atonementHealing.over /
      (this.atonementHealing.effective + this.atonementHealing.over)
    );
  }

  /**
   * If the player has Purge the Wicked
   */
  get hasPurgeTheWicked() {
    return this.selectedCombatant.hasTalent(SPELLS.PURGE_THE_WICKED_TALENT.id);
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.DEATH_THROES.id}
        value={(
<>
            <ItemDamageDone amount={this.damageDone} />
            <br />
            <ItemHealingDone amount={this.atonementHealing.effective} />
          </>
)}
        tooltip={(
<>
            {formatNumber(this.damageDone)} additional damage dealt by{" "}
            {this.hasPurgeTheWicked
              ? SPELLS.PURGE_THE_WICKED_TALENT.name
              : SPELLS.SHADOW_WORD_PAIN.name}
            <br />
            {formatNumber(this.atonementHealing.effective)} additional healing
            from <SpellLink id={SPELLS.ATONEMENT_BUFF.id} /> (
            {formatPercentage(this.percentOverHealing)}%OH).
          </>
)}
      />
    );
  }
}

export default DeathThroes;
