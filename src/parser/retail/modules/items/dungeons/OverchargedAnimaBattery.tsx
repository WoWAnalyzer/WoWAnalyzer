import { formatPercentage } from 'common/format';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Haste from 'interface/icons/Haste';
import Uptime from 'interface/icons/Uptime';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import Buffs from 'parser/core/modules/Auras';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import { calculateSecondaryStatDefault } from 'parser/core/stats';
import STAT from 'parser/shared/modules/features/STAT';
import StatTracker from 'parser/shared/modules/StatTracker';
import BoringItemValueText from 'parser/ui/BoringItemValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class OverchargedAnimaBattery extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    statTracker: StatTracker,
    buffs: Buffs,
  };

  haste = 0;
  hastePercentGained = 0;

  protected abilities!: Abilities;
  protected statTracker!: StatTracker;
  protected buffs!: Buffs;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.OVERCHARGED_ANIMA_BATTERY.id);
    if (!this.active) {
      return;
    }

    const itemLevel = this.selectedCombatant.getItem(ITEMS.OVERCHARGED_ANIMA_BATTERY.id)?.itemLevel;
    this.haste = calculateSecondaryStatDefault(197, 344, itemLevel);

    (options.statTracker as StatTracker).add(SPELLS.OVERCHARGED_ANIMA_BATTERY_BUFF.id, {
      haste: this.haste,
    });

    (options.buffs as Buffs).add({
      spellId: SPELLS.OVERCHARGED_ANIMA_BATTERY_BUFF.id,
      timelineHighlight: true,
    });

    (options.abilities as Abilities).add({
      spell: SPELLS.OVERCHARGED_ANIMA_BATTERY_BUFF.id,
      category: SPELL_CATEGORY.ITEMS,
      cooldown: 90,
      gcd: null,
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.8,
      },
    });
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.OVERCHARGED_ANIMA_BATTERY_BUFF),
      this.applyHasteBuff,
    );
  }

  applyHasteBuff(event: ApplyBuffEvent) {
    this.hastePercentGained +=
      this.haste /
      this.statTracker.ratingNeededForNextPercentage(
        this.statTracker.currentHasteRating,
        this.statTracker.statBaselineRatingPerPercent[STAT.HASTE],
      );
  }

  get uptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.OVERCHARGED_ANIMA_BATTERY_BUFF.id) /
      this.owner.fightDuration
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <BoringItemValueText item={ITEMS.OVERCHARGED_ANIMA_BATTERY}>
          <Haste /> {formatPercentage(this.hastePercentGained * this.uptime)}%{' '}
          <small>average Haste</small>
          <br />
          <Uptime /> {formatPercentage(this.uptime)}% <small>Uptime</small>
        </BoringItemValueText>
      </Statistic>
    );
  }
}

export default OverchargedAnimaBattery;
