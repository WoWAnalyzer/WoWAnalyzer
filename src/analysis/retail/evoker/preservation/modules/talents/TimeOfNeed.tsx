import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { getTimeOfNeedHealing } from '../../normalizers/CastLinkNormalizer';
import { TALENTS_EVOKER } from 'common/TALENTS';
import Events, { HealEvent, SummonEvent, DamageEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import LazyLoadStatisticBox from 'parser/ui/LazyLoadStatisticBox';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { SpellIcon, SpellLink } from 'interface';
import { formatNumber } from 'common/format';
import fetchWcl from 'common/fetchWclApi';
import { WCLEventsResponse } from 'common/WCL_TYPES';
import { Trans } from '@lingui/macro';

//All possible results from a Time of Need proc
enum Result {
  Proc = 'Saved by Verdant Embrace',
  Long = 'Saved by all the healing',
  Not = 'Was not in danger of death',
  Dead = 'Died anyway',
  Bug = 'Time of Need fizzled out',
}

interface tonEvent {
  summon: SummonEvent;
  verdantEmbrace: HealEvent | null;
  livingFlames: HealEvent[];
  livingFlameTotalHeal: number;
  livingFlameTotalOverheal: number;
  target: number;
  result: Result;
}

class TimeOfNeed extends Analyzer {
  spawns: tonEvent[] = [];

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.TIME_OF_NEED_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.summon.by(SELECTED_PLAYER).spell(TALENTS_EVOKER.TIME_OF_NEED_SUMMON),
      this.onSpawn,
    );
  }

  onSpawn(event: SummonEvent) {
    const HealEvents = getTimeOfNeedHealing(event);

    const currentEvent: tonEvent = {
      summon: event,
      verdantEmbrace: null,
      livingFlames: [],
      livingFlameTotalHeal: 0,
      livingFlameTotalOverheal: 0,
      target: 0,
      result: Result.Not,
    };

    HealEvents.forEach((heal) => {
      if (heal.ability.guid === SPELLS.VERDANT_EMBRACE_HEAL.id) {
        currentEvent.verdantEmbrace = heal;
        currentEvent.target = heal.targetID;
      } else if (heal.ability.guid === SPELLS.TIME_OF_NEED_LIVING_FLAME.id) {
        currentEvent.livingFlames.push(heal);
        currentEvent.livingFlameTotalHeal += heal.amount + (heal.absorbed || 0);
        currentEvent.livingFlameTotalOverheal += heal.overheal ?? 0;
      }
    });

    this.spawns.push(currentEvent);
  }

  parseDamageTaken(tonSummon: SummonEvent, eventList: WCLEventsResponse) {
    //Iterate through all Time of Need spawns to find the one that matches
    this.spawns.forEach((spawn, index) => {
      if (spawn.summon.timestamp === tonSummon.timestamp) {
        //Check that ToN actually did any healing
        if (spawn.verdantEmbrace !== null || spawn.livingFlames.length > 0) {
          //If there is no damage events, then Time of Need didn't save the player from anything. Otherwise, parse them
          if (eventList.events.length !== 0) {
            //Iterate all the damage taken events during the time window
            eventList.events.forEach((hit) => {
              hit = hit as DamageEvent;
              //Check if the hit landed on the same player that the Time of Need targeted
              if (hit.targetID === spawn.target) {
                //If the hitpoints after the hit are equal or less than 0, the player died anyway
                if (hit.hitPoints !== undefined && hit.hitPoints === 0) {
                  this.spawns[index].result = Result.Dead;
                } else {
                  //Initialize the healing from Time of Need with the VE
                  let tonHealingAtThisPoint = spawn.verdantEmbrace?.amount || 0;
                  //If there is no living flames casted, or this hit was before the first living flame landed
                  if (
                    spawn.livingFlames.length === 0 ||
                    hit.timestamp < spawn.livingFlames[0].timestamp
                  ) {
                    //Check if the player would've died from this hit without the Verdant Embrace healing
                    if (
                      hit.hitPoints &&
                      hit.hitPoints > 0 &&
                      hit.hitPoints - tonHealingAtThisPoint <= 0
                    ) {
                      this.spawns[index].result = Result.Proc; //Person was saved by the VE
                    }
                  } else {
                    //Add up all the healing done by the living flames that happened before this hit
                    spawn.livingFlames.forEach((livingFlame) => {
                      if (livingFlame.timestamp < hit.timestamp) {
                        tonHealingAtThisPoint += livingFlame.amount;
                      }
                    });
                    //If the hit points after this hit minus the total ToN healing done to this point is equal or less than 0, then he was saved
                    if (
                      hit.hitPoints &&
                      hit.hitPoints > 0 &&
                      hit.hitPoints - tonHealingAtThisPoint <= 0
                    ) {
                      //Mark as long save
                      this.spawns[index].result = Result.Long;
                    }
                  }
                }
              }
            });
          }
        } else {
          //If ToN did no healing, it bugged out
          this.spawns[index].result = Result.Bug;
        }
      }
    });
  }

  async load() {
    //Run every ToN spawn through parseDamageTaken()
    for (const spawn of this.spawns) {
      await fetchWcl(`report/events/damage-taken/${this.owner.report.code}`, {
        start: spawn.summon.timestamp,
        end: spawn.summon.timestamp + 8000,
      }).then((json) => {
        json = json as WCLEventsResponse;
        this.parseDamageTaken(spawn.summon, json);
      });
    }
  }

  statistic() {
    return (
      <LazyLoadStatisticBox
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(60)}
        loader={this.load.bind(this)}
        label={
          <Trans>
            <SpellLink spell={TALENTS_EVOKER.TIME_OF_NEED_TALENT} /> events
          </Trans>
        }
        tooltip={
          <div>
            <SpellLink spell={TALENTS_EVOKER.TIME_OF_NEED_TALENT} /> will cast one{' '}
            <SpellLink spell={TALENTS_EVOKER.VERDANT_EMBRACE_TALENT} /> and several
            <SpellLink spell={SPELLS.LIVING_FLAME_HEAL} />s on the player that caused the proc.
            Depending on the amount of damage that player took during the 8 seconds
            <SpellLink spell={TALENTS_EVOKER.TIME_OF_NEED_TALENT} /> is active the event is
            classified as one of the following:
            <ul>
              <li>
                <b>Saved by Verdant Embrace:</b> If the player would've died from damage after the{' '}
                <SpellLink spell={TALENTS_EVOKER.VERDANT_EMBRACE_TALENT} /> but before any{' '}
                <SpellLink spell={SPELLS.LIVING_FLAME_HEAL} />
                s.
              </li>
              <li>
                <b>Saved by all the healing:</b> If the player was saved by a combination of the{' '}
                <SpellLink spell={TALENTS_EVOKER.VERDANT_EMBRACE_TALENT} /> and some{' '}
                <SpellLink spell={SPELLS.LIVING_FLAME_HEAL} /> healing.
              </li>
              <li>
                <b>Was not in danger of death:</b> If there wasn't any damage event big enough to
                kill the player even without the{' '}
                <SpellLink spell={TALENTS_EVOKER.TIME_OF_NEED_TALENT} /> healing.
              </li>
              <li>
                <b>Died anyway:</b> If they died anyway regardless of the{' '}
                <SpellLink spell={TALENTS_EVOKER.TIME_OF_NEED_TALENT} /> healing.
              </li>
              <li>
                <b>Time of Need fizzled out:</b> The player might have died before{' '}
                <SpellLink spell={TALENTS_EVOKER.TIME_OF_NEED_TALENT} /> had time to land the{' '}
                <SpellLink spell={TALENTS_EVOKER.VERDANT_EMBRACE_TALENT} />, and thus did no healing
                at all.
              </li>
            </ul>
          </div>
        }
        value={<Trans>Total of {this.spawns.length} events</Trans>}
      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Event Time</th>
              <th>Healing (Overhealing)</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {this.spawns.map((info, index) => (
              <tr key={index}>
                <td>{this.owner.formatTimestamp(info.summon.timestamp)}</td>
                <td>
                  <div>
                    {formatNumber(
                      info.verdantEmbrace?.amount || 0 + (info.verdantEmbrace?.absorbed || 0),
                    )}{' '}
                    ({formatNumber(info.verdantEmbrace?.overheal || 0)}){' '}
                    <SpellIcon spell={TALENTS_EVOKER.VERDANT_EMBRACE_TALENT} />
                  </div>
                  <div>
                    {formatNumber(info.livingFlameTotalHeal)} (
                    {formatNumber(info.livingFlameTotalOverheal)}){' '}
                    <SpellIcon spell={SPELLS.TIME_OF_NEED_LIVING_FLAME} />
                  </div>
                  <div>on {info.livingFlames.length} casts</div>
                </td>
                <td>{info.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </LazyLoadStatisticBox>
    );
  }
}

export default TimeOfNeed;
