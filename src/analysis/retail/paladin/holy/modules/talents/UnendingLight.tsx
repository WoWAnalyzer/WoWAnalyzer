import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  BeaconHealEvent,
  GetRelatedEvents,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { formatNumber, formatPercentage } from 'common/format';
import { UNENDING_LIGHT } from '../../normalizers/EventLinks/EventLinkConstants';
import SpellLink from 'interface/SpellLink';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import { UNENDING_LIGHT_INCREASE } from '../../constants';

class UnendingLight extends Analyzer {
  unendingLightLightOfDawns: number[] = [];
  spentAtStacks: number[] = [];

  healingDone = 0;
  overhealing = 0;

  healingTransfered = 0;
  beaconOverhealing = 0;

  currentStacks = 0;
  currentApply = 0;
  wastedStacks = 0;

  constructor(args: Options) {
    super(args);
    this.active = this.selectedCombatant.hasTalent(TALENTS.UNENDING_LIGHT_TALENT);

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.UNENDING_LIGHT_BUFF),
      this.onRemove,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.UNENDING_LIGHT_BUFF),
      this.onApplyStack,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.UNENDING_LIGHT_BUFF),
      this.onApply,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.UNENDING_LIGHT_BUFF),
      this.onRefresh,
    );

    this.addEventListener(Events.beacontransfer.by(SELECTED_PLAYER), this.onBeaconTransfer);
  }

  onRefresh(event: RefreshBuffEvent) {
    if (this.currentApply !== event.timestamp) {
      this.wastedStacks += 1;
    }
  }

  onApply(event: ApplyBuffEvent) {
    this.currentStacks = 1;
    this.currentApply = event.timestamp;
  }

  onApplyStack(event: ApplyBuffStackEvent) {
    this.currentStacks += 1;
    this.currentApply = event.timestamp;
  }

  onRemove(event: RemoveBuffEvent) {
    const events = GetRelatedEvents<HealEvent>(event, UNENDING_LIGHT);
    for (const heal of events) {
      this.unendingLightLightOfDawns.push(heal.timestamp);
      this.healingDone += calculateEffectiveHealing(
        heal,
        this.currentStacks * UNENDING_LIGHT_INCREASE,
      );
      this.overhealing += calculateOverhealing(heal, this.currentStacks * UNENDING_LIGHT_INCREASE);
    }
    this.spentAtStacks.push(this.currentStacks);
    this.currentStacks = 0;
  }

  onBeaconTransfer(event: BeaconHealEvent) {
    const spellId = event.originalHeal.ability.guid;
    if (spellId !== SPELLS.LIGHT_OF_DAWN_HEAL.id) {
      return;
    }
    if (this.unendingLightLightOfDawns.includes(event.originalHeal.timestamp)) {
      this.healingTransfered += event.amount + (event.absorbed || 0);
      this.beaconOverhealing += event.overheal || 0;
    }
  }

  get totalHealing() {
    return this.healingDone + this.healingTransfered;
  }

  get totalOverhealing() {
    return this.overhealing + this.beaconOverhealing;
  }

  get averageStacks() {
    return this.spentAtStacks.reduce((sum, s) => sum + s, 0) / this.spentAtStacks.length;
  }

  get averageHealingIncrease() {
    return this.averageStacks * UNENDING_LIGHT_INCREASE;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(6)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Effective Healing: {formatNumber(this.totalHealing)} <br />
            <ul>
              <li>
                <SpellLink spell={SPELLS.BEACON_OF_LIGHT_CAST_AND_BUFF} /> Healing:{' '}
                {formatNumber(this.healingTransfered)}
              </li>
            </ul>
            Overhealing: {formatNumber(this.totalOverhealing)} <br />
            Wasted Stacks: {formatNumber(this.wastedStacks)} <br />
            <br />
            Average Stacks Spent: {formatNumber(this.averageStacks)} <br />
            Average Healing Increase: {formatPercentage(this.averageHealingIncrease)}%
          </>
        }
      >
        <TalentSpellText talent={TALENTS.UNENDING_LIGHT_TALENT}>
          <ItemHealingDone amount={this.totalHealing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default UnendingLight;
