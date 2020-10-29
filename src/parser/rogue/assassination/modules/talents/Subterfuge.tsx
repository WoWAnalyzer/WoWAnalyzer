import React from 'react';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';
import { Options } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import { SuggestionFactory, ThresholdStyle, When } from 'parser/core/ParseResults';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

import GarroteSnapshot from '../features/GarroteSnapshot';
import StealthCasts from './StealthCasts';

class Subterfuge extends StealthCasts {
  static dependencies = {
    garroteSnapshot: GarroteSnapshot,
  };

  protected garroteSnapshot!: GarroteSnapshot;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SUBTERFUGE_TALENT.id);
  }

  get bonusDamage() {
    return this.garroteSnapshot.bonusDamage;
  }

  get stealthsWithAtleastOneGarrote() {
    let stealthsWithGarrote = 0;
    this.stealthSequences.forEach((sequence: any) => {
      const firstGarroteCast = sequence.find((e: any) => e.ability.guid === SPELLS.GARROTE.id);
      if (firstGarroteCast) {
        stealthsWithGarrote += 1;
      }
    });
    return stealthsWithGarrote;
  }

  get stealthCasts() {
    return this.stealthSequences.length;
  }

  get percentGoodStealthCasts() {
    return (this.stealthsWithAtleastOneGarrote / this.stealthCasts) || 0;
  }

  get suggestionThresholds() {
    return {
      actual: this.percentGoodStealthCasts,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest: SuggestionFactory, actual: number | boolean, recommended: number | boolean) => suggest(<>Your failed to cast atleast one <SpellLink id={SPELLS.GARROTE.id} /> during <SpellLink id={SPELLS.SUBTERFUGE_BUFF.id} /> {this.stealthCasts - this.stealthsWithAtleastOneGarrote} time(s). Make sure to prioritize snapshotting <SpellLink id={SPELLS.GARROTE.id} /> during <SpellLink id={SPELLS.SUBTERFUGE_BUFF.id} />.</>)
      .icon(SPELLS.GARROTE.icon)
      .actual(i18n._(t('rogue.assassinations.suggestions.subterfuge.efficiency')`${formatPercentage(actual as number)}% of Subterfuges with atleast one Garrote cast`))
      .recommended(`>${formatPercentage(recommended as number)}% is recommended`));
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={`You casted atleast one Garrote during Subterfuge ${this.stealthsWithAtleastOneGarrote} times out of ${this.stealthCasts}.`}
      >
        <BoringSpellValueText spell={SPELLS.SUBTERFUGE_TALENT}>
          <ItemDamageDone amount={this.bonusDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }

}

export default Subterfuge;
