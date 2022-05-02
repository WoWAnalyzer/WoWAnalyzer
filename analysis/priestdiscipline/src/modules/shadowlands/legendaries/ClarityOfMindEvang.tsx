import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { POWER_WORD_SHIELD_ATONEMENT_DUR } from '@wowanalyzer/priest-discipline/src/constants';

import AtonementAnalyzer, { AtonementAnalyzerEvent } from '../../core/AtonementAnalyzer';

const CLARITY_EXTENSION_DURATION = 6000;
const EVANG_EXTENSION_DURATION = 6000;

class ClarityOfMindEvang extends Analyzer {
  private atonementHealing: number = 0;
  raptureBuffActive = true;
  raptureShields = [] as any;

  constructor(options: Options) {
    super(options);

    this.active =
      this.selectedCombatant.hasLegendary(SPELLS.CLARITY_OF_MIND) &&
      this.selectedCombatant.hasTalent(SPELLS.EVANGELISM_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(AtonementAnalyzer.atonementEventFilter, this.handleAtone);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.checkRapture);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.applyRapture);
    this.addEventListener(
      Events.removebuff.spell(SPELLS.RAPTURE).by(SELECTED_PLAYER),
      this.raptureRemoved,
    );
  }

  private checkRapture(event: CastEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.POWER_WORD_SHIELD.id && spellId !== SPELLS.RAPTURE.id) {
      return;
    }
    if (this.raptureBuffActive) {
      this.raptureShields.push({
        applyBuff: event,
      });
    }
  }

  applyRapture(event: CastEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.RAPTURE.id) {
      return;
    }
    // return this.raptureBuffActive = true;
  }

  raptureRemoved() {
    return (this.raptureBuffActive = false);
  }

  private handleAtone(event: AtonementAnalyzerEvent) {
    this.raptureShields.forEach((rapture: any) => {
      const end =
        rapture.applyBuff.timestamp +
        EVANG_EXTENSION_DURATION +
        POWER_WORD_SHIELD_ATONEMENT_DUR +
        CLARITY_EXTENSION_DURATION;
      const start =
        rapture.applyBuff.timestamp + EVANG_EXTENSION_DURATION + POWER_WORD_SHIELD_ATONEMENT_DUR;

      if (
        event.targetID === rapture.applyBuff.targetID &&
        event.timestamp > start &&
        event.timestamp < end
      ) {
        this.atonementHealing += event.healEvent.amount;
      }
    });
  }

  statistic() {
    console.log(`${this.atonementHealing} - testing to check`);
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            <strong>Bonus Atonement Healing:</strong>
            <br />
            <strong>Direct Healing:</strong>
            <br />
          </>
        }
      >
        <>
          <BoringSpellValueText spellId={SPELLS.CLARITY_OF_MIND.id}>
            <ItemHealingDone amount={this.atonementHealing} />
          </BoringSpellValueText>
        </>
      </Statistic>
    );
  }
}

export default ClarityOfMindEvang;
