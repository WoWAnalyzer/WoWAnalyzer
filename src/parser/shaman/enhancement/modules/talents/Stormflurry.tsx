import React from 'react';

import SPELLS from 'common/SPELLS/index';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
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
  protected mainHandHits: number[] = [];
  protected offHandHits: number[] = [];
  protected totalStormStrikeCasts: number = 0;
  protected totalStormStrikeHits: number = 0;
  protected extraHits: number = 0;
  protected extraDamage: number = 0;
  protected processed: boolean = false;


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

  onStormstrikeCast(event: CastEvent): void {
    this.totalStormStrikeCasts += 1;
  }

  onStormstrikeDamage(event: DamageEvent): void {

    const dmg = event.amount + (event.absorbed || 0);

    if (MAIN_HAND_DAMAGES.includes(event.ability.guid)) {
      this.totalStormStrikeHits += 1;
      this.mainHandHits.push(dmg);
    } else if (OFF_HAND_DAMAGES.includes(event.ability.guid)) {
      this.offHandHits.push(dmg);
    }
  }

  determineExtraHitsAndDamage(): void {
    this.mainHandHits.sort((a,b) => a - b);
    this.offHandHits.sort((a, b) => a - b);

    this.extraHits = this.totalStormStrikeHits - this.totalStormStrikeCasts;

    const extraMainHandHits = this.mainHandHits.slice(0, this.extraHits);
    const extraOffHandHits = this.offHandHits.slice(0, this.extraHits);
    const extraMainHandDamage = extraMainHandHits.reduce((a, b) => a + b, 0);
    const extraOffHandDamage = extraOffHandHits.reduce((a, b) => a + b, 0);

    this.extraDamage = extraMainHandDamage + extraOffHandDamage;
    this.processed = true;
  }

  statistic() {
    if (!this.processed) {
      this.determineExtraHitsAndDamage();
    }

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={`You had ${this.extraHits} extra Stormstrike hits (+${formatPercentage(this.extraHits / this.totalStormStrikeCasts)}%).`}
      >
        <BoringSpellValueText spell={SPELLS.STORMFLURRY_TALENT}>
          <>
            <ItemDamageDone amount={this.extraDamage} approximate /><br />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Stormflurry;
