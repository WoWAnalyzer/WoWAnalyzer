import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import {
  getPyreEvents,
  isPyreFromCast,
  isPyreFromDragonrage,
} from '../normalizers/CastLinkNormalizer';
import Statistic from 'parser/ui/Statistic';
import { plotOneVariableBinomChart } from 'parser/shared/modules/helpers/Probability';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import { formatNumber } from 'common/format';
import { VOLATILITY_PROC_CHANCE } from '../../constants';
import { encodeEventTargetString } from 'parser/shared/modules/Enemies';

const PYRE_HIT_BUFFER = 30;

/**
 * Pyre has a 15%(Rank 1)/30%(Rank 2) chance to flare up and explode again on a nearby target.
 */
class Volatility extends Analyzer {
  volatilityProcs = 0;
  volatilityProcAttempts = 0;
  volatilityProcChance = 0;

  volatilityDamage = 0;

  currentTargets = new Set<string>();
  latestTimestamp = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.VOLATILITY_TALENT);

    this.volatilityProcChance =
      VOLATILITY_PROC_CHANCE * this.selectedCombatant.getTalentRank(TALENTS.VOLATILITY_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([TALENTS.PYRE_TALENT, TALENTS.DRAGONRAGE_TALENT]),
      this.onCast,
    );

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.PYRE), this.onDamage);
  }

  private onCast(event: CastEvent) {
    const pyreEvents = getPyreEvents(event);

    /** If we only hit one target there are no chances for procs
     * since it needs to bounce to new target */
    if (pyreEvents.length <= 1) {
      return;
    }

    if (event.ability.guid === TALENTS.PYRE_TALENT.id) {
      this.volatilityProcAttempts += 1;
    } else {
      // Dragonrage fires off (up to) 3 Pyres so we can have up to 3 proc chances
      this.volatilityProcAttempts += Math.min(3, pyreEvents.length);
    }
  }

  private onDamage(event: DamageEvent) {
    if (isPyreFromDragonrage(event) || isPyreFromCast(event)) {
      return;
    }

    /**
     * Using castlinks for Volatility procs is a bit too complex to do cleanly.
     * So we will treat Pyre hits without links as Volatility procs.
     *
     * Pyre hits will log ~30ms within each other so we can distinguish between
     * individual procs based on this buffer or whether we hit the same target again.
     *
     * Due to Dragonrage sending out 3 Pyres at the same time we can potentially have
     * event ordering that mixes the event of the 3 Procs. I haven't observed
     * it yet though, and the requisites for it to happen are unlikely due Pyres always
     * having varying traveltime(up to 100ms difference) and requires all 3 Pyres to proc.
     * This would only result in a very minor over count that shouldn't matter enough to worry about.
     */
    const difference = event.timestamp - this.latestTimestamp;
    const target = encodeEventTargetString(event);
    if (difference > PYRE_HIT_BUFFER || this.currentTargets.has(target)) {
      this.currentTargets.clear();
      this.latestTimestamp = event.timestamp;

      this.volatilityProcs += 1;
    }

    this.currentTargets.add(target);

    /** Volatility can infinitely chain procs.
     * It still needs to be able to bounce, so we
     * track the amount of hits to determine whether or not it can */
    if (this.currentTargets.size === 2) {
      this.volatilityProcAttempts += 1;
    }

    this.volatilityDamage += event.amount + (event.absorbed ?? 0);
  }

  get damage() {
    return this.volatilityDamage;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <li>
              Procs: {Math.floor(this.volatilityProcs)}
              <br />
            </li>
            <li>
              Expected procs: {Math.floor(this.volatilityProcAttempts * this.volatilityProcChance)}
            </li>
            <li>Damage: {formatNumber(this.volatilityDamage)}</li>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.VOLATILITY_TALENT}>
          <ItemDamageDone amount={this.volatilityDamage} />
        </TalentSpellText>
        {plotOneVariableBinomChart(
          this.volatilityProcs,
          this.volatilityProcAttempts,
          this.volatilityProcChance,
        )}
      </Statistic>
    );
  }
}

export default Volatility;
