import ITEMS from 'common/ITEMS/dragonflight/enchants';
import SPELLS from 'common/SPELLS/dragonflight/enchants';
import { SpellLink } from 'interface';
import { CriticalStrikeIcon } from 'interface/icons';
import Analyzer, { Options } from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';

// ================ SAMPLE LOGS ================
// Burning Writ R1
// https://www.warcraftlogs.com/reports/F1NPqhc49XdAnvtx#fight=6&type=summary&source=8
// Burning Writ R2
// https://www.warcraftlogs.com/reports/yPCgxp7ZYazdRtXk#fight=12&type=summary&source=122
// Burning Writ R3
// https://www.warcraftlogs.com/reports/4DZNxRHMbjdnW6QC#fight=21&type=summary&source=569

const RANKS = [
  {
    enchant: ITEMS.ENCHANT_WEAPON_BURNING_WRIT_R1,
    crit: 1185.67,
  },
  {
    enchant: ITEMS.ENCHANT_WEAPON_BURNING_WRIT_R2,
    crit: 1209.09,
  },
  {
    enchant: ITEMS.ENCHANT_WEAPON_BURNING_WRIT_R3,
    crit: 1394.51,
  },
];

class BurningWrit extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };
  protected statTracker!: StatTracker;

  private crit = 0;

  constructor(options: Options & { statTracker: StatTracker }) {
    super(options);
    this.statTracker = options.statTracker;

    this.active = RANKS.some((effect) => this.selectedCombatant.hasWeaponEnchant(effect.enchant));

    if (!this.active) {
      return;
    }
    const { mainHand, offHand } = this.selectedCombatant;

    [mainHand.permanentEnchant, offHand.permanentEnchant].forEach((enchantId) => {
      const effect = RANKS.find((e) => e.enchant.effectId === enchantId);
      if (effect) {
        this.crit += effect.crit;
      }
    });

    this.statTracker.add(SPELLS.BURNING_WRIT_BUFF.id, {
      crit: this.crit,
    });
  }

  statistic() {
    const totalProcs = this.selectedCombatant.getBuffTriggerCount(SPELLS.BURNING_WRIT_BUFF.id);
    const ppm = (totalProcs / (this.owner.fightDuration / 1000 / 60)).toFixed(1);
    const uptime =
      this.selectedCombatant.getBuffUptime(SPELLS.BURNING_WRIT_BUFF.id) / this.owner.fightDuration;

    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        position={STATISTIC_ORDER.UNIMPORTANT(1)}
        tooltip={
          <>
            <SpellLink spell={SPELLS.BURNING_WRIT_BUFF} /> triggered {totalProcs} times ({ppm} procs
            per minute), giving {Math.round(this.crit)} crit every time.
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.BURNING_WRIT_BUFF}>
          <CriticalStrikeIcon /> {Math.round(this.crit * uptime)} <small>crit on average</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default BurningWrit;
