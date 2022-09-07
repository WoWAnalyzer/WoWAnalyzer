import { t } from '@lingui/macro';
import {
  ARCANE_SHOT_MAX_TRAVEL_TIME,
  LETHAL_SHOTS_CHANCE,
  LETHAL_SHOTS_REDUCTION,
} from 'analysis/retail/hunter/marksmanship/constants';
import { MS_BUFFER_100 } from 'analysis/retail/hunter/shared';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Arcane Shot, Chimaera Shot and Multi-Shot have a 30% chance to reduce the cooldown of Rapid Fire by 5.0 sec.
 *
 * Example log:
 *
 */
class LethalShots extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  procChances: number = 0;
  lastDamageEvent: number = 0;
  badCasts: number = 0;
  shotInFlight: number | null = null;

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.LETHAL_SHOTS_TALENT.id);
    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([SPELLS.ARCANE_SHOT, SPELLS.MULTISHOT_MM, SPELLS.CHIMAERA_SHOT_TALENT_MARKSMANSHIP]),
      this.castChecker,
    );
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([
          SPELLS.ARCANE_SHOT,
          SPELLS.MULTISHOT_MM,
          SPELLS.CHIMAERA_SHOT_MM_NATURE_DAMAGE,
          SPELLS.CHIMAERA_SHOT_MM_FROST_DAMAGE,
        ]),
      this.onPotentialProc,
    );
  }

  get wastedPotentialCDR() {
    return {
      actual: this.badCasts,
      isGreaterThan: {
        minor: 0,
        average: 3,
        major: 6,
      },
      style: ThresholdStyle.DECIMAL,
    };
  }

  castChecker(event: CastEvent) {
    this.shotInFlight = event.timestamp;
  }

  onPotentialProc(event: DamageEvent) {
    if (!this.shotInFlight) {
      return;
    }
    if (this.shotInFlight > event.timestamp + ARCANE_SHOT_MAX_TRAVEL_TIME) {
      this.shotInFlight = null;
    }
    if (event.timestamp < this.lastDamageEvent + MS_BUFFER_100) {
      return;
    }
    this.procChances += 1;
    if (!this.spellUsable.isOnCooldown(SPELLS.RAPID_FIRE.id)) {
      this.badCasts += 1;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spellId={SPELLS.LETHAL_SHOTS_TALENT.id}>
          <>
            ≈
            {(
              Math.round(this.procChances * LETHAL_SHOTS_CHANCE) *
              (LETHAL_SHOTS_REDUCTION / 1000)
            ).toFixed(1)}
            s <small> potential Rapid Fire CDR</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  suggestions(when: When) {
    when(this.wastedPotentialCDR).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You cast{' '}
          {this.selectedCombatant.hasTalent(SPELLS.CHIMAERA_SHOT_TALENT_MARKSMANSHIP) ? (
            <SpellLink id={SPELLS.CHIMAERA_SHOT_TALENT_MARKSMANSHIP.id} />
          ) : (
            <SpellLink id={SPELLS.ARCANE_SHOT.id} />
          )}{' '}
          or <SpellLink id={SPELLS.MULTISHOT_MM.id} /> whilst{' '}
          <SpellLink id={SPELLS.RAPID_FIRE.id} /> wasn't on cooldown. You want to try and avoid this
          when using <SpellLink id={SPELLS.LETHAL_SHOTS_TALENT.id} />, as it is wasting potential
          cooldown reduction.
        </>,
      )
        .icon(SPELLS.LETHAL_SHOTS_TALENT.icon)
        .actual(
          t({
            id: 'hunter.marksmanship.suggestions.lethalShots.efficiency',
            message: `${actual} Lethal Shot trigger casts while Rapid Fire wasn't on cooldown`,
          }),
        )
        .recommended(`${recommended} bad casts are recommended`),
    );
  }
}

export default LethalShots;
