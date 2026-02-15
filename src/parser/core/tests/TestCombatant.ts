import { FullCombatant } from 'parser/core/Combatant';
import { TIERS } from 'game/TIERS';
import { Talent } from 'common/TALENTS/types';
import CombatLogParser from 'parser/core/CombatLogParser';
import { Buff, CombatantInfoEvent, Item } from 'parser/core/Events';
import { PlayerDetails } from '../Player';

const defaultCombatantInfoEvent = {
  gear: [] as Item[],
  auras: [] as Buff[],
} as CombatantInfoEvent;

const defaultPlayerDetails = {
  name: 'Test',
  className: 'Mage',
  specName: 'Frost',
} as PlayerDetails;

class TestCombatant extends FullCombatant {
  readonly #id = 1;

  constructor(parser: CombatLogParser) {
    super(parser, defaultPlayerDetails, defaultCombatantInfoEvent);
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
