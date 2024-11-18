import { defineMessage } from '@lingui/macro';
import {
  JUGGLER_CDR,
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

  private acceptedCastDueToCapping: boolean = false;
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
    this.casts += 1;
    this.currentGCD = this.globalCooldown.getGlobalCooldownDuration(event.ability.guid);
    if (
      !this.spellUsable.isOnCooldown(TALENTS.WILDFIRE_BOMB_TALENT.id) ||
      this.spellUsable.cooldownRemaining(TALENTS.WILDFIRE_BOMB_TALENT.id) <
        WILDFIRE_BOMB_LEEWAY_BUFFER + this.currentGCD
    ) {
      this.acceptedCastDueToCapping = true;
    }

    // Pack Leader - Covering Fire Talent Cooldown Reduction for Butchery
    if (this.selectedCombatant.hasTalent(TALENTS.COVERING_FIRE_TALENT)) {
      if (this.spellUsable.isOnCooldown(TALENTS.BUTCHERY_TALENT.id)) {
        this.checkCooldown(TALENTS.BUTCHERY_TALENT.id);
      } else {
        this.wastedReductionMs += JUGGLER_CDR;
      }
    }

    // Good or Bad Cast Checking Tip, CA is almost up, or capped are good casts of bomb.
    if (this.selectedCombatant.hasOwnBuff(SPELLS.TIP_OF_THE_SPEAR_CAST.id)) {
      this.tippedCast += 1;
      this.goodCast += 1;
    } else if (
      !this.spellUsable.isOnCooldown(TALENTS.COORDINATED_ASSAULT_TALENT.id) ||
      this.spellUsable.cooldownRemaining(TALENTS.COORDINATED_ASSAULT_TALENT.id) < 4000
    ) {
      this.goodCast += 1;
    } else if (this.acceptedCastDueToCapping) {
      this.goodCast += 1;
    }
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
    if (this.casts === 0) {
      this.casts += 1;
      this.spellUsable.beginCooldown(event, TALENTS.WILDFIRE_BOMB_TALENT.id);
    }
    this.targetsHit += 1;
    const enemy = this.enemies.getEntity(event);
    if (this.selectedCombatant.hasOwnBuff(SPELLS.TIP_OF_THE_SPEAR_CAST.id)) {
      this.tippedDamage += 1;
    }
    if (this.acceptedCastDueToCapping || !enemy) {
      return;
    }
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
