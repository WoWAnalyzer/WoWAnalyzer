import Combatant from 'parser/core/Combatant';
import { TIERS } from 'game/TIERS';
import { Talent } from 'common/TALENTS/types';
import SPECS from 'game/SPECS';
import CombatLogParser from 'parser/core/CombatLogParser';
import { Buff, CombatantInfoEvent, Item } from 'parser/core/Events';

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const defaultCombatantInfoEvent = {
  gear: [] as Item[],
  auras: [] as Buff[],
} as CombatantInfoEvent;

class TestCombatant extends Combatant {
  constructor(parser: CombatLogParser) {
    super(parser, defaultCombatantInfoEvent);
  }

  get id(): number {
    return 1;
  }

  get spec() {
    return SPECS.AFFLICTION_WARLOCK;
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
