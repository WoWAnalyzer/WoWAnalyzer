import React from 'react';

import Analyzer, { SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/index';
import SpellLink from 'common/SpellLink';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import { formatDuration, formatPercentage } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import UptimeIcon from 'interface/icons/Uptime';
import Events, { ApplyBuffEvent, ApplyBuffStackEvent, EventType, FightEndEvent, RemoveBuffEvent } from 'parser/core/Events';
import { currentStacks } from 'parser/shared/modules/helpers/Stacks';

/**
 * Fire a shot that tears through your enemy, causing them to bleed for [(10%
 * of Attack power) * 8 / 2] damage over 8 sec. Sends your pet into a frenzy,
 * increasing attack speed by 30% for 8 sec, stacking up to 3 times.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/39yhq8VLFrm7J4wR#fight=17&type=casts&source=8&ability=-217200
 */

//max stacks your pet can have of the Frenzy buff
const MAX_FRENZY_STACKS: number = 3;

class BarbedShot extends Analyzer {

  barbedShotStacks: Array<Array<number>> = [];
  lastBarbedShotStack: number = 0;
  lastBarbedShotUpdate: number = this.owner.fight.start_time;

  constructor(options: any) {
    super(options);
    this.barbedShotStacks = Array.from({ length: MAX_FRENZY_STACKS + 1 }, x => []);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.BARBED_SHOT_PET_BUFF), (event: ApplyBuffEvent) => this.handleStacks(event));
    this.addEventListener(Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.BARBED_SHOT_PET_BUFF), (event: ApplyBuffStackEvent) => this.handleStacks(event));
    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER_PET).spell(SPELLS.BARBED_SHOT_PET_BUFF), (event: RemoveBuffEvent) => this.handleStacks(event));
    this.addEventListener(Events.fightend, (event: FightEndEvent) => this.handleStacks(event));
  }

  get barbedShotTimesByStacks() {
    return this.barbedShotStacks;
  }

  get percentUptimeMaxStacks() {
    return (this.barbedShotStacks[MAX_FRENZY_STACKS].reduce((a: number, b: number) => a + b, 0)) / this.owner.fightDuration;
  }

  get percentUptimePet() {
    //This removes the time spent without the pet having the frenzy buff
    const withoutNoBuff = this.barbedShotStacks.slice(1);
    //Because .flat doesn't work in Microsoft Edge (non-chromium versions), we use this alternate option that is equivalent
    const alternativeFlatten = withoutNoBuff.reduce((acc, val) => acc.concat(val), []);
    //After flattening the array, we can reduce it normally.
    return alternativeFlatten.reduce((totalUptime: number, stackUptime: number) => totalUptime + stackUptime, 0) / this.owner.fightDuration;
  }

  get percentPlayerUptime() {
    //This calculates the uptime over the course of the encounter of Barbed Shot for the player
    return this.selectedCombatant.getBuffUptime(SPELLS.BARBED_SHOT_BUFF.id) / this.owner.fightDuration;
  }

  get frenzyUptimeThreshold() {
    return {
      actual: this.percentUptimePet,
      isLessThan: {
        minor: 0.90,
        average: 0.825,
        major: 0.75,
      },
      style: 'percentage',
    };
  }

  get frenzy3StackThreshold() {
    if (this.selectedCombatant.hasTrait(SPELLS.FEEDING_FRENZY.id)) {
      return {
        actual: this.percentUptimeMaxStacks,
        isLessThan: {
          minor: 0.85,
          average: 0.80,
          major: 0.75,
        },
        style: 'percentage',
      };
    } else {
      return {
        actual: this.percentUptimeMaxStacks,
        isLessThan: {
          minor: 0.75,
          average: 0.70,
          major: 0.65,
        },
        style: 'percentage',
      };
    }
  }

  handleStacks(event: RemoveBuffEvent | ApplyBuffEvent | ApplyBuffStackEvent | FightEndEvent) {
    this.barbedShotStacks[this.lastBarbedShotStack].push(event.timestamp - this.lastBarbedShotUpdate);
    if (event.type === EventType.FightEnd) {
      return;
    }
    this.lastBarbedShotUpdate = event.timestamp;
    this.lastBarbedShotStack = currentStacks(event);
  }

  getAverageBarbedShotStacks() {
    let avgStacks = 0;
    this.barbedShotStacks.forEach((elem: Array<number>, index: number) => {
      avgStacks += elem.reduce((a: number, b: number) => a + b, 0) / this.owner.fightDuration * index;
    });
    return avgStacks;
  }

  suggestions(when: any) {
    when(this.frenzyUptimeThreshold).addSuggestion((suggest: any, actual: any, recommended: any) => {
      return suggest(<>Your pet has a general low uptime of the buff from <SpellLink id={SPELLS.BARBED_SHOT.id} />, you should never be sitting on 2 stacks of this spell, if you've chosen this talent, it's your most important spell to continously be casting. </>)
        .icon(SPELLS.BARBED_SHOT.icon)
        .actual(`Your pet had the buff from Barbed Shot for ${formatPercentage(actual)}% of the fight`)
        .recommended(`${formatPercentage(recommended)}% is recommended`);
    });
    when(this.frenzy3StackThreshold).addSuggestion((suggest: any, actual: any, recommended: any) => {
      return suggest(<>Your pet has a general low uptime of the 3 stacked buff from <SpellLink id={SPELLS.BARBED_SHOT.id} />. It's important to try and maintain the buff at 3 stacks for as long as possible, this is done by spacing out your casts, but at the same time never letting them cap on charges. </>)
        .icon(SPELLS.BARBED_SHOT.icon)
        .actual(`Your pet had 3 stacks of the buff from Barbed Shot for ${formatPercentage(actual)}% of the fight`)
        .recommended(`${formatPercentage(recommended)}% is recommended`);
    });
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(15)}
        size="flexible"
        tooltip={(
          <>
            <ul>
              <li>Your pet had an average of {this.getAverageBarbedShotStacks().toFixed(2)} stacks active throughout the fight.</li>
              <li>Your pet had an overall uptime of {formatPercentage(this.percentUptimePet)}% on the increased attack speed buff</li>
              <li>You had an uptime of {formatPercentage(this.percentPlayerUptime)}% on the focus regen buff.</li>
            </ul>
          </>
        )}
        dropdown={(
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Stacks</th>
                  <th>Time (s)</th>
                  <th>Time (%)</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(this.barbedShotTimesByStacks).map((e, i) => (
                  <tr key={i}>
                    <th>{i}</th>
                    <td>{formatDuration(e.reduce((a: number, b: number) => a + b, 0) / 1000)}</td>
                    <td>{formatPercentage(e.reduce((a: number, b: number) => a + b, 0) / this.owner.fightDuration)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.BARBED_SHOT_PET_BUFF}>
          <>
            <UptimeIcon /> {formatPercentage(this.percentUptimeMaxStacks)}% <small>3 stack uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default BarbedShot;
