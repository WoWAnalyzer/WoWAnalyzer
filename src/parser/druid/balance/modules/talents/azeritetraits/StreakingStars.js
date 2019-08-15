import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Events from 'parser/core/Events';
import DAMAGING_ABILITIES from 'parser/druid/balance/constants';
import { formatNumber, formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import { calculateAzeriteEffects } from 'common/stats';
import AzeritePowerStatistic from 'interface/statistics/AzeritePowerStatistic';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

const streakingStarsStats = traits => Object.values(traits).reduce((obj, rank) => {
  const [damage] = calculateAzeriteEffects(SPELLS.STREAKING_STARS.id, rank);
  obj.damage += damage;
  return obj;
}, {
  damage: 0,
});

/**
 * Streaking Stars,  Azerite Power
 * Requires Druid (Balance)
 * While Celestial Alignment is active, your damaging spells call a Streaking Star,
 * dealing an additional 3876 damage when they are not a repeat of the previous ability.
 * Example log: https://www.warcraftlogs.com/reports/ma43rhYpFzAQHxtv#fight=21&type=damage-done&source=27&ability=272873
 *
 * Streaking Stars will never check spells outside of Celestial Alignment window.
 * You can cast Lunar Strike > Celestial Alignment > Lunar Strike and still get
 * the Streaking Stars proc on the second Lunar Strike. Because of this we don't
 * need to keep track of casts outside of Celestial Alignment windows.
 * Example: https://www.warcraftlogs.com/reports/jnAYqfr74FQRhxZG#fight=16&type=casts&source=8&start=4692350&end=4714505&pins=0%24Separate%24%23244F4B%24auras-gained%240%240.0.0.Any%24140177772.0.0.Druid%24true%24140177772.0.0.Druid%24false%24102560%5E0%24Separate%24%23909049%24damage%240%240.0.0.Any%24140177772.0.0.Druid%24true%240.0.0.Any%24false%24194153%5E0%24Separate%24%23a04D8A%24damage%240%240.0.0.Any%24140177772.0.0.Druid%24true%240.0.0.Any%24false%24272873&ability=194153
 */
class StreakingStars extends Analyzer {

  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  buffToTrack = SPELLS.CELESTIAL_ALIGNMENT;
  celestialAlignmentRunning = false;
  lastCastSpellId = 0;

  totalCastsDuringCelestialAlignment = 0;
  badCasts = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.STREAKING_STARS.id);
    if (!this.active) {
      return;
    }
    if (this.selectedCombatant.hasTalent(SPELLS.INCARNATION_CHOSEN_OF_ELUNE_TALENT.id)) {
      this.buffToTrack = SPELLS.INCARNATION_CHOSEN_OF_ELUNE_TALENT;
    }

    const { damage } = streakingStarsStats(this.selectedCombatant.traitsBySpellId[SPELLS.STREAKING_STARS.id]);
    this.damagePerStreakingStars = damage;

    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(this.buffToTrack), this.onCelestialAlignmentApply);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(this.buffToTrack), this.onCelestialAlignmentRemove);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
  }

  onCelestialAlignmentApply(event) {
    this.celestialAlignmentRunning = true;
  }

  onCelestialAlignmentRemove(event) {
    this.celestialAlignmentRunning = false;
    this.lastCastSpellId = 0;
  }

  onCast(event) {
    if (this.celestialAlignmentRunning === false) {
      return;
    }
    const spellId = event.ability.guid;
    if (!DAMAGING_ABILITIES.includes(spellId)) {
      return;
    }
    this.totalCastsDuringCelestialAlignment += 1;
    if (spellId === this.lastCastSpellId) {
      this.badCasts += 1;
    }
    this.lastCastSpellId = spellId;
  }

  get damageDone() {
    const spell = this.abilityTracker.getAbility(SPELLS.STREAKING_STARS.id);
    return spell.damageEffective + spell.damageAbsorbed;
  }

  statistic() {
    const totalDamage = this.damagePerStreakingStars * (this.totalCastsDuringCelestialAlignment - this.badCasts);
    const damageThroughputPercent = this.owner.getPercentageOfTotalDamageDone(totalDamage);
    const dps = totalDamage / this.owner.fightDuration * 1000;
    return (
      <AzeritePowerStatistic
        size="flexible"
        tooltip={(
          <>
            <SpellLink id={SPELLS.STREAKING_STARS.id} /> is a flat damage increase on each damaging ability<br />
            that you cast while <SpellLink id={this.buffToTrack.id} /> buff is active, providing<br />
            that it is not a duplicate of the previously cast skill.<br />
            <br />
            {formatNumber(this.damagePerStreakingStars)} damage per proc of <SpellLink id={SPELLS.STREAKING_STARS.id} /><br />
            {this.totalCastsDuringCelestialAlignment - this.badCasts} out of {this.totalCastsDuringCelestialAlignment} possible procs of <SpellLink id={SPELLS.STREAKING_STARS.id} /><br />
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.STREAKING_STARS}>
          <img
            src="/img/sword.png"
            alt="Damage"
            className="icon"
          /> {formatNumber(dps)} DPS <small>{formatPercentage(damageThroughputPercent)} % of total</small>
        </BoringSpellValueText>
      </AzeritePowerStatistic>
    );
  }
}

export default StreakingStars;
