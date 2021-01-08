import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';

import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';

import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import ItemDamageDone from 'interface/ItemDamageDone';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

import { t } from '@lingui/macro';

const damagingCasts = [SPELLS.FIRE_ELEMENTAL_METEOR, SPELLS.FIRE_ELEMENTAL_IMMOLATE, SPELLS.FIRE_ELEMENTAL_FIRE_BLAST];

class PrimalFireElemental extends Analyzer {
  meteorCasts = 0;
  PFEcasts = 0;

  usedCasts: { [key: number]: boolean };

  damageGained = 0;
  maelstromGained = 0;

  constructor(options: Options) {
    super(options);
    this.usedCasts = {
      [SPELLS.FIRE_ELEMENTAL_METEOR.id]: false,
      [SPELLS.FIRE_ELEMENTAL_IMMOLATE.id]: false,
      [SPELLS.FIRE_ELEMENTAL_FIRE_BLAST.id]: false,
    };
    this.active = this.selectedCombatant.hasTalent(SPELLS.PRIMAL_ELEMENTALIST_TALENT.id)
      && (!this.selectedCombatant.hasTalent(SPELLS.STORM_ELEMENTAL_TALENT.id));
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET).spell(damagingCasts), this.onDamage);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FIRE_ELEMENTAL), this.onFECast);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER_PET).spell(damagingCasts), this.onDamagingCast);
  }

  get missedMeteorCasts() {
    return this.PFEcasts - this.meteorCasts;
  }

  onDamage(event: DamageEvent) {
    this.damageGained += event.amount + (event.absorbed || 0);
  }

  onFECast(event: CastEvent) {
    this.PFEcasts += 1;
  }

  onDamagingCast(event: CastEvent) {
    this.usedCasts[event.ability.guid] = true;
  }

  get unusedSpells() {
    return Object.keys(this.usedCasts).filter(key => !this.usedCasts[Number(key)]);
  }

  get unusedSpellsSuggestionTresholds() {
    return {
      actual: this.unusedSpells.length,
      isGreaterThanOrEqual: {
        major: 1,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  get missedMeteorSuggestionTresholds() {
    return {
      actual: this.unusedSpells.length,
      isGreaterThanOrEqual: {
        major: 1,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    const unusedSpellsString = this.unusedSpells.map(x=>(SPELLS[Number(x)].name)).join(', ');
    when(this.unusedSpellsSuggestionTresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<span> Your Fire Elemental is not using all of it's spells. Check if immolate and Fire Blast are set to autocast and you are using Meteor.</span>)
        .icon(SPELLS.FIRE_ELEMENTAL.icon)
        .actual(t({
      id: "shaman.elemental.suggestions.primalFireElemental.unusedSpells",
      message: `${formatNumber(this.unusedSpells.length)} spell/-s not used by your Fire Elemental (${unusedSpellsString})`
    }))
        .recommended(`You should be using all spells of your Fire Elemental.`)
        .major(recommended + 1));

    when(this.missedMeteorSuggestionTresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<span>You are not using <SpellLink id={SPELLS.FIRE_ELEMENTAL_METEOR.id} /> every time you cast <SpellLink id={SPELLS.FIRE_ELEMENTAL.id} /> if you are using <SpellLink id={SPELLS.PRIMAL_ELEMENTALIST_TALENT.id} />. Only wait with casting meteor if you wait for adds to spawn.</span>)
        .icon(SPELLS.FIRE_ELEMENTAL.icon)
        .actual(t({
      id: "shaman.elemental.suggestions.primalFireElemental.meteorCastsMissed",
      message: `${formatNumber(this.missedMeteorCasts)} missed Meteor Casts.`
    }))
        .recommended(`You should cast Meteor every time you summon your Fire Elemental `)
        .major(recommended + 1));
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
      >
        <>
          <BoringSpellValueText spell={SPELLS.FIRE_ELEMENTAL}>
            <ItemDamageDone amount={this.damageGained} />
          </BoringSpellValueText>
        </>
      </Statistic>
    );
  }
}

export default PrimalFireElemental;
