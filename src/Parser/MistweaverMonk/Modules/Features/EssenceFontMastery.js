import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

const debug = false;

class EssenceFontMastery extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  healEF = 0;
  healing = 0;
  castEF = 0;

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    const targetId = event.targetID;
    if(spellId === SPELLS.GUSTS_OF_MISTS.id) {
      if(!this.combatants.players[targetId]) {
        return;
      }
      if(this.combatants.players[targetId].hasBuff(SPELLS.ESSENCE_FONT_BUFF.id, event.timestamp, 0, 0) === true) {
        debug && console.log('Player ID: ' + event.targetID + '  Timestamp: ' + event.timestamp);
        this.healEF++;
        this.healing += (event.amount || 0 ) + (event.absorbed || 0);
      }
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if(spellId === SPELLS.ESSENCE_FONT.id) {
      this.castEF++;
    }
  }

  on_finished() {
    if(debug) {
      console.log('EF Mastery Hots Casted into: ' + (this.healEF / 2));
      console.log('EF Mastery Healing Amount: ' + this.healing);
      console.log('EF Casts: ' + this.castEF);
      console.log('EF Targets Hit: ' + this.targetsEF);
      console.log('EF Avg Targets Hit per Cast: ' + (this.targetsEF / this.castEF));
    }
  }
  /*
  // EF Targets Hit
  if(avgTargetsHitPerEF < 17) {
    results.addIssue({
      issue: <span>You are currently using not utilizing your <SpellLink id={SPELLS.ESSENCE_FONT.id} /> effectively. You only hit an average of {(avgTargetsHitPerEF).toFixed(0)} targets over {this.modules.essenceFontMastery.castEF} <SpellLink id={SPELLS.ESSENCE_FONT.id} /> casts. Each <SpellLink id={SPELLS.ESSENCE_FONT.id} /> cast should hit a total of 18 targets. Your missed an average of {(18 - avgTargetsHitPerEF).toFixed(0)} targets.</span>,
      icon: SPELLS.ESSENCE_FONT.icon,
      importance: getIssueImportance(avgTargetsHitPerEF, 14, 12),
    });
  }
  */
  suggestions(when) {
    const efMasteryCasts = (this.healEF / 2) || 0;
    const avgMasteryCastsPerEF = (efMasteryCasts / this.castEF) || 0;

    when(avgMasteryCastsPerEF).isLessThan(3)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You are currently not utilizing your <SpellLink id={SPELLS.ESSENCE_FONT.id} /> HOT buffs effectively. Casting into injured targets with the <SpellLink id={SPELLS.ESSENCE_FONT.id} /> allows you to take advantage of the double <SpellLink id={SPELLS.GUSTS_OF_MISTS.id} /> procs.</span>)
          .icon(SPELLS.ESSENCE_FONT.icon)
          .actual(`${avgMasteryCastsPerEF.toFixed(2)} average EF HoTs`)
          .recommended(`${recommended} or more EF HoTs utilized is recommended`)
          .regular(recommended - 1).major(recommended - 2);
      });
  }

  statistic() {
    const efMasteryCasts = (this.healEF / 2) || 0;
    const efMasteryEffectiveHealing = ((this.healing) / 2) || 0;
    const avgEFMasteryHealing = efMasteryEffectiveHealing / efMasteryCasts || 0;
    const avgMasteryCastsPerEF = (efMasteryCasts / this.castEF) || 0;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.GUSTS_OF_MISTS.id} />}
        value={`${efMasteryCasts}`}
        label={(
          <dfn data-tip={`You healed a total of ${efMasteryCasts} targets with the Essence Font buff for ${formatNumber(efMasteryEffectiveHealing)} healing. You also healed an average of ${avgMasteryCastsPerEF.toFixed(2)} targets per Essence Font cast. (${formatNumber(avgEFMasteryHealing)} average healing per cast.)`}>
            Mastery Buffs utilized
          </dfn>
        )}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default EssenceFontMastery;
