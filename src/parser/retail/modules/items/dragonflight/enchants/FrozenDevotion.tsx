import ITEMS from 'common/ITEMS/dragonflight/enchants';
import SPELLS from 'common/SPELLS/dragonflight/enchants';
import { formatNumber } from 'common/format';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import WeaponEnchantAnalyzer from '../../WeaponEnchantAnalyzer';

// ================ SAMPLE LOGS ================
// Frozen Devotion R1
// https://www.warcraftlogs.com/reports/jA1HZK479CQqFhya#fight=3&type=summary&source=26
// Frozen Devotion R2
// https://www.warcraftlogs.com/reports/Vtn6Fk2qRfhC1Wv3#fight=59&type=summary&source=957
// Frozen Devotion R3
// https://www.warcraftlogs.com/reports/FJQ28G6LgynCK9tj#fight=3&type=summary&source=164

const RANKS = [
  { rank: 1, enchant: ITEMS.ENCHANT_WEAPON_FROZEN_DEVOTION_R1 },
  { rank: 2, enchant: ITEMS.ENCHANT_WEAPON_FROZEN_DEVOTION_R2 },
  { rank: 3, enchant: ITEMS.ENCHANT_WEAPON_FROZEN_DEVOTION_R3 },
];

class FrozenDevotion extends WeaponEnchantAnalyzer {
  private procs: {
    timestamp: number;
    hits: number;
    damage: number;
  }[] = [];

  constructor(options: Options) {
    super(SPELLS.FROZEN_DEVOTION_ENCHANT, RANKS, options);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FROZEN_DEVOTION_DAMAGE),
      this.onDamage,
    );
  }

  private onDamage(event: DamageEvent) {
    let currentProc = this.procs[this.procs.length - 1];

    if (
      // We have not yet created any proc
      currentProc == null ||
      // The last proc was more than 50ms ago
      event.timestamp - currentProc.timestamp > 50
    ) {
      // Create a new proc
      currentProc = {
        timestamp: event.timestamp,
        hits: 0,
        damage: 0,
      };
      this.procs.push(currentProc);
    }

    currentProc.hits += 1;
    currentProc.damage += event.amount + (event.absorbed || 0);
  }

  statisticParts() {
    const numberProcs = this.procs.length;

    let totalDamage = 0;
    let totalHits = 0;

    for (const proc of this.procs) {
      totalDamage += proc.damage;
      totalHits += proc.hits;
    }

    const averageDamage = totalDamage / totalHits;
    const averageTargets = totalHits / numberProcs;

    const tooltip = (
      <>
        {this.procCount(numberProcs)}, and hit a total of {totalHits} targets (
        {averageTargets.toFixed(1)} per proc) for an average of {formatNumber(averageDamage)}{' '}
        damage, resulting in a total damage of {formatNumber(totalDamage)}.
      </>
    );

    const content = (
      <>
        <ItemDamageDone amount={totalDamage} />
      </>
    );

    return { tooltip, content };
  }
}

export default FrozenDevotion;
