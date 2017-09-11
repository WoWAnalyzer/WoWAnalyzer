import React from 'react';

import Icon from 'common/Icon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import SPELLS from 'common/SPELLS';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

const debug = false;

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  _highestVoidformStack = 0;
  _highestLingeringStack = 0;

  static ABILITIES_ON_GCD = [
    // handled in _removebuff
    // SPELLS.VOID_TORRENT.id,
    // SPELLS.MIND_FLAY.id,
    // SPELLS.DISPERSION.id,

    // rotational:
    SPELLS.VOID_BOLT.id,
    SPELLS.VOID_ERUPTION.id,
    SPELLS.MIND_BLAST.id,
    SPELLS.VAMPIRIC_TOUCH.id,
    SPELLS.SHADOW_WORD_DEATH.id,
    SPELLS.SHADOW_WORD_PAIN.id,
    SPELLS.SHADOWFIEND.id,
    SPELLS.SHADOWFIEND_WITH_GLYPH_OF_THE_SHA.id,
    
    // talents:
    SPELLS.MINDBENDER_TALENT_SHADOW.id,
    SPELLS.POWER_INFUSION_TALENT.id,
    SPELLS.SHADOW_CRASH_TALENT.id,
    SPELLS.SHADOW_WORD_VOID_TALENT.id,
    SPELLS.MIND_BOMB_TALENT.id,

    // utility:
    SPELLS.SHADOWFORM.id,
    SPELLS.MIND_VISION.id,
    SPELLS.POWER_WORD_SHIELD.id,
    SPELLS.SHADOW_MEND.id,
    SPELLS.DISPEL_MAGIC.id,
    SPELLS.MASS_DISPEL.id,
    SPELLS.LEVITATE.id,
    SPELLS.SHACKLE_UNDEAD.id,
    SPELLS.PURIFY_DISEASE.id,

  ];

  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.LINGERING_INSANITY.id) {
      this._applyHasteLoss(this._highestVoidformStack * 0.01);
      debug && console.log(`ABC: Current haste: ${this.currentHaste} (lost ${0.01 * this._highestVoidformStack} from VOIDFORM_BUFF)`);

      this._highestLingeringStack = this._highestVoidformStack;
      this._applyHasteGain(this._highestLingeringStack * 0.01);
        
      this._highestVoidformStack = 0;
        
      debug && console.log(`ABC: Current haste: ${this.currentHaste} (gained ${0.01 * this._highestLingeringStack} from LINGERING_INSANITY)`);
      return;
    }

    if (spellId === SPELLS.VOID_TORRENT.id) {
      return;
    }
    
    super.on_toPlayer_applybuff(event);
  }


  on_toPlayer_applybuffstack(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.VOIDFORM_BUFF.id) {
      this._applyHasteLoss(this._highestVoidformStack * 0.01);
      this._highestVoidformStack = event.stack;
      this._applyHasteGain(this._highestVoidformStack * 0.01);

      debug && console.log(`ABC: Current haste: ${this.currentHaste} (gained ${0.01 * this._highestVoidformStack} from VOIDFORM_BUFF)`);
    }
  }

  on_toPlayer_removebuffstack(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.LINGERING_INSANITY.id) {
      this._applyHasteLoss(this._highestLingeringStack * 0.01);
      this._highestLingeringStack = event.stack;
      this._applyHasteGain(this._highestLingeringStack * 0.01);

      debug && console.log(`ABC: Current haste: ${this.currentHaste} (lost ${0.02} from LINGERING_INSANITY)`);
    }
  }

  on_toPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (
        spellId === SPELLS.MIND_FLAY.id ||
        spellId === SPELLS.DISPERSION.id ||
        spellId === SPELLS.VOID_TORRENT.id
    ) {
      this._lastCastFinishedTimestamp = event.timestamp;
      return;
    }


    super.on_toPlayer_removebuff(event);
  }

  on_finished() {
    const fightDuration = this.owner.fight.end_time - this.owner.fight.start_time;
    debug && console.log('totalTimeWasted:', this.totalTimeWasted, 'totalTime:', fightDuration, (this.totalTimeWasted / fightDuration));
    debug && console.log('totalHealingTimeWasted:', this.totalHealingTimeWasted, 'totalTime:', fightDuration, (this.totalHealingTimeWasted / fightDuration));

    // override default as it never does the voidform/lingering insanity haste changes
  }

  suggestions(when) {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    when(deadTimePercentage).isGreaterThan(0.2)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your dead GCD time can be improved. Try to Always Be Casting (ABC), try to reduce the delay between casting spells. Even if you have to move, try casting something instant - maybe refresh your dots or replenish your mana with <SpellLink id={SPELLS.LIFE_TAP.id}/></span>)
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% dead GCD time`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.15).major(recommended + 0.2);
      });
  }

  statistic() {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;
    return (<StatisticBox
        icon={<Icon icon="spell_mage_altertime" alt="Dead GCD time" />}
        value={`${formatPercentage(deadTimePercentage)} %`}
        label={(
          <dfn data-tip="Dead GCD time is available casting time not used. This can be caused by latency, cast interrupting, not casting anything (e.g. due to movement/stunned), etc.">
            Dead GCD time
          </dfn>
        )}
    />);
  }

  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default AlwaysBeCasting;
