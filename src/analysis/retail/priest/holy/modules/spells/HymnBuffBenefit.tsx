import fetchWcl from 'common/fetchWclApi';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { WCLHealing, WCLHealingTableResponse } from 'common/WCL_TYPES';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, ApplyBuffStackEvent, EventType } from 'parser/core/Events';
import LazyLoadStatisticBox from 'parser/ui/LazyLoadStatisticBox';

const BASE_DIVINE_HYMN_HEALING_INCREASE_PER_STACK = 0.04;
const GALES_OF_SONG_HEALING_INCREASE_PER_POINT = 0.02;

class HymnBuffBenefit extends Analyzer {
  // This is an approximation. See the reasoning below.
  totalHealingFromHymnBuffPerStack = [0, 0, 0, 0, 0];

  divineHymnTotalHealingIncreasePerStack = 0;
  filter(stackCount: number = 1) {
    // The first stack is an apply buff event, not an apply buff stack event
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
    // This just reduces the number of calls we make (making 5 is probably not great)
    for (let i = 1; i <= this.maxHymnStacks; i += 1) {
      promises.push(this.makeHymnQuery(i));
    }
    return Promise.all(promises);
  }

  makeHymnQuery(stackCount: number) {
    // Hymn stacks up to 5 times, we have to grab the healing for each stack count in order to use the multiplyer effectivly.
    return fetchWcl<WCLHealingTableResponse>(`report/tables/healing/${this.owner.report.code}`, {
      start: this.owner.fight.start_time,
      end: this.owner.fight.end_time,
      filter: this.filter(stackCount),
    }).then((json) => {
      // This is an array just to make debugging easier.
      this.totalHealingFromHymnBuffPerStack[stackCount - 1] += json.entries.reduce(
        // Because this is a % healing increase and we are unable to parse each healing event individually for its effective healing,
        // we need to do some "approximations" using the total overheal in tandem with the total healing. We do not want to naively
        // assume all healing was fully effective, as this would drastically overweight the power of the buff in situations where a
        // lot of overhealing occurs.
        (healingFromBuff: any, entry: WCLHealing) =>
          healingFromBuff +
          (entry.total -
            entry.total / (1 + this.divineHymnTotalHealingIncreasePerStack * stackCount)) *
            (entry.total / (entry.total + (entry.overheal || 0))),
        0,
      );
    });
  }

  constructor(options: Options) {
    super(options);
    if (!this.selectedCombatant.hasTalent(TALENTS.DIVINE_HYMN_TALENT)) {
      this.active = false;
    }
    this.divineHymnTotalHealingIncreasePerStack =
      BASE_DIVINE_HYMN_HEALING_INCREASE_PER_STACK +
      this.selectedCombatant.getTalentRank(TALENTS.GALES_OF_SONG_TALENT) *
        GALES_OF_SONG_HEALING_INCREASE_PER_POINT;
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.DIVINE_HYMN_HEAL),
      this.onBuffStackApply,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.DIVINE_HYMN_HEAL),
      this.onBuffStackApply,
    );
  }

  maxHymnStacks = 0;

  onBuffStackApply(event: ApplyBuffEvent | ApplyBuffStackEvent) {
    if (event.type === EventType.ApplyBuff) {
      this.maxHymnStacks = Math.max(this.maxHymnStacks, 1);
    } else {
      this.maxHymnStacks = Math.max(this.maxHymnStacks, event.stack);
    }
  }

  statistic() {
    const fightDuration = this.owner.fightDuration;

    return (
      <LazyLoadStatisticBox
        loader={this.load.bind(this)}
        icon={<SpellIcon id={TALENTS.DIVINE_HYMN_TALENT.id} />}
        value={`≈${formatNumber((this.totalHealingFromHymnBuff / fightDuration) * 1000)} HPS`}
        label="Hymn Buff Contribution"
        tooltip={
          <>
            The Divine Hymn buff contributed {formatNumber(this.totalHealingFromHymnBuff)} healing.
            This includes healing from other healers.
            <br />
            NOTE: This metric uses an approximation to calculate contribution from the buff due to
            technical limitations.
          </>
        }
      />
    );
  }
}

export default HymnBuffBenefit;
