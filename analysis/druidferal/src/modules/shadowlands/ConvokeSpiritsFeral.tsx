import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';

import { ConvokeSpirits } from '@wowanalyzer/druid';
import {
  CONVOKE_DAMAGE_SPELLS,
  SPELL_IDS_WITH_TRAVEL_TIME,
} from '@wowanalyzer/druid/src/shadowlands/ConvokeSpirits';

const debug = false;

const DOTS_WITH_DIRECT_PORTION = [
  SPELLS.FERAL_FRENZY_DEBUFF,
  SPELLS.RAKE,
  SPELLS.THRASH_BEAR,
  SPELLS.MOONFIRE,
  SPELLS.MOONFIRE_BEAR,
  SPELLS.MOONFIRE_FERAL,
];

class ConvokeSpiritsFeral extends ConvokeSpirits {
  static dependencies = {
    ...ConvokeSpirits.dependencies,
  };

  /** The direct damage attributed to each Convoke, with the same indices as the base tracker */
  convokeDamage: number[] = []; // TODO use in chart?

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasCovenant(COVENANTS.NIGHT_FAE.id);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(CONVOKE_DAMAGE_SPELLS),
      this.onDamage,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(DOTS_WITH_DIRECT_PORTION),
      this.onPossibleTickDamage,
    );
  }

  onConvoke(event: ApplyBuffEvent) {
    super.onConvoke(event);
    this.convokeDamage[this.cast] = 0;
  }

  // TODO also attribute "non-refreshable" periodic damage like Feral Frenzy and Starfall

  // the direct portion of damage that *can* tick can be attributed solely to convoke
  onPossibleTickDamage(event: DamageEvent) {
    if (!event.tick) {
      this.onDamage(event);
    }
  }

  // direct damage can be attributed solely to convoke
  onDamage(event: DamageEvent) {
    const spellId = event.ability.guid;

    const isTravelTime = SPELL_IDS_WITH_TRAVEL_TIME.includes(spellId);
    const wasProbablyHardcast = isTravelTime && this.wasProbablyHardcast(event);
    const isConvoking = this.isConvoking();

    if (isConvoking && !wasProbablyHardcast) {
      // spell hit during convoke and was due to convoke
      this._addDamage(event);
    } else if (isTravelTime && !wasProbablyHardcast && this.isWithinTravelFromConvoke()) {
      // spell hit soon after convoke but was due to convoke
      this._addDamage(event);
    }
  }

  _addDamage(event: DamageEvent) {
    this.convokeDamage[this.cast] += event.amount + (event.absorbed || 0);
    debug &&
      console.log(`Convoke ${event.ability.name} did ${event.amount + (event.absorbed || 0)}`);
  }

  get totalDamage() {
    return this.convokeDamage.reduce((att, amount) => att + amount, 0);
  }

  // TODO also show energy and CP gained
  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={
          <>
            <strong>
              Damage amount listed considers only the direct damage done by convoked abilities!{' '}
            </strong>
            DoTs, heals, and the energy from Tiger's Fury are all not considered by this number,
            making it almost certainly an undercount of Convoke's true value.
            <br />
            <br />
            {this.baseTooltip}
          </>
        }
        dropdown={this.baseTable}
      >
        <BoringSpellValueText spell={SPELLS.CONVOKE_SPIRITS}>
          <ItemPercentDamageDone greaterThan amount={this.totalDamage} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ConvokeSpiritsFeral;
