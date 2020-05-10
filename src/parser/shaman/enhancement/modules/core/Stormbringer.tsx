import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  DamageEvent,
} from 'parser/core/Events';
import SPELLS from 'common/SPELLS/shaman';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import React from 'react';
import Statistic from 'interface/statistics/Statistic';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import ItemDamageDone from 'interface/ItemDamageDone';
import BoringSpellValueText
  from 'interface/statistics/components/BoringSpellValueText';
import {
  STORMSTRIKE_CAST_SPELLS,
  STORMSTRIKE_DAMAGE_SPELLS,
} from 'parser/shaman/enhancement/constants';

const STORMBRINGER_DAMAGE_MODIFIER = 0.25;

class Stormbringer extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  private damage = 0;

  constructor(options: any) {
    super(options);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER)
        .spell(SPELLS.STORMBRINGER_BUFF),
      this.onStormbringerApplied,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER)
        .spell(STORMSTRIKE_CAST_SPELLS),
      this.onStormstrikeUseWithStormbringerBuff,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER)
        .spell(STORMSTRIKE_DAMAGE_SPELLS),
      this.onStrikeDamage,
    );
  }

  onStormbringerApplied(event: ApplyBuffEvent) {
    if (this.spellUsable.isOnCooldown(SPELLS.STORMSTRIKE_CAST.id)) {
      this.spellUsable.endCooldown(SPELLS.STORMSTRIKE_CAST.id);
    }

    if (this.spellUsable.isOnCooldown(SPELLS.WINDSTRIKE_CAST.id)) {
      this.spellUsable.endCooldown(SPELLS.WINDSTRIKE_CAST.id);
    }
  }

  onStormstrikeUseWithStormbringerBuff(event: CastEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.STORMBRINGER_BUFF.id)) {
      return;
    }

    if (this.spellUsable.isOnCooldown(SPELLS.STORMSTRIKE_CAST.id)) {
      this.spellUsable.endCooldown(SPELLS.STORMSTRIKE_CAST.id);
    }

    if (this.spellUsable.isOnCooldown(SPELLS.WINDSTRIKE_CAST.id)) {
      this.spellUsable.endCooldown(SPELLS.WINDSTRIKE_CAST.id);
    }
  }

  onStrikeDamage(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.STORMBRINGER_BUFF.id)) {
      return;
    }

    this.damage += calculateEffectiveDamage(
      event,
      STORMBRINGER_DAMAGE_MODIFIER,
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="small"
        category={'GENERAL'}
      >
        <BoringSpellValueText
          spell={SPELLS.STORMBRINGER}
        >
          <>
            <ItemDamageDone amount={this.damage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Stormbringer;
