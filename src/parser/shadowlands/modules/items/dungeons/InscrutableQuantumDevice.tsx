import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import { TooltipElement } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, Item } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import Buffs from 'parser/core/modules/Buffs';
import { calculateSecondaryStatDefault } from 'parser/core/stats';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import { encodeTargetString } from 'parser/shared/modules/Enemies';
import StatTracker from 'parser/shared/modules/StatTracker';
import BoringItemValueText from 'parser/ui/BoringItemValueText';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const COOLDOWN_SECONDS = 180 as const;

const IQD_CAST: Spell = SPELLS.INSCRUTABLE_QUANTUM_DEVICE_CAST;

// https://www.wowhead.com/item=179350/inscrutable-quantum-device?bonus=6805:1472#comments:id=3243706

const IQD_CRIT: Spell = SPELLS.INSCRUTABLE_QUANTUM_DEVICE_CRIT;
const IQD_HASTE: Spell = SPELLS.INSCRUTABLE_QUANTUM_DEVICE_HASTE;
const IQD_MASTERY: Spell = SPELLS.INSCRUTABLE_QUANTUM_DEVICE_MASTERY;
const IQD_VERS: Spell = SPELLS.INSCRUTABLE_QUANTUM_DEVICE_VERS;

const IQD_CC_BREAK: Spell = SPELLS.INSCRUTABLE_QUANTUM_DEVICE_CC_BREAK;

const IQD_BUFFS = [IQD_CRIT, IQD_HASTE, IQD_MASTERY, IQD_VERS, IQD_CC_BREAK];

const IQD_MANA: Spell = SPELLS.INSCRUTABLE_QUANTUM_DEVICE_MANA;
const IQD_DECOY: Spell = SPELLS.INSCRUTABLE_QUANTUM_DEVICE_DECOY;
const IQD_DECOY_DISTRACT: Spell = SPELLS.INSCRUTABLE_QUANTUM_DEVUCE_DECOY_DISTRACT;
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
 * - https://www.warcraftlogs.com/reports/Cwth4bkpX8mnFvZD#fight=4&type=healing&source=121
 *   - Mana (330376) + Haste (330368), Vers (330367), Execute (330373)
 * - https://www.warcraftlogs.com/reports/a9knCMFB1xdKyJ6G#fight=8&type=damage-done&source=10
 *   - CcBreak (330363) + Haste (330368), Mastery (330380)
 * - https://www.warcraftlogs.com/reports/4phRMkjqgHd7aVJy#fight=10&type=damage-done&source=260
 *   - Execute (330373) + Mastery (330380), Crit (330366)
 * - https://www.warcraftlogs.com/reports/9ZLVq32tkGxznpDw#fight=34&type=damage-done&source=6
 *   - Decoy (330372) + Haste (330368)
 */
class InscrutableQuantumDevice extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    buffs: Buffs,
    castEfficiency: CastEfficiency,
    statTracker: StatTracker,
  };

  protected abilities!: Abilities;
  protected buffs!: Buffs;
  protected castEfficiency!: CastEfficiency;
  protected statTracker!: StatTracker;

  private readonly item: Item;

  private readonly counts = {
    crit: 0,
    haste: 0,
    mastery: 0,
    vers: 0,

    heal: 0,
    execute: 0,

    mana: 0,
    ccBreak: 0,
    get decoy() {
      return this.decoyIds.size;
    },
    decoyIds: new Set<string>(),
  };

  constructor(
    options: Options & {
      abilities: Abilities;
      buffs: Buffs;
      castEfficiency: CastEfficiency;
      statTracker: StatTracker;
    },
  ) {
    super(options);

    this.item = this.selectedCombatant.getItem(ITEMS.INSCRUTABLE_QUANTUM_DEVICE.id)!;
    if (this.item == null) {
      this.active = false;
      return;
    }

    // https://wowhead.com/spell=330366/inscrutable-quantum-device?ilvl=262
    const secondaryStat = calculateSecondaryStatDefault(262, 850, this.item.itemLevel);

    // Add all the buffs to the statTracker so that other modules know them
    options.statTracker.add(SPELLS.INSCRUTABLE_QUANTUM_DEVICE_CRIT, {
      crit: secondaryStat,
    });
    options.statTracker.add(SPELLS.INSCRUTABLE_QUANTUM_DEVICE_HASTE, {
      haste: secondaryStat,
    });
    options.statTracker.add(SPELLS.INSCRUTABLE_QUANTUM_DEVICE_MASTERY, {
      mastery: secondaryStat,
    });
    options.statTracker.add(SPELLS.INSCRUTABLE_QUANTUM_DEVICE_VERS, {
      versatility: secondaryStat,
    });

    // Add the buffs to the buff tracker so that they show up in the timeline
    options.buffs.add({
      spellId: IQD_BUFFS.map(({ id }) => id),
      timelineHighlight: true,
      triggeredBySpellId: IQD_CAST.id,
    });

    // Add the main cast as an ability so that we can track cooldown and usage in timeline
    options.abilities.add({
      spell: IQD_CAST.id,
      category: Abilities.SPELL_CATEGORIES.ITEMS,
      cooldown: COOLDOWN_SECONDS,
      gcd: null,
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.8,
      },
    });

    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(IQD_BUFFS), this.onBuff);
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(IQD_MANA),
      () => (this.counts.mana += 1),
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER_PET).spell(IQD_DECOY_DISTRACT), (e) =>
      this.counts.decoyIds.add(encodeTargetString(e.sourceID, e.sourceInstance)),
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(IQD_EXECUTE),
      () => (this.counts.execute += 1),
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(IQD_HEAL),
      () => (this.counts.heal += 1),
    );
    this.addEventListener(Events.fightend, () => {
      const { casts = -1 } = this.getCastEfficiency() || {};
      const { crit, haste, mastery, vers, heal, execute, mana, ccBreak, decoy } = this.counts;
      const total = crit + haste + mastery + vers + heal + execute + mana + ccBreak + decoy;

      if (casts !== total) {
        console.warn(
          'Inscrutable Quantum Device:',
          casts,
          'casts, but only',
          total,
          'effects were detected.',
        );
      }
    });
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

  private getCastEfficiency() {
    return this.castEfficiency.getCastEfficiencyForSpellId(IQD_CAST.id);
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
      {
        label: (
          <TooltipElement content="We did not manage to track what happened, please report">
            ???
          </TooltipElement>
        ),
        value:
          (this.getCastEfficiency()?.casts ?? 0) -
          this.counts.crit -
          this.counts.haste -
          this.counts.mastery -
          this.counts.vers -
          this.counts.execute -
          this.counts.heal -
          this.counts.mana -
          this.counts.ccBreak -
          this.counts.decoy,
        color: 'hotpink',
      },
    ]
      .filter((i) => i.value > 0)
      .sort((a, b) => b.value - a.value);
  }

  statistic() {
    const { casts = 0, maxCasts = 0 } = this.getCastEfficiency() ?? {};

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(100)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <BoringItemValueText item={this.item}>
          {casts} Uses <small>{maxCasts} possible</small>
        </BoringItemValueText>
        <div className="pad">
          <small>??? Effects</small>
          {casts > 0 && <DonutChart items={this.donutChartItems} />}
        </div>
      </Statistic>
    );
  }
}

export default InscrutableQuantumDevice;
