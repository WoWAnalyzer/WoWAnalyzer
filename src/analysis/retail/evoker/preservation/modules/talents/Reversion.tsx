import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import HIT_TYPES from 'game/HIT_TYPES';
import Analyzer from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, HealEvent, RefreshBuffEvent } from 'parser/core/Events';
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
import { TooltipElement } from 'interface';

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
  buffCount: number = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([TALENTS_EVOKER.REVERSION_TALENT, SPELLS.REVERSION_ECHO]),
      this.reversionHeal,
    );
    this.addEventListener(
      Events.applybuff
        .by(SELECTED_PLAYER)
        .spell([TALENTS_EVOKER.REVERSION_TALENT, SPELLS.REVERSION_ECHO]),
      this.onApply,
    );
    this.addEventListener(
      Events.refreshbuff
        .by(SELECTED_PLAYER)
        .spell([TALENTS_EVOKER.REVERSION_TALENT, SPELLS.REVERSION_ECHO]),
      this.onApply,
    );
  }

  get totalHealing() {
    return this.healing + this.absorbedHealing;
  }

  get totalAdditionalHealing() {
    return this.additionalAbsorbed + this.additionalHealing;
  }

  get averageExtension() {
    return this.totalExtensionTime / this.buffCount;
  }

  get averageDuration() {
    return (
      this.averageExtension +
      Number(this.hotTracker.hotInfo[TALENTS_EVOKER.REVERSION_TALENT.id].duration)
    );
  }

  onApply(event: ApplyBuffEvent | RefreshBuffEvent) {
    this.buffCount += 1;
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
            <li>Extra duration from crits: {formatDuration(this.totalExtensionTime)}</li>
            <li>Total healing from extensions: {formatNumber(this.totalAdditionalHealing)}</li>
          </ul>
        }
      >
        <TalentSpellText talent={TALENTS_EVOKER.REVERSION_TALENT}>
          <ItemHealingDone amount={this.totalHealing} />
          <br />
          <TooltipElement
            content={
              <>
                Each hot was extended by an average of {(this.averageExtension / 1000).toFixed(1)}{' '}
                seconds
              </>
            }
          >
            {(this.averageDuration / 1000).toFixed(1)}s <small>average HoT duration</small>
          </TooltipElement>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Reversion;
