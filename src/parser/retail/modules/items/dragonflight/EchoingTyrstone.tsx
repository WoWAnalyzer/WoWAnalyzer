import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import { formatNumber, formatPercentage } from 'common/format';
import ItemLink from 'interface/ItemLink';
import { CooldownIcon, HasteIcon } from 'interface/icons';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, HealEvent, Item } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringItemValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';

const ECHOING_TYRSTONE_COOLDOWN = 120000; // 120sec

// Need a better way to do this. The calculateSecondaryStat functions don't seem to line up
const HEALS_BY_ILVL: { [key: number]: EchoingTyrstoneStats } = {
  421: { heal: 181431, haste: 179 },
  424: { heal: 189728, haste: 184 },
  428: { heal: 201297, haste: 191 },
  431: { heal: 210370, haste: 197 },
  434: { heal: 219795, haste: 202 },
  437: { heal: 229585, haste: 208 },
  441: { heal: 243230, haste: 216 },
  444: { heal: 253925, haste: 222 },
  447: { heal: 265031, haste: 228 },
  450: { heal: 276562, haste: 235 },
  454: { heal: 292625, haste: 243 },
  457: { heal: 305208, haste: 250 },
  460: { heal: 318273, haste: 257 },
  463: { heal: 331829, haste: 265 },
  467: { heal: 350708, haste: 275 },
  470: { heal: 365491, haste: 283 },
  473: { heal: 380829, haste: 291 },
  476: { heal: 396746, haste: 299 },
  480: { heal: 418896, haste: 310 },
  483: { heal: 436236, haste: 319 },
  486: { heal: 454222, haste: 328 },
  489: { heal: 472877, haste: 337 },
};

class EchoingTyrstone extends Analyzer {
  healAmount: number = 0;
  overhealAmount: number = 0;
  trinket: Item | undefined;
  maxStored: number = 0;
  hasteValue: number = 0;
  useTracker: EchoingTyrstoneUse[] = [];
  timeOnCooldown: number = 0;

  constructor(options: Options) {
    super(options);
    this.trinket = this.selectedCombatant.getTrinket(ITEMS.ECHOING_TYRSTONE.id);
    this.active = this.trinket !== undefined;

    if (!this.active) {
      return;
    }
    const itemLevel = this.trinket?.itemLevel || 421;

    this.maxStored = HEALS_BY_ILVL[itemLevel].heal;
    this.hasteValue = HEALS_BY_ILVL[itemLevel].haste;

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ECHOING_TYRSTONE_HEAL),
      this.onTyrstoneHeal,
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.ECHOING_TYRSTONE_BUFF),
      this.onTyrstoneActivate,
    );
  }

  onTyrstoneHeal(event: HealEvent) {
    this.healAmount += event.amount + (event.absorbed || 0);
    this.overhealAmount += event.overheal || 0;
  }

  onHeal(event: HealEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.ECHOING_TYRSTONE_BUFF.id, event.timestamp)) {
      return;
    }

    const totalHeal = event.amount + (event.overheal || 0);

    this.useTracker[this.useTracker.length - 1].heal += totalHeal * 0.3;

    if (this.useTracker[this.useTracker.length - 1].heal > this.maxStored) {
      this.useTracker[this.useTracker.length - 1].heal = this.maxStored;
    }
  }

  onTyrstoneActivate(event: ApplyBuffEvent) {
    this.useTracker.push({
      timestamp: event.timestamp,
      heal: 0,
    });

    if (event.timestamp + ECHOING_TYRSTONE_COOLDOWN < this.owner.fight.end_time) {
      this.timeOnCooldown += ECHOING_TYRSTONE_COOLDOWN;
    } else {
      this.timeOnCooldown += this.owner.fight.end_time - event.timestamp;
    }
  }

  getCastEfficiency() {
    return this.timeOnCooldown / this.owner.fightDuration;
  }

  getHasteOverFight() {
    const uptime = this.selectedCombatant.getBuffUptime(SPELLS.ECHOING_TYRSTONE_HASTE_BUFF.id);
    const averageHaste = (uptime / this.owner.fightDuration) * this.hasteValue;

    return Math.round(averageHaste);
  }

  tooltip() {
    return (
      <>
        <p>
          <ItemLink id={ITEMS.ECHOING_TYRSTONE.id} /> was used {this.useTracker.length} times
          spending <strong>{formatPercentage(this.getCastEfficiency())}%</strong> of the fight
          either active or on cooldown.{' '}
          <em>
            This trinket will make use of the healing when it's needed or when it is next triggered,
            so it should be used off cooldown.
          </em>
        </p>
        <p>
          A total of <strong>{formatNumber(this.healAmount)}</strong> healing was done with{' '}
          <strong>{formatNumber(this.overhealAmount)}</strong> overhealing.
        </p>
        <p>
          Each use of the healing also granted <strong>{formatNumber(this.hasteValue)}</strong>{' '}
          haste for 15 seconds to each member of the raid. This equates to{' '}
          <strong>{this.getHasteOverFight()}</strong> haste each over the length of the fight.
        </p>
      </>
    );
  }

  subStatistic() {
    return (
      <BoringSpellValueText item={this.trinket || ITEMS.ECHOING_TYRSTONE}>
        <ItemPercentHealingDone amount={this.healAmount} />
        <br />
        <HasteIcon /> {this.getHasteOverFight()} <small>Haste over time (per raider)</small>
        <br />
        <CooldownIcon /> {formatPercentage(this.getCastEfficiency())}% <small>use efficiency</small>
      </BoringSpellValueText>
    );
  }

  getClass(value: number) {
    if (value >= this.maxStored) {
      return 'good-mark';
    } else if (value >= this.maxStored / 2) {
      return 'ok-mark';
    }

    return 'bad-mark';
  }

  dropdown() {
    return (
      <>
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Use</th>
              <th>Timestamp</th>
              <th>Healing Stored</th>
            </tr>
          </thead>
          <tbody>
            {this.useTracker.map((use, index) => (
              <tr key={index}>
                <th scope="row">{index + 1}</th>
                <td>{this.owner.formatTimestamp(use.timestamp)}</td>
                <td className={this.getClass(use.heal)}>{formatNumber(use.heal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(9)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={this.tooltip()}
        dropdown={this.dropdown()}
      >
        {this.subStatistic()}
      </Statistic>
    );
  }
}

export default EchoingTyrstone;

interface EchoingTyrstoneUse {
  /** Cast's timestamp */
  timestamp: number;
  /** Heal stored during use */
  heal: number;
}

interface EchoingTyrstoneStats {
  heal: number;
  haste: number;
}
