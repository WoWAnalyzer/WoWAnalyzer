import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { SpellLink, TooltipElement } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, GetRelatedEvents, HealEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { LIFEBIND_DURATION } from '../../constants';
import { getLifebindTargets } from '../../normalizers/EventLinking/helpers';
import Combatants from 'parser/shared/modules/Combatants';
import { LIFEBIND_ALL_HEALING } from '../../normalizers/EventLinking/constants';

interface LifebindWindow {
  buffApply: ApplyBuffEvent;
  selfHealing: HealEvent[];
  targets: number;
  healingDone: number;
  overhealing: number;
}

class Lifebind extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;
  lifebindWindows: LifebindWindow[] = [];
  lifebindSpellBlacklist: number[] = [
    SPELLS.LIFEBIND_HEAL.id,
    SPELLS.PANACEA_HEAL.id,
    SPELLS.VERDANT_EMBRACE_HEAL.id,
    143924, //Leech
  ];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.LIFEBIND_TALENT);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).to(SELECTED_PLAYER).spell(SPELLS.LIFEBIND_BUFF),
      this.onLifebindApply,
    );

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).to(SELECTED_PLAYER), this.onSelfHeal);
  }

  onLifebindApply(event: ApplyBuffEvent) {
    let lifebindApplications = getLifebindTargets(event);
    lifebindApplications = lifebindApplications.filter(
      (buff) => this.combatants.getEntity(buff) !== null,
    ); //Remove pets
    const totalLifebinds = [...new Set(lifebindApplications.map((buff) => buff.targetID))].length; //Remove duplicates in case you VE someone with Echo

    if (totalLifebinds >= 5) {
      const lifebindHealing = GetRelatedEvents<HealEvent>(event, LIFEBIND_ALL_HEALING);
      let totalLifebindHealing = 0;
      let totalLifebindOverheal = 0;
      for (const Heal of lifebindHealing) {
        totalLifebindHealing += Heal.amount + (Heal.absorbed || 0);
        totalLifebindOverheal += Heal.overheal || 0;
      }
      const overhealPercentage =
        (totalLifebindOverheal * 100) / (totalLifebindHealing + totalLifebindOverheal);

      const currentWindow: LifebindWindow = {
        buffApply: event,
        selfHealing: [],
        targets: totalLifebinds,
        healingDone: totalLifebindHealing,
        overhealing: overhealPercentage,
      };
      this.lifebindWindows.push(currentWindow);
    }
  }

  onSelfHeal(event: HealEvent) {
    for (const window of this.lifebindWindows) {
      if (
        event.timestamp > window.buffApply.timestamp &&
        event.timestamp < window.buffApply.timestamp + LIFEBIND_DURATION &&
        !this.lifebindSpellBlacklist.includes(event.ability.guid)
      ) {
        window.selfHealing.push(event);
      }
    }
  }

  getSpellLink(spell: HealEvent) {
    return (
      <>
        <SpellLink spell={spell.ability.guid} />{' '}
        <small>
          ({formatNumber(spell.amount + (spell.absorbed || 0) + (spell.overheal || 0))})
        </small>
        <br />
      </>
    );
  }

  getTotalSelfHealing(window: HealEvent[]) {
    let totalSelfHealing = 0;
    for (const Heal of window) {
      totalSelfHealing += Heal.amount + (Heal.absorbed || 0) + (Heal.overheal || 0);
    }
    return totalSelfHealing;
  }

  statistic() {
    console.log(this.lifebindWindows);

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        wide
        tooltip={
          <>
            A <SpellLink spell={TALENTS_EVOKER.LIFEBIND_TALENT} /> window is when you consume
            atleast five <SpellLink spell={TALENTS_EVOKER.ECHO_TALENT} />
            es with <SpellLink spell={TALENTS_EVOKER.VERDANT_EMBRACE_TALENT} /> in order to apply{' '}
            <SpellLink spell={TALENTS_EVOKER.LIFEBIND_TALENT} /> to a big part of your group and
            then do self healing on yourself to transfer it via the{' '}
            <SpellLink spell={TALENTS_EVOKER.LIFEBIND_TALENT} />.
            <br />
            <br />
            At the moment the best way for Chronowarden to do healing via{' '}
            <SpellLink spell={TALENTS_EVOKER.LIFEBIND_TALENT} /> is to cast a single{' '}
            <SpellLink spell={TALENTS_EVOKER.ECHO_TALENT} /> on yourself and then a rank 2{' '}
            <SpellLink spell={TALENTS_EVOKER.SPIRITBLOOM_TALENT} />.
            <br />
            <br />
            You should also plan to do a bigger ramp and cover more people to do{' '}
            <SpellLink spell={TALENTS_EVOKER.LIFEBIND_TALENT} /> healing with{' '}
            <SpellLink spell={TALENTS_EVOKER.EMERALD_COMMUNION_TALENT} /> as a raid cooldown.
          </>
        }
      >
        <SpellLink spell={TALENTS_EVOKER.LIFEBIND_TALENT} /> <small>windows breakdown</small>
        <br />
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Window #</th>
              <th>Targets</th>
              <th>Healing Done</th>
              <th>Self Healing</th>
            </tr>
          </thead>
          <tbody>
            {this.lifebindWindows.map((window, index) => (
              <tr key={index}>
                <th scope="row">
                  {index + 1} @ {this.owner.formatTimestamp(window.buffApply.timestamp)}
                </th>
                <td>{window.targets}</td>
                <td>
                  {formatNumber(window.healingDone)}
                  <br />
                  <small>({formatNumber(window.overhealing)}% overhealing)</small>
                </td>
                <td>
                  <TooltipElement
                    content={window.selfHealing.map((spell) => this.getSpellLink(spell))}
                  >
                    {formatNumber(this.getTotalSelfHealing(window.selfHealing))}
                  </TooltipElement>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Statistic>
    );
  }
}

export default Lifebind;
