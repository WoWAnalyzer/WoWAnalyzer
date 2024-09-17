import ITEMS from 'common/ITEMS/dragonflight/enchants';
import SPELLS from 'common/SPELLS/dragonflight/enchants';
import { formatNumber, formatPercentage } from 'common/format';
import { PlusIcon } from 'interface/icons';
import { SELECTED_PLAYER, type Options } from 'parser/core/Analyzer';
import Events, { type HealEvent } from 'parser/core/Events';
import WeaponEnchantAnalyzer from '../../WeaponEnchantAnalyzer';

// ================ SAMPLE LOGS ================
// Burning Devotion R1
// https://www.warcraftlogs.com/reports/WvnxHDbNrj4C7ZV8#fight=33&type=summary&source=291
// Burning Devotion R2
// https://www.warcraftlogs.com/reports/Z2BfgTVkqM1XWDAh#fight=8&type=summary&source=108
// Burning Devotion R3
// https://www.warcraftlogs.com/reports/YjCz1Gw2JqmWc3Ng#fight=4&type=summary&source=3

const RANKS = [
  { rank: 1, enchant: ITEMS.ENCHANT_WEAPON_BURNING_DEVOTION_R1 },
  { rank: 2, enchant: ITEMS.ENCHANT_WEAPON_BURNING_DEVOTION_R2 },
  { rank: 3, enchant: ITEMS.ENCHANT_WEAPON_BURNING_DEVOTION_R3 },
];

class BurningDevotion extends WeaponEnchantAnalyzer {
  private healCount = 0;
  private totalHeal = 0;

  constructor(options: Options) {
    super(SPELLS.BURNING_DEVOTION_ENCHANT, RANKS, options);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.BURNING_DEVOTION_HEAL),
      this.onHeal,
    );
  }

  private onHeal(event: HealEvent) {
    this.healCount += 1;
    this.totalHeal += event.amount + (event.absorbed || 0);
  }

  protected statisticParts() {
    return {
      tooltip: (
        <>
          {this.procCount(this.healCount)}, healing for a total of{' '}
          <strong>{formatNumber(this.totalHeal)}</strong>.
        </>
      ),
      content: (
        <>
          <PlusIcon /> {formatNumber(this.owner.getPerSecond(this.totalHeal))} HPS{' '}
          <small>
            {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.totalHeal))}%
          </small>
        </>
      ),
    };
  }
}

export default BurningDevotion;
