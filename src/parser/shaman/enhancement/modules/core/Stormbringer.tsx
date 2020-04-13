import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/shaman';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import SpellLink from '../../../../../common/SpellLink';
import { formatNumber, formatPercentage } from '../../../../../common/format';
import React from 'react';
import Statistic from 'interface/statistics/Statistic';
import SpellIcon from '../../../../../common/SpellIcon';
import calculateEffectiveDamage from '../../../../core/calculateEffectiveDamage';
import STATISTIC_ORDER from '../../../../../interface/others/STATISTIC_ORDER';
import ItemDamageDone from '../../../../../interface/ItemDamageDone';
import BoringSpellValueText from '../../../../../interface/statistics/components/BoringSpellValueText';

const STORMBRINGER_DAMAGE_MODIFIER = 0.25;

class Stormbringer extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  private stormbringerCount = 0;
  private stormbringerUses = 0;
  private damage = 0;

  constructor(options: any) {
    super(options);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER)
        .spell(SPELLS.STORMBRINGER_BUFF),
      this.onReset,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER)
        .spell(SPELLS.STORMSTRIKE_CAST),
      this.onNoCooldown,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER)
        .spell([
          SPELLS.STORMSTRIKE_ATTACK,
          SPELLS.STORMSTRIKE_ATTACK_OFFHAND,
          SPELLS.WINDSTRIKE_ATTACK,
          SPELLS.WINDSTRIKE_ATTACK_OFFHAND
        ]),
      this.onStrikeDamage,
    );
  }

  onReset() {
    if (!this.spellUsable.isOnCooldown(SPELLS.STORMSTRIKE_CAST.id)) {
      return;
    }
    this.spellUsable.endCooldown(SPELLS.STORMSTRIKE_CAST.id);
  }

  onNoCooldown() {
    if (!this.selectedCombatant.hasBuff(SPELLS.STORMBRINGER_BUFF.id)) {
      return;
    }
    if (!this.spellUsable.isOnCooldown(SPELLS.STORMSTRIKE_CAST.id)) {
      return;
    }
    this.spellUsable.endCooldown(SPELLS.STORMSTRIKE_CAST.id);
  }

  onStrikeDamage(event: DamageEvent) {
    if(!this.selectedCombatant.hasBuff(SPELLS.STORMBRINGER_BUFF.id)) {
      return;
    }

    this.damage += calculateEffectiveDamage(event, STORMBRINGER_DAMAGE_MODIFIER);
  }

  get suggestionThresholds() {
    return {
      actual: this.stormbringerUses / this.stormbringerCount,
      isLessThan: {
        minor: 0.85,
        average: 0.70,
        major: 0.6,
      },
      style: 'decimal',
    };
  }

  suggestions(when: any) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest: any, actual: any, recommended: any) => {
        return suggest(<span>Cast <SpellLink id={SPELLS.STORMSTRIKE_CAST.id} /> or <SpellLink id={SPELLS.WINDSTRIKE_CAST.id} /> more often when <SpellLink id={SPELLS.STORMBRINGER.id} /> by using it before combat.</span>)
          .icon(SPELLS.STORMBRINGER.icon)
          .actual(`${formatPercentage(actual)}% procs used`)
          .recommended(`${(formatPercentage(recommended, 0))}% is recommended`);
      });
  }

  // TODO: Extra information about procs and its use.
  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="small"
        category={"GENERAL"}
      >
        <BoringSpellValueText
          spell={SPELLS.STORMBRINGER}>
          <>
            <ItemDamageDone amount={this.damage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Stormbringer;
