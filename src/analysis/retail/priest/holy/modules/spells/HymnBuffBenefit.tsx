import { loadParserTable } from 'report-data/parserCapabilities';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { WCLHealing, WCLHealingTableResponse } from 'common/WCL_TYPES';
import { SpellIcon, SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  EventType,
  HealEvent,
} from 'parser/core/Events';
import LazyLoadStatisticBox from 'parser/ui/LazyLoadStatisticBox';
import { BASE_DIVINE_HYMN_HEALING_INCREASE_PER_STACK } from '../../constants';
import Combatants from 'parser/shared/modules/Combatants';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';

class HymnBuffBenefit extends Analyzer {
  totalHealingFromHymnBuffPerStack = [0, 0, 0, 0, 0];
  selfDivineHymnIncrease = 0;

  divineHymnTotalHealingIncreasePerStack = BASE_DIVINE_HYMN_HEALING_INCREASE_PER_STACK;

  filter(stackCount = 1) {
    if (stackCount === 1) {
      return `IN RANGE
     FROM type='${EventType.ApplyBuff}'
         AND ability.id=${SPELLS.DIVINE_HYMN_HEAL.id}
         AND source.name='${this.selectedCombatant.name}'
     TO (type='${EventType.ApplyBuffStack}'
         AND ability.id=${SPELLS.DIVINE_HYMN_HEAL.id}
         AND source.name='${this.selectedCombatant.name}'
         AND stack=2)
     OR (type='${EventType.RemoveBuff}'
         AND ability.id=${SPELLS.DIVINE_HYMN_HEAL.id}
         AND source.name='${this.selectedCombatant.name}')
     GROUP BY
       target ON target END`;
    }

    return `IN RANGE
     FROM type='${EventType.ApplyBuffStack}'
         AND ability.id=${SPELLS.DIVINE_HYMN_HEAL.id}
         AND source.name='${this.selectedCombatant.name}'
         AND stack=${stackCount}
     TO (type='${EventType.ApplyBuffStack}'
         AND ability.id=${SPELLS.DIVINE_HYMN_HEAL.id}
         AND source.name='${this.selectedCombatant.name}'
         AND stack=${stackCount + 1})
     OR (type='${EventType.RemoveBuff}'
         AND ability.id=${SPELLS.DIVINE_HYMN_HEAL.id}
         AND source.name='${this.selectedCombatant.name}')
     GROUP BY
       target ON target END`;
  }

  get totalHealingFromHymnBuff() {
    return this.totalHealingFromHymnBuffPerStack.reduce((a, b) => a + b, 0);
  }

  load() {
    const promises = [];
    for (let i = 1; i <= this.maxHymnStacks; i += 1) {
      promises.push(this.makeHymnQuery(i));
    }
    return Promise.all(promises);
  }

  makeHymnQuery(stackCount: number) {
    return loadParserTable<WCLHealingTableResponse>(this.owner, 'healing', {
      start: this.owner.fight.start_time,
      end: this.owner.fight.end_time,
      filter: this.filter(stackCount),
    }).then((json) => {
      this.totalHealingFromHymnBuffPerStack[stackCount - 1] += json.entries.reduce(
        (healingFromBuff: number, entry: WCLHealing) =>
          healingFromBuff +
          (entry.total -
            entry.total / (1 + this.divineHymnTotalHealingIncreasePerStack * stackCount)) *
            (entry.total / (entry.total + (entry.overheal || 0))),
        0,
      );
    });
  }

  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  constructor(options: Options) {
    super(options);

    if (!this.selectedCombatant.hasTalent(TALENTS.DIVINE_HYMN_TALENT)) {
      this.active = false;
    }

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.DIVINE_HYMN_HEAL),
      this.onBuffStackApply,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.DIVINE_HYMN_HEAL),
      this.onBuffStackApply,
    );

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  maxHymnStacks = 0;

  onBuffStackApply(event: ApplyBuffEvent | ApplyBuffStackEvent) {
    if (event.type === EventType.ApplyBuff) {
      this.maxHymnStacks = Math.max(this.maxHymnStacks, 1);
    } else {
      this.maxHymnStacks = Math.max(this.maxHymnStacks, event.stack);
    }
  }

  onHeal(event: HealEvent) {
    const target = this.combatants.getEntity(event);
    if (!target) return;

    const divineHymnStacks = target.getBuffStacks(
      SPELLS.DIVINE_HYMN_HEAL,
      null,
      0,
      0,
      this.selectedCombatant.id,
    );
    this.selfDivineHymnIncrease += calculateEffectiveHealing(
      event,
      this.divineHymnTotalHealingIncreasePerStack * divineHymnStacks,
    );
  }

  get hymnContribToOthers() {
    return this.totalHealingFromHymnBuff - this.selfDivineHymnIncrease;
  }

  statistic() {
    return (
      <LazyLoadStatisticBox
        loader={this.load.bind(this)}
        icon={<SpellIcon spell={TALENTS.DIVINE_HYMN_TALENT} />}
        value={<ItemPercentHealingDone amount={this.totalHealingFromHymnBuff} />}
        label="Hymn Buff Contribution"
        tooltip={
          <>
            <div>
              <SpellLink spell={TALENTS.DIVINE_HYMN_TALENT} /> Breakdown:
            </div>
            <ItemPercentHealingDone amount={this.hymnContribToOthers} /> contribution to others.
            <div>
              <ItemPercentHealingDone amount={this.selfDivineHymnIncrease} /> contribution to self.
            </div>
            <div>
              {/* oxlint-disable-next-line @wowanalyzer/no-br */}
              <br />
              If this healing was attributed to you from other healers (like Augmented Healing), you
              would have done <ItemPercentHealingDone amount={this.hymnContribToOthers} /> more than
              your total on WCL.
            </div>
            <div>
              {/* oxlint-disable-next-line @wowanalyzer/no-br */}
              <br />
              NOTE: This is an approximated value due to technical limitations. If you see a
              negative number, please load the module first.
            </div>
          </>
        }
      />
    );
  }
}

export default HymnBuffBenefit;
