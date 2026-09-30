import type { JSX } from 'react';
import SPELLS from 'common/SPELLS/monk';
import { formatNumber } from 'common/format';
import TALENTS_MONK from 'common/TALENTS/monk';
import { SpellIcon, SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  FightEndEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import ChiTracker from 'analysis/retail/monk/windwalker/modules/resources/ChiTracker';
import SpellUsable from 'analysis/retail/monk/windwalker/modules/core/SpellUsable';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import { getZenithDurationMs } from '../apl/common';

const ADDITIONAL_BLACKOUT_KICK_CDR_MS = 1000;
const TOTM_CONSUME_WINDOW_MS = 400;
const ZENITH_STOMP_DEDUP_WINDOW_MS = 150;

class Zenith extends Analyzer.withDependencies({
  chi: ChiTracker,
  spellUsable: SpellUsable,
}) {
  private zenithActiveUntil = 0;
  private blackoutKicksDuringZenith = 0;
  private obsidianSpiralChiGenerated = 0;
  private obsidianSpiralChiGeneratedPotential = 0;
  private zenithStompsDuringZenith = 0;
  private zenithStompChiGenerated = 0;
  private zenithStompChiWasted = 0;
  private lastZenithStompTimestamp = -Infinity;
  private unusedZenithStomps = 0;
  private currentZenithStompStacks = 0;
  private readonly hasObsidianSpiral: boolean = false;
  private readonly additionalZenithStompCharges: number = 0;
  private readonly zenithDurationMs: number = 0;
  private lastBlackoutKickTimestamp = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.ZENITH_TALENT);
    if (!this.active) {
      return;
    }
    this.hasObsidianSpiral = this.selectedCombatant.hasTalent(TALENTS_MONK.OBSIDIAN_SPIRAL_TALENT);
    this.additionalZenithStompCharges = this.selectedCombatant.hasTalent(
      TALENTS_MONK.TIGEREYE_BREW_3_WINDWALKER_TALENT,
    )
      ? 2
      : 0;
    this.zenithDurationMs = getZenithDurationMs(this.selectedCombatant);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.ZENITH_TALENT),
      this.onZenithCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.BLACKOUT_KICK, SPELLS.BLACKOUT_KICK_TOTM]),
      this.onBlackoutKick,
    );
    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([
          TALENTS_MONK.ZENITH_STOMP_TALENT,
          SPELLS.ZENITH_STOMP_CAST,
          SPELLS.ZENITH_STOMP_DAMAGE,
        ]),
      this.onZenithStomp,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.ZENITH_STOMP_CAST),
      this.onZenithStompBuffApplied,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.ZENITH_STOMP_CAST),
      this.onZenithStompBuffStackChanged,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.ZENITH_STOMP_CAST),
      this.onZenithStompBuffStackChanged,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.ZENITH_STOMP_CAST),
      this.onZenithStompBuffRemoved,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.TEACHINGS_OF_THE_MONASTERY),
      this.onTotmConsumed,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.TEACHINGS_OF_THE_MONASTERY),
      this.onTotmConsumed,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  private isZenithActive(timestamp: number) {
    return timestamp <= this.zenithActiveUntil;
  }

  private onZenithCast(event: CastEvent) {
    const end = event.timestamp + this.zenithDurationMs;
    this.zenithActiveUntil = Math.max(this.zenithActiveUntil, end);
    this.deps.spellUsable.endCooldown(TALENTS_MONK.RISING_SUN_KICK_TALENT.id, event.timestamp);
  }

  private onBlackoutKick(event: CastEvent) {
    if (!this.isZenithActive(event.timestamp)) {
      return;
    }

    this.lastBlackoutKickTimestamp = event.timestamp;
    this.deps.spellUsable.reduceCooldown(
      TALENTS_MONK.RISING_SUN_KICK_TALENT.id,
      ADDITIONAL_BLACKOUT_KICK_CDR_MS,
      event.timestamp,
    );
    this.deps.spellUsable.reduceCooldown(
      TALENTS_MONK.FISTS_OF_FURY_TALENT.id,
      ADDITIONAL_BLACKOUT_KICK_CDR_MS,
      event.timestamp,
    );

    this.blackoutKicksDuringZenith += 1;
    this.obsidianSpiralChiGeneratedPotential += 1;
    if (this.hasObsidianSpiral) {
      const current = this.deps.chi.current;
      const max = this.deps.chi.maxResource;
      const actualGain = Math.max(0, Math.min(1, max - current));
      this.obsidianSpiralChiGenerated += actualGain;
      this.deps.chi.processInvisibleEnergize(
        TALENTS_MONK.OBSIDIAN_SPIRAL_TALENT.id,
        1,
        event.timestamp,
      );
    }
  }

  private onZenithStomp(event: CastEvent) {
    if (!this.isZenithActive(event.timestamp)) {
      return;
    }
    if (event.timestamp - this.lastZenithStompTimestamp <= ZENITH_STOMP_DEDUP_WINDOW_MS) {
      return;
    }
    this.lastZenithStompTimestamp = event.timestamp;

    this.zenithStompsDuringZenith += 1;
    const current = this.deps.chi.current;
    const max = this.deps.chi.maxResource;
    const actualGain = Math.max(0, Math.min(2, max - current));
    this.zenithStompChiGenerated += actualGain;
    this.zenithStompChiWasted += 2 - actualGain;
  }

  private onZenithStompBuffApplied(_event: ApplyBuffEvent) {
    if (this.additionalZenithStompCharges <= 0) {
      return;
    }
    this.currentZenithStompStacks = Math.max(this.currentZenithStompStacks, 1);
  }

  private onZenithStompBuffStackChanged(event: ApplyBuffStackEvent | RemoveBuffStackEvent) {
    if (this.additionalZenithStompCharges <= 0) {
      return;
    }
    this.currentZenithStompStacks = event.stack;
  }

  private onZenithStompBuffRemoved(_event: RemoveBuffEvent) {
    if (this.additionalZenithStompCharges <= 0) {
      return;
    }
    this.unusedZenithStomps += this.currentZenithStompStacks;
    this.currentZenithStompStacks = 0;
  }

  private onFightEnd(_event: FightEndEvent) {
    if (this.additionalZenithStompCharges <= 0 || this.currentZenithStompStacks <= 0) {
      return;
    }
    this.unusedZenithStomps += this.currentZenithStompStacks;
    this.currentZenithStompStacks = 0;
  }

  private onTotmConsumed(event: RemoveBuffEvent | RemoveBuffStackEvent) {
    if (!this.isZenithActive(event.timestamp)) {
      return;
    }
    if (event.timestamp - this.lastBlackoutKickTimestamp > TOTM_CONSUME_WINDOW_MS) {
      return;
    }

    // Match the inferred TotM bonus strike so Zenith grants its extra 1s CDR
    // even when the bonus Blackout Kick is not logged as a separate cast.
    this.deps.spellUsable.reduceCooldown(
      TALENTS_MONK.RISING_SUN_KICK_TALENT.id,
      ADDITIONAL_BLACKOUT_KICK_CDR_MS,
      event.timestamp,
    );
    this.deps.spellUsable.reduceCooldown(
      TALENTS_MONK.FISTS_OF_FURY_TALENT.id,
      ADDITIONAL_BLACKOUT_KICK_CDR_MS,
      event.timestamp,
    );
  }

  get guideSubsection(): JSX.Element {
    const styleObj = {
      fontSize: 20,
    };
    const styleObjInner = {
      fontSize: 15,
    };

    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS_MONK.ZENITH_TALENT} />
        </b>{' '}
        resets <SpellLink spell={TALENTS_MONK.RISING_SUN_KICK_TALENT} /> and for 15 seconds reduces
        Chi costs by 1 while making <SpellLink spell={SPELLS.BLACKOUT_KICK} /> reduce the cooldown
        of affected abilities by an additional 1 second. Casting{' '}
        <SpellLink spell={TALENTS_MONK.ZENITH_TALENT} /> grants 2 charges of{' '}
        <SpellLink spell={TALENTS_MONK.ZENITH_STOMP_TALENT} />, and each cast generates 2 Chi.
      </p>
    );

    const chiLabel = this.hasObsidianSpiral
      ? 'Chi generated with Obsidian Spiral'
      : 'Chi that would have been generated with Obsidian Spiral';
    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={TALENTS_MONK.ZENITH_TALENT} /> cast efficiency
          </strong>
          {this.guideSubStatistic()}
          <div style={styleObj}>
            <small style={styleObjInner}>
              <SpellLink spell={TALENTS_MONK.OBSIDIAN_SPIRAL_TALENT} /> -{' '}
            </small>
            <strong>
              {formatNumber(
                this.hasObsidianSpiral
                  ? this.obsidianSpiralChiGenerated
                  : this.obsidianSpiralChiGeneratedPotential,
              )}
            </strong>{' '}
            <small>{chiLabel}</small>
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }

  guideSubStatistic() {
    return (
      <CastEfficiencyBar
        spell={TALENTS_MONK.ZENITH_TALENT}
        gapHighlightMode={GapHighlight.FullCooldown}
        minimizeIcons
        slimLines
        useThresholds
      />
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(6)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={TALENTS_MONK.ZENITH_TALENT}>
          <div>
            <SpellIcon
              spell={SPELLS.BLACKOUT_KICK}
              style={{
                height: '1.3em',
                marginTop: '-1.em',
              }}
            />{' '}
            {formatNumber(this.blackoutKicksDuringZenith)}{' '}
            <small>Blackout Kicks during Zenith</small>
          </div>
          <div>
            <SpellIcon
              spell={TALENTS_MONK.ZENITH_STOMP_TALENT}
              style={{
                height: '1.3em',
                marginTop: '-1.em',
              }}
            />{' '}
            {formatNumber(this.zenithStompsDuringZenith)} <small>Zenith Stomps during Zenith</small>
          </div>
          <div>
            <SpellIcon
              spell={TALENTS_MONK.OBSIDIAN_SPIRAL_TALENT}
              style={{
                height: '1.3em',
                marginTop: '-1.em',
              }}
            />{' '}
            {formatNumber(
              this.hasObsidianSpiral
                ? this.obsidianSpiralChiGenerated
                : this.obsidianSpiralChiGeneratedPotential,
            )}{' '}
            <small>
              {this.hasObsidianSpiral
                ? 'Chi generated during Zenith'
                : 'Chi that would have been generated during Zenith (requires Obsidian Spiral)'}
            </small>
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Zenith;
