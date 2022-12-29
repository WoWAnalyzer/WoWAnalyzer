import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, {
  ApplyBuffEvent,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import BoringValueText from 'parser/ui/BoringValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from '../../constants';

const ENVELOPING_BREATH_BASE_DURATION = 6000;
const HOT_INCREASE_SPELLS = ABILITIES_AFFECTED_BY_HEALING_INCREASES;

class MistWrapEnvelopingBreath extends Analyzer {
  hotInfo: Map<string, HotInfo> = new Map<string, HotInfo>();

  effectiveHealing: number = 0;
  overHealing: number = 0;

  healingBoost: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.MIST_WRAP_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.ENVELOPING_BREATH_HEAL),
      this.addToMap,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.ENVELOPING_BREATH_HEAL),
      this.addToMap,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.ENVELOPING_BREATH_HEAL),
      this.hotRemoved,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ENVELOPING_BREATH_HEAL),
      this.hotHeal,
    );
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.genericHeal);
  }

  addToMap(event: ApplyBuffEvent | RefreshBuffEvent) {
    const GUID = this.makeGUID(event);
    this.hotInfo.set(GUID, {
      applyTimeStamp: event.timestamp,
      playerAppliedTo: GUID,
    });
  }

  hotRemoved(event: RemoveBuffEvent) {
    const GUID = this.makeGUID(event);
    this.hotInfo.delete(GUID);
  }

  hotHeal(event: HealEvent) {
    const GUID = this.makeGUID(event);
    // I didn't test if this is really needed but if it is then its most likely due to a tick healing before buff applied
    // which is something we already don't care about so its fine
    if (!this.hotInfo.has(GUID)) {
      return;
    }

    const appliedDate = this.hotInfo.get(GUID)?.applyTimeStamp || 0;
    if (appliedDate + ENVELOPING_BREATH_BASE_DURATION < event.timestamp) {
      this.effectiveHealing += event.amount + (event.absorbed || 0);
      this.overHealing += event.overheal || 0;
    }
  }

  genericHeal(event: HealEvent) {
    if (!HOT_INCREASE_SPELLS.includes(event.ability.guid)) {
      return;
    }

    const GUID = this.makeGUID(event);
    if (!this.hotInfo.has(GUID)) {
      return;
    }

    const appliedDate = this.hotInfo.get(GUID)?.applyTimeStamp || 0;
    if (appliedDate + ENVELOPING_BREATH_BASE_DURATION < event.timestamp) {
      this.healingBoost += calculateEffectiveHealing(event, 0.1);
    }
  }

  makeGUID(event: HealEvent | ApplyBuffEvent | RefreshBuffEvent | RemoveBuffEvent): string {
    // in theory, targetID is always defined here. in practice, covenant bugs (seed)
    return event.targetID?.toString() + (event.targetInstance || '');
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(20)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Total Healing:{' '}
            {(this.effectiveHealing + this.overHealing + this.healingBoost).toFixed(2)}
            <br />
            Effective Healing: {this.effectiveHealing.toFixed(2)}
            <br />
            Overhealing: {this.overHealing.toFixed(2)}
            <br />
            Healing Boost: {this.healingBoost.toFixed(2)}
          </>
        }
      >
        <BoringValueText
          label={
            <>
              <SpellLink id={SPELLS.ENVELOPING_BREATH_HEAL.id} /> gained from{' '}
              <SpellLink id={TALENTS_MONK.MIST_WRAP_TALENT.id} />
            </>
          }
        >
          <ItemHealingDone amount={this.effectiveHealing + this.healingBoost} />
        </BoringValueText>
      </Statistic>
    );
  }
}

export default MistWrapEnvelopingBreath;

type HotInfo = {
  applyTimeStamp: number;
  playerAppliedTo: string;
};
