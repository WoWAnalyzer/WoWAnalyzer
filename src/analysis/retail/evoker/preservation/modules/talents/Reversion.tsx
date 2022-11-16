import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import HIT_TYPES from 'game/HIT_TYPES';
import Analyzer from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import { Options, SELECTED_PLAYER } from 'parser/core/EventSubscriber';

import Haste from 'parser/shared/modules/Haste';
import HotTrackerPrevoker from '../core/HotTrackerPrevoker';
import HotTracker, { Attribution } from 'parser/shared/modules/HotTracker';
import Combatants from 'parser/shared/modules/Combatants';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { formatDuration, formatNumber } from 'common/format';

const debug = false;
const REVERSION_EXTENSION_PREFIX = 'Reversion Crit #';

class Reversion extends Analyzer {
  static dependencies = {
    haste: Haste,
    combatants: Combatants,
    hotTracker: HotTrackerPrevoker,
  };
  protected haste!: Haste;
  hotTracker!: HotTrackerPrevoker;
  combatants!: Combatants;
  totalExtensionTime: number = 0;
  reversionCritCount: number = 0;
  reversionExtensions: Attribution[] = [];
  additionalHealing: number = 0;
  additionalAbsorbed: number = 0;
  healing: number = 0;
  absorbedHealing: number = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([TALENTS_EVOKER.REVERSION_TALENT, SPELLS.REVERSION_ECHO]),
      this.reversionHeal,
    );
  }

  get totallHealing() {
    return this.healing + this.absorbedHealing;
  }

  get totalAdditionaHealing() {
    return this.additionalAbsorbed + this.additionalHealing;
  }

  reversionHeal(event: HealEvent) {
    const targetId = event.targetID;
    const spellId = event.ability.guid;
    if (!this.hotTracker.hots[targetId] || !this.hotTracker.hots[targetId][spellId]) {
      return;
    }
    const hot = this.hotTracker.hots[targetId][spellId];
    if (event.tick) {
      //if crit add extension
      if (event.hitType === HIT_TYPES.CRIT) {
        const extensionLength = this.hotTracker.hotInfo[spellId]?.tickPeriod;
        debug &&
          console.log(
            'Current Haste Value: ' +
              this.haste.current +
              '. Calculated extension: ' +
              extensionLength,
          );
        this.totalExtensionTime += extensionLength;
        this.reversionCritCount += 1;
        const newReversionCrit = HotTracker.getNewAttribution(
          REVERSION_EXTENSION_PREFIX + this.reversionCritCount,
        );
        this.reversionExtensions.push(newReversionCrit);

        this.hotTracker.addExtension(
          newReversionCrit,
          extensionLength,
          targetId,
          spellId,
          event.timestamp,
        );
      }
      //tally additional tick healing
      if (hot.originalEnd < event.timestamp) {
        this.additionalHealing += event.amount || 0;
        this.additionalAbsorbed += event.absorbed || 0;
      }
      this.healing += event.amount || 0;
      this.absorbedHealing += event.absorbed || 0;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <ul>
            <li>Extra ticks: {this.reversionCritCount}</li>
            <li>Total healing from extensions: {formatNumber(this.totalAdditionaHealing)}</li>
          </ul>
        }
      >
        <TalentSpellText talent={TALENTS_EVOKER.REVERSION_TALENT}>
          <ItemHealingDone amount={this.totallHealing} />
          <br />
          <>
            {formatDuration(this.totalExtensionTime)} <small>additional duration from crits</small>
          </>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Reversion;
