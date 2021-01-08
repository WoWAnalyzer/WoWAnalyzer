import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';

import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';

import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';
import Spell from 'common/SPELLS/Spell';

const damagingCasts: Spell[] = [SPELLS.EYE_OF_THE_STORM, SPELLS.WIND_GUST, SPELLS.CALL_LIGHTNING];
const CALL_LIGHTNING_BUFF_DURATION: number = 15000;

class PrimalStormElemental extends Analyzer {
  eotsCasts = 0;
  pseCasts = 0;
  lastCLCastTimestamp = 0;

  usedCasts: { [key: number]: boolean };

  damageGained = 0;
  maelstromGained = 0;
  badCasts = 0;

  constructor(options: Options) {
    super(options);
    this.usedCasts = {
      [SPELLS.EYE_OF_THE_STORM.id]: false,
      [SPELLS.WIND_GUST.id]: false,
      [SPELLS.CALL_LIGHTNING.id]: false,
    };
    this.active = this.selectedCombatant.hasTalent(SPELLS.PRIMAL_ELEMENTALIST_TALENT.id)
      && this.selectedCombatant.hasTalent(SPELLS.STORM_ELEMENTAL_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER_PET).spell(damagingCasts), this.onPetCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET).spell(damagingCasts), this.onPetDamage);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.STORM_ELEMENTAL_TALENT), this.onPSECast);
  }

  get unusedSpells() {
    return Object.keys(this.usedCasts).filter(key => !this.usedCasts[Number(key)]);
  }

  get unusedSpellsSuggestionTresholds() {
    return {
      actual: this.unusedSpells.length,
      isGreaterThanOrEqual: {
        minor: 1,
        major: 1,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  get badCastsSuggestionTresholds() {
    return {
      actual: this.unusedSpells.length,
      isGreaterThanOrEqual: {
        minor: 1,
        major: 5,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  onPSECast(event: CastEvent) {
    this.pseCasts += 1;
  }

  onPetCast(event: CastEvent) {
    this.usedCasts[event.ability.guid] = true;
  }

  onPetDamage(event: DamageEvent) {
    this.damageGained += event.amount + (event.absorbed || 0);

    if (event.ability.guid !== SPELLS.CALL_LIGHTNING.id) {
      if (event.timestamp > this.lastCLCastTimestamp + CALL_LIGHTNING_BUFF_DURATION) {
        this.badCasts += 1;
      }
    }
  }

  suggestions(when: When) {
    const unusedSpellsString = this.unusedSpells.map(x=>(SPELLS[Number(x)].name)).join(', ');

    when(this.unusedSpellsSuggestionTresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<span> Your Storm Elemental is not using all of it's spells. Check if Wind Gust and Call Lightning are set to autocast and you are using Eye Of The Storm.</span>)
        .icon(SPELLS.STORM_ELEMENTAL_TALENT.icon)
        .actual(`${formatNumber(actual)} spells not used by your Storm Elemental (${unusedSpellsString})`)
        .recommended(`You should be using all spells of your Storm Elemental.`));

    when(this.badCastsSuggestionTresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<span>You are not using <SpellLink id={SPELLS.CALL_LIGHTNING.id} /> on cooldown.</span>)
        .icon(SPELLS.STORM_ELEMENTAL_TALENT.icon)
        .actual(`${formatNumber(actual)} casts done by your Storm Elemental without the "Call Lightning"-Buff.}`)
        .recommended(`You should be recasting "Call Lightning" before the buff drops off.`));
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        tooltip={(
          <>
            Your Storm Elemental cast {formatNumber(this.badCasts)} spells without <SpellLink id={SPELLS.CALL_LIGHTNING.id} />
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.STORM_ELEMENTAL_TALENT}>
          <ItemDamageDone amount={this.damageGained} />
        </BoringSpellValueText>

      </Statistic>
    );
  }
}

export default PrimalStormElemental;
