import { t } from '@lingui/macro';
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

  acceptedCastDueToCapping = false;
  currentGCD = 0;
  badRefreshes = 0;
  lastRefresh = 0;
  casts = 0;
  targetsHit = 0;

  protected enemies!: Enemies;
  protected spellUsable!: SpellUsable;
  protected globalCooldown!: GlobalCooldown;

  constructor(options: Options) {
    super(options);

    this.active = !this.selectedCombatant.hasTalent(TALENTS.WILDFIRE_INFUSION_TALENT);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.WILDFIRE_BOMB), this.onCast);
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
      !this.spellUsable.isOnCooldown(SPELLS.WILDFIRE_BOMB.id) ||
      this.spellUsable.cooldownRemaining(SPELLS.WILDFIRE_BOMB.id) <
        WILDFIRE_BOMB_LEEWAY_BUFFER + this.currentGCD
    ) {
      this.acceptedCastDueToCapping = true;
    }
  }

  onDamage(event: DamageEvent) {
    if (this.casts === 0) {
      this.casts += 1;
      this.spellUsable.beginCooldown(event, SPELLS.WILDFIRE_BOMB.id);
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
          You shouldn't refresh <SpellLink id={SPELLS.WILDFIRE_BOMB.id} /> since it doesn't
          pandemic. It's generally better to cast something else and wait for the DOT to drop off
          before reapplying.
        </>,
      )
        .icon(SPELLS.WILDFIRE_BOMB.icon)
        .actual(
          t({
            id: 'hunter.survival.suggestions.wildfireBomb.pandemic.efficiency',
            message: `${actual} casts unnecessarily refreshed WFB`,
          }),
        )
        .recommended(`<${recommended} is recommended`),
    );
    when(this.uptimeThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Try and maximize your uptime on <SpellLink id={SPELLS.WILDFIRE_BOMB.id} />. This is
          achieved through not unnecessarily refreshing the debuff as it doesn't pandemic.{' '}
        </>,
      )
        .icon(SPELLS.WILDFIRE_BOMB.icon)
        .actual(
          t({
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
        position={STATISTIC_ORDER.OPTIONAL(2)}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
      >
        <BoringSpellValueText spellId={SPELLS.WILDFIRE_BOMB.id}>
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
