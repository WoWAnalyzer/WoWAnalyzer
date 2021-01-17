import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SPELLS from 'common/SPELLS';
import Events, { DamageEvent, HealEvent, SummonEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemDamageDone from 'interface/ItemDamageDone';
import ItemHealingDone from 'interface/ItemHealingDone';
import React from 'react';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import { formatNumber } from 'common/format';
import COVENANTS from 'game/shadowlands/COVENANTS';
import SPECS from 'game/SPECS';

class FallenOrder extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };
  windDamage: number = 0;
  brewDamage: number = 0;
  mistDamage: number = 0;
  mistHealing: number = 0;
  mistOverhealing: number = 0;
  cloneMap: Map<number, number> = new Map<number, number>();
  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);

    // In my testing this line always returns false but its what putput uses so I have faith
    // it will work in the future. (might just be a bad log too)
    this.active = this.selectedCombatant.hasCovenant(COVENANTS.VENTHYR.id);

    if (!this.active) {
      return;
    }

    (options.abilities as Abilities).add({
      spell: SPELLS.FALLEN_ORDER_CAST,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      cooldown: 180,
      gcd: this.selectedCombatant.spec === SPECS.MISTWEAVER_MONK ? { base: 1500 } : { static: 1000 },
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.8,
      },
    });

    //summon events (need to track this to get melees)
    this.addEventListener(Events.summon.by(SELECTED_PLAYER).spell([SPELLS.FALLEN_ORDER_OX_CLONE, SPELLS.FALLEN_ORDER_TIGER_CLONE, SPELLS.FALLEN_ORDER_CRANE_CLONE]), this.trackSummons);

    //mistweaver spells
    this.addEventListener(Events.heal.by(SELECTED_PLAYER_PET).spell([SPELLS.FALLEN_ORDER_ENVELOPING_MIST, SPELLS.FALLEN_ORDER_SOOTHING_MIST]), this.mistHealingTracker);
    //brewmaster spells
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET).spell([SPELLS.FALLEN_ORDER_KEG_SMASH, SPELLS.FALLEN_ORDER_BREATH_OF_FIRE, SPELLS.BREATH_OF_FIRE_DEBUFF]), this.brewDamageTracker);
    //windwalker spells
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET).spell([SPELLS.FALLEN_ORDER_SPINNING_CRANE_KICK, SPELLS.FISTS_OF_FURY_DAMAGE]), this.windDamageTracker);
    //shared
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.MELEE), this.handleMelee);
  }

  trackSummons(event: SummonEvent) {
    this.cloneMap.set(event.targetID, event.ability.guid);
  }

  mistHealingTracker(event: HealEvent) {
    this.mistHealing += (event.amount || 0) + (event.absorbed || 0);
    this.mistOverhealing += event.overheal || 0;
  }

  brewDamageTracker(event: DamageEvent) {
    this.brewDamage += event.amount || 0;
  }

  windDamageTracker(event: DamageEvent) {
    this.windDamage += event.amount || 0;
  }

  mistDamageTracker(event: DamageEvent) {
    this.mistDamage += event.amount || 0;
  }

  handleMelee(event: DamageEvent) {
    //if we don't know who its from then we can't add it
    if (!event.sourceID) {
      return;
    }

    const id: number = event.sourceID;

    const cloneType: number | undefined = this.cloneMap.get(id);
    //because typescript won't let me just do this.cloneMap.get(id) i might as well add a null check too
    if (cloneType === undefined) {
      return;
    }

    if (cloneType === SPELLS.FALLEN_ORDER_OX_CLONE.id) {
      this.brewDamageTracker(event);
    } else if (cloneType === SPELLS.FALLEN_ORDER_TIGER_CLONE.id) {
      this.windDamageTracker(event);
    } else {
      this.mistDamageTracker(event);
    }

  }

  statistic() {
    const totalDamage: number = this.brewDamage + this.mistDamage + this.windDamage;

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={(
          <>
            <ul>
              <li>Damage from Brewmaster clones: {formatNumber(this.brewDamage)}</li>
              <li>Damage from Mistweaver clones: {formatNumber(this.mistDamage)}</li>
              <li>Damage from Windwalker clones: {formatNumber(this.windDamage)}</li>
            </ul>
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.FALLEN_ORDER_CAST}>
          <ItemHealingDone amount={this.mistHealing} /><br />
          <ItemDamageDone amount={totalDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FallenOrder;
