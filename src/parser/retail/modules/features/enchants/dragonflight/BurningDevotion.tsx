import ITEMS from 'common/ITEMS/dragonflight/enchants';
import SPELLS from 'common/SPELLS/dragonflight/enchants';
import { formatNumber } from 'common/format';
import { PlusIcon } from 'interface/icons';
import Analyzer, { SELECTED_PLAYER, type Options } from 'parser/core/Analyzer';
import Events, { type HealEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';

// ================ SAMPLE LOGS ================
// Burning Devotion R1
// https://www.warcraftlogs.com/reports/WvnxHDbNrj4C7ZV8#fight=33&type=summary&source=291
// Burning Devotion R2
// https://www.warcraftlogs.com/reports/Z2BfgTVkqM1XWDAh#fight=8&type=summary&source=108
// Burning Devotion R3
// https://www.warcraftlogs.com/reports/YjCz1Gw2JqmWc3Ng#fight=4&type=summary&source=3

const RANKS = [
  ITEMS.ENCHANT_WEAPON_BURNING_DEVOTION_R1,
  ITEMS.ENCHANT_WEAPON_BURNING_DEVOTION_R2,
  ITEMS.ENCHANT_WEAPON_BURNING_DEVOTION_R3,
];

class BurningDevotion extends Analyzer {
  private healCount = 0;
  private totalHeal = 0;

  constructor(options: Options) {
    super(options);

    this.active = RANKS.some((enchant) => this.selectedCombatant.hasWeaponEnchant(enchant));

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

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        position={STATISTIC_ORDER.UNIMPORTANT(1)}
        tooltip={
          <span>
            Burning devotion triggered <strong>{this.healCount}</strong> times, healing for a total
            of <strong>{formatNumber(this.totalHeal)}</strong>.
          </span>
        }
      >
        <BoringSpellValueText spell={SPELLS.BURNING_DEVOTION_HEAL}>
          <PlusIcon /> {this.owner.formatItemHealingDone(this.totalHeal)}
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default BurningDevotion;
