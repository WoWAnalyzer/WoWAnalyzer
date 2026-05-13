import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import spells from '../../spell-list_Monk_Brewmaster.retail';
import Events, { ApplyBuffEvent, RemoveBuffEvent, EventType, CastEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringValue from 'parser/ui/BoringValueText';
import { formatDurationMinSec } from 'common/format';
import SpellLink from 'interface/SpellLink';
import StateHistory, { EventHistory } from 'parser/core/StateHistory';
import type SpellUsable from 'parser/shared/modules/SpellUsable';

const CDR_PER_RANK = 2000;

// CDR for HT is handled in SpellUsable in order to deal with the bug where CDR is applied *before* a charge is consumed.
class HighTolerance extends Analyzer {
  protected ranks = 0;

  protected elevatedPurifyCount = 0;
  protected cdrAmount = 0;
  protected wastedCdr = 0;

  get elevatedPurifyCountTotal(): number {
    return this.elevatedPurifyCount;
  }

  get elevatedPurifyCdr(): number {
    return this.cdrAmount;
  }

  /**
   * Externally-callable method to apply HT CDR. this is used by Brew's SpellUsable to apply CDR *before* the cast, matching in-game behavior.
   */
  public reducePurifyCooldown(event: CastEvent, spellUsable: SpellUsable): void {
    if (!this.active) {
      return;
    }

    const cdr = this.ranks * CDR_PER_RANK;
    const actualAmount = spellUsable.reduceCooldown(spells.PURIFYING_BREW_TALENT.id, cdr);
    this.cdrAmount += actualAmount;
    this.wastedCdr += cdr - actualAmount;
    this.elevatedPurifyCount += 1;
  }

  uptime: EventHistory<EventType.ApplyBuff | EventType.RemoveBuff> = new StateHistory([]);

  constructor(options: Options) {
    super(options);
    this.ranks = this.selectedCombatant.getTalentRank(spells.HIGH_TOLERANCE_TALENT);
    this.active = this.ranks > 0;

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.ELEVATED_STAGGER_BUFF),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.ELEVATED_STAGGER_BUFF),
      this.onRemoveBuff,
    );
  }

  private onApplyBuff(event: ApplyBuffEvent) {
    this.uptime.data.push(event);
  }

  private onRemoveBuff(event: RemoveBuffEvent) {
    this.uptime.data.push(event);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            {formatDurationMinSec(this.wastedCdr / 1000)} CDR wasted. Note that{' '}
            <strong>High Tolerance has a bug</strong> causing cooldown reduction to be applied
            before consuming a charge.
          </>
        }
      >
        <BoringValue
          label={
            <>
              <SpellLink spell={spells.HIGH_TOLERANCE_TALENT} /> Elevated Purifies
            </>
          }
        >
          {this.elevatedPurifyCount} casts / {formatDurationMinSec(this.cdrAmount / 1000)} CDR
        </BoringValue>
      </Statistic>
    );
  }
}

export default HighTolerance;
