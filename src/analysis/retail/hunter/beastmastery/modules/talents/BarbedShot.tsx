import { t, Trans } from '@lingui/macro';
import { MS_BUFFER_250 } from 'analysis/retail/hunter/shared/constants';
import { formatDuration, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import { SpellLink } from 'interface';
import { ExplanationAndDataSubSection } from 'interface/guide/components/ExplanationRow';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  EventType,
  FightEndEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { currentStacks } from 'parser/shared/modules/helpers/Stacks';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import {
  MAX_FRENZY_STACKS,
  ORIGINAL_FRENZY_DURATION,
  SAVAGERY_FRENZY_DURATION,
} from '../../constants';
import GlobalCooldown from '../core/GlobalCooldown';
import SpellUsable from '../core/SpellUsable';
import CastSummaryAndBreakdown from 'interface/guide/components/CastSummaryAndBreakdown';

/**
 * Fire a shot that tears through your enemy, causing them to bleed for X damage over 8 sec. Sends your pet into a frenzy, increasing attack speed by 30% for 8 sec, stacking up to 3 times.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/39yhq8VLFrm7J4wR#fight=17&type=casts&source=8&ability=-217200
 */

class BarbedShot extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    globalCooldown: GlobalCooldown,
  };

  protected spellUsable!: SpellUsable;
  protected globalCooldown!: GlobalCooldown;

  barbedShotStacks: number[][] = [];
  lastBarbedShotStack: number = 0;
  lastBarbedShotUpdate: number = this.owner.fight.start_time;
  frenzyBuffDuration: number = this.selectedCombatant.hasTalent(TALENTS.SAVAGERY_TALENT)
    ? SAVAGERY_FRENZY_DURATION
    : ORIGINAL_FRENZY_DURATION;

  //Guide specific variables
  castEntries: Array<BoxRowEntry & { event: CastEvent }> = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.BARBED_SHOT_TALENT);
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

    //Guide specific listeners
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.BARBED_SHOT_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.BARBED_SHOT_PET_BUFF),
      this.onRefresh,
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

  handleStacks(
    event:
      | RemoveBuffEvent
      | ApplyBuffEvent
      | ApplyBuffStackEvent
      | FightEndEvent
      | RefreshBuffEvent,
  ) {
    this.barbedShotStacks[this.lastBarbedShotStack].push(
      event.timestamp - this.lastBarbedShotUpdate,
    );
    if (event.type === EventType.FightEnd || event.type === EventType.RefreshBuff) {
      return;
    }
    this.lastBarbedShotUpdate = event.timestamp;
    //Bosses like Volcoross are shit and will trigger ApplyBuffEvents without the buff having expired, and it should have been RefreshBuffEvent instead
    if (
      event.type === EventType.ApplyBuff &&
      event.timestamp < this.lastBarbedShotUpdate + this.frenzyBuffDuration
    ) {
      return;
    }
    this.lastBarbedShotStack = currentStacks(event);
  }

  onRefresh(event: RefreshBuffEvent) {
    this.handleStacks(event);
    this.lastBarbedShotUpdate = event.timestamp;
  }

  getAverageBarbedShotStacks() {
    let avgStacks = 0;
    this.barbedShotStacks.forEach((elem: number[], index: number) => {
      avgStacks +=
        (elem.reduce((a: number, b: number) => a + b, 0) / this.owner.fightDuration) * index;
    });
    return avgStacks;
  }

  suggestions(when: When) {
    when(this.frenzyUptimeThreshold).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your pet has a general low uptime of the buff from{' '}
          <SpellLink spell={TALENTS.BARBED_SHOT_TALENT} />, you should never be sitting on 2 stacks
          of this spell.{' '}
        </>,
      )
        .icon(TALENTS.BARBED_SHOT_TALENT.icon)
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
          <SpellLink spell={TALENTS.BARBED_SHOT_TALENT} />. It's important to try and maintain the
          buff at 3 stacks for as long as possible, this is done by spacing out your casts, but at
          the same time never letting them cap on charges.{' '}
        </>,
      )
        .icon(TALENTS.BARBED_SHOT_TALENT.icon)
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
        <BoringSpellValueText spell={SPELLS.BARBED_SHOT_PET_BUFF}>
          <>
            <UptimeIcon /> {formatPercentage(this.percentUptimeMaxStacks)}%{' '}
            <small>3 stack uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  onCast(event: CastEvent) {
    //Barbed Shot casts are good if
    // There's less than a global (+ leeway) time remaining on Frenzy
    // Pet has less than 3 stacks, Scent of Blood is talented and Bestial Wrath is ready
    // Wild Instinct is talented & Call of the Wild is up
    // Wild Call is talented, and there's more than 1.4 charges of Barbed Shot
    // There's less than a GCD till Barbed Shot is fully recharged AND Bestial Wrath is on cooldown
    // Scent of Blood is talented and there's less than 12 seconds (+ gcd) till bestial wrath is ready
    const frenzyBuffRemaining =
      this.lastBarbedShotUpdate === this.owner.fight.start_time
        ? 0
        : Math.max(this.frenzyBuffDuration - (event.timestamp - this.lastBarbedShotUpdate), 0);

    const bestialWrathOnCooldown = this.spellUsable.isOnCooldown(TALENTS.BESTIAL_WRATH_TALENT.id);
    const currentBarbedShotStacks = this.lastBarbedShotStack;

    const currentGCDWithBuffer =
      this.globalCooldown.getGlobalCooldownDuration(TALENTS.BARBED_SHOT_TALENT.id) + MS_BUFFER_250;

    //We subtract 1 because it's the one we just used, but we want to make calculations based on the state before using it
    const chargesOnCd = this.spellUsable.chargesOnCooldown(TALENTS.BARBED_SHOT_TALENT.id) - 1;
    const barbedShotCharges = 2 - chargesOnCd;
    const barbedShotFractionalCharges =
      barbedShotCharges +
      (this.spellUsable.isOnCooldown(TALENTS.BARBED_SHOT_TALENT.id)
        ? (this.spellUsable.fullCooldownDuration(TALENTS.BARBED_SHOT_TALENT.id) -
            this.spellUsable.cooldownRemaining(TALENTS.BARBED_SHOT_TALENT.id)) /
          this.spellUsable.fullCooldownDuration(TALENTS.BARBED_SHOT_TALENT.id)
        : 0);

    const baseTooltip = (
      <>
        @ <strong>{this.owner.formatTimestamp(event.timestamp)}</strong> targetting{' '}
        <strong>{this.owner.getTargetName(event) || 'unknown'}</strong>
        <br />
      </>
    );

    if (frenzyBuffRemaining > 0 && frenzyBuffRemaining < currentGCDWithBuffer) {
      const tooltip = (
        <>
          {baseTooltip}
          You refreshed <SpellLink spell={SPELLS.BARBED_SHOT_PET_BUFF} /> with{' '}
          {(frenzyBuffRemaining / 1000).toFixed(2)} seconds remaining.
        </>
      );
      this.castEntries.push({ value: QualitativePerformance.Good, tooltip, event });
      return;
    }

    if (
      currentBarbedShotStacks < MAX_FRENZY_STACKS &&
      this.selectedCombatant.hasTalent(TALENTS.SCENT_OF_BLOOD_TALENT) &&
      !bestialWrathOnCooldown
    ) {
      const tooltip = (
        <>
          {baseTooltip}
          You progressed towards {MAX_FRENZY_STACKS} stacks of{' '}
          <SpellLink spell={SPELLS.BARBED_SHOT_PET_BUFF} /> while{' '}
          <SpellLink spell={TALENTS.BESTIAL_WRATH_TALENT} /> was available to reset charges
          afterwards.
          <br />
          Pet had {currentBarbedShotStacks} stacks of{' '}
          <SpellLink spell={SPELLS.BARBED_SHOT_PET_BUFF} />.
        </>
      );
      this.castEntries.push({ value: QualitativePerformance.Good, tooltip, event });
      return;
    }

    if (
      this.selectedCombatant.hasTalent(TALENTS.WILD_CALL_TALENT) &&
      barbedShotFractionalCharges > 1.4
    ) {
      const tooltip = (
        <>
          {baseTooltip}
          You had <strong>{barbedShotFractionalCharges.toFixed(1)}</strong> charges of{' '}
          <SpellLink spell={TALENTS.BARBED_SHOT_TALENT} /> while talented into{' '}
          <SpellLink spell={TALENTS.WILD_CALL_TALENT} /> giving you more resets.
        </>
      );
      this.castEntries.push({ value: QualitativePerformance.Good, tooltip, event });
      return;
    }

    if (
      barbedShotCharges === 1 &&
      bestialWrathOnCooldown &&
      currentGCDWithBuffer > this.spellUsable.cooldownRemaining(TALENTS.BARBED_SHOT_TALENT.id)
    ) {
      const tooltip = (
        <>
          {baseTooltip}
          You used <SpellLink spell={TALENTS.BARBED_SHOT_TALENT} /> as it was almost coming off
          cooldown.
        </>
      );
      this.castEntries.push({ value: QualitativePerformance.Good, tooltip, event });
      return;
    }

    if (
      this.selectedCombatant.hasTalent(TALENTS.SCENT_OF_BLOOD_TALENT) &&
      bestialWrathOnCooldown &&
      this.spellUsable.cooldownRemaining(TALENTS.BESTIAL_WRATH_TALENT.id) <
        12000 + currentGCDWithBuffer
    ) {
      const tooltip = (
        <>
          {baseTooltip}
          You used <SpellLink spell={TALENTS.BARBED_SHOT_TALENT} /> as{' '}
          <SpellLink spell={TALENTS.BESTIAL_WRATH_TALENT} /> was close to coming off cooldown while
          talented into <SpellLink spell={TALENTS.SCENT_OF_BLOOD_TALENT} />.
        </>
      );
      this.castEntries.push({ value: QualitativePerformance.Good, tooltip, event });
      return;
    }

    if (this.selectedCombatant.hasTalent(TALENTS.SAVAGERY_TALENT)) {
      const tooltip = (
        <>
          {baseTooltip}
          You used <SpellLink spell={TALENTS.BARBED_SHOT_TALENT} /> while talented into{' '}
          <SpellLink spell={TALENTS.SAVAGERY_TALENT} /> giving your{' '}
          <SpellLink spell={SPELLS.BARBED_SHOT_PET_BUFF} /> a longer duration.
        </>
      );
      this.castEntries.push({ value: QualitativePerformance.Good, tooltip, event });
      return;
    }

    const badTooltip = (
      <>
        {baseTooltip} You didn't fulfill any of the criteria of casting a good{' '}
        <SpellLink spell={TALENTS.BARBED_SHOT_TALENT} />.
        <br />
        {barbedShotFractionalCharges < 1.4 && frenzyBuffRemaining > currentGCDWithBuffer && (
          <>
            You should have delayed your <SpellLink spell={TALENTS.BARBED_SHOT_TALENT} /> cast since{' '}
            <SpellLink spell={SPELLS.BARBED_SHOT_PET_BUFF} /> had{' '}
            {(frenzyBuffRemaining / 1000).toFixed(2)} seconds remaining, and you had{' '}
            {barbedShotFractionalCharges.toFixed(2)}{' '}
            <SpellLink spell={TALENTS.BARBED_SHOT_TALENT} /> charges available.
          </>
        )}
      </>
    );

    this.castEntries.push({ value: QualitativePerformance.Fail, tooltip: badTooltip, event });
  }

  guideSubsection() {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={TALENTS.BARBED_SHOT_TALENT} />
        </strong>{' '}
        is your primary <strong>builder</strong> for <strong>Focus</strong>, and is used to maintain{' '}
        <SpellLink spell={SPELLS.BARBED_SHOT_PET_BUFF} /> on your pet. With{' '}
        <SpellLink spell={TALENTS.BARBED_WRATH_TALENT} /> talented it helps to lower the cooldown of{' '}
        <SpellLink spell={TALENTS.BESTIAL_WRATH_TALENT} /> by a significant amount. Therefore you
        should aim to keep <SpellLink spell={SPELLS.BARBED_SHOT_PET_BUFF} /> and{' '}
        <SpellLink spell={TALENTS.BESTIAL_WRATH_TALENT} /> rolling to maximize the potential of your{' '}
        <SpellLink spell={TALENTS.BARBED_SHOT_TALENT} /> usage.
      </p>
    );
    const data = (
      <CastSummaryAndBreakdown
        spell={TALENTS.BARBED_SHOT_TALENT}
        castEntries={this.castEntries}
        goodLabel={t({
          id: 'guide.hunter.beastmastery.sections.rotation.barbedshot.data.summary.performance.good',
          message: 'Barbed Shot',
        })}
        includeGoodCastPercentage
        badLabel={t({
          id: 'guide.hunter.beastmastery.sections.rotation.barbedshot.data.summary.performance.bad',
          message: 'Bad Barbed Shots',
        })}
      />
    );
    return <ExplanationAndDataSubSection explanation={explanation} data={data} />;
  }
}

export default BarbedShot;
