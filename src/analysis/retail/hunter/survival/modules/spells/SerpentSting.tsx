import { t } from '@lingui/macro';
import {
  SERPENT_STING_SV_BASE_DURATION,
  SERPENT_STING_SV_PANDEMIC,
} from 'analysis/retail/hunter/survival/constants';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import { SpellLink } from 'interface';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyDebuffEvent,
  CastEvent,
  DamageEvent,
  RefreshDebuffEvent,
  RemoveDebuffEvent,
} from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import { encodeTargetString } from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Fire a shot that poisons your target, causing them to take (15% of Attack power) Nature damage instantly and an additional (60% of Attack power) Nature damage over 12 sec.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/ZRALzNbMpqka1fTB#fight=17&type=summary&source=329
 */

class SerpentSting extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  //Used to handle talents
  hasVV: boolean = false;
  hasBoP: boolean = false;

  //Used for handling when parsing
  serpentStingTargets: Array<{ timestamp: number; serpentStingDuration: number }> = [];
  vipersVenomBuffUp: boolean = false;

  //Used for statistics
  casts: number = 0;
  bonusDamage: number = 0;
  timesRefreshed: number = 0;

  //Used for suggestions
  nonPandemicRefresh: number = 0;
  nonVVBoPRefresh: number = 0;

  protected enemies!: Enemies;

  constructor(options: Options) {
    super(options);

    this.hasBoP = this.selectedCombatant.hasTalent(TALENTS.BIRDS_OF_PREY_TALENT.id);
    this.hasVV = this.selectedCombatant.hasTalent(TALENTS.VIPERS_VENOM_TALENT.id);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SERPENT_STING_SV),
      this.onCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SERPENT_STING_SV),
      this.onDamage,
    );
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.SERPENT_STING_SV),
      this.onApplyDebuff,
    );
    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.SERPENT_STING_SV),
      this.onRemoveDebuff,
    );
    this.addEventListener(
      Events.refreshdebuff.by(SELECTED_PLAYER).spell(SPELLS.SERPENT_STING_SV),
      this.onRefreshDebuff,
    );
  }

  get uptimePercentage() {
    return this.enemies.getBuffUptime(SPELLS.SERPENT_STING_SV.id) / this.owner.fightDuration;
  }

  get nonPandemicThreshold() {
    return {
      actual: this.nonPandemicRefresh,
      isGreaterThan: {
        minor: 1,
        average: 3,
        major: 5,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  get nonVVBoPRefreshThreshold() {
    return {
      actual: this.nonVVBoPRefresh,
      isGreaterThan: {
        minor: 1,
        average: 3,
        major: 5,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  get uptimeThresholdBoP() {
    if (this.hasVV) {
      return {
        actual: this.uptimePercentage,
        isLessThan: {
          minor: 0.6,
          average: 0.55,
          major: 0.5,
        },
        style: ThresholdStyle.PERCENTAGE,
      };
    } else {
      return {
        actual: this.uptimePercentage,
        isGreaterThan: {
          minor: 0.3,
          average: 0.35,
          major: 0.4,
        },
        style: ThresholdStyle.PERCENTAGE,
      };
    }
  }

  get uptimeThresholdNonBoP() {
    return {
      actual: this.uptimePercentage,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.85,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get serpentStingDuringCA() {
    return (
      this.hasBoP &&
      this.selectedCombatant.hasBuff(SPELLS.COORDINATED_ASSAULT.id) &&
      (!this.hasVV || !this.vipersVenomBuffUp)
    );
  }

  onCast(event: CastEvent) {
    this.casts += 1;

    if (event.meta === undefined) {
      event.meta = {
        isInefficientCast: false,
        isEnhancedCast: false,
        inefficientCastReason: '',
        enhancedCastReason: '',
      };
    }
    if (this.selectedCombatant.hasBuff(SPELLS.VIPERS_VENOM_BUFF.id)) {
      this.vipersVenomBuffUp = true;
      event.meta.isEnhancedCast = true;
      event.meta.enhancedCastReason = "Viper's Venom buff consumed";
    }
    if (this.serpentStingDuringCA) {
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason =
        'Serpent String cast during Coordinated Assault with Birds of Prey talent used.';
    }
  }

  onDamage(event: DamageEvent) {
    this.bonusDamage += event.amount + (event.absorbed || 0);
  }

  onApplyDebuff(event: ApplyDebuffEvent) {
    let targetInstance = event.targetInstance;
    if (targetInstance === undefined) {
      targetInstance = 1;
    }
    const serpentStingTarget = Number(encodeTargetString(event.targetID, targetInstance));
    this.serpentStingTargets[serpentStingTarget] = {
      timestamp: event.timestamp,
      serpentStingDuration: SERPENT_STING_SV_BASE_DURATION,
    };
    if (this.vipersVenomBuffUp) {
      this.vipersVenomBuffUp = false;
    }
  }

  onRemoveDebuff(event: RemoveDebuffEvent) {
    let targetInstance = event.targetInstance;
    if (targetInstance === undefined) {
      targetInstance = 1;
    }
    const serpentStingTarget = Number(encodeTargetString(event.targetID, targetInstance));
    this.serpentStingTargets.splice(serpentStingTarget, 1);
  }

  onRefreshDebuff(event: RefreshDebuffEvent) {
    let targetInstance = event.targetInstance;
    if (targetInstance === undefined) {
      targetInstance = 1;
    }
    const serpentStingTarget = Number(encodeTargetString(event.targetID, targetInstance));
    this.timesRefreshed += 1;

    const timeRemaining =
      this.serpentStingTargets[serpentStingTarget].serpentStingDuration -
      (event.timestamp - this.serpentStingTargets[serpentStingTarget].timestamp);
    if (timeRemaining > SERPENT_STING_SV_BASE_DURATION * SERPENT_STING_SV_PANDEMIC) {
      this.nonPandemicRefresh += 1;
    } else {
      const pandemicSerpentStingDuration =
        Math.min(SERPENT_STING_SV_BASE_DURATION * SERPENT_STING_SV_PANDEMIC, timeRemaining) +
        SERPENT_STING_SV_BASE_DURATION;
      this.serpentStingTargets[serpentStingTarget].timestamp = event.timestamp;
      this.serpentStingTargets[
        serpentStingTarget
      ].serpentStingDuration = pandemicSerpentStingDuration;
    }
    if (this.hasBoP && this.selectedCombatant.hasBuff(SPELLS.COORDINATED_ASSAULT.id)) {
      if (this.vipersVenomBuffUp) {
        this.vipersVenomBuffUp = false;
      } else {
        this.nonVVBoPRefresh += 1;
      }
    }
  }

  suggestions(when: When) {
    if (this.hasBoP) {
      const suggestionText = this.hasVV ? (
        <>
          {' '}
          You should make sure to keep up <SpellLink id={SPELLS.SERPENT_STING_SV.id} /> by using it
          within the pandemic windows during <SpellLink id={SPELLS.COORDINATED_ASSAULT.id} />, so
          long as you have a <SpellLink id={TALENTS.VIPERS_VENOM_TALENT.id} /> proc.{' '}
        </>
      ) : (
        <>
          With <SpellLink id={TALENTS.BIRDS_OF_PREY_TALENT.id} /> talented and without{' '}
          <SpellLink id={TALENTS.VIPERS_VENOM_TALENT.id} /> talented, you don't want to cast{' '}
          <SpellLink id={SPELLS.SERPENT_STING_SV.id} /> during{' '}
          <SpellLink id={SPELLS.COORDINATED_ASSAULT.id} /> at all, which is a majority of the fight,
          therefore a low uptime of <SpellLink id={SPELLS.SERPENT_STING_SV.id} /> is better than a
          high uptime.{' '}
        </>
      );

      when(this.uptimeThresholdBoP).addSuggestion((suggest, actual, recommended) =>
        suggest(suggestionText)
          .icon(SPELLS.SERPENT_STING_SV.icon)
          .actual(
            t({
              id: 'hunter.survival.suggestions.serpentSting.pandemicWindow',
              message: `${formatPercentage(actual)}% Serpent Sting uptime`,
            }),
          )
          .recommended(`<${formatPercentage(recommended)}% is recommended`),
      );
    } else {
      when(this.uptimeThresholdNonBoP).addSuggestion((suggest, actual, recommended) =>
        suggest(
          <>
            Remember to maintain the <SpellLink id={SPELLS.SERPENT_STING_SV.id} /> on enemies, but
            don't refresh the debuff unless it has less than{' '}
            {formatPercentage(SERPENT_STING_SV_PANDEMIC, 0)}% duration remaining.
          </>,
        )
          .icon(SPELLS.SERPENT_STING_SV.icon)
          .actual(
            t({
              id: 'hunter.survival.suggestions.serpentSting.uptime',
              message: `${formatPercentage(actual)}% Serpent Sting uptime`,
            }),
          )
          .recommended(`>${formatPercentage(recommended)}% is recommended`),
      );
    }

    when(this.nonPandemicThreshold).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          It is not recommended to refresh <SpellLink id={SPELLS.SERPENT_STING_SV.id} /> earlier
          than when there is less than {formatPercentage(SERPENT_STING_SV_PANDEMIC, 0)}% of the
          duration remaining.{' '}
        </>,
      )
        .icon(SPELLS.SERPENT_STING_SV.icon)
        .actual(
          t({
            id: 'hunter.survival.suggestions.serpentSting.tooEarly',
            message: `${actual} Serpent Sting cast(s) were cast too early`,
          }),
        )
        .recommended(`<${recommended} is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(3)}
        size="flexible"
        tooltip={
          <>
            <ul>
              <li>You cast Serpent Sting a total of {this.casts} times.</li>
              <li>You refreshed the debuff {this.timesRefreshed} times.</li>
              {this.nonVVBoPRefresh + this.nonPandemicRefresh > 0 && (
                <ul>
                  {this.nonPandemicRefresh > 0 && (
                    <li>
                      You had {this.nonPandemicRefresh} refreshes outside of the pandemic window.
                      This means refreshes with more than{' '}
                      {formatPercentage(SERPENT_STING_SV_PANDEMIC, 0)}% of the current debuff
                      remaining and no Viper's Venom buff active.
                    </li>
                  )}
                  {this.hasBoP && this.hasVV && this.nonVVBoPRefresh > 0 && (
                    <li>
                      During Coordinated Assault, you should only refresh Serpent Sting when there
                      is less than {formatPercentage(SERPENT_STING_SV_PANDEMIC, 0)}% remaining on
                      Serpent Sting AND you have a Viper's Venom proc. You refreshed it incorrectly{' '}
                      {this.nonVVBoPRefresh} times.
                    </li>
                  )}
                  {this.hasBoP && !this.hasVV && this.nonVVBoPRefresh > 0 && (
                    <li>
                      Because you're using Birds of Prey, but not using Viper's Venom, you should
                      never refresh Serpent Sting during Coordinated Assault buff. You did this{' '}
                      {this.nonVVBoPRefresh} times.
                    </li>
                  )}
                </ul>
              )}
            </ul>
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.SERPENT_STING_SV.id}>
          <>
            <ItemDamageDone amount={this.bonusDamage} />
            <br />
            <UptimeIcon /> {formatPercentage(this.uptimePercentage)}% <small>uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SerpentSting;
