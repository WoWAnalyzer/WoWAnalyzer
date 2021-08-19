import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import SPECS from 'game/SPECS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';

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

    this.active = this.selectedCombatant.hasCovenant(COVENANTS.NIGHT_FAE.id);

    if (!this.active) {
      return;
    }

    (options.abilities as Abilities).add({
      spell: SPELLS.FAELINE_STOMP_CAST.id,
      category:
        this.selectedCombatant.spec === SPECS.MISTWEAVER_MONK
          ? Abilities.SPELL_CATEGORIES.COOLDOWNS
          : Abilities.SPELL_CATEGORIES.ROTATIONAL,
      cooldown: 30,
      gcd:
        this.selectedCombatant.spec === SPECS.MISTWEAVER_MONK ? { base: 1500 } : { static: 1000 },
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.8,
      },
    });

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FAELINE_STOMP_CAST),
      this.casts,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.FAELINE_STOMP_RESET),
      this.reset,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FAELINE_STOMP_DAMAGE_AND_HEAL),
      this.damage,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.FAELINE_STOMP_DAMAGE_AND_HEAL),
      this.heal,
    );
  }

  casts() {
    this.flsCasts += 1;
  }

  reset() {
    if (this.spellUsable.isOnCooldown(SPELLS.FAELINE_STOMP_CAST.id)) {
      this.spellUsable.endCooldown(SPELLS.FAELINE_STOMP_CAST.id);
      this.resets += 1;
    }
  }

  damage() {
    this.targetsDamaged += 1;
  }

  heal() {
    this.targetsHealed += 1;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <BoringSpellValueText spellId={SPELLS.FAELINE_STOMP_CAST.id}>
          {this.resets} <small>resets</small> <br />
          {(this.targetsDamaged / this.flsCasts).toFixed(2)} <small>Foes Hit per cast</small> <br />
          {(this.targetsHealed / this.flsCasts).toFixed(2)} <small>Allies Hit per cast</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FaelineStomp;
