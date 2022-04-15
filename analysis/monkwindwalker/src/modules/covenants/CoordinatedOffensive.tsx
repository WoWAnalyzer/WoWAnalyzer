import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import conduitScaling from 'parser/core/conduitScaling';
import Events, { CastEvent, DamageEvent, RemoveBuffEvent, SummonEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { ABILITIES_AFFECTED_BY_DAMAGE_INCREASES, ABILITIES_CLONED_BY_SEF } from '../../constants';


/**
 * Calculates the amount of damage that could have been added if an effect
 * had been applied.
 *
 * @param event a damage event that could have been boosted by an effect
 * @param increase the boost's added multiplier (for +20% pass 0.20)
 * @returns the amount of damage that the boost would have added if applied
 */
function calculateMissedDamage(event: DamageEvent, increase: number): number {
  const raw = (event.amount || 0) + (event.absorbed || 0);
  return raw * increase;
}

class CoordinatedOffensive extends Analyzer {
  FIXATE_ACTIVATE_TIMESTAMP = -1;
  FIXATE_UPTIME = 0;
  CO_MOD = 0;
  SER_MOD = 0.2;
  damageIncrease = 0;
  missedDamageIncrease = 0;
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
        .spell([SPELLS.STORM_EARTH_AND_FIRE_EARTH_SPIRIT, SPELLS.STORM_EARTH_AND_FIRE_FIRE_SPIRIT]),
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
    if (this.selectedCombatant.hasTalent(SPELLS.SERENITY_TALENT.id)) {
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER).spell(ABILITIES_AFFECTED_BY_DAMAGE_INCREASES),
        this.onSERDamage,
      );
    }
  }
  CO_Deactivator(event: RemoveBuffEvent) {
    this.FIXATE_UPTIME = this.FIXATE_UPTIME + (event.timestamp - this.FIXATE_ACTIVATE_TIMESTAMP);
    this.CO_Active = false;
  }
  CO_Activator(event: CastEvent) {
    // Don't want to overwrite the fixate timestamp if we're already active
    if (!this.CO_Active) {
      this.FIXATE_ACTIVATE_TIMESTAMP = event.timestamp;
      this.CO_Active = true;
    }
  }
  trackSummons(event: SummonEvent) {
    this.cloneMap.set(event.targetID, event.ability.guid);
  }
  handleMelee(event: DamageEvent) {
    //if we don't know who its from then we can't add it
    if (!event.sourceID) {
      return;
    }
    const id: number = event.sourceID;
    const cloneType: number | undefined = this.cloneMap.get(id);
    if (cloneType === undefined) {
      return;
    }

    if (
      cloneType === SPELLS.STORM_EARTH_AND_FIRE_FIRE_SPIRIT.id ||
      cloneType === SPELLS.STORM_EARTH_AND_FIRE_EARTH_SPIRIT.id
    ) {
      this.onSEFDamage(event);
    }
  }

  onSEFDamage(event: DamageEvent) {
    if (this.CO_Active) {
      this.damageIncrease += calculateEffectiveDamage(event, this.CO_MOD);
    } else {
      this.missedDamageIncrease += calculateMissedDamage(event, this.CO_MOD);
    }
  }
  onSERDamage(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.SERENITY_TALENT.id)) {
      return;
    }
    this.damageIncrease +=
      calculateEffectiveDamage(event, this.CO_MOD + this.SER_MOD) -
      calculateEffectiveDamage(event, this.SER_MOD);
  }

  /** How much of the active SEF time that has been fixated */
  get uptime() {
    return (
      this.FIXATE_UPTIME / this.selectedCombatant.getBuffUptime(SPELLS.STORM_EARTH_AND_FIRE_CAST.id)
    );
  }

  get fixateUptimeThreshold() {
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
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={
          <>
            The {formatPercentage(this.CO_MOD)}% increase from Coordinated Offensive was worth ~
            {formatNumber(this.damageIncrease)} raw Damage.
          </>
        }
      >
        <ConduitSpellText spellId={SPELLS.COORDINATED_OFFENSIVE.id}>
          <ItemDamageDone amount={this.damageIncrease} />
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default CoordinatedOffensive;
