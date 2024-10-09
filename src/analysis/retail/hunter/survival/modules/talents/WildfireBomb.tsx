import { defineMessage } from '@lingui/macro';
import { MS_BUFFER_100 } from 'analysis/retail/hunter/shared/constants';
import { WILDFIRE_BOMB_LEEWAY_BUFFER } from 'analysis/retail/hunter/survival/constants';
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
  private badRefreshes: number = 0;
  private lastRefresh: number = 0;
  private casts: number = 0;
  private targetsHit: number = 0;

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

  get badWFBThresholds() {
    return {
      actual: this.badRefreshes,
      isGreaterThan: {
        minor: 2,
        average: 4,
        major: 6,
      },
      style: ThresholdStyle.NUMBER,
    };
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

  get averageTargetsHit() {
    return this.targetsHit / this.casts;
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
  }

  onDamage(event: DamageEvent) {
    if (this.casts === 0) {
      this.casts += 1;
      this.spellUsable.beginCooldown(event, TALENTS.WILDFIRE_BOMB_TALENT.id);
    }
    this.targetsHit += 1;
    const enemy = this.enemies.getEntity(event);
    if (this.acceptedCastDueToCapping || !enemy) {
      return;
    }
    if (
      enemy.hasBuff(SPELLS.WILDFIRE_BOMB_DOT.id) &&
      event.timestamp > this.lastRefresh + MS_BUFFER_100
    ) {
      this.badRefreshes += 1;
      this.lastRefresh = event.timestamp;
    }
  }

  suggestions(when: When) {
    when(this.badWFBThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You shouldn't refresh <SpellLink spell={TALENTS.WILDFIRE_BOMB_TALENT} /> since it doesn't
          pandemic. It's generally better to cast something else and wait for the DOT to drop off
          before reapplying.
        </>,
      )
        .icon(TALENTS.WILDFIRE_BOMB_TALENT.icon)
        .actual(
          defineMessage({
            id: 'hunter.survival.suggestions.wildfireBomb.pandemic.efficiency',
            message: `${actual} casts unnecessarily refreshed WFB`,
          }),
        )
        .recommended(`<${recommended} is recommended`),
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
        position={STATISTIC_ORDER.CORE(2)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <BoringSpellValueText spell={TALENTS.WILDFIRE_BOMB_TALENT}>
          <>
            {this.averageTargetsHit.toFixed(2)} <small>average targets hit</small>
            <br />
            {formatPercentage(this.uptimePercentage)}% <small> DoT uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default WildfireBomb;
