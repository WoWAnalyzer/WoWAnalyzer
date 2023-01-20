import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  EventType,
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
  FightEndEvent,
  CastEvent,
  DamageEvent,
} from 'parser/core/Events';
import { currentStacks } from 'parser/shared/modules/helpers/Stacks';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_DRUID } from 'common/TALENTS';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import {
  STARFALL_BASE_COST,
  STARFALL_ELUNES_GUIDANCE_DISCOUNT,
  STARSURGE_BASE_COST,
  STARSURGE_ELUNES_GUIDANCE_DISCOUNT,
} from '../../constants';

const MAX_STACKS = 2;
export const PERCENT_DAMAGE_INCREASE_PER_STACK = 0.1;
export const PERCENT_AP_SAVED_PER_STACK = 0.05;

class RattleTheStars extends Analyzer {
  buffStacks: number[][];
  buffedStarsurges: number[];
  buffedStarfalls: number[];
  lastStacks = 0;
  totalAPSaved = 0;
  lastUpdate = this.owner.fight.start_time;
  totalAddedDamage = 0;
  inTouchOfCosmosProc = false;
  private get elunedGuidanceDiscountActive() {
    return (
      this.selectedCombatant.hasTalent(TALENTS_DRUID.ELUNES_GUIDANCE_TALENT) &&
      this.selectedCombatant.hasBuff(SPELLS.INCARNATION_CHOSEN_OF_ELUNE.id)
    );
  }

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.RATTLE_THE_STARS_TALENT);
    this.buffStacks = Array.from({ length: MAX_STACKS + 1 }, (x) => [0]);
    this.buffedStarsurges = Array.from({ length: MAX_STACKS + 1 }, (x) => 0);
    this.buffedStarfalls = Array.from({ length: MAX_STACKS + 1 }, (x) => 0);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.RATTLED_STARS),
      this.handleStacks,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.RATTLED_STARS),
      this.handleStacks,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.RATTLED_STARS),
      this.handleStacks,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.RATTLED_STARS),
      this.handleStacks,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.STARFALL_CAST),
      this.handleStarfallCast,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.STARSURGE_MOONKIN),
      this.handleStarsurgeCast,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.STARFALL_CAST),
      this.handleDamage,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.STARSURGE_MOONKIN),
      this.handleDamage,
    );

    this.addEventListener(Events.fightend, this.handleStacks);
  }

  handleStacks(
    event:
      | ApplyBuffEvent
      | ApplyBuffStackEvent
      | RemoveBuffEvent
      | RemoveBuffStackEvent
      | FightEndEvent,
    stack = null,
  ) {
    this.buffStacks[this.lastStacks].push(event.timestamp - this.lastUpdate);
    if (event.type === EventType.FightEnd) {
      return;
    }
    this.lastUpdate = event.timestamp;
    this.lastStacks = currentStacks(event);
  }

  handleStarsurgeCast(event: CastEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.TOUCH_THE_COSMOS.id)) {
      this.totalAPSaved +=
        (STARSURGE_BASE_COST -
          (this.elunedGuidanceDiscountActive ? STARSURGE_ELUNES_GUIDANCE_DISCOUNT : 0)) *
        PERCENT_AP_SAVED_PER_STACK *
        this.selectedCombatant.getBuffStacks(SPELLS.RATTLED_STARS.id);
    }
    this.buffedStarsurges[this.lastStacks] = this.buffedStarsurges[this.lastStacks] + 1;
  }

  handleStarfallCast(event: CastEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.TOUCH_THE_COSMOS.id)) {
      this.totalAPSaved +=
        (STARFALL_BASE_COST -
          (this.elunedGuidanceDiscountActive ? STARFALL_ELUNES_GUIDANCE_DISCOUNT : 0)) *
        PERCENT_AP_SAVED_PER_STACK *
        this.selectedCombatant.getBuffStacks(SPELLS.RATTLED_STARS.id);
    }
    this.buffedStarfalls[this.lastStacks] = this.buffedStarfalls[this.lastStacks] + 1;
  }

  handleDamage(event: DamageEvent) {
    const buffStacks = this.selectedCombatant.getBuffStacks(SPELLS.RATTLED_STARS.id);
    this.totalAddedDamage += calculateEffectiveDamage(
      event,
      buffStacks * PERCENT_DAMAGE_INCREASE_PER_STACK,
    );
  }

  statistic() {
    const dpsIncrease = this.totalAddedDamage / (this.owner.fightDuration / 1000);
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(7)}
        wide
        size="flexible"
        tooltip={`This approximate DPS increase of ${formatNumber(
          dpsIncrease,
        )} on considers the damage increase from the talent, not increased Starsurge or Starfall usages from astral power that was saved`}
        dropdown={
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Stacks</th>
                  <th>Starsurges</th>
                  <th>Starfalls</th>
                  <th>Uptime</th>
                </tr>
              </thead>
              <tbody>
                {this.buffStacks.map((e, i) => (
                  <tr key={i}>
                    <th>{i} Stacks</th>
                    <td>{this.buffedStarsurges[i]}</td>
                    <td>{this.buffedStarfalls[i]}</td>
                    <td>
                      {formatPercentage(e.reduce((a, b) => a + b, 0) / this.owner.fightDuration)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        }
      >
        <BoringSpellValueText spellId={TALENTS_DRUID.RATTLE_THE_STARS_TALENT.id}>
          <>
            {formatNumber(this.totalAPSaved)} <small>Astral Power Saved</small>
            <br />
            {'>'}
            {formatNumber(dpsIncrease)} <small>approx. DPS added</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default RattleTheStars;
