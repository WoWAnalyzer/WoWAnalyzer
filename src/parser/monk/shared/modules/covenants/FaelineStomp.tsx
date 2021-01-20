import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SPELLS from 'common/SPELLS';
import Events, { ApplyBuffEvent, CastEvent, DamageEvent, HealEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import React from 'react';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import COVENANTS from 'game/shadowlands/COVENANTS';
import SPECS from 'game/SPECS';
import SpellUsable from 'parser/shared/modules/SpellUsable';

class FaelineStomp extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    spellUsable: SpellUsable,
  };


  protected abilities!: Abilities;
  protected spellUsable!: SpellUsable;

  resets = 0;
  flsCasts = 0;
  targetsDamaged = 0;
  targetsHealed = 0;

  constructor(options: Options) {
    super(options);

    // In my testing this line always returns false but its what putput uses so I have faith
    // it will work in the future. (might just be a bad log too)
    this.active = this.selectedCombatant.hasCovenant(COVENANTS.NIGHT_FAE.id);

    if (!this.active) {
      return;
    }

    (options.abilities as Abilities).add({
      spell: SPELLS.FAELINE_STOMP_CAST,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      cooldown: 30,
      gcd: this.selectedCombatant.spec === SPECS.MISTWEAVER_MONK ? { base: 1500 } : { static: 1000 },
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.8,
      },
    });

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FAELINE_STOMP_CAST), this.casts);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.FAELINE_STOMP_RESET), this.reset);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FAELINE_STOMP_DAMAGE_AND_HEAL), this.damage);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.FAELINE_STOMP_DAMAGE_AND_HEAL), this.heal);

  }

  casts(event: CastEvent){
    this.flsCasts += 1;
  }

  reset(event: ApplyBuffEvent) {
    if(this.spellUsable.isOnCooldown(SPELLS.FAELINE_STOMP_CAST.id)){
      this.spellUsable.endCooldown(SPELLS.FAELINE_STOMP_CAST.id);
      this.resets += 1;
    }
  }

  damage(event: DamageEvent) {
    this.targetsDamaged += 1;
  }

  heal(event: HealEvent) {
    this.targetsHealed += 1; 
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <BoringSpellValueText spell={SPELLS.FAELINE_STOMP_CAST}>
          {this.resets} <small>resets</small> <br />
          {(this.targetsDamaged / this.flsCasts).toFixed(2)} <small>Foes Hit per cast</small> <br />
          {(this.targetsHealed / this.flsCasts).toFixed(2)} <small>Allies Hit per cast</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FaelineStomp;
