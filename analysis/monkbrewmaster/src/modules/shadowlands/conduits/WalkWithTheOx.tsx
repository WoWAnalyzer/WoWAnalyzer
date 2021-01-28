import React from 'react';

import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { formatNumber } from 'common/format';
import SpellUsable from 'parser/shared/modules/SpellUsable';

import { WALK_WITH_THE_OX_DAMAGE_INCREASE } from '../../../constants';

const COOLDOWN_REDUCTION = 500;

export default class WalkWithTheOx extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  rank: number = 0;
  effCdr = 0;
  wastedCdr = 0;
  additionalDamage: number = 0;

  private sckTarget?: number;

  constructor(options: Options) {
    super(options);

    this.rank = this.selectedCombatant.conduitRankBySpellID(SPELLS.WALK_WITH_THE_OX.id);
    if(!this.rank) {
      this.active = false;
      return;
    }

    this.addEventListener(Events.cast.spell(SPELLS.BLACKOUT_KICK_BRM).by(SELECTED_PLAYER), this.reduceCooldown);
    this.addEventListener(Events.cast.spell(SPELLS.KEG_SMASH).by(SELECTED_PLAYER), this.reduceCooldown);
    // SCK generates 1 shuffle application per tick of the channel that hits at
    // least one enemy. this concoction is equal to that in 99% of cases. we
    // could try to determine whether two damage events are for the same tick,
    // but that is way more error-prone with haste shenanigans allowing some
    // VERY short SCKs
    this.addEventListener(Events.cast.spell(SPELLS.SPINNING_CRANE_KICK_BRM).by(SELECTED_PLAYER), this.startSCK);
    this.addEventListener(Events.damage.spell(SPELLS.SPINNING_CRANE_KICK_DAMAGE).by(SELECTED_PLAYER), this.reduceCooldownSCK);
    // Calculating additional damages on Niuzao
    this.addEventListener(Events.damage.spell(SPELLS.STOMP_DAMAGE).by(SELECTED_PLAYER_PET), this.onPetStompDamage);
  }

  private reduceCooldown() {
    if(this.spellUsable.isOnCooldown(SPELLS.INVOKE_NIUZAO_THE_BLACK_OX.id)) {
      const cdr = this.spellUsable.reduceCooldown(SPELLS.INVOKE_NIUZAO_THE_BLACK_OX.id, COOLDOWN_REDUCTION);
      this.effCdr += cdr;
      this.wastedCdr += COOLDOWN_REDUCTION - cdr;
    }
  }

  private startSCK(_event: CastEvent) {
    this.sckTarget = undefined;
  }

  private reduceCooldownSCK(event: DamageEvent) {
    if(!this.sckTarget) {
      this.sckTarget = event.targetID;
    }

    if(this.sckTarget !== event.targetID) {
      return;
    }

    this.reduceCooldown();
  }

  private onPetStompDamage(event: DamageEvent) {
    this.additionalDamage += calculateEffectiveDamage(event, WALK_WITH_THE_OX_DAMAGE_INCREASE[this.rank]);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <ConduitSpellText spell={SPELLS.WALK_WITH_THE_OX} rank={this.rank}>
          <>
            <ItemDamageDone amount={this.additionalDamage} />
            <br />
            {formatNumber(this.effCdr / 1000)}s<small> total Invoke Niuzao CDR</small>
          </>
        </ConduitSpellText>
      </Statistic>
    );
  }
}
