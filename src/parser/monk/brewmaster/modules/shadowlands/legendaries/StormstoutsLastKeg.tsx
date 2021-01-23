import React from 'react';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import { STORMSTOUTS_LK_MODIFIER } from 'parser/monk/brewmaster/constants';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { formatDuration } from 'common/format';

import BrewCDR from '../../core/BrewCDR';
import Abilities from '../../Abilities';

/**
 * Keg Smash deals 30% additional damage, and has 1 additional charge.
 */
class StormstoutsLastKeg extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    brewCdr: BrewCDR,
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;
  protected brewCdr!: BrewCDR;
  protected abilities!: Abilities;

  damage = 0;
  extraCD = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.STORMSTOUTS_LAST_KEG.bonusID);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.KEG_SMASH), this.onDamage);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.KEG_SMASH), this.trackExtraCD);
  }

  onDamage(event: DamageEvent) {
    this.damage += calculateEffectiveDamage(event, STORMSTOUTS_LK_MODIFIER);
  }

  // The idea here is that we can look at the remaining cooldown after a cast
  // to determine how much time the spell would have spent off cooldown without
  // the legendary. For example: if you cast Keg Smash 400ms after the first
  // charge comes off cooldown, then after the cast (when this event fires)
  // `expectedDuration - remaining = 400`, which is the amount of time it would
  // have wasted if not for this legendary.
  //
  // There is a special case for getting an entire extra cast off, because in
  // that scenario the remaining CD is equal to the expected total CD of the
  // cast.
  //
  // TODO: There is a pathological case that I havent figured out how to solve
  // yet: if the player casts Keg Smash exactly at the 2nd charge every time,
  // then they waste exactly 1 cast. The current implementation will report
  // them "preventing" n wasted casts. As long as players are trying to keep it
  // at 0 charges, this doesn't occur.
  trackExtraCD(_event: CastEvent) {
    const { expectedDuration, chargesOnCooldown } = this.spellUsable._currentCooldowns[SPELLS.KEG_SMASH.id];
    const remaining = this.spellUsable.cooldownRemaining(SPELLS.KEG_SMASH.id);
    // if we ever get a 3rd charge this will need revisiting
    if (chargesOnCooldown === 1) {
      this.extraCD += remaining;
    } else {
      this.extraCD += expectedDuration - remaining;
    }
  }

  avgCooldown() {
    const ability = this.abilities.getAbility(SPELLS.KEG_SMASH.id)!;
    return ability.getCooldown(this.brewCdr.meanHaste);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(1)}
        size="flexible"
        tooltip={(
          <>
          <p>This statistic shows the damage gained from the increased Keg Smash damage. It does not reflect the potential damage gain from having 2 charges of Keg Smashs.</p>
            <p>This legendary prevented {formatDuration(this.extraCD / 1000)} of wasted cooldown time, equal to about {(this.extraCD / 1000 / this.avgCooldown()).toFixed(1)} extra casts of Keg Smash. This includes the initial extra cast.</p>
          </>
        )}
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <BoringSpellValueText spell={SPELLS.STORMSTOUTS_LAST_KEG}>
          <>
            <ItemDamageDone amount={this.damage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default StormstoutsLastKeg;
