import { formatNumber } from 'common/format';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ChangeBuffStackEvent, DamageEvent, Item } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import Buffs from 'parser/core/modules/Buffs';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import StatTracker from 'parser/shared/modules/StatTracker';
import BoringItemValueText from 'parser/ui/BoringItemValueText';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const COOLDOWN_SECONDS = 180 as const;

// Example logs here:
// https://www.warcraftlogs.com/reports/jD2bMCPfvJpFt6c8#type=damage-done&source=1&fight=3
// https://www.warcraftlogs.com/reports/ZBgnJDaWRQNKHwpG#fight=62&type=damage-done&source=969

/**
 * Tracks usage of Cache of Acquired Treasures - https://www.wowhead.com/item=188265/cache-of-acquired-treasures?bonus=6805
 */
class CacheOfAcquiredTreasures extends Analyzer {
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

  private readonly item: Item;

  axeDamage = 0;
  swordStacks = 0;
  wandDamage = 0;

  constructor(
    options: Options & {
      abilities: Abilities;
      buffs: Buffs;
      castEfficiency: CastEfficiency;
      statTracker: StatTracker;
    },
  ) {
    super(options);
    this.item = this.selectedCombatant.getItem(ITEMS.CACHE_OF_ACQUIRED_TREASURES.id)!;
    if (this.item == null) {
      this.active = false;
      return;
    }

    // Add the buffs to the buff tracker so that they show up in the timeline
    options.buffs.add({
      spellId: SPELLS.CACHE_OF_ACQUIRED_TREASURES_ACQUIRED_AXE_BUFF.id,
      timelineHighlight: true,
      triggeredBySpellId: SPELLS.CACHE_OF_ACQUIRED_TREASURES.id,
    });
    options.buffs.add({
      spellId: SPELLS.CACHE_OF_ACQUIRED_TREASURES_ACQUIRED_SWORD_BUFF.id,
      timelineHighlight: true,
      triggeredBySpellId: SPELLS.CACHE_OF_ACQUIRED_TREASURES.id,
    });
    // Add the main cast as an ability so that we can track cooldown and usage in timeline
    options.abilities.add({
      spell: SPELLS.CACHE_OF_ACQUIRED_TREASURES.id,
      category: Abilities.SPELL_CATEGORIES.ITEMS,
      cooldown: COOLDOWN_SECONDS,
      gcd: null,
      castEfficiency: {
        suggestion: false,
      },
    });

    // add event listeners
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell(SPELLS.CACHE_OF_ACQUIRED_TREASURES_ACQUIRED_AXE_DAMAGE),
      this.onAxeDamage,
    );
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell(SPELLS.CACHE_OF_ACQUIRED_TREASURES_ACQUIRED_WAND_DAMAGE),
      this.onWandDamage,
    );
    this.addEventListener(
      Events.changebuffstack
        .by(SELECTED_PLAYER)
        .spell(SPELLS.CACHE_OF_ACQUIRED_TREASURES_ACQUIRED_SWORD_BUFF),
      this.onBuffStackChange,
    );
  }

  onAxeDamage(event: DamageEvent) {
    this.axeDamage += event.amount;
  }

  onBuffStackChange(event: ChangeBuffStackEvent) {
    if (event.stacksGained > 0) {
      this.swordStacks += event.stacksGained;
    }
  }

  onWandDamage(event: DamageEvent) {
    this.wandDamage += event.amount;
  }

  statistic() {
    const { casts, maxCasts } = this.getCastEfficiency();
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <BoringItemValueText item={ITEMS.CACHE_OF_ACQUIRED_TREASURES}>
          {casts} Uses <small>{maxCasts} possible</small>
        </BoringItemValueText>
        <BoringSpellValueText spellId={SPELLS.CACHE_OF_ACQUIRED_TREASURES_ACQUIRED_AXE_DAMAGE.id}>
          <ItemDamageDone amount={this.axeDamage} />
        </BoringSpellValueText>
        <BoringSpellValueText spellId={SPELLS.CACHE_OF_ACQUIRED_TREASURES_ACQUIRED_WAND_DAMAGE.id}>
          <ItemDamageDone amount={this.wandDamage} />
        </BoringSpellValueText>
        <BoringSpellValueText spellId={SPELLS.CACHE_OF_ACQUIRED_TREASURES_ACQUIRED_SWORD_BUFF.id}>
          {formatNumber(this.swordStacks)} stacks acquired
        </BoringSpellValueText>
      </Statistic>
    );
  }

  private getCastEfficiency() {
    return (
      this.castEfficiency.getCastEfficiencyForSpellId(SPELLS.CACHE_OF_ACQUIRED_TREASURES.id) ?? {
        casts: 0,
        maxCasts: 0,
      }
    );
  }
}

export default CacheOfAcquiredTreasures;
