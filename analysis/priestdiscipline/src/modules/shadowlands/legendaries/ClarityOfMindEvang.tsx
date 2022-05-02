import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import ItemManaGained from 'parser/ui/ItemManaGained';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { POWER_WORD_SHIELD_ATONEMENT_DUR } from '@wowanalyzer/priest-discipline/src/constants';

import AtonementAnalyzer, { AtonementAnalyzerEvent } from '../../core/AtonementAnalyzer';

const CLARITY_EXTENSION_DURATION = 6000;
const EVANG_EXTENSION_DURATION = 6000;
const POWER_WORD_SHIELD_MANA_COST = 1550;

class ClarityOfMindEvang extends Analyzer {
  private atonementHealing: number = 0;
  raptureBuffActive = false;
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
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.checkEvang);
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
    this.raptureShields.push({ applyBuff: event });
    this.raptureBuffActive = true;
  }

  checkEvang(event: CastEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.EVANGELISM_TALENT.id) {
      return;
    }
    this.raptureShields.forEach((shield: any, index: number) => {
      if (
        event.timestamp > shield.applyBuff.timestamp &&
        event.timestamp < shield.applyBuff.timestamp + POWER_WORD_SHIELD_ATONEMENT_DUR
      ) {
        this.raptureShields[index].extendedByEvang = true;
      }
    });
  }

  raptureRemoved() {
    return (this.raptureBuffActive = false);
  }

  private handleAtone(event: AtonementAnalyzerEvent) {
    this.raptureShields.forEach((rapture: any) => {
      const end =
        rapture.applyBuff.timestamp +
        (rapture.extendedByEvang ? EVANG_EXTENSION_DURATION : 0) +
        POWER_WORD_SHIELD_ATONEMENT_DUR +
        CLARITY_EXTENSION_DURATION;
      const start =
        rapture.applyBuff.timestamp +
        (rapture.extendedByEvang ? EVANG_EXTENSION_DURATION : 0) +
        POWER_WORD_SHIELD_ATONEMENT_DUR;

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
    const manaSaved = 0.2 * POWER_WORD_SHIELD_MANA_COST * this.raptureShields.length;
    console.log(manaSaved);
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            This value is calculated from the healing contributed from the last 6 seconds of the
            applied <SpellLink id={SPELLS.ATONEMENT_BUFF.id} />. If you cast{' '}
            <SpellLink id={SPELLS.POWER_WORD_SHIELD.id} /> during{' '}
            <SpellLink id={SPELLS.RAPTURE.id} /> and the atonement was only extended by Evangelism
            due to <SpellLink id={SPELLS.CLARITY_OF_MIND.id} />
            's atonement exenstion, it is not counted by the module as with proper play, it is not
            reccomended to begin a ramp over 15 seconds before pressing{' '}
            <SpellLink id={SPELLS.EVANGELISM_TALENT.id} />.
          </>
        }
      >
        <>
          <BoringSpellValueText spellId={SPELLS.CLARITY_OF_MIND.id}>
            <ItemHealingDone amount={this.atonementHealing} /> <br />
            <ItemManaGained amount={manaSaved} />
          </BoringSpellValueText>
        </>
      </Statistic>
    );
  }
}

export default ClarityOfMindEvang;
