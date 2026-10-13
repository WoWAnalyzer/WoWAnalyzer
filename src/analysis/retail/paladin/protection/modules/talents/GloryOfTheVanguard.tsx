import SPELLS from 'common/SPELLS/paladin';
import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffStackEvent,
  HasRelatedEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import { VANGUARD_CONSUMED_BY } from '../../normalizers/VanguardLinkNormalizer';

export default class GloryOfTheVanguard extends Analyzer {
  gained = 0;
  used = 0;
  lostInWings = 0;
  lost: { timestamp: number; count: number }[] = [];

  private stacks = 0;
  private sawWings = false;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(
      TALENTS.GLORY_OF_THE_VANGUARD_1_PROTECTION_TALENT,
    );

    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.VANGUARD_BUFF),
      this.onApply,
    );
    this.addEventListener(
      Events.applybuffstack.to(SELECTED_PLAYER).spell(SPELLS.VANGUARD_BUFF),
      this.onApplyStack,
    );
    this.addEventListener(
      Events.removebuffstack.to(SELECTED_PLAYER).spell(SPELLS.VANGUARD_BUFF),
      this.onRemoveStack,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.VANGUARD_BUFF),
      this.onRemove,
    );
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell([TALENTS.AVENGING_WRATH_TALENT, SPELLS.SENTINEL]),
      this.onWings,
    );
  }

  get lostCount() {
    return this.lost.reduce((total, lost) => total + lost.count, 0);
  }

  private get inWings() {
    return (
      this.selectedCombatant.hasBuff(TALENTS.AVENGING_WRATH_TALENT.id) ||
      this.selectedCombatant.hasBuff(SPELLS.SENTINEL.id)
    );
  }

  private onApply() {
    this.gained += 1;
    this.stacks = 1;
    this.sawWings = this.inWings;
  }

  private onApplyStack(event: ApplyBuffStackEvent) {
    this.gained += Math.max(0, event.stack - this.stacks);
    this.stacks = event.stack;
  }

  private onRemoveStack(event: RemoveBuffStackEvent) {
    this.used += Math.max(0, this.stacks - event.stack);
    this.stacks = event.stack;
  }

  private onRemove(event: RemoveBuffEvent) {
    let count = this.stacks;
    this.stacks = 0;
    if (count > 0 && HasRelatedEvent(event, VANGUARD_CONSUMED_BY)) {
      this.used += 1;
      count -= 1;
    }
    if (count <= 0) {
      return;
    }
    if (this.sawWings || this.inWings) {
      this.lostInWings += count;
    } else {
      this.lost.push({ timestamp: event.timestamp, count });
    }
  }

  private onWings() {
    this.sawWings = true;
  }
}
