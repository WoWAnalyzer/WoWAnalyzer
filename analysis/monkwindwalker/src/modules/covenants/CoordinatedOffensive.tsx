import { Trans } from '@lingui/macro';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink, ConduitLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import conduitScaling from 'parser/core/conduitScaling';
import Events, { CastEvent, DamageEvent, RemoveBuffEvent, SummonEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { ABILITIES_CLONED_BY_SEF, ABILITIES_AFFECTED_BY_DAMAGE_INCREASES } from '../../constants';

/**
 * Tracks damage increase from
 * [Coordinated Offensive Conduit](https://www.wowhead.com/spell=336598/coordinated-offensive).
 *
 * Also tracks if you are not Fixating your Storm, Earth and Fire spirits and missing out on
 * the damage.
 *
 * * Example logs:
 *   - Serenity https://www.warcraftlogs.com/reports/HYTBGcXtV4AN27QW#fight=last&type=damage-done&source=27
 *   - SEF https://www.warcraftlogs.com/reports/TmtHDNgX7ApGywbZ#fight=27&type=damage-done&source=12
 */
class CoordinatedOffensive extends Analyzer {
  CO_MOD = 0;
  readonly SERENITY_MOD = 0.2;
  hasSerenity = false;
  fixateUptime = 0;
  fixateActivateTimestamp = -1;
  totalDamage = 0;
  CO_Active: boolean = false;
  cloneIDs = new Set();
  cloneMap: Map<number, number> = new Map<number, number>();

  constructor(options: Options) {
    super(options);
    const conduitRank = this.selectedCombatant.conduitRankBySpellID(
      SPELLS.COORDINATED_OFFENSIVE.id,
    );
    if (!conduitRank) {
      this.active = false;
      return;
    }

    this.CO_MOD = conduitScaling(0.088, conduitRank);

    this.hasSerenity = this.selectedCombatant.hasTalent(SPELLS.SERENITY_TALENT.id);

    if (!this.hasSerenity) {
      //summon events (need to track this to get melees)
      this.addEventListener(
        Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.STORM_EARTH_AND_FIRE_CAST),
        this.CO_Deactivator,
      );
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(SPELLS.STORM_EARTH_AND_FIRE_FIXATE),
        this.CO_Activator,
      );
      this.addEventListener(
        Events.summon
          .by(SELECTED_PLAYER)
          .spell([
            SPELLS.STORM_EARTH_AND_FIRE_EARTH_SPIRIT,
            SPELLS.STORM_EARTH_AND_FIRE_FIRE_SPIRIT,
          ]),
        this.trackSummons,
      );
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.MELEE),
        this.handleMelee,
      );
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER_PET).spell(ABILITIES_CLONED_BY_SEF),
        this.onSEFDamage,
      );
    } else {
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER).spell(ABILITIES_AFFECTED_BY_DAMAGE_INCREASES),
        this.onSerenityDamage,
      );
    }
  }
  CO_Deactivator(event: RemoveBuffEvent) {
    this.fixateUptime = this.fixateUptime + (event.timestamp - this.fixateActivateTimestamp);
    this.CO_Active = false;
  }
  CO_Activator(event: CastEvent) {
    // Don't want to overwrite the fixate timestamp if we're already active
    if (!this.CO_Active) {
      this.fixateActivateTimestamp = event.timestamp;
      this.CO_Active = true;
    }
  }
  trackSummons(event: SummonEvent) {
    this.cloneMap.set(event.targetID, event.ability.guid);
  }
  handleMelee(event: DamageEvent) {
    //if CO is not active we cant add the dmg
    if (!this.CO_Active) {
      return;
    }
    //if we don't know who its from then we can't add it
    if (!event.sourceID) {
      return;
    }
    const id: number = event.sourceID;
    const cloneType: number | undefined = this.cloneMap.get(id);
    if (cloneType === undefined) {
      return;
    }

    if (cloneType === SPELLS.STORM_EARTH_AND_FIRE_FIRE_SPIRIT.id) {
      this.totalDamage += calculateEffectiveDamage(event, this.CO_MOD);
    }
    if (cloneType === SPELLS.STORM_EARTH_AND_FIRE_EARTH_SPIRIT.id) {
      this.totalDamage += calculateEffectiveDamage(event, this.CO_MOD);
    }
  }

  onSEFDamage(event: DamageEvent) {
    if (!this.CO_Active) {
      return;
    }
    this.totalDamage += calculateEffectiveDamage(event, this.CO_MOD);
  }
  onSerenityDamage(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.SERENITY_TALENT.id)) {
      return;
    }
    this.totalDamage +=
      calculateEffectiveDamage(event, this.CO_MOD + this.SERENITY_MOD) -
      calculateEffectiveDamage(event, this.SERENITY_MOD);
  }

  /** How much of the active SEF time that has been fixated */
  get uptime() {
    return (
      this.fixateUptime / this.selectedCombatant.getBuffUptime(SPELLS.STORM_EARTH_AND_FIRE_CAST.id)
    );
  }

  get fixateUptimeSuggestionThreshold() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.9,
        average: 0.75,
        major: 0.5,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
  statistic() {
    const tooltip = this.hasSerenity ? (
      <>
        The {formatPercentage(this.CO_MOD, 1)}% increase to{' '}
        <SpellLink id={SPELLS.SERENITY_TALENT.id} /> from{' '}
        <SpellLink id={SPELLS.COORDINATED_OFFENSIVE.id} /> was worth{' '}
        {formatNumber(this.totalDamage)} raw damage.
      </>
    ) : (
      <>
        The {formatPercentage(this.CO_MOD, 1)}% damage increase during the{' '}
        {formatPercentage(this.uptime, 0)}% of <SpellLink id={SPELLS.STORM_EARTH_AND_FIRE.id} />{' '}
        that the spirits was fixated contributed ~{formatNumber(this.totalDamage)} raw damage.
      </>
    );

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={tooltip}
      >
        <ConduitSpellText spellId={SPELLS.COORDINATED_OFFENSIVE.id}>
          <ItemDamageDone amount={this.totalDamage} />
        </ConduitSpellText>
      </Statistic>
    );
  }
  suggestions(when: When) {
    when(this.fixateUptimeSuggestionThreshold).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <Trans id="monk.windwalker.suggestions.coordinatedOffensiveFixate">
          {' '}
          Remember to use <SpellLink id={SPELLS.STORM_EARTH_AND_FIRE_FIXATE.id} /> to benefit from{' '}
          <ConduitLink id={SPELLS.COORDINATED_OFFENSIVE.id} />.
        </Trans>,
      )
        .icon(SPELLS.COORDINATED_OFFENSIVE.icon)
        .actual(
          <>
            {formatPercentage(actual, 0)}% of <SpellLink id={SPELLS.STORM_EARTH_AND_FIRE.id} /> was
            fixated.
          </>,
        )
        .recommended(`${formatPercentage(recommended, 0)}% recommended`),
    );
  }
}

export default CoordinatedOffensive;
