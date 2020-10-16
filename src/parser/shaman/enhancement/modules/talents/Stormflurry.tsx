import React from 'react';

import SPELLS from 'common/SPELLS/index';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';
import { formatPercentage } from 'common/format';
import { STORMSTRIKE_CAST_SPELLS, STORMSTRIKE_DAMAGE_SPELLS } from 'parser/shaman/enhancement/constants';

const MAIN_HAND_DAMAGES = [
  SPELLS.STORMSTRIKE_DAMAGE.id,
  SPELLS.WINDSTRIKE_DAMAGE.id,
];

const OFF_HAND_DAMAGES = [
  SPELLS.STORMSTRIKE_DAMAGE_OFFHAND.id,
  SPELLS.WINDSTRIKE_DAMAGE_OFFHAND.id,
];

/**
 * Stormstrike has a 25% chance to strike the target an additional time for
 * 40% of normal damage. This effect can chain off of itself.
 *
 * Example Log:
 *
 */
class Stormflurry extends Analyzer {
  protected totalStormStrikeCasts: number = 0;
  protected extraHits: number = 0;
  protected extraDamage: number = 0;
  protected firstMainHandSeen: boolean = false;
  protected firstOffHandSeen: boolean = false;


  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(SPELLS.STORMFLURRY_TALENT.id);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER)
        .spell(STORMSTRIKE_CAST_SPELLS),
      this.onStormstrikeCast,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER)
        .spell(STORMSTRIKE_DAMAGE_SPELLS),
      this.onStormstrikeDamage,
    );
  }

  onStormstrikeCast(): void {
    this.totalStormStrikeCasts += 1;
    this.firstMainHandSeen = false;
    this.firstOffHandSeen = false;
  }

  onStormstrikeDamage(event: DamageEvent): void {
    if (!this.firstMainHandSeen && MAIN_HAND_DAMAGES.includes(event.ability.guid)) {
      this.firstMainHandSeen = true;
      return;
    }
    if (!this.firstOffHandSeen && OFF_HAND_DAMAGES.includes(event.ability.guid)) {
      this.firstOffHandSeen = true;
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
        tooltip={`You had ${this.extraHits} extra Stormstrike${this.selectedCombatant.hasTalent(SPELLS.ASCENDANCE_TALENT_ENHANCEMENT) ? `/Windstrike` : ``} hits (+${formatPercentage(this.extraHits / this.totalStormStrikeCasts)}%).`}
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
