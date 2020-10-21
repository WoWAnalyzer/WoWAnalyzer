import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Events from 'parser/core/Events';

import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';
const damagingCasts = [SPELLS.FIRE_ELEMENTAL_METEOR, SPELLS.FIRE_ELEMENTAL_IMMOLATE, SPELLS.FIRE_ELEMENTAL_FIRE_BLAST];


class PrimalFireElemental extends Analyzer {
  meteorCasts = 0;
  PFEcasts = 0;

  usedCasts = {
    'Meteor': false,
    'Immolate': false,
    'Fire Blast': false,
  };

  damageGained = 0;
  maelstromGained = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.PRIMAL_ELEMENTALIST_TALENT.id)
      && (!this.selectedCombatant.hasTalent(SPELLS.STORM_ELEMENTAL_TALENT.id));
    this.addEventListener(Events.damage.spell(damagingCasts), this.onDamage);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.FIRE_ELEMENTAL), this.onEnergize);
    this.addEventListener(Events.cast, this.onCast);
  }

  onDamage(event) {
    this.damageGained+=event.amount;
  }

  onEnergize(event) {
    this.maelstromGained+=event.amount;
  }

  onCast(event) {
    switch(event.ability.guid) {
      case SPELLS.FIRE_ELEMENTAL.id:
        this.PFEcasts += 1;
        break;
      case SPELLS.FIRE_ELEMENTAL_FIRE_BLAST.id:
        this.usedCasts['Fire Blast']=true;
        break;
      case SPELLS.FIRE_ELEMENTAL_IMMOLATE.id:
        this.usedCasts.Immolate=true;
        break;
      case SPELLS.FIRE_ELEMENTAL_METEOR.id:
        this.usedCasts.Meteor=true;
        this.meteorCasts += 1;
        break;
      default:
        break;
    }
  }

  get damagePercent() {
    return this.owner.getPercentageOfTotalDamageDone(this.damageGained);
  }

  get damagePerSecond() {
    return this.damageGained / (this.owner.fightDuration / 1000);
  }

  get missedMeteorCasts() {
    return this.PFEcasts-this.meteorCasts;
  }

  suggestions(when) {
    const unusedSpells = Object.keys(this.usedCasts).filter(key => !this.usedCasts[key]);
    const unusedSpellsString = unusedSpells.join(', ');
    const unusedSpellsCount = unusedSpells.length;
    when(unusedSpellsCount).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => suggest(<span> Your Fire Elemental is not using all of it's spells. Check if immolate and Fire Blast are set to autocast and you are using Meteor.</span>)
          .icon(SPELLS.FIRE_ELEMENTAL.icon)
          .actual(i18n._(t('shaman.elemental.suggestions.primalElemental.unusedSpells')`${formatNumber(unusedSpellsCount)} spells not used by your Fire Elemental (${unusedSpellsString})`))
          .recommended(`You should be using all spells of your Fire Elemental.`)
          .major(recommended+1));
    when(this.missedMeteorCasts).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => suggest(<span>You are not using <SpellLink id={SPELLS.FIRE_ELEMENTAL_METEOR.id} /> every time you cast <SpellLink id={SPELLS.FIRE_ELEMENTAL.id} /> if you are using <SpellLink id={SPELLS.PRIMAL_ELEMENTALIST_TALENT.id} />. Only wait with casting meteor if you wait for adds to spawn.</span>)
          .icon(SPELLS.FIRE_ELEMENTAL.icon)
          .actual(i18n._(t('shaman.elemental.suggestions.primalElemental.meteorCastsMissed')`${formatNumber(this.missedMeteorCasts)} missed Meteor Casts.`))
          .recommended(`You should cast Meteor every time you summon your Fire Elemental `)
          .major(recommended+1));
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.FIRE_ELEMENTAL.id} />}
        value={`~ ${formatPercentage(this.damagePercent)} %`}
        position={STATISTIC_ORDER.OPTIONAL()}
        label="Of total damage"
        tooltip={`PFE contributed ${formatNumber(this.damagePerSecond)} DPS (${formatNumber(this.damageGained)} total damage) and also generated ${formatNumber(this.maelstromGained)} Maelstrom.`}
      />
    );
  }
}

export default PrimalFireElemental;
