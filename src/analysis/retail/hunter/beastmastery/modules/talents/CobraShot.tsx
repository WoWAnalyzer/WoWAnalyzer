import { Trans } from '@lingui/macro';
import GlobalCooldown from 'analysis/retail/hunter/beastmastery/modules/core/GlobalCooldown';
import { formatNumber, formatPercentage } from 'common/format';
import TALENTS from 'common/TALENTS/hunter';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { COBRA_SHOT_CDR_MS, COBRA_SHOT_FOCUS_THRESHOLD_TO_WAIT } from '../../constants';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';

/**
 * A quick shot causing Physical damage.
 * Reduces the cooldown of Kill Command by 1 sec.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/bf3r17Yh86VvDLdF#fight=8&type=damage-done&source=1&ability=193455
 */

class CobraShot extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    globalCooldown: GlobalCooldown,
  };

  effectiveKCReductionMs = 0;
  wastedKCReductionMs = 0;
  wastedCasts = 0;
  casts = 0;
  cobraShotCDR = COBRA_SHOT_CDR_MS;

  protected spellUsable!: SpellUsable;
  protected globalCooldown!: GlobalCooldown;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.COBRA_SHOT_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.COBRA_SHOT_TALENT),
      this.onCobraShotCast,
    );
    this.cobraShotCDR += this.selectedCombatant.hasTalent(TALENTS.COBRA_SENSES_TALENT) ? 1000 : 0;
  }

  get totalPossibleCDR() {
    return Math.max(this.casts * this.cobraShotCDR, 1);
  }

  get wastedCDR() {
    return this.wastedKCReductionMs / 1000;
  }

  get cdrEfficiencyCobraShotThreshold() {
    return {
      actual: this.effectiveKCReductionMs / this.totalPossibleCDR,
      isLessThan: {
        minor: 0.85,
        average: 0.8,
        major: 0.75,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get wastedCobraShotsThreshold() {
    return {
      actual: this.wastedCasts,
      isGreaterThan: {
        minor: 0,
        average: 1,
        major: 2,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  onCobraShotCast(event: CastEvent) {
    this.casts += 1;
    if (!this.spellUsable.isOnCooldown(TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT.id)) {
      this.wastedCasts += 1;
      this.wastedKCReductionMs += this.cobraShotCDR;
      addInefficientCastReason(event, 'Cobra Shot cast while Kill Command is not on cooldown.');
      return;
    }
    const globalCooldown = this.globalCooldown.getGlobalCooldownDuration(
      TALENTS.COBRA_SHOT_TALENT.id,
    );
    const killCommandCooldownRemaining = this.spellUsable.cooldownRemaining(
      TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT.id,
    );
    if (killCommandCooldownRemaining < this.cobraShotCDR + globalCooldown) {
      const effectiveReductionMs = killCommandCooldownRemaining - globalCooldown;
      this.effectiveKCReductionMs += this.spellUsable.reduceCooldown(
        TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT.id,
        effectiveReductionMs,
      );
      this.wastedKCReductionMs += this.cobraShotCDR - effectiveReductionMs;

      const resource = event.classResources?.find(
        (resource) => resource.type === RESOURCE_TYPES.FOCUS.id,
      );
      if (!resource) {
        return;
      }
      if (resource.amount < COBRA_SHOT_FOCUS_THRESHOLD_TO_WAIT) {
        addInefficientCastReason(
          event,
          "Cobra Shot cast while Kill Command's cooldown was under " +
            (globalCooldown + this.cobraShotCDR / 1000).toFixed(1) +
            's remaining and you were not close to capping focus as you only had ' +
            resource.amount +
            ' focus.',
        );
      }
    } else {
      this.effectiveKCReductionMs += this.spellUsable.reduceCooldown(
        TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT.id,
        COBRA_SHOT_CDR_MS,
      );
    }
  }

  suggestions(when: When) {
    when(this.cdrEfficiencyCobraShotThreshold).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          A crucial part of <SpellLink spell={TALENTS.COBRA_SHOT_TALENT} /> is the cooldown
          reduction of <SpellLink spell={TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT} /> it provides.
          When the cooldown of <SpellLink spell={TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT} /> is
          larger than the duration of your GCD + 1s, you'll want to be casting{' '}
          <SpellLink spell={TALENTS.COBRA_SHOT_TALENT} /> to maximize the amount of casts of{' '}
          <SpellLink spell={TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT} />. If the cooldown of{' '}
          <SpellLink spell={TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT} /> is lower than GCD + 1s,
          you'll only want to be casting <SpellLink spell={TALENTS.COBRA_SHOT_TALENT} />, if you'd
          be capping focus otherwise.
        </>,
      )
        .icon(TALENTS.COBRA_SHOT_TALENT.icon)
        .actual(
          <Trans id="hunter.beastmastery.suggestions.cobraShot.efficiency">
            {' '}
            You had {formatPercentage(actual)}% effective cooldown reduction of Kill Command
          </Trans>,
        )
        .recommended(
          <Trans id="hunter.beastmastery.suggestions.cobraShot.recommended">
            {' '}
            {'>'}
            {formatPercentage(recommended)}% is recommended
          </Trans>,
        ),
    );
    when(this.wastedCobraShotsThreshold).addSuggestion((suggest, actual) =>
      suggest(
        <>
          You should never cast <SpellLink spell={TALENTS.COBRA_SHOT_TALENT} /> when{' '}
          <SpellLink spell={TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT} /> is off cooldown.
        </>,
      )
        .icon(TALENTS.COBRA_SHOT_TALENT.icon)
        .actual(
          <Trans id="hunter.beastmastery.suggestions.cobraShot.cooldown.wasted">
            You cast {actual} Cobra Shots when Kill Command wasn't on cooldown
          </Trans>,
        )
        .recommended(
          <Trans id="hunter.beastmastery.suggestions.cobraShot.cooldown.recommended">
            0 inefficient casts is recommended
          </Trans>,
        ),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(3)}
        size="flexible"
        tooltip={
          <>
            {this.wastedCasts > 0 && (
              <>
                You had {this.wastedCasts} {this.wastedCasts > 1 ? 'casts' : 'cast'} of Cobra Shot
                when Kill Command wasn't on cooldown.{' '}
              </>
            )}
            {this.wastedCasts > 0 && this.wastedKCReductionMs > 0 && <br />}
            {this.wastedKCReductionMs > 0 &&
              `You wasted ${this.wastedCDR.toFixed(
                2,
              )} seconds of potential cooldown reduction by casting Cobra Shot while Kill Command had less than 1 + GCD seconds remaining on its CD.`}
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.COBRA_SHOT_TALENT}>
          <>
            {formatNumber(this.effectiveKCReductionMs / 1000)}s / {this.totalPossibleCDR / 1000}s
            <br />
            {formatPercentage(this.effectiveKCReductionMs / this.totalPossibleCDR)}%{' '}
            <small>effectiveness</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default CobraShot;
