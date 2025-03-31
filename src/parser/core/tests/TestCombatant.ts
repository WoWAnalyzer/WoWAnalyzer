import Combatant from 'parser/core/Combatant';
import { TIERS } from 'game/TIERS';
import { Talent } from 'common/TALENTS/types';
import CombatLogParser from 'parser/core/CombatLogParser';
import { Buff, CombatantInfoEvent, Item } from 'parser/core/Events';

const defaultCombatantInfoEvent = {
  gear: [] as Item[],
  auras: [] as Buff[],
} as CombatantInfoEvent;

class TestCombatant extends Combatant {
  readonly #id = 1;

  constructor(parser: CombatLogParser) {
    super(parser, defaultCombatantInfoEvent);
  }

  get id(): number {
    return this.#id;
  }

  has4PieceByTier(tier: TIERS): boolean {
    return true;
  }

  hasBuff(): boolean {
    return true;
  }

  hasFinger(itemId: number): boolean {
    return true;
  }

  hasTalent(talent: Talent): boolean {
    return true;
  }
}

export default TestCombatant;
