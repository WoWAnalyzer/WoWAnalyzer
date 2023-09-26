import ENCHANTS from 'common/ITEMS/dragonflight/enchants';
import SPELLS from 'common/SPELLS/dragonflight/enchants';
import { SpellLink } from 'interface';
import { HasteIcon, SpeedIcon } from 'interface/icons';
import Analyzer, { Options } from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';

// ================ SAMPLE LOGS ================
// Wafting Devotion R1
// https://www.warcraftlogs.com/reports/RbcAaJFL4H7G6fqy#fight=6&type=summary&source=117
// Wafting Devotion R2
// https://www.warcraftlogs.com/reports/9TxFbNHCGRmXQLyh#fight=1&type=summary&source=22
// Wafting Devotion R3
// https://www.warcraftlogs.com/reports/HBZCMDav3dTyXmgn#fight=3&type=summary&source=56

// Define an array of enchant effects
const RANKS = [
  {
    enchant: ENCHANTS.ENCHANT_WEAPON_WAFTING_DEVOTION_R1,
    haste: 1465.25,
    speed: 466.52,
  },
  {
    enchant: ENCHANTS.ENCHANT_WEAPON_WAFTING_DEVOTION_R2,
    haste: 1603.35,
    speed: 511.08,
  },
  {
    enchant: ENCHANTS.ENCHANT_WEAPON_WAFTING_DEVOTION_R3,
    haste: 1743.14,
    speed: 555.78,
  },
];

class WaftingDevotion extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };
  protected statTracker!: StatTracker;

  private haste = 0;
  private speed = 0;

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
        this.speed += effect.speed;
      }
    });

    this.statTracker.add(SPELLS.WAFTING_DEVOTION.id, {
      haste: this.haste,
      speed: this.speed,
    });
  }

  statistic() {
    const totalProcs = this.selectedCombatant.getBuffTriggerCount(SPELLS.WAFTING_DEVOTION.id);
    const ppm = (totalProcs / (this.owner.fightDuration / 1000 / 60)).toFixed(1);
    const uptime =
      this.selectedCombatant.getBuffUptime(SPELLS.WAFTING_DEVOTION.id) / this.owner.fightDuration;

    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        position={STATISTIC_ORDER.UNIMPORTANT(1)}
        tooltip={
          <>
            <SpellLink spell={SPELLS.WAFTING_DEVOTION} /> triggered {totalProcs} times ({ppm} procs
            per minute), giving {Math.round(this.haste)} haste and {Math.round(this.speed)} speed
            every time.
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.WAFTING_DEVOTION}>
          <div>
            <HasteIcon /> {Math.round(this.haste * uptime)} <small>haste on average</small>
          </div>
          <div>
            <SpeedIcon /> {Math.round(this.speed * uptime)} <small>speed on average</small>
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default WaftingDevotion;
