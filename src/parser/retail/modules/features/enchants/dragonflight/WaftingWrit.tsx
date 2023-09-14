import ENCHANTS from 'common/ITEMS/dragonflight/enchants';
import SPELLS from 'common/SPELLS/dragonflight/enchants';
import { SpellLink } from 'interface';
import { HasteIcon } from 'interface/icons';
import Analyzer, { Options } from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';

// ================ SAMPLE LOGS ================
// Wafting Writ R1
// https://www.warcraftlogs.com/reports/hwGB9JHC7PLRfZMK#fight=12&type=summary&source=23
// Wafting Writ R2
// https://www.warcraftlogs.com/reports/Wx8mLFCKT67dwGP3#fight=3&type=summary&source=47
// Wafting Writ R3
// https://www.warcraftlogs.com/reports/rxR13mGzY4WkH2QN#fight=7&type=summary&source=139

// Define an array of enchant effects
const RANKS = [
  {
    enchant: ENCHANTS.ENCHANT_WEAPON_WAFTING_WRIT_R1,
    haste: 1185.67,
  },
  {
    enchant: ENCHANTS.ENCHANT_WEAPON_WAFTING_WRIT_R2,
    haste: 1209.09,
  },
  {
    enchant: ENCHANTS.ENCHANT_WEAPON_WAFTING_WRIT_R3,
    haste: 1394.51,
  },
];

class WaftingWrit extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };
  protected statTracker!: StatTracker;

  private haste = 0;

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
        this.haste += effect.haste;
      }
    });

    this.statTracker.add(SPELLS.WAFTING_WRIT.id, {
      haste: this.haste,
    });
  }

  statistic() {
    const totalProcs = this.selectedCombatant.getBuffTriggerCount(SPELLS.WAFTING_WRIT.id);
    const ppm = (totalProcs / (this.owner.fightDuration / 1000 / 60)).toFixed(1);
    const uptime =
      this.selectedCombatant.getBuffUptime(SPELLS.WAFTING_WRIT.id) / this.owner.fightDuration;

    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        position={STATISTIC_ORDER.UNIMPORTANT(1)}
        tooltip={
          <>
            <SpellLink spell={SPELLS.WAFTING_WRIT} /> triggered {totalProcs} times ({ppm} procs per
            minute), giving {Math.round(this.haste)} haste every time.
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.WAFTING_WRIT}>
          <HasteIcon /> {Math.round(this.haste * uptime)} <small>haste on average</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default WaftingWrit;
