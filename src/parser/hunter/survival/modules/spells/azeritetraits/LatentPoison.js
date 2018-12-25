import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import SPELLS from 'common/SPELLS';
import { RAPTOR_MONGOOSE_VARIANTS } from 'parser/hunter/survival/constants';

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
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.LATENT_POISON.id}
        value={`${this.averageStacksPerRaptorOrMongoose} pr ${this.spellKnown}`}
        tooltip={`${this.utilised} debuffs consumed / ${this.maxPossible} possible. ${this.wasted > 0 ? <><br /> You cast ${this.spellKnown} ${this.wasted} times while you already had ${MAX_STACKS} stacks on the target.</> : ''}`}
      />
    );
  }
}

export default LatentPoison;
