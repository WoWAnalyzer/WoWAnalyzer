import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, DamageEvent, RefreshBuffEvent } from 'parser/core/Events';
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

const debug = true;

const DOTS_WITH_DIRECT_PORTION = [
  SPELLS.RAKE,
  SPELLS.THRASH_BEAR,
  SPELLS.MOONFIRE_DEBUFF,
  SPELLS.MOONFIRE_FERAL,
];

class ConvokeSpiritsFeral extends ConvokeSpirits {
  static dependencies = {
    ...ConvokeSpirits.dependencies,
  };

  /** The direct damage attributed to each Convoke, with the same indices as the base tracker */
  convokeDamage: number[] = []; // TODO use in chart?

  /** True iff the current Feral Frenzy damage is from Convoke */
  feralFrenzyIsConvoke: boolean = false;
  /** True iff the current Starfall damage is from Convoke */
  starfallIsConvoke: boolean = false;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasCovenant(COVENANTS.NIGHT_FAE.id);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(CONVOKE_DAMAGE_SPELLS),
      this.onDirectDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(DOTS_WITH_DIRECT_PORTION),
      this.onPossibleTickDamage,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FERAL_FRENZY_DEBUFF),
      this.onFeralFrenzyDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.STARFALL),
      this.onStarfallDamage,
    );

    // only alternate way to do Starfall is lycara's, so only need to watch if we have it
    if (this.selectedCombatant.hasLegendaryByBonusID(SPELLS.LYCARAS_FLEETING_GLIMPSE.bonusID)) {
      this.addEventListener(
        Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.STARFALL_CAST),
        this.onGainStarfall,
      );
      this.addEventListener(
        Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.STARFALL_CAST),
        this.onGainStarfall,
      );
    } else {
      this.starfallIsConvoke = true;
    }

    // only alternate way to do Feral Frenzy is having the talent, so only need to watch if we have it
    if (this.selectedCombatant.hasTalent(SPELLS.FERAL_FRENZY_TALENT.id)) {
      this.addEventListener(
        Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.FERAL_FRENZY_TALENT),
        this.onGainFeralFrenzy,
      );
      this.addEventListener(
        Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.FERAL_FRENZY_TALENT),
        this.onGainFeralFrenzy,
      );
    } else {
      this.feralFrenzyIsConvoke = true;
    }
  }

  onConvoke(event: ApplyBuffEvent) {
    super.onConvoke(event);
    this.convokeDamage[this.cast] = 0;
  }

  onGainFeralFrenzy(_: ApplyBuffEvent | RefreshBuffEvent) {
    this.feralFrenzyIsConvoke = this.isConvoking();
  }

  onGainStarfall(_: ApplyBuffEvent | RefreshBuffEvent) {
    this.starfallIsConvoke = this.isConvoking();
  }

  onFeralFrenzyDamage(event: DamageEvent) {
    if (this.feralFrenzyIsConvoke) {
      this._addDamage(event);
    }
  }

  onStarfallDamage(event: DamageEvent) {
    if (this.starfallIsConvoke) {
      this._addDamage(event);
    }
  }

  // the direct portion of damage that *can* tick can be attributed solely to convoke
  onPossibleTickDamage(event: DamageEvent) {
    if (!event.tick) {
      this.onDirectDamage(event);
    }
  }

  // direct damage can be attributed solely to convoke
  onDirectDamage(event: DamageEvent) {
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
              Damage amount listed considers only the direct damage and non-refreshable DoT damage
              done by convoked abilities!{' '}
            </strong>
            (Non-refreshable DoTs are Starfall and Feral Frenzy) Refreshable DoTs, heals, and the
            energy from Tiger's Fury are all not considered by this number, making it almost
            certainly an undercount of Convoke's true value.
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
