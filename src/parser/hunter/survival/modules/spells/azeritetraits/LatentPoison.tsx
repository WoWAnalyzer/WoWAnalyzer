import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { RAPTOR_MONGOOSE_VARIANTS } from 'parser/hunter/survival/constants';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Statistic from 'interface/statistics/Statistic';
import Events, { ApplyDebuffEvent, ApplyDebuffStackEvent, EventType, RemoveDebuffEvent } from 'parser/core/Events';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import { currentStacks } from 'parser/shared/modules/helpers/Stacks';

/**
 * Serpent Sting damage applies Latent Poison, stacking up to 10 times. Your Mongoose Bite or Raptor Strike consumes all applications of Latent Poison to deal 451 Nature damage per stack.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/nYXazkPpFwDrK3mh#fight=75&type=damage-done&source=692&translate=true&ability=273289
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

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTrait(SPELLS.LATENT_POISON.id);
    this.spellKnown = this.selectedCombatant.hasTalent(SPELLS.MONGOOSE_BITE_TALENT.id) ? SPELLS.MONGOOSE_BITE_TALENT.name : SPELLS.RAPTOR_STRIKE.name;

    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.LATENT_POISON_DEBUFF), (event: ApplyDebuffEvent) => this.handleStacks(event));
    this.addEventListener(Events.applydebuffstack.by(SELECTED_PLAYER).spell(SPELLS.LATENT_POISON_DEBUFF), (event: ApplyDebuffStackEvent) => this.handleStacks(event));
    this.addEventListener(Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.LATENT_POISON_DEBUFF), (event: RemoveDebuffEvent) => this.handleStacks(event));
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SERPENT_STING_SV), this.onDamage);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(RAPTOR_MONGOOSE_VARIANTS), this.onCast);
  }

  get averageStacksPerRaptorOrMongoose() {
    return this.utilised / this.casts;
  }

  handleStacks(event: ApplyDebuffEvent | ApplyDebuffStackEvent | RemoveDebuffEvent) {
    if (event.type !== EventType.RemoveDebuff) {
      this.applications += 1;
    }
    this._stacks = currentStacks(event);
  }

  onDamage() {
    this.maxPossible += 1;
  }

  onCast() {
    this.utilised += this._stacks;
    this.casts += 1;
  }

  statistic() {
    this.wasted = this.maxPossible - this.utilised;
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.AZERITE_POWERS}
        tooltip={(
          <>
            {this.wasted > 0 &&
            <> You wasted {this.wasted} stacks by not casting {this.spellKnown} at the target with {MAX_STACKS} stacks on them, or if the mob died while it had stacks on it.</>}
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.LATENT_POISON}>
          <>
            {this.utilised} / {this.maxPossible} <small>possible stack consumes</small><br />
            {this.averageStacksPerRaptorOrMongoose.toFixed(1)} <small>stacks per {this.spellKnown}</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default LatentPoison;
