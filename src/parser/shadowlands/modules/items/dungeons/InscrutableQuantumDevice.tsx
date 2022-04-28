import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import calculateMaxCasts from 'parser/core/calculateMaxCasts';
import Events, { ApplyBuffEvent, CastEvent, Item } from 'parser/core/Events';
import BoringItemValueText from 'parser/ui/BoringItemValueText';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const COOLDOWN_SECONDS = 180 as const;

// https://www.wowhead.com/item=179350/inscrutable-quantum-device?bonus=6805:1472#comments:id=3243706

const IQD_CRIT: Spell = SPELLS.INSCRUTABLE_QUANTUM_DEVICE_CRIT;
const IQD_HASTE: Spell = SPELLS.INSCRUTABLE_QUANTUM_DEVICE_HASTE;
const IQD_MASTERY: Spell = SPELLS.INSCRUTABLE_QUANTUM_DEVICE_MASTERY;
const IQD_VERS: Spell = SPELLS.INSCRUTABLE_QUANTUM_DEVICE_VERS;

const IQD_CC_BREAK: Spell = SPELLS.INSCRUTABLE_QUANTUM_DEVICE_CC_BREAK;

const IQD_BUFFS = [IQD_CRIT, IQD_HASTE, IQD_MASTERY, IQD_VERS, IQD_CC_BREAK];

const IQD_MANA: Spell = SPELLS.INSCRUTABLE_QUANTUM_DEVICE_MANA;
const IQD_DECOY: Spell = SPELLS.INSCRUTABLE_QUANTUM_DEVICE_DECOY;

const IQD_CASTS = [IQD_MANA, IQD_DECOY];

const IQD_EXECUTE: Spell = SPELLS.INSCRUTABLE_QUANTUM_DEVICE_EXECUTE;
const IQD_HEAL: Spell = SPELLS.INSCRUTABLE_QUANTUM_DEVICE_HEAL;

/**
 * Tracks the "random" effects of the Inscrutable Quantum Device.
 *
 * Add statistics on the statistics page showing a breakdown of the effects that the user got.
 *
 * ### Examples parses:
 *
 * - https://www.warcraftlogs.com/reports/867WJHaxdLcnpfNt#fight=1&type=damage-done&source=4
 *   - Heal (330364) + Haste (330368), Mastery (330380)
 * - https://www.warcraftlogs.com/reports/v8anRWA7zYj1DChK#fight=5&type=damage-done&source=3
 *   - Mana (330376) + Haste (330368), Vers (330367)
 * - https://www.warcraftlogs.com/reports/a9knCMFB1xdKyJ6G#fight=8&type=damage-done&source=10
 *   - CcBreak (330363) + Haste (330368), Mastery (330380)
 * - https://www.warcraftlogs.com/reports/4phRMkjqgHd7aVJy#fight=10&type=damage-done&source=260
 *   - Execute (330373) + Mastery (330380), Crit (330366)
 *
 * ### WANTED
 *
 * - Find log where the decoy effect happened. I couldn't find any.
 */
class InscrutableQuantumDevice extends Analyzer {
  item: Item;

  private readonly counts = {
    crit: 0,
    haste: 0,
    mastery: 0,
    vers: 0,

    heal: 0,
    execute: 0,

    mana: 0,
    ccBreak: 0,
    decoy: 0,
  };

  constructor(options: Options) {
    super(options);

    this.item = this.selectedCombatant.getItem(ITEMS.INSCRUTABLE_QUANTUM_DEVICE.id)!;
    if (this.item == null) {
      this.active = false;
      return;
    }

    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(IQD_BUFFS), this.onBuff);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(IQD_CASTS), this.onCast);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(IQD_EXECUTE),
      () => (this.counts.execute += 1),
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(IQD_HEAL),
      () => (this.counts.heal += 1),
    );
    this.addEventListener(Events.any.by(SELECTED_PLAYER).spell(IQD_CC_BREAK), (e) =>
      console.log(e),
    );
  }

  onBuff(event: ApplyBuffEvent) {
    switch (event.ability.guid) {
      case IQD_CRIT.id:
        this.counts.crit += 1;
        break;
      case IQD_HASTE.id:
        this.counts.haste += 1;
        break;
      case IQD_MASTERY.id:
        this.counts.mastery += 1;
        break;
      case IQD_VERS.id:
        this.counts.vers += 1;
        break;
      case IQD_CC_BREAK.id:
        this.counts.ccBreak += 1;
        break;
    }
  }

  onCast(event: CastEvent) {
    switch (event.ability.guid) {
      case IQD_MANA.id:
        this.counts.mana += 1;
        break;
      case IQD_CC_BREAK.id:
        this.counts.ccBreak += 1;
        break;
      case IQD_DECOY.id:
        this.counts.decoy += 1;
        break;
      case IQD_EXECUTE.id:
        this.counts.execute += 1;
        break;
    }
  }

  private get totalCount() {
    return Object.values(this.counts).reduce((a, b) => a + b, 0);
  }

  private get maxCasts() {
    return Math.ceil(calculateMaxCasts(COOLDOWN_SECONDS, this.owner.fightDuration));
  }

  private get donutChartItems() {
    return [
      {
        label: 'Critical Strike',
        spellId: IQD_CRIT.id,
        itemLevel: this.item.itemLevel,
        value: this.counts.crit,
        color: '#003f5c',
      },
      {
        label: 'Haste',
        spellId: IQD_HASTE.id,
        itemLevel: this.item.itemLevel,
        value: this.counts.haste,
        color: '#2f4b7c',
      },
      {
        label: 'Mastery',
        spellId: IQD_MASTERY.id,
        itemLevel: this.item.itemLevel,
        value: this.counts.mastery,
        color: '#665191',
      },
      {
        label: 'Versatility',
        spellId: IQD_VERS.id,
        itemLevel: this.item.itemLevel,
        value: this.counts.vers,
        color: '#a05195',
      },
      {
        label: 'Execute',
        spellId: IQD_EXECUTE.id,
        itemLevel: this.item.itemLevel,
        value: this.counts.execute,
        color: '#d45087',
      },
      {
        label: 'Heal',
        spellId: IQD_HEAL.id,
        itemLevel: this.item.itemLevel,
        value: this.counts.heal,
        color: '#f95d6a',
      },
      {
        label: 'Mana',
        spellId: IQD_MANA.id,
        itemLevel: this.item.itemLevel,
        value: this.counts.mana,
        color: '#ff7c43',
      },
      {
        label: 'CC Break',
        spellId: IQD_CC_BREAK.id,
        itemLevel: this.item.itemLevel,
        value: this.counts.ccBreak,
        color: '#ffa600',
      },
      {
        label: 'Decoy',
        spellId: IQD_DECOY.id,
        itemLevel: this.item.itemLevel,
        value: this.counts.decoy,
        color: '#ffd11a',
      },
    ]
      .filter((i) => i.value > 0)
      .sort((a, b) => b.value - a.value);
  }

  statistic() {
    const totalCount = this.totalCount;
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(1)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <BoringItemValueText item={this.item}>
          {totalCount} Uses <small>{this.maxCasts} possible</small>
        </BoringItemValueText>
        <div className="pad">
          <small>??? Effects</small>
          {totalCount > 0 && <DonutChart items={this.donutChartItems} />}
        </div>
      </Statistic>
    );
  }
}

export default InscrutableQuantumDevice;
