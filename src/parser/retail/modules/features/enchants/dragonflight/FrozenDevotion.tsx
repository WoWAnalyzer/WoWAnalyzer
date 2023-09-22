import ITEMS from 'common/ITEMS/dragonflight/enchants';
import SPELLS from 'common/SPELLS/dragonflight/enchants';
import { formatNumber, formatPercentage } from 'common/format';
import { SpellLink } from 'interface';
import { DamageIcon } from 'interface/icons';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';

// ================ SAMPLE LOGS ================
// Frozen Devotion R1
// https://www.warcraftlogs.com/reports/jA1HZK479CQqFhya#fight=3&type=summary&source=26
// Frozen Devotion R2
// https://www.warcraftlogs.com/reports/Vtn6Fk2qRfhC1Wv3#fight=59&type=summary&source=957
// Frozen Devotion R3
// https://www.warcraftlogs.com/reports/FJQ28G6LgynCK9tj#fight=3&type=summary&source=164

const RANKS = [
  ITEMS.ENCHANT_WEAPON_FROZEN_DEVOTION_R1,
  ITEMS.ENCHANT_WEAPON_FROZEN_DEVOTION_R2,
  ITEMS.ENCHANT_WEAPON_FROZEN_DEVOTION_R3,
];

class FrozenDevotion extends Analyzer {
  private procs: {
    timestamp: number;
    hits: number;
    damage: number;
  }[] = [];

  constructor(options: Options) {
    super(options);

    this.active = RANKS.some((enchant) => this.selectedCombatant.hasWeaponEnchant(enchant));

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
      // We have not yet created any procc
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
    currentProc.damage += event.amount;
  }

  statistic() {
    const numberProcs = this.procs.length;
    const procsPerMinute = this.owner.getPerMinute(numberProcs);

    let totalDamage = 0;
    let totalHits = 0;

    for (const proc of this.procs) {
      totalDamage += proc.damage;
      totalHits += proc.hits;
    }

    const averageDamage = totalDamage / totalHits;
    const averageTargets = totalHits / numberProcs;
    const dps = this.owner.getPerSecond(totalDamage);
    const percentage = this.owner.getPercentageOfTotalDamageDone(totalDamage);

    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        position={STATISTIC_ORDER.UNIMPORTANT(1)}
        tooltip={
          <>
            <SpellLink spell={SPELLS.FROZEN_DEVOTION_DAMAGE} /> triggered {numberProcs} times (
            {procsPerMinute.toFixed(1)} PPM) and hit an average of {averageTargets.toFixed(1)}{' '}
            targets for an average of {formatNumber(averageDamage)} damage, resulting in a total
            damage of {formatNumber(totalDamage)}.
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.FROZEN_DEVOTION_DAMAGE}>
          <DamageIcon /> {formatNumber(dps)} DPS <small>{formatPercentage(percentage)}%</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FrozenDevotion;
