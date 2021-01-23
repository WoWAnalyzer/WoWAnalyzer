import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Events, { ApplyBuffStackEvent, DamageEvent, RemoveBuffStackEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import AverageTargetsHit from 'parser/ui/AverageTargetsHit';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import { formatNumber, formatPercentage } from 'common/format';
import Spell from 'common/SPELLS/Spell';

const HAILSTORM = {
  INCREASE_PER_STACK: .35,
};

const MAX_STACKS = 5;
const STACKS_CONSUMED_PER_FROST_SHOCK_CAST = 5;
const MAX_MAELSTROM_WEAPON_STACKS_CONSUMED_PER_CAST = 5;

/**
 * Each stack of Maelstrom Weapon consumed increases the damage of your next
 * Frost Shock by 35%, and causes your next Frost Shock to hit 1 additional
 * target per Maelstrom Weapon stack consumed.
 *
 * Example Log:
 */
class Hailstorm extends Analyzer {
  protected casts: number = 0;
  protected hits: number = 0;
  protected damage: number = 0;
  protected currentStacks: number = 0;
  protected lostStacks: number = 0;
  protected totalStacksGained: number = 0;
  protected overcappedStacks: number = 0;
  protected currentMaelstromWeaponStacks: number = 0;

  protected timestamp: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(SPELLS.HAILSTORM_TALENT.id);

    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.MAELSTROM_WEAPON_BUFF),
      this.onMaelstromWeaponStackApply,
    );

    const SPELLS_WITH_CAST_TIME: Spell[] = [
      SPELLS.CHAIN_HEAL,
      SPELLS.CHAIN_LIGHTNING,
      SPELLS.HEALING_SURGE,
      SPELLS.LIGHTNING_BOLT,
    ];

    SPELLS_WITH_CAST_TIME.forEach(spell => {
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(spell),
        this.onSpellWithCastTimeCast,
      );
    });

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER)
        .spell(SPELLS.FROST_SHOCK),
      this.onFrostShockCast,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER)
        .spell(SPELLS.FROST_SHOCK),
      this.onFrostShockDamage,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.HAILSTORM_BUFF),
      this.onHailstormRemove,
    );

    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.HAILSTORM_BUFF),
      this.onHailstormStackRemove,
    );
  }

  onMaelstromWeaponStackApply(event: ApplyBuffStackEvent) {
    this.currentMaelstromWeaponStacks = event.stack;
  }

  onSpellWithCastTimeCast() {
    const maelstromWeaponStacksConsumed = Math.min(
      MAX_MAELSTROM_WEAPON_STACKS_CONSUMED_PER_CAST,
      this.currentMaelstromWeaponStacks,
    );
    this.currentMaelstromWeaponStacks -= maelstromWeaponStacksConsumed;

    const hailstormStacksGained = Math.min(
      maelstromWeaponStacksConsumed,
      MAX_STACKS - this.currentStacks,
    );
    this.currentStacks += hailstormStacksGained;
    this.totalStacksGained += hailstormStacksGained;
    this.overcappedStacks += maelstromWeaponStacksConsumed - hailstormStacksGained;
  }

  onFrostShockCast() {
    if (!this.selectedCombatant.hasBuff(SPELLS.HAILSTORM_BUFF.id)) {
      return;
    }

    this.currentStacks -= STACKS_CONSUMED_PER_FROST_SHOCK_CAST;
    this.currentStacks = this.currentStacks < 0 ? 0 : this.currentStacks;

    this.casts += 1;
  }

  onFrostShockDamage(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.HAILSTORM_BUFF.id)) {
      return;
    }

    this.hits += 1;
    // TODO: hailstorm buff stacks are buggy right now, so assume that they're correctly using 5 stacks
    this.damage += calculateEffectiveDamage(event, HAILSTORM.INCREASE_PER_STACK * STACKS_CONSUMED_PER_FROST_SHOCK_CAST);
  }

  onHailstormStackRemove(event: RemoveBuffStackEvent) {
    // if hailstorm removal is due to consumption by frost shock, they are not considered as lost
    if (this.currentStacks === 0) {
      return;
    }

    this.lostStacks += (this.currentStacks - event.stack);
    this.currentStacks = event.stack;
  }

  onHailstormRemove() {
    // if hailstorm removal is due to consumption by frost shock, they are not considered as lost
    if (this.currentStacks === 0) {
      return;
    }

    this.lostStacks += this.currentStacks;
    this.currentStacks = 0;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={(
          <ul>
            <li>{`${formatNumber(this.totalStacksGained)} / ${formatNumber(this.totalStacksGained + this.overcappedStacks)} stacks gained: you overcapped ${this.overcappedStacks} stacks.`}</li>
            <li>{`${formatNumber(this.totalStacksGained - this.lostStacks)} / ${formatNumber(this.totalStacksGained)} stacks used: ${this.lostStacks} stacks lost due to timeout.`}</li>
          </ul>
        )}
      >
        <BoringSpellValueText spell={SPELLS.HAILSTORM_TALENT}>
          <>
            <ItemDamageDone amount={this.damage} approximate /><br />
            <AverageTargetsHit casts={this.casts} hits={this.hits} /><br />
            <>
              {formatPercentage((this.totalStacksGained - this.lostStacks) / (this.totalStacksGained + this.overcappedStacks))}{'% '}
              <small>stacks used</small>
            </>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Hailstorm;
