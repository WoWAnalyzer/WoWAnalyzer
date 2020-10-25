import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import { When } from 'parser/core/ParseResults';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

class DivineHymn extends Analyzer {
  healing = 0;
  ticks = 0;
  overhealing = 0;
  absorbed = 0;
  casts = 0;

  constructor(options: Options){
    super(options);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.DIVINE_HYMN_HEAL), this.onHeal);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.DIVINE_HYMN_CAST), this.onCast);
  }

  onHeal(event: HealEvent) {
    this.healing += event.amount || 0;
    this.overhealing += event.overheal || 0;
    this.absorbed += event.absorbed || 0;
    if (event.sourceID === event.targetID) {
      this.ticks += 1;
    }
  }

  onCast(event: CastEvent) {
    this.casts += 1;
  }

  suggestions(when: When) {
    const missedHymnTicks = (this.casts * 5) - this.ticks;

    when(missedHymnTicks).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => suggest('You wasted Divine Hymn ticks. Try to avoid clipping the end of Divine Hymn as well as positioning such that you will not have to move during its duration. ')
          .icon('spell_holy_divinehymn')
          .actual(i18n._(t('priest.holy.suggestions.divineHymn.wastedTicks')`${actual} missed Hymn ticks`))
          .recommended('0 is recommended')
          .regular(recommended).major(recommended));
  }
}

export default DivineHymn;
