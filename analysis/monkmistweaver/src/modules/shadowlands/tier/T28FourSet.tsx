import SPELLS from 'common/SPELLS';
import HIT_TYPES from 'game/HIT_TYPES';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, HealEvent, RemoveBuffEvent } from 'parser/core/Events';
import StatTracker from 'parser/shared/modules/StatTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { ABILITIES_AFFECTED_BY_FOUR_SET } from '../../../constants';

const boostAmount = 450;

class T28FourSet extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  protected statTracker!: StatTracker;

  tracking = false;
  spellToHealing: Map<number, HealingSet> = new Map();

  /**
   * After you cast Essence Font, Tiger Palm, Blackout Kick, and Rising Sun Kick heal an injured ally within 20 yards for 250% of the damage done. Lasts 15s.
   */
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has4Piece();

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.PRIMORDIAL_MENDING),
      this.enableTracking,
    );

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER | SELECTED_PLAYER_PET).spell(ABILITIES_AFFECTED_BY_FOUR_SET),
      this.calculateEffectiveHealing,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.PRIMORDIAL_MENDING),
      this.disableTracking,
    );
  }

  enableTracking(event: ApplyBuffEvent) {
    this.tracking = true;
  }

  calculateEffectiveHealing(event: HealEvent) {
    if (!this.tracking) {
      return;
    }

    let effectiveBoost = boostAmount;

    if (event.hitType === HIT_TYPES.CRIT) {
      effectiveBoost *= 2;
    }

    const currentVers = this.statTracker.currentVersatilityPercentage;

    effectiveBoost *= 1 + currentVers;

    const value = (event.overheal || 0) - effectiveBoost;

    const effective = Math.abs(Math.min(value, 0)) || 0;
    const overheal = effectiveBoost - effective || 0;

    let healingSet = this.spellToHealing.get(event.ability.guid);

    if (healingSet === undefined) {
      healingSet = {
        effectiveHealing: 0,
        overhealing: 0,
      };
      this.spellToHealing.set(event.ability.guid, healingSet);
    }

    healingSet.effectiveHealing += effective;
    healingSet.overhealing += overheal;
  }

  disableTracking(event: RemoveBuffEvent) {
    this.tracking = false;
  }

  statistic() {
    let effectiveHealingFromFourSet = 0;

    this.spellToHealing.forEach((value) => {
      effectiveHealingFromFourSet += value.effectiveHealing;
    });

    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(0)}
        category={STATISTIC_CATEGORY.ITEMS}
        dropdown={this.baseTable}
        tooltip={
          <>
            Duplicate spell entries are another aspect or source of the spell. IE Enveloping Mist
            can show up 3 times due to Fallen Order, Thunder Focus Tea, and Regular Enveloping Mist.
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.PRIMORDIAL_MENDING.id}>
          <>
            <ItemHealingDone amount={effectiveHealingFromFourSet} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  /** The dropdown table in the base form of this statistic */
  get baseTable(): React.ReactNode {
    // sort since it was asked for

    const sortedMap = new Map(
      [...this.spellToHealing].sort((a, b) => b[1].effectiveHealing - a[1].effectiveHealing),
    );

    return (
      <>
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Spell</th>
              <th>HPS</th>
            </tr>
          </thead>
          <tbody>
            {Array.from(sortedMap.keys()).map((value) => (
              <tr key={value}>
                <td>
                  <SpellLink id={value} />
                </td>
                <td>
                  {this.owner.getPerSecond(sortedMap.get(value)?.effectiveHealing || 0).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  }
}

type HealingSet = { effectiveHealing: number; overhealing: number };

export default T28FourSet;
