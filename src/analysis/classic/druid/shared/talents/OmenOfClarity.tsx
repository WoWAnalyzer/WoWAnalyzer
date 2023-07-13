import SPELLS from 'common/SPELLS/classic/druid';
import { SpellIcon, SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, RemoveBuffEvent } from 'parser/core/Events';
import BoringValue from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../restoration/Guide';
import { getClearcastConsumer } from '../../restoration/modules/normalizers/CastLinkNormalizer';
import { abilityToSpell } from 'common/abilityToSpell';

/**
 * OmenOfClarity procs Clearcasting
 */

class OmenOfClarity extends Analyzer {
  static dependencies = {};

  protected _clearcasts: ClearcastProc[] = [];
  protected _isResto = true;
  protected _lastApplied: number | null = null;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.talentPoints[2] >= 11;
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.CLEARCASTING),
      this.onClearcastApply,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.CLEARCASTING),
      this.onClearcast,
    );
  }

  onClearcastApply(event: ApplyBuffEvent) {
    this._lastApplied = event.timestamp;
  }

  onClearcast(event: RemoveBuffEvent) {
    const castEvent = getClearcastConsumer(event);

    this._clearcasts.push({
      clearcastEvent: event,
      castEvent: castEvent,
      delay: event.timestamp - (this._lastApplied ?? event.timestamp),
    });
    this._lastApplied = null;
  }

  get numberOfClearcasts(): number {
    return this._clearcasts.length;
  }

  /** Guide subsection describing the proper usage of Rejuvenation */
  get guideSubsection(): JSX.Element {
    const explanation = (
      <>
        <p>
          <b>
            <SpellLink spell={SPELLS.CLEARCASTING} />
          </b>{' '}
          procs reduce the cost of your next spell by 100%. It should ideally be used on high cost
          abilities.
        </p>
        {this._isResto && (
          <p>
            The best option for Restoration Druids being a <SpellLink spell={SPELLS.LIFEBLOOM} />{' '}
            which will cost nothing but return 50% of the cost of the spell, gaining you mana.
          </p>
        )}
      </>
    );

    const data = (
      <div>
        <strong>Per-Proc Breakdown</strong>
        <br />
        {this._clearcasts.map((cast, ix) => (
          <>{cast.castEvent && this.spellIconFromEvent(cast.castEvent, cast.delay)}</>
        ))}
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  spellIconFromEvent(event: CastEvent, delay: number): JSX.Element {
    return (
      <div>
        @ {this.owner.formatTimestamp(event.timestamp)} &mdash;{' '}
        <SpellLink spell={abilityToSpell(event.ability)} /> ({(delay / 1000).toFixed(1)}sec
        hesitation)
      </div>
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(53)} // chosen for fixed ordering of general stats
        size="flexible"
      >
        <BoringValue
          label={
            <>
              <SpellIcon spell={SPELLS.CLEARCASTING} /> Omen of Clarity
            </>
          }
        >
          <>
            {this.numberOfClearcasts} <small>procs</small>
          </>
        </BoringValue>
      </Statistic>
    );
  }
}

interface ClearcastProc {
  delay: number;
  clearcastEvent: RemoveBuffEvent;
  castEvent: CastEvent | undefined;
}

export default OmenOfClarity;
