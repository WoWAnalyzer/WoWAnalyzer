import { Trans } from '@lingui/macro';
import { formatDuration, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  ResourceChangeEvent,
  EventType,
  FightEndEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { currentStacks } from 'parser/shared/modules/helpers/Stacks';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { NESINGWARY_FOCUS_GAIN_MULTIPLIER } from '@wowanalyzer/hunter';

import {
  BARBED_SHOT_FOCUS_REGEN_BUFFS,
  BARBED_SHOT_REGEN,
  MAX_FRENZY_STACKS,
} from '../../constants';

/**
 * Fire a shot that tears through your enemy, causing them to bleed for X damage over 8 sec. Sends your pet into a frenzy, increasing attack speed by 30% for 8 sec, stacking up to 3 times.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/39yhq8VLFrm7J4wR#fight=17&type=casts&source=8&ability=-217200
 */

class BarbedShot extends Analyzer {
  barbedShotStacks: number[][] = [];
  lastBarbedShotStack: number = 0;
  lastBarbedShotUpdate: number = this.owner.fight.start_time;
  additionalFocusFromNesingwary = 0;
  possibleAdditionalFocusFromNesingwary = 0;

  constructor(options: Options) {
    super(options);
    this.barbedShotStacks = Array.from({ length: MAX_FRENZY_STACKS + 1 }, (x) => []);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.BARBED_SHOT_PET_BUFF),
      this.handleStacks,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.BARBED_SHOT_PET_BUFF),
      this.handleStacks,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER_PET).spell(SPELLS.BARBED_SHOT_PET_BUFF),
      this.handleStacks,
    );
    this.addEventListener(Events.fightend, this.handleStacks);
    this.selectedCombatant.hasLegendary(SPELLS.NESINGWARYS_TRAPPING_APPARATUS_EFFECT) &&
      this.addEventListener(
        Events.resourcechange.by(SELECTED_PLAYER).spell(BARBED_SHOT_FOCUS_REGEN_BUFFS),
        this.checkNesingwaryFocusGain,
      );
  }

  get barbedShotTimesByStacks() {
    return this.barbedShotStacks;
  }

  get percentUptimeMaxStacks() {
    return (
      this.barbedShotStacks[MAX_FRENZY_STACKS].reduce((a: number, b: number) => a + b, 0) /
      this.owner.fightDuration
    );
  }

  get percentUptimePet() {
    //This removes the time spent without the pet having the frenzy buff
    const withoutNoBuff = this.barbedShotStacks.slice(1);
    //Because .flat doesn't work in Microsoft Edge (non-chromium versions), we use this alternate option that is equivalent
    const alternativeFlatten = withoutNoBuff.reduce((acc, val) => acc.concat(val), []);
    //After flattening the array, we can reduce it normally.
    return (
      alternativeFlatten.reduce(
        (totalUptime: number, stackUptime: number) => totalUptime + stackUptime,
        0,
      ) / this.owner.fightDuration
    );
  }

  get percentPlayerUptime() {
    //This calculates the uptime over the course of the encounter of Barbed Shot for the player
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.BARBED_SHOT_BUFF.id) / this.owner.fightDuration
    );
  }

  get frenzyUptimeThreshold() {
    return {
      actual: this.percentUptimePet,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.85,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get frenzy3StackThreshold() {
    return {
      actual: this.percentUptimeMaxStacks,
      isLessThan: {
        minor: 0.85,
        average: 0.8,
        major: 0.75,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  handleStacks(event: RemoveBuffEvent | ApplyBuffEvent | ApplyBuffStackEvent | FightEndEvent) {
    this.barbedShotStacks[this.lastBarbedShotStack].push(
      event.timestamp - this.lastBarbedShotUpdate,
    );
    if (event.type === EventType.FightEnd) {
      return;
    }
    this.lastBarbedShotUpdate = event.timestamp;
    this.lastBarbedShotStack = currentStacks(event);
  }

  getAverageBarbedShotStacks() {
    let avgStacks = 0;
    this.barbedShotStacks.forEach((elem: number[], index: number) => {
      avgStacks +=
        (elem.reduce((a: number, b: number) => a + b, 0) / this.owner.fightDuration) * index;
    });
    return avgStacks;
  }

  checkNesingwaryFocusGain(event: ResourceChangeEvent) {
    const waste = BARBED_SHOT_REGEN - event.resourceChange;
    if (this.selectedCombatant.hasBuff(SPELLS.NESINGWARYS_TRAPPING_APPARATUS_ENERGIZE.id)) {
      this.additionalFocusFromNesingwary +=
        event.resourceChange * (1 - 1 / NESINGWARY_FOCUS_GAIN_MULTIPLIER) - waste;
      this.possibleAdditionalFocusFromNesingwary += BARBED_SHOT_REGEN;
    }
  }

  suggestions(when: When) {
    when(this.frenzyUptimeThreshold).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your pet has a general low uptime of the buff from{' '}
          <SpellLink id={SPELLS.BARBED_SHOT.id} />, you should never be sitting on 2 stacks of this
          spell.{' '}
        </>,
      )
        .icon(SPELLS.BARBED_SHOT.icon)
        .actual(
          <Trans id="hunter.beastmastery.suggestions.barbedShot.petBuff.uptime">
            Your pet had the buff from Barbed Shot for {formatPercentage(actual)}% of the fight{' '}
          </Trans>,
        )
        .recommended(
          <Trans id="hunter.beastmastery.suggestions.barbedShot.petBuff.recommended">
            {formatPercentage(recommended)}% is recommended{' '}
          </Trans>,
        ),
    );
    when(this.frenzy3StackThreshold).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your pet has a general low uptime of the 3 stacked buff from{' '}
          <SpellLink id={SPELLS.BARBED_SHOT.id} />. It's important to try and maintain the buff at 3
          stacks for as long as possible, this is done by spacing out your casts, but at the same
          time never letting them cap on charges.{' '}
        </>,
      )
        .icon(SPELLS.BARBED_SHOT.icon)
        .actual(
          <Trans id="hunter.beastmastery.suggestions.barbedShot.threeStacks.uptime">
            Your pet had 3 stacks of the buff from Barbed Shot for {formatPercentage(actual)}% of
            the fight
          </Trans>,
        )
        .recommended(
          <Trans id="hunter.beastmastery.suggestions.barbedShot.threeStacks.recommended">
            {formatPercentage(recommended)}% is recommended{' '}
          </Trans>,
        ),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(1)}
        size="flexible"
        tooltip={
          <>
            <ul>
              <li>
                Your pet had an average of {this.getAverageBarbedShotStacks().toFixed(2)} stacks
                active throughout the fight.
              </li>
              <li>
                Your pet had an overall uptime of {formatPercentage(this.percentUptimePet)}% on the
                increased attack speed buff
              </li>
              <li>
                You had an uptime of {formatPercentage(this.percentPlayerUptime)}% on the focus
                regen buff.
              </li>
            </ul>
          </>
        }
        dropdown={
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
                    <td>{formatDuration(e.reduce((a: number, b: number) => a + b, 0))}</td>
                    <td>
                      {formatPercentage(
                        e.reduce((a: number, b: number) => a + b, 0) / this.owner.fightDuration,
                      )}
                      %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.BARBED_SHOT_PET_BUFF.id}>
          <>
            <UptimeIcon /> {formatPercentage(this.percentUptimeMaxStacks)}%{' '}
            <small>3 stack uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default BarbedShot;
