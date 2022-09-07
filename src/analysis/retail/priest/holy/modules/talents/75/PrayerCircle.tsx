import Abilities from 'analysis/retail/priest/holy/modules/Abilities';
import AbilityTracker from 'analysis/retail/priest/holy/modules/core/AbilityTracker';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { BeginCastEvent, CastEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/*
  Using Circle of Healing reduces the cast time of your Prayer of Healing by 25% for 8 sec.
*/
class PrayerCircle extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    abilities: Abilities,
  };
  lastCohCastAt: number = 0;
  lastCastStartWasBuffed: boolean = false;
  buffedCohCasts = 0;
  protected abilityTracker!: AbilityTracker;
  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.PRAYER_CIRCLE_TALENT.id);

    if (this.active) {
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CIRCLE_OF_HEALING_TALENT),
        this.cohCast,
      );
      this.addEventListener(
        Events.begincast.by(SELECTED_PLAYER).spell(SPELLS.PRAYER_OF_HEALING),
        this.startPohCast,
      );
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(SPELLS.PRAYER_OF_HEALING),
        this.finishPohCast,
      );
    }
  }

  get unbuffedCohCasts() {
    return this.abilityTracker.getAbility(SPELLS.PRAYER_OF_HEALING.id).casts - this.buffedCohCasts;
  }

  cohCast(event: CastEvent) {
    this.lastCohCastAt = event.timestamp;
  }

  startPohCast(event: BeginCastEvent) {
    this.lastCastStartWasBuffed = this.selectedCombatant.hasBuff(SPELLS.PRAYER_CIRCLE_BUFF.id);
  }

  finishPohCast(event: CastEvent) {
    if (this.lastCastStartWasBuffed) {
      this.buffedCohCasts += 1;
    }
  }

  statistic() {
    return (
      <Statistic
        tooltip={
          <>
            {this.buffedCohCasts} casts with Prayer Circle active.
            <br />
            {this.unbuffedCohCasts} casts without Prayer Circle active.
          </>
        }
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(5)}
      >
        <BoringSpellValueText spellId={SPELLS.PRAYER_CIRCLE_TALENT.id}>
          <>{this.buffedCohCasts} Faster PoH's</>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default PrayerCircle;
