import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import { formatPercentage } from 'common/format';
import EventHistory from 'parser/shared/modules/EventHistory';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

import { STORMSTRIKE_CAST_SPELLS, STORMSTRIKE_DAMAGE_SPELLS } from '../../constants';

const MAIN_HAND_DAMAGES = [
  SPELLS.STORMSTRIKE_DAMAGE.id,
  SPELLS.WINDSTRIKE_DAMAGE.id,
];

const STORMFLURRY = {
  WINDOW: 400,
};

/**
 * Stormstrike has a 25% chance to strike the target an additional time for
 * 40% of normal damage. This effect can chain off of itself.
 *
 * Example Log:
 *
 */
class Stormflurry extends Analyzer {
  static dependencies = {
    eventHistory: EventHistory,
    abilityTracker: AbilityTracker,
  };
  protected eventHistory!: EventHistory;
  protected abilityTracker!: AbilityTracker;

  protected extraHits: number = 0;
  protected extraDamage: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(SPELLS.STORMFLURRY_TALENT.id);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER)
        .spell(STORMSTRIKE_DAMAGE_SPELLS),
      this.onStormstrikeDamage,
    );
  }

  get totalStormstrikeCasts() {
    let casts = 0;

    STORMSTRIKE_CAST_SPELLS.forEach(spell => {
      casts += this.abilityTracker.getAbility(spell.id).casts || 0;
    });

    return casts;
  }

  onStormstrikeDamage(event: DamageEvent): void {
    const lastDmg = this.eventHistory.last(1, STORMFLURRY.WINDOW, Events.damage.by(SELECTED_PLAYER).spell(STORMSTRIKE_DAMAGE_SPELLS));
    if (!lastDmg.length) {
      return;
    }

    if (MAIN_HAND_DAMAGES.includes(event.ability.guid)) {
      this.extraHits += 1;
    }

    this.extraDamage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={`You had ${this.extraHits} extra Stormstrike${this.selectedCombatant.hasTalent(SPELLS.ASCENDANCE_TALENT_ENHANCEMENT) ? `/Windstrike` : ``} hits (+${formatPercentage(this.extraHits / this.totalStormstrikeCasts)}%).`}
      >
        <BoringSpellValueText spell={SPELLS.STORMFLURRY_TALENT}>
          <>
            <ItemDamageDone amount={this.extraDamage} /><br />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Stormflurry;
