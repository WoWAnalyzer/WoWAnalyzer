import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/warrior';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyDebuffEvent,
  ApplyDebuffStackEvent,
  CastEvent,
  EventType,
  RefreshBuffEvent,
  RemoveBuffStackEvent,
  RemoveDebuffEvent,
  RemoveDebuffStackEvent,
} from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import { currentStacks } from 'parser/shared/modules/helpers/Stacks';
import SpellUsable from '../features/SpellUsable';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';

/*  Example log:
 *  https://www.warcraftlogs.com/reports/vM8zdCPFhZkxfW3y?fight=45&type=casts&source=13
 *  https://www.warcraftlogs.com/reports/bzfPd1NBxRa9hG7n?fight=17&type=casts&source=15
 */
const ASHEN_JUGGERNAUT_DURATION = 15000;
const SUDDEN_DEATH_DURATION = 12000;
const BUFF_REFRESH_BUFFER = 3000;
const RAMPAGE_RAGE_COST = 80;
const MARKED_FOR_EXECUTION_STACK_THRESHOLD = 2;

// Track how many times Execute was used prematurely relative to its respective buff/debuffs

class SlayerExecute extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  overusedExecutes = 0;
  markedForExecutionStacks = 0;
  hasAshenJuggernaut = false;
  ashenJuggernautExpirationTimestamp = 0;
  suddenDeathExpirationTimestamp = 0;
  lastSuddenDeathRemoveBuffStackTimestamp = 0;
  ramWasAvailable = false; //rampage
  rbWasAvailable = false; //raging blow
  ajCount = 0;
  sdCount = 0;
  mfeCount = 0;
  availCount = 0;
  rawCount = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(talents.SLAYERS_DOMINANCE_TALENT);
    this.hasAshenJuggernaut = this.selectedCombatant.hasTalent(talents.ASHEN_JUGGERNAUT_TALENT);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.EXECUTE_FURY), this.onCast);

    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.MARKED_FOR_EXECUTION),
      this.onMarkedForExecutionStackChange,
    );
    this.addEventListener(
      Events.applydebuffstack.by(SELECTED_PLAYER).spell(SPELLS.MARKED_FOR_EXECUTION),
      this.onMarkedForExecutionStackChange,
    );
    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.MARKED_FOR_EXECUTION),
      this.onMarkedForExecutionStackChange,
    );
    this.addEventListener(
      Events.removedebuffstack.by(SELECTED_PLAYER).spell(SPELLS.MARKED_FOR_EXECUTION),
      this.onMarkedForExecutionStackChange,
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SUDDEN_DEATH_FURY_TALENT_BUFF),
      this.onSuddenDeathStackChange,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.SUDDEN_DEATH_FURY_TALENT_BUFF),
      this.onSuddenDeathStackChange,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.SUDDEN_DEATH_FURY_TALENT_BUFF),
      this.updateRemoveBuffStack,
    );
  }

  get suggestionThresholds() {
    return {
      actual: this.overusedExecutes,
      isGreaterThan: {
        minor: 0,
        average: 5,
        major: 12,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  onMarkedForExecutionStackChange(
    event: ApplyDebuffEvent | ApplyDebuffStackEvent | RemoveDebuffStackEvent | RemoveDebuffEvent,
  ) {
    this.markedForExecutionStacks = currentStacks(event);
  }

  updateRemoveBuffStack(event: RemoveBuffStackEvent) {
    this.lastSuddenDeathRemoveBuffStackTimestamp = event.timestamp;
  }

  onSuddenDeathStackChange(event: ApplyBuffEvent | RefreshBuffEvent) {
    // 2->1 stacks triggers refresh buff event, but doesn't extend duration
    // so ignore those
    // but we still want to listen to refreshbuff because
    // 2->2 stacks triggers a refresh event and extends duration
    if (
      event.type === EventType.RefreshBuff &&
      event.timestamp - this.lastSuddenDeathRemoveBuffStackTimestamp < 100
    ) {
      return;
    }
    this.suddenDeathExpirationTimestamp = event.timestamp + SUDDEN_DEATH_DURATION;
  }

  onCast(event: CastEvent) {
    let usedForAshenJuggernaut = false;
    let usedForSuddenDeath = false;
    let usedForMarkedForExecution = false;

    if (this.ashenJuggernautExpirationTimestamp - event.timestamp < BUFF_REFRESH_BUFFER) {
      usedForAshenJuggernaut = true;
    }
    // Assume new AJ duration on cast of Execute
    // which is true unless the execute is parried
    this.ashenJuggernautExpirationTimestamp = event.timestamp + ASHEN_JUGGERNAUT_DURATION;

    if (
      this.suddenDeathExpirationTimestamp - event.timestamp < BUFF_REFRESH_BUFFER ||
      this.selectedCombatant.getBuffStacks(SPELLS.SUDDEN_DEATH_FURY_TALENT_BUFF) === 2
    ) {
      usedForSuddenDeath = true;
    }

    if (this.markedForExecutionStacks >= MARKED_FOR_EXECUTION_STACK_THRESHOLD) {
      usedForMarkedForExecution = true;
    }

    let rage = 0;
    const rageResource = event.classResources?.find(
      (resource) => resource.type === RESOURCE_TYPES.RAGE.id,
    );
    if (!rageResource) {
      return;
    } else {
      rage = rageResource.amount / 10;
    }
    this.ramWasAvailable = rage > RAMPAGE_RAGE_COST;
    this.rbWasAvailable = this.spellUsable.isAvailable(SPELLS.RAGING_BLOW.id);

    if (
      !usedForAshenJuggernaut &&
      !usedForSuddenDeath &&
      !usedForMarkedForExecution &&
      (this.rbWasAvailable || this.ramWasAvailable)
    ) {
      this.overusedExecutes += 1;
      addInefficientCastReason(
        event,
        'Execute was used without high stacks of Marked for Execution, or when neither Ashen Juggernaut nor Sudden Death were near expiring',
      );
    }
  }
}

export default SlayerExecute;
