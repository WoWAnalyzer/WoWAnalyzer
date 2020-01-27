import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { RAPTOR_MONGOOSE_VARIANTS } from 'parser/hunter/survival/constants';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import AzeritePowerStatistic from 'interface/statistics/AzeritePowerStatistic';

/**
 * Serpent Sting damage applies Latent Poison, stacking up to 10 times. Your Mongoose Bite or Raptor Strike consumes all applications of Latent Poison to deal 451 Nature damage per stack.
 *
 * Example: https://www.warcraftlogs.com/reports/2vJyCmRVKgQWLHcY/#fight=9&source=3
 */

const MAX_STACKS = 10;

class LatentPoison extends Analyzer {

  applications = 0;
  _stacks = 0;
  maxPossible = 0;
  wasted = 0;
  utilised = 0;
  casts = 0;
  spellKnown = null;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.LATENT_POISON.id);
    this.spellKnown = this.selectedCombatant.hasTalent(SPELLS.MONGOOSE_BITE_TALENT.id) ? SPELLS.MONGOOSE_BITE_TALENT.name : SPELLS.RAPTOR_STRIKE.name;
  }
  on_byPlayer_applydebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.LATENT_POISON_DEBUFF.id) {
      return;
    }
    this.applications += 1;
    this._stacks = 1;
  }

  on_byPlayer_applydebuffstack(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.LATENT_POISON_DEBUFF.id) {
      return;
    }
    this.applications += 1;
    this._stacks = event.stack;
  }

  on_byPlayer_removedebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.LATENT_POISON_DEBUFF.id) {
      return;
    }
    this.removeDebuffTimestamp = event.timestamp;
    this._stacks = 0;
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SERPENT_STING_SV.id) {
      return;
    }
    this.maxPossible++;
    if (this._stacks === MAX_STACKS) {
      this.wasted += 1;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (!RAPTOR_MONGOOSE_VARIANTS.includes(spellId)) {
      return;
    }
    this.utilised += this._stacks;
    this.casts += 1;
  }

  get averageStacksPerRaptorOrMongoose() {
    return (this.utilised / this.casts).toFixed(2);
  }

  statistic() {
    return (
      <AzeritePowerStatistic
        size="flexible"
        category={'AZERITE_POWERS'}
        tooltip={(
          <>
            {this.utilised} stacks consumed / {this.maxPossible} possible.<br />
            {this.wasted > 0 && <> You wasted {this.wasted} stacks by not casting {this.spellKnown} at the target with {MAX_STACKS} stacks on.</>}
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.LATENT_POISON}>
          <>
            {this.averageStacksPerRaptorOrMongoose} <small>stacks per {this.spellKnown}</small>
          </>
        </BoringSpellValueText>
      </AzeritePowerStatistic>
    );
  }
}

export default LatentPoison;
