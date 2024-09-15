import ENCHANTS from 'common/ITEMS/dragonflight/enchants';
import SPELLS from 'common/SPELLS/dragonflight/enchants';
import { formatDuration, formatPercentage } from 'common/format';
import { HasteIcon, SpeedIcon } from 'interface/icons';
import { Options, withDependencies } from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';
import WeaponEnchantAnalyzer, { EnchantRank } from '../../WeaponEnchantAnalyzer';

// ================ SAMPLE LOGS ================
// Wafting Devotion R1
// https://www.warcraftlogs.com/reports/RbcAaJFL4H7G6fqy#fight=6&type=summary&source=117
// Wafting Devotion R2
// https://www.warcraftlogs.com/reports/9TxFbNHCGRmXQLyh#fight=1&type=summary&source=22
// Wafting Devotion R3
// https://www.warcraftlogs.com/reports/HBZCMDav3dTyXmgn#fight=3&type=summary&source=56

interface WaftingDevotionRank extends EnchantRank {
  haste: number;
  speed: number;
}

// Define an array of enchant effects
const RANKS: WaftingDevotionRank[] = [
  {
    rank: 1,
    enchant: ENCHANTS.ENCHANT_WEAPON_WAFTING_DEVOTION_R1,
    haste: 1465.25,
    speed: 466.52,
  },
  {
    rank: 2,
    enchant: ENCHANTS.ENCHANT_WEAPON_WAFTING_DEVOTION_R2,
    haste: 1603.35,
    speed: 511.08,
  },
  {
    rank: 3,
    enchant: ENCHANTS.ENCHANT_WEAPON_WAFTING_DEVOTION_R3,
    haste: 1743.14,
    speed: 555.78,
  },
];

const deps = { statTracker: StatTracker };

class WaftingDevotion extends withDependencies(WeaponEnchantAnalyzer<WaftingDevotionRank>, deps) {
  constructor(options: Options) {
    super(SPELLS.WAFTING_DEVOTION_ENCHANT, RANKS, options);

    if (!this.active) {
      return;
    }

    this.deps.statTracker.add(SPELLS.WAFTING_DEVOTION_BUFF.id, this.sumValues());
  }

  sumValues(): { haste: number; speed: number } {
    return {
      haste: (this.mainHand?.haste ?? 0) + (this.offHand?.haste ?? 0),
      speed: (this.mainHand?.speed ?? 0) + (this.offHand?.speed ?? 0),
    };
  }

  statisticParts() {
    const { haste, speed } = this.sumValues();
    const totalProcs = this.selectedCombatant.getBuffTriggerCount(SPELLS.WAFTING_DEVOTION_BUFF.id);
    const uptime = this.selectedCombatant.getBuffUptime(SPELLS.WAFTING_DEVOTION_BUFF.id);
    const uptimePercentage = uptime / this.owner.fightDuration;
    const calculatedAverageHaste = Math.round(haste * uptimePercentage);
    const calculatedAverageSpeed = Math.round(speed * uptimePercentage);

    const hasteExplanation =
      this.mainHand != null && this.offHand != null ? (
        <>
          <b>{Math.round(this.mainHand.haste)}</b> (main hand) +{' '}
          <b>{Math.round(this.offHand.haste)}</b> (off hand)
        </>
      ) : (
        <b>{Math.round(haste)}</b>
      );

    const speedExplanation =
      this.mainHand != null && this.offHand != null ? (
        <>
          <b>{Math.round(this.mainHand.speed)}</b> + <b>{Math.round(this.offHand.speed)}</b>
        </>
      ) : (
        <b>{Math.round(speed)}</b>
      );

    return {
      tooltip: (
        <>
          {this.procCount(totalProcs)}.
          <br />
          The buff gives {hasteExplanation} haste and {speedExplanation}. The buff had a total
          uptime of <b>{formatDuration(uptime)}</b>, {formatPercentage(uptimePercentage, 1)}% of the
          fight. This means over time you benefited an average of <b>{calculatedAverageHaste}</b>{' '}
          haste and <b>{calculatedAverageSpeed}</b> speed from this enchant.
        </>
      ),
      content: (
        <>
          <div>
            <HasteIcon /> {calculatedAverageHaste} <small>haste over time</small>
          </div>
          <div>
            <SpeedIcon /> {calculatedAverageSpeed} <small>speed over time</small>
          </div>
        </>
      ),
    };
  }
}

export default WaftingDevotion;
