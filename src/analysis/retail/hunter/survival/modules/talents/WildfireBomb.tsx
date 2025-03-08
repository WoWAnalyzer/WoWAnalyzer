import { defineMessage } from '@lingui/macro';
import {
  WILDFIRE_BOMB_LEEWAY_BUFFER,
  COVERING_FIRE_CDR,
} from 'analysis/retail/hunter/survival/constants';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import GlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
// Guide Imports
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import CastSummaryAndBreakdown from 'interface/guide/components/CastSummaryAndBreakdown';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import { BadColor, GoodColor, OkColor } from 'interface/guide';
/**
 * Hurl a bomb at the target, exploding for (45% of Attack power) Fire damage in a cone and coating enemies in wildfire, scorching them for (90% of Attack power) Fire damage over 6 sec.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/6GjD12YkQCnJqPTz#fight=25&type=damage-done&source=19&translate=true&ability=-259495
 */

class WildfireBomb extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    spellUsable: SpellUsable,
    globalCooldown: GlobalCooldown,
  };

  protected enemies!: Enemies;
  protected spellUsable!: SpellUsable;
  protected globalCooldown!: GlobalCooldown;
  useEntries: BoxRowEntry[] = [];
  //private acceptedCastDueToCapping: boolean = false;
  private currentGCD: number = 0;
  private casts: number = 0;
  private targetsHit: number = 0;
  // Travel time of Wildfire Bomb can allow you to consume a tip with the following GCD and so tippedCasts should = tippedDamage
  private tippedCast: number = 0;
  private tippedDamage: number = 0;
  private goodCast: number = 0;
  private effectiveReductionMs: number = 0;
  private wastedReductionMs: number = 0;
  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.WILDFIRE_BOMB_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.WILDFIRE_BOMB_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.WILDFIRE_BOMB_IMPACT),
      this.onDamage,
    );
  }

  get uptimePercentage() {
    return this.enemies.getBuffUptime(SPELLS.WILDFIRE_BOMB_DOT.id) / this.owner.fightDuration;
  }

  get uptimeThresholds() {
    return {
      actual: this.uptimePercentage,
      isLessThan: {
        minor: 0.4,
        average: 0.35,
        major: 0.3,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
  get tippedThresholds() {
    return {
      actual: this.untippedCastPercentage,
      isLessThan: {
        minor: 0.95,
        average: 0.85,
        major: 0.75,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get averageTargetsHit() {
    return this.targetsHit / this.casts;
  }
  get untippedDamagePercentage() {
    return this.tippedCast / this.casts;
  }
  get untippedCastPercentage() {
    return this.goodCast / this.casts;
  }
  onCast(event: CastEvent) {
    let value: QualitativePerformance = QualitativePerformance.Good;
    let castAtCap = false;
    let perfExplanation: React.ReactNode = undefined;
    const targetName = this.owner.getTargetName(event);
    this.casts += 1;
    this.currentGCD = this.globalCooldown.getGlobalCooldownDuration(event.ability.guid);
    if (
      !this.spellUsable.isOnCooldown(TALENTS.WILDFIRE_BOMB_TALENT.id) ||
      this.spellUsable.cooldownRemaining(TALENTS.WILDFIRE_BOMB_TALENT.id) <
        WILDFIRE_BOMB_LEEWAY_BUFFER + this.currentGCD
    ) {
      castAtCap = true;
    }

    // Good or Bad Cast Checking Tip, CA is almost up, or capped are good casts of bomb.
    if (castAtCap && this.selectedCombatant.hasOwnBuff(SPELLS.TIP_OF_THE_SPEAR_CAST.id)) {
      value = QualitativePerformance.Ok;
      perfExplanation = (
        <h5 style={{ color: OkColor }}>
          ACCEPTABLE. Casted at maximum stacks with a Tip. Do not delay bomb for a tip if it means
          it will cap!
          <br />
        </h5>
      );
      this.goodCast += 1;
    } else if (castAtCap) {
      value = QualitativePerformance.Ok;
      perfExplanation = (
        <h5 style={{ color: OkColor }}>
          ACCEPTABLE. Casted at maximum stacks. Try to cast bomb before it caps.
          <br />
        </h5>
      );
      this.goodCast += 1;
    } else if (this.selectedCombatant.hasOwnBuff(SPELLS.TIP_OF_THE_SPEAR_CAST.id)) {
      this.tippedCast += 1;
      this.goodCast += 1;
      value = QualitativePerformance.Good;
      perfExplanation = (
        <h5 style={{ color: GoodColor }}>
          Tipped Cast.
          <br />
        </h5>
      );
    } else if (
      !this.spellUsable.isOnCooldown(TALENTS.COORDINATED_ASSAULT_TALENT.id) ||
      this.spellUsable.cooldownRemaining(TALENTS.COORDINATED_ASSAULT_TALENT.id) < 4000
    ) {
      this.goodCast += 1;
      value = QualitativePerformance.Good;
      perfExplanation = (
        <h5 style={{ color: GoodColor }}>
          ACCEPTABLE. Casted Prior to Coordinated Assault.
          <br />
        </h5>
      );
    } else {
      value = QualitativePerformance.Fail;
      perfExplanation = (
        <h5 style={{ color: BadColor }}>
          BAD. Cast without a Tip of the Spear or other APL conditions being true!
          <br />
        </h5>
      );
    }
    const tooltip = (
      <>
        {perfExplanation}@ <strong>{this.owner.formatTimestamp(event.timestamp)}</strong> targetting{' '}
        <strong>{targetName || 'unknown'}</strong>
        <br />
      </>
    );
    this.useEntries.push({
      value,
      tooltip,
    });
  }

  checkCooldown(spellId: number) {
    if (this.spellUsable.cooldownRemaining(spellId) < COVERING_FIRE_CDR) {
      const effectiveReductionMs = this.spellUsable.reduceCooldown(spellId, COVERING_FIRE_CDR);
      this.effectiveReductionMs += effectiveReductionMs;
      this.wastedReductionMs += COVERING_FIRE_CDR - effectiveReductionMs;
    } else {
      this.effectiveReductionMs += this.spellUsable.reduceCooldown(spellId, COVERING_FIRE_CDR);
    }
  }
  onDamage(event: DamageEvent) {
    /* TODO: Use CastLinkNormalizer to link damage to cast.
   Then count number of *good* damage instances because bomb travel time means you can consume and make bomb tipless or tip bomb while it's mid air.
   This leaves a different statistic for good casts on fights like Bloodbound because you may want to bomb THEN kill command on large bosses so that if you go
   KC -> Bomb -> raptor that you don't tip the raptor so you'd go bomb->kc -> raptor and the bomb would hit as the KC applies tip and then consumes it right away.
    */
    if (this.casts === 0) {
      this.casts += 1;
      this.spellUsable.beginCooldown(event, TALENTS.WILDFIRE_BOMB_TALENT.id);
    }
    this.targetsHit += 1;
    /* TODO: Logic to track number of enemies hit. Saving this as the current reference bomb had for targets hit. */
    //const enemy = this.enemies.getEntity(event);
    if (this.selectedCombatant.hasOwnBuff(SPELLS.TIP_OF_THE_SPEAR_CAST.id)) {
      this.tippedDamage += 1;
    }
    // if (this.acceptedCastDueToCapping || !enemy) {
    //   return;
    // }
  }

  suggestions(when: When) {
    when(this.tippedThresholds).addSuggestion((suggest, actual, recommend) =>
      suggest(
        <>
          Try to ensure your <SpellLink spell={TALENTS.WILDFIRE_BOMB_TALENT} /> is affected by{' '}
          <SpellLink spell={TALENTS.TIP_OF_THE_SPEAR_TALENT} />
        </>,
      )
        .icon(TALENTS.WILDFIRE_BOMB_TALENT.icon)
        .actual(
          defineMessage({
            id: 'hunter.survival.suggestions.wildfireBomb.tipped',
            message: `${formatPercentage(actual)}% tipped`,
          }),
        )
        .recommended(`>${formatPercentage(recommend)}% is recommended`),
    );
    when(this.uptimeThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Try and maximize your uptime on <SpellLink spell={TALENTS.WILDFIRE_BOMB_TALENT} />. This
          is achieved through not unnecessarily refreshing the debuff as it doesn't pandemic.{' '}
        </>,
      )
        .icon(TALENTS.WILDFIRE_BOMB_TALENT.icon)
        .actual(
          defineMessage({
            id: 'hunter.survival.suggestions.wildfireBomb.uptime',
            message: `${formatPercentage(actual)}% uptime`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={TALENTS.WILDFIRE_BOMB_TALENT} />
        </strong>{' '}
        should be kept off maximum charges and always be cast with{' '}
        <SpellLink spell={SPELLS.TIP_OF_THE_SPEAR_CAST.id} />. It can go untipped if any of:
        <ol>
          <li>You are capped on bomb charges. </li>
          <li>Lunar Storm is ready </li>
          <li>
            You are about to press Coordinated Assault and have{' '}
            <SpellLink spell={TALENTS.BOMBARDIER_TALENT} /> talented.{' '}
          </li>
          <li>
            You are about to press Butchery and the cooldown reduction from Frenzied Strikes would
            overcap bomb.{' '}
          </li>
        </ol>
      </p>
    );

    const data = (
      <div>
        <CastSummaryAndBreakdown
          spell={TALENTS.WILDFIRE_BOMB_TALENT}
          castEntries={this.useEntries}
          badExtraExplanation={<>or an expired proc</>}
          usesInsteadOfCasts
        />
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }
  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(0)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <BoringSpellValueText spell={TALENTS.WILDFIRE_BOMB_TALENT}>
          <>
            {this.averageTargetsHit.toFixed(2)} <small>average targets hit</small>
            <br />
            {formatPercentage(this.uptimePercentage, 1)}% <small> DoT uptime</small>
            <br />
            {formatPercentage(this.untippedDamagePercentage, 1)}%{' '}
            <small> average tipped hits.</small>
            <br />
            {formatPercentage(this.untippedCastPercentage, 1)}%{' '}
            <small> average tipped casts.</small>
            <br />
            {this.casts} <small> Wildfire Bomb casts.</small>
            <br />
            {this.tippedCast} <small> Tipped Wildfire Bomb casts.</small>
            <br />
            {this.goodCast} <small> Good Wildfire Bomb casts.</small>
            <br />
            {this.tippedDamage} <small> Tipped Wildfire Bomb Damage.</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default WildfireBomb;
