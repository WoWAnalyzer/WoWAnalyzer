import TALENTS from 'common/TALENTS/evoker';
import SPELLS from 'common/SPELLS/evoker';
import { formatNumber } from 'common/format';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, {
  ApplyDebuffEvent,
  DamageEvent,
  EventType,
  RefreshDebuffEvent,
  RemoveDebuffEvent,
} from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { encodeEventTargetString } from 'parser/shared/modules/Enemies';
import { InformationIcon } from 'interface/icons';

const BOMBARDMENTS_BASE_DURATION_MS = 6_000;

/**
 * Essence abilities extend Bombardments by 1 sec.
 */
class ExtendedBattle extends Analyzer {
  extraDamage = 0;
  extraDuration = 0;

  latestApplyTimestamp = 0;
  previousApplyTimestamp = 0;

  debuffTracker: Map<string, number> = new Map();

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.EXTENDED_BATTLE_TALENT);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.BOMBARDMENTS_DAMAGE),
      this.onDamage,
    );

    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.BOMBARDMENTS_DEBUFF),
      this.onApplyDebuff,
    );
    this.addEventListener(
      Events.refreshdebuff.by(SELECTED_PLAYER).spell(SPELLS.BOMBARDMENTS_DEBUFF),
      this.onRemoveDebuff,
    );
    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.BOMBARDMENTS_DEBUFF),
      this.onRemoveDebuff,
    );
  }

  onApplyDebuff(event: ApplyDebuffEvent) {
    const target = encodeEventTargetString(event);
    this.debuffTracker.set(target, event.timestamp);

    this.previousApplyTimestamp = this.latestApplyTimestamp;
    this.latestApplyTimestamp = event.timestamp;
  }

  onRemoveDebuff(event: RemoveDebuffEvent | RefreshDebuffEvent) {
    const target = encodeEventTargetString(event);
    const debuff = this.debuffTracker.get(target);
    if (!debuff) {
      console.warn(
        "ExtendedBattle module tried to remove a debuff that wasn't applied:",
        target,
        this.owner.formatTimestamp(event.timestamp),
      );
      return;
    }

    const diff = event.timestamp - debuff;
    const extraDurationSeconds = (diff - BOMBARDMENTS_BASE_DURATION_MS) / 1000;

    this.extraDuration += Math.max(extraDurationSeconds, 0);

    if (event.type === EventType.RemoveDebuff) {
      this.debuffTracker.delete(target);
    } else {
      this.debuffTracker.set(target, event.timestamp);
      this.latestApplyTimestamp = event.timestamp;
    }
  }

  onDamage(event: DamageEvent) {
    // Easy case
    if (this.debuffTracker.size < 2) {
      const diff = event.timestamp - this.latestApplyTimestamp;

      if (diff > BOMBARDMENTS_BASE_DURATION_MS) {
        this.extraDamage += event.amount + (event.absorbed || 0);
      }

      return;
    }

    /** Less easy case
     * Essentially we can have 2 Bomba active with differing timestamps
     * since we can't know which Bomba blew up, we need to do some narrowing */

    // Earlier Bomba is still within base duration, so we bail
    const previousDiff = event.timestamp - this.previousApplyTimestamp;
    if (previousDiff <= BOMBARDMENTS_BASE_DURATION_MS) {
      return;
    }

    // Both are beyond the base duration, so we can just add the damage
    const latestDiff = event.timestamp - this.latestApplyTimestamp;
    if (latestDiff > BOMBARDMENTS_BASE_DURATION_MS) {
      this.extraDamage += event.amount + (event.absorbed || 0);
      return;
    }

    /** Earlier Bomba is beyond base duration, whilst latest is within
     * so we need to interpolate the amount.
     * In my testing it is pretty rare to end up here, so this will have
     * a very small impact on the damage */
    const diff = previousDiff - latestDiff;
    const multiplier = 1 - diff / BOMBARDMENTS_BASE_DURATION_MS;
    const amount = (event.amount + (event.absorbed || 0)) * multiplier;

    this.extraDamage += Math.max(amount, 0);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            <li>Damage: {formatNumber(this.extraDamage)}</li>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.EXTENDED_BATTLE_TALENT}>
          <ItemDamageDone amount={this.extraDamage} />

          <div>
            <InformationIcon /> {this.extraDuration.toFixed(2)}s<small> extra duration</small>
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default ExtendedBattle;
