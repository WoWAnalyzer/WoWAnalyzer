import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';
import { TooltipElement } from 'common/Tooltip';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Combatants from 'parser/shared/modules/Combatants';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

const debug = false;

class EssenceFontMastery extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  healEF: number = 0;
  healing: number = 0;
  castEF: number = 0;
  gustHeal: boolean = false;
  hasUpwelling: boolean = false;
  secondGustHealing: number = 0;
  secondGustOverheal: number = 0;


  constructor(options: Options){
    super(options);
    this.hasUpwelling = this.selectedCombatant.hasTalent(SPELLS.UPWELLING_TALENT.id);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GUSTS_OF_MISTS), this.gustHealing);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ESSENCE_FONT), this.efCast);
  }

  gustHealing(event: HealEvent) {
    const targetId = event.targetID;
      if (!this.combatants.players[targetId]) {
        return;
      }
      if (this.combatants.players[targetId].hasBuff(SPELLS.ESSENCE_FONT_BUFF.id, event.timestamp, 0, 0, event.sourceID) && !this.gustHeal) {
        debug && console.log(`First Gust Heal: Player ID: ${event.targetID}  Timestamp: ${event.timestamp}`);
        this.healEF += 1;
        this.gustHeal = true;
      } else if (this.combatants.players[targetId].hasBuff(SPELLS.ESSENCE_FONT_BUFF.id, event.timestamp, 0, 0, event.sourceID) && this.gustHeal) {
        this.healEF += 1;
        this.healing += (event.amount || 0) + (event.absorbed || 0);
        this.gustHeal = false;
      }
  }

  efCast(event: CastEvent) {
    this.castEF += 1;
  }

  get avgMasteryCastsPerEF() {
    const efMasteryCasts = (this.healEF / 2) || 0;

    return (efMasteryCasts / this.castEF) || 0;
  }

  get suggestionThresholds() {
    if (this.hasUpwelling) {
      return {
        actual: this.avgMasteryCastsPerEF,
        isLessThan: {
          minor: 4,
          average: 3.5,
          major: 3,
        },
        style: ThresholdStyle.DECIMAL,
      };
    } else {
     return {
        actual: this.avgMasteryCastsPerEF,
        isLessThan: {
          minor: 3,
          average: 2.5,
          major: 2,
       },
       style: ThresholdStyle.DECIMAL,
      };
   }
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(
          <>
            You are currently not utilizing your <SpellLink id={SPELLS.ESSENCE_FONT.id} /> HOT buffs effectively. Casting into injured targets with the <SpellLink id={SPELLS.ESSENCE_FONT.id} /> allows you to take advantage of the double <SpellLink id={SPELLS.GUSTS_OF_MISTS.id} /> procs.
          </>,
        )
          .icon(SPELLS.ESSENCE_FONT.icon)
          .actual(i18n._(t('monk.mistweaver.suggestions.essenceFontMastery.averageHots')`${this.avgMasteryCastsPerEF.toFixed(2)} average EF HoTs`))
          .recommended(`${recommended} or more EF HoTs utilized is recommended`));
  }

  statistic() {
    const efMasteryCasts = (this.healEF / 2) || 0;
    const efMasteryEffectiveHealing = ((this.healing) / 2) || 0;
    const avgEFMasteryHealing = efMasteryEffectiveHealing / efMasteryCasts || 0;

    return (
      <StatisticBox
        position={STATISTIC_ORDER.OPTIONAL(0)}
        icon={<SpellIcon id={SPELLS.GUSTS_OF_MISTS.id} />}
        value={efMasteryCasts}
        label={(
          <TooltipElement
            content={(
              <>
                You healed an average of {this.avgMasteryCastsPerEF.toFixed(2)} targets per Essence Font cast.
                <ul>
                  <li>{formatNumber(avgEFMasteryHealing)} average healing per cast</li>
                  <li>{formatNumber(this.secondGustOverheal)} Second Gust of Mists overhealing ({formatPercentage(this.secondGustOverheal / this.secondGustHealing)}%)</li>
                </ul>
              </>
            )}
          >
            Mastery Buffs utilized
          </TooltipElement>
        )}
      />
    );
  }
}

export default EssenceFontMastery;
