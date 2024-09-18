import fetchWcl from 'common/fetchWclApi';
import TALENTS from 'common/TALENTS/priest';
import { WCLHealing, WCLHealingTableResponse } from 'common/WCL_TYPES';
import { SpellIcon, SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { EventType, HealEvent } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import LazyLoadStatisticBox from 'parser/ui/LazyLoadStatisticBox';
import { GUARDIAN_SPIRIT_HEALING_INCREASE } from '../../constants';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Combatants from 'parser/shared/modules/Combatants';
import { Options } from 'parser/core/EventSubscriber';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';

class GuardianSpirit extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  constructor(options: Options) {
    super(options);
    if (this.selectedCombatant.hasTalent(TALENTS.GUARDIAN_ANGEL_TALENT)) {
      this.active;
    }

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  // This is an approximation. See the reasoning below.
  totalHealingFromGSBuff = 0;
  selfGSIncrease = 0;
  protected abilityTracker!: AbilityTracker;

  get totalGSCasts() {
    return this.abilityTracker.getAbility(TALENTS.GUARDIAN_SPIRIT_TALENT.id).casts;
  }

  get filter() {
    return `
    IN RANGE
      FROM type='${EventType.ApplyBuff}'
          AND ability.id=${TALENTS.GUARDIAN_SPIRIT_TALENT.id}
          AND source.name='${this.selectedCombatant.name}'
      TO type='${EventType.RemoveBuff}'
          AND ability.id=${TALENTS.GUARDIAN_SPIRIT_TALENT.id}
          AND source.name='${this.selectedCombatant.name}'
      GROUP BY
        target ON target END`;
  }

  load() {
    return fetchWcl<WCLHealingTableResponse>(`report/tables/healing/${this.owner.report.code}`, {
      start: this.owner.fight.start_time,
      end: this.owner.fight.end_time,
      filter: this.filter,
    }).then((json) => {
      this.totalHealingFromGSBuff = json.entries.reduce(
        // Because this is a % healing increase and we are unable to parse each healing event individually for its effective healing,
        // we need to do some "approximations" using the total overheal in tandem with the total healing. We do not want to naively
        // assume all healing was fully effective, as this would drastically overweight the power of the buff in situations where a
        // lot of overhealing occurs.
        (healingFromBuff, entry: WCLHealing) =>
          healingFromBuff +
          (entry.total - entry.total / (1 + GUARDIAN_SPIRIT_HEALING_INCREASE)) *
            (entry.total / (entry.total + (entry.overheal || 0))),
        0,
      );
    });
  }

  onHeal(event: HealEvent) {
    const target = this.combatants.getEntity(event);

    if (target === null) {
      return;
    }
    if (target.hasBuff(TALENTS.GUARDIAN_SPIRIT_TALENT, null, 0, 0, this.selectedCombatant.id)) {
      this.selfGSIncrease += calculateEffectiveHealing(event, GUARDIAN_SPIRIT_HEALING_INCREASE);
    }
  }

  get gsContribToothers() {
    return this.totalHealingFromGSBuff - this.selfGSIncrease;
  }

  statistic() {
    return (
      <LazyLoadStatisticBox
        loader={this.load.bind(this)}
        icon={<SpellIcon spell={TALENTS.GUARDIAN_SPIRIT_TALENT} />}
        value={<ItemPercentHealingDone amount={this.totalHealingFromGSBuff} />}
        label="Guardian Spirit Contribution"
        tooltip={
          <>
            <div>
              <SpellLink spell={TALENTS.GUARDIAN_SPIRIT_TALENT} /> Breakdown:{' '}
            </div>
            <ItemPercentHealingDone amount={this.gsContribToothers}></ItemPercentHealingDone>
            {' contribution to others.'}
            <div>
              <ItemPercentHealingDone amount={this.selfGSIncrease}></ItemPercentHealingDone>
              {' contribution to self.'} <br />
            </div>
            <div>
              <br />
              If this healing was attributed to you from the other healers like Augmented Healing,
              you would have done{' '}
              <ItemPercentHealingDone amount={this.gsContribToothers}></ItemPercentHealingDone> more
              than your total on WCL.
            </div>
            <div>
              <br />
              NOTE: This is an approximated value due to technical limitations. If you are seeing a
              negative number, please load the module first.
            </div>
          </>
        }
      />
    );
  }
}

export default GuardianSpirit;
