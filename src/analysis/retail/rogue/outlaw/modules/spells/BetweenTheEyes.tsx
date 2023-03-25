import SPELLS from 'common/SPELLS';
import { TALENTS_ROGUE } from 'common/TALENTS/rogue';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, RemoveDebuffEvent, TargettedEvent } from 'parser/core/Events';
import getResourceSpent from 'parser/core/getResourceSpent';
import { encodeTargetString } from 'parser/shared/modules/Enemies';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const TIME_PER_CP_SPENT = 3000;
const BUFFER = 200;

class BetweenTheEyes extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  debuffInstances: { [targetString: string]: DebuffInstance } = {};

  protected hasImprovedBteTalent = this.selectedCombatant.hasTalent(
    TALENTS_ROGUE.IMPROVED_BETWEEN_THE_EYES_TALENT,
  );
  protected hasCtOTalent = this.selectedCombatant.hasTalent(TALENTS_ROGUE.COUNT_THE_ODDS_TALENT);
  protected hasGSWTalent = this.selectedCombatant.hasTalent(
    TALENTS_ROGUE.GREENSKINS_WICKERS_TALENT,
  );

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BETWEEN_THE_EYES),
      this.onCast,
    );
    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.BETWEEN_THE_EYES),
      this.onRemove,
    );
  }

  private onCast(event: CastEvent) {
    const cpsSpent = getResourceSpent(event, RESOURCE_TYPES.COMBO_POINTS);
    if (cpsSpent === 0 || !event.targetID) {
      return;
    }

    const target = encodeTargetString(event.targetID, event.targetInstance);
    const lastDebuffInstance = this.debuffInstances[target];
    const remainingTimeBeforeRefresh = lastDebuffInstance
      ? lastDebuffInstance.time - (event.timestamp - lastDebuffInstance.castTimestamp)
      : 0;

    this.debuffInstances[target] = {
      remainingBeforeRefresh: remainingTimeBeforeRefresh,
      castTimestamp: event.timestamp,
      time: cpsSpent * TIME_PER_CP_SPENT,
    };
  }

  private onRemove(event: RemoveDebuffEvent) {
    const target = encodeTargetString(event.targetID, event.targetInstance);
    delete this.debuffInstances[target];
  }

  getTimeRemaining(event: TargettedEvent<any>): number {
    const targetString = encodeTargetString(event.targetID, event.targetInstance);
    const debuffInstance = this.debuffInstances[targetString];

    if (!debuffInstance) {
      return 0;
    }

    const timeElapsed = event.timestamp - debuffInstance.castTimestamp;
    return timeElapsed > BUFFER
      ? debuffInstance.time - timeElapsed
      : debuffInstance.remainingBeforeRefresh;
  }
}

export default BetweenTheEyes;

interface DebuffInstance {
  castTimestamp: number;
  time: number;
  remainingBeforeRefresh: number;
}
