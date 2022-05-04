import { formatNumber } from 'common/format';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import { ItemLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  DamageEvent,
  HealEvent,
  Item,
} from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import Buffs from 'parser/core/modules/Buffs';
import { calculateSecondaryStatDefault } from 'parser/core/stats';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import StatTracker from 'parser/shared/modules/StatTracker';
import BoringItemValueText from 'parser/ui/BoringItemValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { ReactNode } from 'react';

const COOLDOWN_SECONDS = 120 as const;
const CAST: Spell = SPELLS.SOULLETTING_RUBY_CAST;
const HEAL: Spell = SPELLS.SOULLETTING_RUBY_HEAL;
const BUFF: Spell = SPELLS.SOULLETTING_RUBY_BUFF;

// We got the ratio between the guaranteed base and the dynamic part of the crit rating from simc data
// https://github.dev/simulationcraft/simc/blob/e718ffa2a052facfe07f450d34377589abc0e049/engine/dbc/generated/sc_spell_data.inc#L41795-L41796
const baseRatio = 1.926421 as const;
const dynamicRatio = 2.464831 as const;

// Get the total maximum crit rating from a sample item
// https://wowhead.com/item=178809/soulletting-ruby?ilvl=223
const sample = {
  ilvl: 223,
  criticalStrike: 875,
} as const;

const calculateCritRating = (ilvl: number) => {
  const totalCrit = calculateSecondaryStatDefault(sample.ilvl, sample.criticalStrike, ilvl);
  const v = totalCrit / (baseRatio + dynamicRatio);

  return {
    base: v * baseRatio,
    dynamic: v * dynamicRatio,
  };
};

/**
 * ### Example Logs:
 *
 * - https://www.warcraftlogs.com/reports/V3RndD8QGmzrJHhB#fight=5&type=damage-done&source=99
 * - https://www.warcraftlogs.com/reports/fZGa6X23CWbm9v8B#fight=9&type=damage-done&source=360
 */
class SoullettingRuby extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    buffs: Buffs,
    castEfficiency: CastEfficiency,
    statTracker: StatTracker,
  };
  protected abilities!: Abilities;
  protected buffs!: Buffs;
  protected castEfficiency!: CastEfficiency;
  protected statTracker!: StatTracker;

  crit: Readonly<{
    base: number;
    dynamic: number;
  }> = {
    base: -1,
    dynamic: -1,
  };
  item: Item;

  /** The percentages of all enemies that has been damaged */
  // TODO: I'm sure there's some module that tracks this for me??
  enemyHealths: { [key: string]: number } = {};
  healedAmount = 0;
  /** Each entry is the crit value of a particular instance of the buff */
  casts: Array<{
    // Is it possible to get the enemys name here? To be able to display all casts
    enemyHpPercent: number;
  }> = [];
  appliedBuffs: number[] = [];

  constructor(
    options: Options & {
      abilities: Abilities;
      buffs: Buffs;
      castEfficiency: CastEfficiency;
      statTracker: StatTracker;
    },
  ) {
    super(options);

    this.item = this.selectedCombatant.getItem(ITEMS.SOULLETTING_RUBY.id)!;
    if (this.item == null) {
      this.active = false;
      return;
    }

    this.crit = calculateCritRating(this.item.itemLevel);

    // This value needs to update with every use of the trinket, we
    // just set it to the lowest possible value to start with.
    options.statTracker.add(BUFF.id, {
      crit: this.crit.base,
    });

    // Add buff to show up in timeline
    options.buffs.add({
      spellId: BUFF.id,
      timelineHighlight: true,
      triggeredBySpellId: CAST.id,
    });

    // Add cast as an ability to show effective usage and cooldown in timeline
    options.abilities.add({
      spell: CAST.id,
      category: Abilities.SPELL_CATEGORIES.ITEMS,
      cooldown: COOLDOWN_SECONDS,
      gcd: null,
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.8,
      },
    });

    this.addEventListener(Events.damage, this.onDamage);
    this.addEventListener(Events.cast.spell(CAST).by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.heal.spell(HEAL).to(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(Events.applybuff.spell(BUFF).to(SELECTED_PLAYER), this.onBuff);
  }

  /** Tracks health of all enemies so that we know the percentage when the trinket is used. */
  onDamage(event: DamageEvent) {
    if (
      event.targetID == null ||
      // Don't know if damage to friends can show up here.
      event.targetIsFriendly ||
      event.hitPoints == null ||
      event.maxHitPoints == null
    ) {
      return;
    }

    const targetString = encodeTargetString(event.targetID, event.targetInstance);
    this.enemyHealths[targetString] = event.hitPoints / event.maxHitPoints;
  }

  /** When cast, figure out the multiplier of the buff we will gain later */
  onCast(event: CastEvent) {
    if (event.targetID == null) {
      console.error('SoullettingRuby: targetID is null');
      return;
    }

    const targetString = encodeTargetString(event.targetID, event.targetInstance);
    /** Enemy health percentage as fraction (0.4 === 40%) */
    const enemyHpPercent = this.enemyHealths[targetString];

    this.casts.push({
      enemyHpPercent,
    });

    // Update statTracker so that the next buff will have the correct crit value
    this.statTracker.update(BUFF.id, {
      crit: this.calculateBuffValue(enemyHpPercent).total,
    });
  }

  /** We can track how much you heal because why not */
  onHeal(event: HealEvent) {
    this.healedAmount += (event.amount || 0) * (event.absorbed || 0);
  }

  /** Once we get the buff, track it. Using the multiplier we calculated on the cast */
  onBuff(event: ApplyBuffEvent) {
    const { enemyHpPercent } = this.casts[this.casts.length - 1] || { enemyHpPercent: -1 };

    const { base, dynamic, total } = this.calculateBuffValue(enemyHpPercent);

    console.log(`Buffing with (${base.toFixed()} + ${dynamic.toFixed()}) ${total.toFixed()}`);

    this.appliedBuffs.push(total);
  }

  calculateBuffValue(enemyHpPercent: number) {
    // https://github.dev/simulationcraft/simc/blob/e718ffa2a052facfe07f450d34377589abc0e049/engine/player/unique_gear_shadowlands.cpp#L1034-L1035
    const bonusMultiplier = 1 - enemyHpPercent;

    const base = this.crit.base;
    const dynamic = this.crit.dynamic * bonusMultiplier;
    const total = base + dynamic;

    return {
      base,
      dynamic,
      total,
    };
  }

  private getCastEfficiency() {
    return this.castEfficiency.getCastEfficiencyForSpellId(CAST.id);
  }

  get averageBuffValues() {
    return this.appliedBuffs.reduce((a, b) => a + b, 0) / this.appliedBuffs.length;
  }

  statistic(): ReactNode {
    const { casts = 0, maxCasts = 0 } = this.getCastEfficiency() ?? {};

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(100)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            Using <ItemLink id={this.item.id} /> buffs you depending on the enemy's health
            <ul style={{ marginLeft: '-1.4em' }}>
              <li>
                {formatNumber(this.calculateBuffValue(1).total)} Critical Strike Rating when
                targeting an enemy with 100% health
              </li>
              <li>
                {formatNumber(this.calculateBuffValue(0).total)} Critical Strike Rating when
                targeting an enemy with 0% health
              </li>
            </ul>
          </>
        }
      >
        <BoringItemValueText item={this.item}>
          {casts} Uses <small>{maxCasts} possible</small>
        </BoringItemValueText>
        <div className="pad value">
          Average {this.averageBuffValues.toFixed(1)} <small>Critical Strike</small>
        </div>
      </Statistic>
    );
  }
}

export default SoullettingRuby;
