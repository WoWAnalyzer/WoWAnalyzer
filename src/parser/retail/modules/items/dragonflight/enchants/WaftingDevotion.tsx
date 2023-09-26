import ENCHANTS from 'common/ITEMS/dragonflight/enchants';
import SPELLS from 'common/SPELLS/dragonflight/enchants';
import { formatDuration, formatPercentage } from 'common/format';
import { SpellLink } from 'interface';
import { HasteIcon, SpeedIcon } from 'interface/icons';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { Item } from 'parser/core/Events';
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

  private mainHandHaste = 0;
  private offhandHaste = 0;
  private mainhandSpeed = 0;
  private offhandSpeed = 0;

  constructor(options: Options & { statTracker: StatTracker }) {
    super(options);
    this.statTracker = options.statTracker;

    this.active = RANKS.some((effect) => this.selectedCombatant.hasWeaponEnchant(effect.enchant));

    if (!this.active) {
      return;
    }
    const { mainHand, offHand } = this.selectedCombatant;

    ({ haste: this.mainHandHaste, speed: this.mainhandSpeed } = this.getEnchantAmount(mainHand));
    ({ haste: this.offhandHaste, speed: this.offhandSpeed } = this.getEnchantAmount(offHand));

    this.statTracker.add(SPELLS.WAFTING_DEVOTION.id, {
      haste: this.mainHandHaste + this.offhandHaste,
      speed: this.offhandHaste + this.offhandSpeed,
    });
  }

  private getEnchantAmount(weapon: Item) {
    const rank = RANKS.find((effect) => effect.enchant.effectId === weapon.permanentEnchant);
    return {
      haste: rank?.haste || 0,
      speed: rank?.speed || 0,
    };
  }

  statistic() {
    const totalHaste = this.mainHandHaste + this.offhandHaste;
    const totalSpeed = this.mainhandSpeed + this.offhandSpeed;
    const totalProcs = this.selectedCombatant.getBuffTriggerCount(SPELLS.WAFTING_DEVOTION.id);
    const ppm = (totalProcs / (this.owner.fightDuration / 1000 / 60)).toFixed(1);
    const uptime = this.selectedCombatant.getBuffUptime(SPELLS.WAFTING_DEVOTION.id);
    const uptimePercentage = uptime / this.owner.fightDuration;
    const calculatedAverageHaste = Math.round(totalHaste * uptimePercentage);
    const calculatedAverageSpeed = Math.round(totalSpeed * uptimePercentage);

    const hasteExplanation =
      this.mainHandHaste !== 0 && this.offhandHaste !== 0 ? (
        <>
          <b>{Math.round(this.mainHandHaste)}</b> (main hand) +{' '}
          <b>{Math.round(this.offhandHaste)}</b> (off hand)
        </>
      ) : (
        <b>{Math.round(totalHaste)}</b>
      );

    const speedExplanation =
      this.mainhandSpeed !== 0 && this.offhandSpeed !== 0 ? (
        <>
          <b>{Math.round(this.mainhandSpeed)}</b> + <b>{Math.round(this.offhandSpeed)}</b>
        </>
      ) : (
        <b>{Math.round(totalSpeed)}</b>
      );

    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        position={STATISTIC_ORDER.UNIMPORTANT(1)}
        tooltip={
          <>
            <SpellLink spell={SPELLS.WAFTING_DEVOTION} /> triggered {totalProcs} times ({ppm} procs
            per minute). The buff gives {hasteExplanation} haste and {speedExplanation}. The buff
            had a total uptime of <b>{formatDuration(uptime)}</b>,{' '}
            {formatPercentage(uptimePercentage, 1)}% of the fight. This means over time you
            benefited an average of <b>{calculatedAverageHaste}</b> haste and{' '}
            <b>{calculatedAverageSpeed}</b> speed from this enchant.
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.WAFTING_DEVOTION}>
          <div>
            <HasteIcon /> {calculatedAverageHaste} <small>haste over time</small>
          </div>
          <div>
            <SpeedIcon /> {calculatedAverageSpeed} <small>speed over time</small>
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default WaftingDevotion;
