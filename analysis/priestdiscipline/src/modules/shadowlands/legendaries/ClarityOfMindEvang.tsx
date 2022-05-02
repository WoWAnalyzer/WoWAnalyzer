// import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
// import ApplyBuff from 'parser/shared/normalizers/ApplyBuff';
import Events, { ApplyBuffEvent, DamageEvent, Ability } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import AtonementAnalyzer, { AtonementAnalyzerEvent } from '../../core/AtonementAnalyzer';

// const CLARITY_EXTENSION_DURATION = 6000;

class ClarityOfMindEvang extends Analyzer {
  private atonementHealing: number = 0;
  private healingMap: Map<number, number> = new Map();
  private abilityMap: Map<number, Ability> = new Map();
  raptureBuffActive = false;
  raptureShields = [] as any;

  // private abilityMap: Map<number, Ability> = new Map();
  constructor(options: Options) {
    super(options);

    this.active =
      this.selectedCombatant.hasLegendary(SPELLS.CLARITY_OF_MIND) &&
      this.selectedCombatant.hasTalent(SPELLS.EVANGELISM_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(AtonementAnalyzer.atonementEventFilter, this.handleAtone);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER), this.checkRapture);
    // this.addEventListener(ApplyBuff, this.raptureTest)
  }

  private checkRapture(event: ApplyBuffEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.ATONEMENT_BUFF.id || SPELLS.RAPTURE.id) {
      return;
    }
    console.log(event);
    this.selectedCombatant.buffs.forEach((buff) => {
      if (buff.ability.name === 'Rapture') {
        console.log(this.owner.formatTimestamp(buff.timestamp));
        // console.log(buff) ;
      }
    });
    // console.log(this.selectedCombatant.has2Piece());
    if (SELECTED_PLAYER) {
      this.raptureShields.push({
        applyBuff: event,
        atonementEvents: [],
      });
    }
  }

  private handleAtone(event: AtonementAnalyzerEvent) {
    console.log(event);
    if (event) {
      event;
    }
    console.log(this.owner.formatTimestamp(event.timestamp));
    this.attributeToMap(event.healEvent.amount, event.damageEvent);
    this.atonementHealing += event.healEvent.amount;
  }

  private attributeToMap(amount: number, sourceEvent?: DamageEvent) {
    if (!sourceEvent) {
      return;
    }
    const { ability } = sourceEvent;

    // Set ability in map
    this.abilityMap.set(ability.guid, ability);

    // Attribute healing
    const currentValue = this.healingMap.get(ability.guid) || 0;
    this.healingMap.set(ability.guid, currentValue + amount);
  }

  statistic() {
    // console.log(this.healingMap);
    // console.log(this.raptureShields);
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
            <ItemHealingDone amount={0} />
          </BoringSpellValueText>
        </>
      </Statistic>
    );
  }
}

export default ClarityOfMindEvang;
