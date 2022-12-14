import { formatNumber } from 'common/format';
import ITEMS from 'common/ITEMS';
import Item from 'common/ITEMS/Item';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { TrackedBuffEvent } from 'parser/core/Entity';
import StatTracker from 'parser/shared/modules/StatTracker';
import DamageDone from 'parser/shared/modules/throughput/DamageDone';
import DamageTaken from 'parser/shared/modules/throughput/DamageTaken';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';
import BoringItemValueText from 'parser/ui/BoringItemValueText';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

// https://www.wowhead.com/uncategorized-spells/name:Vantus+Rune:?filter=29:21;42:2;0:80100
// TODO: Figure out how to make this work with ranks of Vantus Runes
const VANTUS_RUNE_VERSATILITY = 267;
const VERSATILITY_PER_PERCENT_THROUGHPUT = 40 * 100;
const VERSATILITY_PER_PERCENT_DAMAGE_REDUCTION = VERSATILITY_PER_PERCENT_THROUGHPUT * 2;
const VANTUS_RUNE_PERCENTAGE_THROUGHPUT =
  VANTUS_RUNE_VERSATILITY / VERSATILITY_PER_PERCENT_THROUGHPUT;
const VANTUS_RUNE_PERCENTAGE_DAMAGE_REDUCTION =
  VANTUS_RUNE_VERSATILITY / VERSATILITY_PER_PERCENT_DAMAGE_REDUCTION;

const runes = [ITEMS.VANTUS_RUNE_VAULT];

/**
 * @property {HealingDone} healingDone
 * @property {DamageDone} damageDone
 * @property {DamageTaken} damageTaken
 */
class VantusRune extends Analyzer {
  static dependencies = {
    healingDone: HealingDone,
    damageDone: DamageDone,
    damageTaken: DamageTaken,
    statTracker: StatTracker,
  };

  protected healingDone!: HealingDone;
  protected damageDone!: DamageDone;
  protected damageTaken!: DamageTaken;
  protected statTracker!: StatTracker;

  activeRune: TrackedBuffEvent | null = null;
  masterRune: Item | undefined;

  constructor(options: Options) {
    super(options);

    const boss = this.owner.boss;
    const vantusRuneBuffId = boss ? boss.fight.vantusRuneBuffId : null;
    if (vantusRuneBuffId) {
      const match = this.selectedCombatant.getBuff(vantusRuneBuffId);
      if (match !== undefined) {
        this.activeRune = match;
      }
    }
    this.active = this.activeRune !== null;
    if (this.active) {
      runes.forEach((rune) => {
        if (this.activeRune?.ability.abilityIcon === rune.icon) {
          this.masterRune = rune;
        }
      });
      // StatTracker ignores the buff because its active on pull, but the stats aren't actually in the pull stats
      const statTracker = options.statTracker as StatTracker;
      statTracker.forceChangeStats({ versatility: VANTUS_RUNE_VERSATILITY }, null, true);
    }
    if (this.masterRune === null) {
      //default to the icon to current tier
      this.masterRune = runes[runes.length - 1];
    }
  }

  statistic() {
    const fightDuration = this.owner.fightDuration;

    const damageDone =
      this.damageDone.total.effective -
      this.damageDone.total.effective / (1 + VANTUS_RUNE_PERCENTAGE_THROUGHPUT);
    const healingDone =
      this.healingDone.total.effective -
      this.healingDone.total.effective / (1 + VANTUS_RUNE_PERCENTAGE_THROUGHPUT);
    const damageReduced =
      this.damageTaken.total.effective / (1 - VANTUS_RUNE_PERCENTAGE_DAMAGE_REDUCTION) -
      this.damageTaken.total.effective;

    if (!this.masterRune) {
      console.warn(
        'Vantus rune module active but no rune selected',
        this.activeRune,
        this.masterRune,
      );
      return null;
    }

    return (
      <Statistic position={STATISTIC_ORDER.UNIMPORTANT()} size="flexible">
        <BoringItemValueText item={this.masterRune}>
          <img src="/img/sword.png" alt="Damage" className="icon" />
          {` ${formatNumber((damageDone / fightDuration) * 1000)} DPS`}
          <br />
          <img src="/img/healing.png" alt="Healing" className="icon" />
          {` ${formatNumber((healingDone / fightDuration) * 1000)} HPS`}
          <br />
          <img src="/img/shield.png" alt="Damage Taken" className="icon" />
          {` ${formatNumber((damageReduced / fightDuration) * 1000)} DRPS`}
        </BoringItemValueText>
      </Statistic>
    );
  }
}

export default VantusRune;
