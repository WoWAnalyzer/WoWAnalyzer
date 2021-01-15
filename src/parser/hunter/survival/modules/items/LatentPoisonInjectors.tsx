import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { LATENT_POISON_INJECOTRS_MAX_STACKS, RAPTOR_MONGOOSE_VARIANTS } from 'parser/hunter/survival/constants';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Statistic from 'interface/statistics/Statistic';
import Events, { ApplyDebuffEvent, ApplyDebuffStackEvent, DamageEvent } from 'parser/core/Events';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import { currentStacks } from 'parser/shared/modules/helpers/Stacks';
import ItemDamageDone from 'interface/ItemDamageDone';

/**
 * Serpent Sting's damage applies Latent Poison to the target, stacking up to 10 times.
 * Mongoose Bite and Raptor Strike consumes all stacks of Latent Poison, dealing (18% of Attack power) Nature damage to the target per stack consumed.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/WM6dXqCmj7aHPK3f#fight=3&type=auras&translate=true&hostility=1&spells=debuffs&target=23
 */

class LatentPoisonInjectors extends Analyzer {

  stacks = 0;
  maxPossible = 0;
  wasted = 0;
  utilised = 0;
  casts = 0;
  spellKnown = this.selectedCombatant.hasTalent(SPELLS.MONGOOSE_BITE_TALENT.id) ? SPELLS.MONGOOSE_BITE_TALENT.name : SPELLS.RAPTOR_STRIKE.name;
  damage = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.LATENT_POISON_INJECTORS_EFFECT.bonusID);

    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.LATENT_POISON_INJECTORS_DEBUFF), this.handleStacks);
    this.addEventListener(Events.applydebuffstack.by(SELECTED_PLAYER).spell(SPELLS.LATENT_POISON_INJECTORS_DEBUFF), this.handleStacks);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SERPENT_STING_SV), this.onSerpentStingDamage);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.LATENT_POISON_INJECTORS_DAMAGE), this.onLatentDamage);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(RAPTOR_MONGOOSE_VARIANTS), this.onCast);
  }

  get averageStacksPerRaptorOrMongoose() {
    return this.utilised / this.casts;
  }

  handleStacks(event: ApplyDebuffEvent | ApplyDebuffStackEvent) {
    this.stacks = currentStacks(event);
  }

  onSerpentStingDamage() {
    this.maxPossible += 1;
  }

  onLatentDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  onCast() {
    this.utilised += this.stacks;
    this.casts += 1;
    this.stacks = 0;
  }

  statistic() {
    this.wasted = this.maxPossible - this.utilised;
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={(
          <>
            {this.wasted > 0 &&
            <> You wasted {this.wasted} stacks by not casting {this.spellKnown} at the target with {LATENT_POISON_INJECOTRS_MAX_STACKS} stacks on them, or if the mob died while it had stacks on it.</>}
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.LATENT_POISON_INJECTORS_EFFECT}>
          <>
            <ItemDamageDone amount={this.damage} />
            <br />
            {this.utilised} / {this.maxPossible} <small>possible stacks consumed</small>
            <br />
            {this.averageStacksPerRaptorOrMongoose.toFixed(1)} <small>average stacks per {this.spellKnown}</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default LatentPoisonInjectors;
