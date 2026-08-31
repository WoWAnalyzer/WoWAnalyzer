import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import { Options } from 'parser/core/Module';
import CoreStatTracker from 'parser/shared/modules/StatTracker';

import { DEEP_HEALING_BONUS_SPELLPOINTS } from '../../constants';

/**
 * Mastery is stored as spellpoints; the displayed percentage is
 * `spellpoints * spec.masteryCoefficient` (3 for Restoration Shaman).
 *
 * The CoreStatTracker knows about the 8 baseline spellpoints and everything gained from
 * mastery *rating*, but its buff system is expressed purely in rating, so it has no way to
 * represent auras that grant flat spellpoints.
 *
 * Nominal values on the ingame tooltip:
 * Class TALENT: Spiritual Awakening +3%
 * Hero TALENT (Totemic): Elemental Attunement +2%
 * Skyfury BUFF: +2%
 *
 * Translates to ingame reality:
 * BASE:                  (8) * 3     = 24%
 * Spiritual Awakening:   (8 + 3) * 3 = 33%
 * Elemental Attunement:  (8 + 2) * 3 = 30%
 * Skyfury:               (8 + 2) * 3 = 30%
 * SA + EA + Skyfury:     (8 + 7) * 3 = 45%
 */
class StatTracker extends CoreStatTracker {
  /** Spellpoints from passives that are up for the whole fight. */
  protected passiveMasterySpellpoints = 0;

  constructor(options: Options) {
    super(options);
    //Optional class tree talent
    if (this.selectedCombatant.hasTalent(TALENTS.SPIRITUAL_AWAKENING_TALENT)) {
      this.passiveMasterySpellpoints += DEEP_HEALING_BONUS_SPELLPOINTS.SPIRITUAL_AWAKENING;
    }
    //Mandatory totemic hero tree talent
    if (this.selectedCombatant.hasTalent(TALENTS.ELEMENTAL_ATTUNEMENT_TALENT)) {
      this.passiveMasterySpellpoints += DEEP_HEALING_BONUS_SPELLPOINTS.ELEMENTAL_ATTUNEMENT;
    }
  }

  get innateMasteryPercentage(): number {
    return this.baseMasteryPercentage;
  }

  /** Spellpoints from talents and buffs, at the currently processed event. */
  get bonusMasterySpellpoints(): number {
    const skyfury = this.selectedCombatant.hasBuff(SPELLS.SKYFURY.id)
      ? DEEP_HEALING_BONUS_SPELLPOINTS.SKYFURY
      : 0;
    return this.passiveMasterySpellpoints + skyfury;
  }

  override get baseMasteryPercentage(): number {
    const coefficient = this.selectedCombatant.spec?.masteryCoefficient ?? 3;
    return super.baseMasteryPercentage + (this.bonusMasterySpellpoints * coefficient) / 100;
  }

  /**
 * Mastery percentage coming from mastery *rating* — gear, gems, enchants, food, flask, procs.
 *
  get gearMasteryPercentage(): number {
    return this.currentMasteryPercentage - this.baseMasteryPercentage;
  }
 *
 * Clamped at 0: WCL reports catalyst items with the secondary stats of the original tier drop,
 * so combatantinfo can report 0 mastery rating for a character that has it. That makes the
 * rating side of this subtraction go negative. Remove the clamp once WCL is fixed.
 * https://www.warcraftlogs.com/reports/bRVvBpZNyJ4LmFGr/?fight=55&type=summary&source=3
 */
  get gearMasteryPercentage(): number {
    return Math.max(0, this.currentMasteryPercentage - this.baseMasteryPercentage);
  }
}

export default StatTracker;
