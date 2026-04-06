import type { JSX } from 'react';
import SPELLS from 'common/SPELLS/monk';
import { formatNumber } from 'common/format';
import TALENTS_MONK from 'common/TALENTS/monk';
import { SpellIcon, SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import ChiTracker from 'analysis/retail/monk/windwalker/modules/resources/ChiTracker';
import SpellUsable from 'analysis/retail/monk/windwalker/modules/core/SpellUsable';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';

class Zenith extends Analyzer.withDependencies({
  chi: ChiTracker,
  spellUsable: SpellUsable,
}) {
  private zenithActiveUntil = 0;
  private blackoutKicksDuringZenith = 0;
  private chiGenerated = 0;
  private chiGeneratedPotential = 0;
  private readonly hasObsidianSpiral: boolean = false;
  private readonly zenithDurationMs: number = 15000;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.ZENITH_TALENT);
    if (!this.active) {
      return;
    }
    this.hasObsidianSpiral = this.selectedCombatant.hasTalent(TALENTS_MONK.OBSIDIAN_SPIRAL_TALENT);
    this.zenithDurationMs =
      15000 +
      (this.selectedCombatant.hasTalent(TALENTS_MONK.DRINKING_HORN_COVER_TALENT) ? 5000 : 0);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.ZENITH_TALENT),
      this.onZenithCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.BLACKOUT_KICK, SPELLS.BLACKOUT_KICK_TOTM]),
      this.onBlackoutKick,
    );
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
    this.blackoutKicksDuringZenith += 1;
    this.chiGeneratedPotential += 1;
    if (this.hasObsidianSpiral) {
      const current = this.deps.chi.current;
      const max = this.deps.chi.maxResource;
      const actualGain = Math.max(0, Math.min(1, max - current));
      this.chiGenerated += actualGain;
      this.deps.chi.processInvisibleEnergize(
        TALENTS_MONK.OBSIDIAN_SPIRAL_TALENT.id,
        1,
        event.timestamp,
      );
    }
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
        resets <SpellLink spell={TALENTS_MONK.RISING_SUN_KICK_TALENT} />, grants 2 Chi, and for 15
        seconds reduces Chi costs by 1 while making <SpellLink spell={SPELLS.BLACKOUT_KICK} />{' '}
        reduce the cooldown of affected abilities by an additional 1 second.
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
                this.hasObsidianSpiral ? this.chiGenerated : this.chiGeneratedPotential,
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
              spell={TALENTS_MONK.OBSIDIAN_SPIRAL_TALENT}
              style={{
                height: '1.3em',
                marginTop: '-1.em',
              }}
            />{' '}
            {formatNumber(this.hasObsidianSpiral ? this.chiGenerated : this.chiGeneratedPotential)}{' '}
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
