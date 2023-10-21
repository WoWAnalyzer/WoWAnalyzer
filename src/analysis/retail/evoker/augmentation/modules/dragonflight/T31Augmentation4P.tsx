import SPELLS from 'common/SPELLS/evoker';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  DamageEvent,
  HasRelatedEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Combatants from 'parser/shared/modules/Combatants';
import { TIERS } from 'game/TIERS';
import { TREMBLING_EARTH_DAM_LINK } from '../normalizers/CastLinkNormalizer';
import Soup from 'interface/icons/Soup';
import { SpellLink } from 'interface';
import { InformationIcon } from 'interface/icons';
import {
  SANDS_OF_TIME_CRIT_MOD,
  TREMBLING_EARTH_EXTENSION_MS,
  TREMBLING_EART_STACK_LIMIT,
} from '../../constants';
import StatTracker from 'parser/shared/modules/StatTracker';
import { formatNumber } from 'common/format';
import { Trans } from '@lingui/macro';
import DonutChart from 'parser/ui/DonutChart';

/**
 * (4) Set Augmentation: Casting Prescience enhances your next
 * Eruption with smaller fissures for each Prescience you have
 * active, each dealing (110% of Spell power) damage and extending Ebon Might by 0.2 sec.
 *
 * So basicly, whenever you cast Prescience, you can a stacking buff for each Prescience you have active.
 * Currently this maxes out at 5 stacks.
 *
 * The way it functions is that if you imagine you have 0 Prescience active:
 * You cast Prescience and now you gain 1 stack of Trembling Earth(4pc buff) and have 1 active Prescience.
 * Now you cast Prescience again, you gain 2 more stacks of Trembling Earth, and have 2 active Prescience.
 * Now you cast Prescience again, you gain 3 more stacks of Trembling Earth, but since it caps at 5, you
 * waste one of the stacks.
 *
 * The stack behaviour is not reflected properly in logs due to when you gain the inital buff, it will count as
 * 1 stack regardless of the amount of stacks you actually gained. There relying on the proper count from events
 * is not viable.
 * This could be solved with a normalizer, but since we want to count the overflow manually as well we would already
 * be trying to manually figure out the amount of stacks we should be getting, which would result in double work.
 * So we will skip normalizing and simply deal with all the logic needed here.
 */
class T31Augmentation4P extends Analyzer {
  static dependencies = {
    stats: StatTracker,
    combatants: Combatants,
  };
  protected stats!: StatTracker;
  protected combatants!: Combatants;

  ampedDamage: number = 0;

  currentTremblingStacks: number = 0;

  wastedBuffStacks: number = 0;
  overcappedBuffStacks: number = 0;
  effectiveBuffStacks: number = 0;

  effectiveExtension: number = 0;
  wastedExtension: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has4PieceByTier(TIERS.T31);

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.TREMBLING_EARTH_BUFF),
      (event) => {
        this.onRemoveBuff(event);
      },
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.TREMBLING_EARTH_DAM),
      (event) => {
        this.onDamage(event);
      },
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.TREMBLING_EARTH_BUFF),
      (event) => {
        this.onBuffApply(event);
      },
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.TREMBLING_EARTH_BUFF),
      (event) => {
        this.onBuffApply(event);
      },
    );
  }

  onBuffApply(event: ApplyBuffEvent | ApplyBuffStackEvent) {
    const players = Object.values(this.combatants.players);

    const prescienceActive = players.reduce((count, player) => {
      const hasBuff = player.hasBuff(
        SPELLS.PRESCIENCE_BUFF.id,
        event.timestamp,
        0,
        0,
        this.owner.playerId,
      );
      return hasBuff ? (count += 1) : count;
    }, 0);

    this.currentTremblingStacks += prescienceActive;

    const overcappedStacks = Math.max(0, this.currentTremblingStacks - TREMBLING_EART_STACK_LIMIT);

    this.overcappedBuffStacks += overcappedStacks;
    this.wastedExtension += this.calculateExtionsion(overcappedStacks);

    this.currentTremblingStacks = Math.min(this.currentTremblingStacks, TREMBLING_EART_STACK_LIMIT);
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    const extendValue = this.calculateExtionsion(this.currentTremblingStacks);
    if (!HasRelatedEvent(event, TREMBLING_EARTH_DAM_LINK)) {
      this.wastedExtension += extendValue;
      this.wastedBuffStacks += this.currentTremblingStacks;
      return;
    }

    if (this.selectedCombatant.hasBuff(SPELLS.EBON_MIGHT_BUFF_PERSONAL.id)) {
      this.effectiveExtension += extendValue;
    } else {
      this.wastedExtension += extendValue;
    }

    this.effectiveBuffStacks += this.currentTremblingStacks;
    this.currentTremblingStacks = 0;
  }

  calculateExtionsion(buffStacks: number): number {
    const critChance = this.stats.currentCritPercentage;
    const critMod = 1 + SANDS_OF_TIME_CRIT_MOD * critChance;

    const estimatedExtension = (critMod * TREMBLING_EARTH_EXTENSION_MS * buffStacks) / 1000;

    return estimatedExtension;
  }

  /** The 4pc damage has it's own spellId so this is nice and simple */
  onDamage(event: DamageEvent) {
    this.ampedDamage += event.amount + (event.absorbed ?? 0);
  }

  statistic() {
    const buffUsage = [
      {
        color: 'rgb(123,188,93)',
        label: 'Used',
        spellId: SPELLS.TREMBLING_EARTH_BUFF.id,
        valueTooltip: formatNumber(this.effectiveBuffStacks),
        value: this.effectiveBuffStacks,
      },
      {
        color: 'rgb(216,59,59)',
        label: 'Wasted',
        spellId: SPELLS.TREMBLING_EARTH_BUFF.id,
        valueTooltip: formatNumber(this.wastedBuffStacks),
        value: this.wastedBuffStacks,
      },
      {
        color: 'rgb(129, 52, 5)',
        label: 'Overcapped',
        spellId: SPELLS.TREMBLING_EARTH_BUFF.id,
        valueTooltip: formatNumber(this.overcappedBuffStacks),
        value: this.overcappedBuffStacks,
      },
    ];
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            <SpellLink spell={SPELLS.EBON_MIGHT_BUFF_EXTERNAL} />: The uptime provided is an
            estimate based on your current critical chance and may not be entirely accurate.
            <br />
            The total uptime wasted is a combination of both stacks that have been wasted or
            overcapped and Eruption casts that occurred outside of Ebon Might windows.
          </>
        }
      >
        <div className="pad boring-text">
          <label>Emerald Dream (T31 4pc Set Bonus)</label>
          <div className="value">
            <ItemDamageDone amount={this.ampedDamage} />
            <div>
              <Soup /> ~{this.effectiveExtension.toFixed(2)}s<small> uptime gained</small>
            </div>
            <div>
              <InformationIcon /> ~{this.wastedExtension.toFixed(2)}s<small> uptime wasted</small>
            </div>
          </div>
        </div>
        <div className="pad">
          <label>
            <Trans>Buff usage</Trans>
          </label>
          <DonutChart items={buffUsage} />
        </div>
      </Statistic>
    );
  }
}

export default T31Augmentation4P;
