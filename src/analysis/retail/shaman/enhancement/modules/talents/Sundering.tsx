import { formatNumber } from 'common/format';
import TALENTS from 'common/TALENTS/shaman';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  DamageEvent,
  UpdateSpellUsableEvent,
  UpdateSpellUsableType,
} from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import AverageTargetsHit from 'parser/ui/AverageTargetsHit';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';
import SpellUsable from '../core/SpellUsable';
import { UptimeIcon } from 'interface/icons';
import Abilities from 'parser/core/modules/Abilities';

/**
 * This can be quite a large gap since the cooldown of Sundering is `only` 40 seconds.
 */
const CAST_TO_DAMAGE_LATENCY = 1500;

/**
 * Shatters a line of earth in front of you with your main hand weapon,
 * causing (140% of Attack power) Flamestrike damage
 * and Incapacitating any enemy hit for 2 sec.
 *
 * Example Log: https://www.warcraftlogs.com/reports/kAjvaxWdPbpnf8cK#fight=1&type=damage-done&source=12&ability=197214
 */
class Sundering extends Analyzer.withDependencies({
  spellUsable: SpellUsable,
  abilities: Abilities,
}) {
  protected cooldown = this.deps.abilities.getAbility(TALENTS.SUNDERING_TALENT.id);
  protected damageGained = 0;
  protected casts = 0;
  protected hits = 0;
  protected resets = 0;
  protected expectedCooldownEnd = 0;

  /**
   * Store the casts and remove them when damage occours within {CAST_TO_DAMAGE_INTERVAL} seconds.
   * Leaving only the missed casts.
   */
  protected missedCasts: CastEvent[] = [];

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.SUNDERING_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.SUNDERING_TALENT),
      this.onCast,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.SUNDERING_TALENT),
      this.onDamage,
    );

    if (this.selectedCombatant.hasTalent(TALENTS.MOLTEN_THUNDER_TALENT)) {
      this.addEventListener(
        Events.UpdateSpellUsable.by(SELECTED_PLAYER).spell(TALENTS.SUNDERING_TALENT),
        this.onMoltenThunderReset,
      );
    }

    this.addEventListener(Events.fightend, this.markBadCasts);
  }

  onMoltenThunderReset(event: UpdateSpellUsableEvent) {
    if (event.updateType !== UpdateSpellUsableType.EndCooldown) {
      return;
    }
    if (event.timestamp < this.expectedCooldownEnd) {
      this.resets += 1;
    }
  }

  onDamage(event: DamageEvent) {
    /**
     * Remove casts from missedCasts if the cast was done in the approximate range of the damage
     * time.
     */
    const casts = this.missedCasts.filter(
      (cast) =>
        cast.timestamp >= event.timestamp - CAST_TO_DAMAGE_LATENCY &&
        cast.timestamp <= event.timestamp + CAST_TO_DAMAGE_LATENCY,
    );

    if (casts.length > 0) {
      const index = this.missedCasts.indexOf(casts[0]);
      this.missedCasts.splice(index, 1);
    }

    this.hits += 1;
    this.damageGained += event.amount + (event.absorbed || 0);
  }

  onCast(event: CastEvent) {
    this.casts += 1;
    this.missedCasts.push(event);
  }

  /**
   * Mark bad casts on the timeline.
   */
  markBadCasts() {
    this.missedCasts.forEach((cast) => {
      addInefficientCastReason(cast, <>Sundering did not hit any targets.</>);
    });
  }

  statistic() {
    return [
      <Statistic
        key="missed-hits"
        position={STATISTIC_ORDER.OPTIONAL()}
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            {this.misses} out of {this.casts} casts did not hit an enemy.
          </>
        }
        size="flexible"
      >
        <BoringSpellValueText spell={TALENTS.SUNDERING_TALENT}>
          <>
            <ItemDamageDone amount={this.damageGained} />
            <br />
            <AverageTargetsHit casts={this.casts} hits={this.hits} />
          </>
        </BoringSpellValueText>
      </Statistic>,
      <Statistic
        key="molten-thunder"
        position={STATISTIC_ORDER.OPTIONAL()}
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={TALENTS.MOLTEN_THUNDER_TALENT}>
          <>
            <UptimeIcon /> {formatNumber(0)}{' '}
            <small>
              <SpellLink spell={TALENTS.SUNDERING_TALENT} /> resets
            </small>
          </>
        </BoringSpellValueText>
      </Statistic>,
    ];
  }

  get misses() {
    return this.missedCasts.length;
  }

  /**
   * There isn't a proper way to define this since a Sundering cast is only valuable as a filler.
   * Missing it is a shame but not a major thing to work on.
   */
  get missesThreshold() {
    return {
      actual: this.misses / this.casts,
      isGreaterThan: {
        major: 0.5,
        average: 0.33,
        minor: 0.1,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
}

export default Sundering;
