import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import spells from '../../spell-list_Monk_Brewmaster.retail';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Events, { CastEvent, ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringValue from 'parser/ui/BoringValueText';
import { Uptime } from 'parser/ui/UptimeBar';
import { formatDurationMinSec } from 'common/format';
import SpellLink from 'interface/SpellLink';

const CDR_PER_RANK = 3000;

class HighTolerance extends Analyzer.withDependencies({ spellUsable: SpellUsable }) {
  protected ranks = 0;

  protected cdrAmount = 0;
  protected wastedCdr = 0;

  uptime: Uptime[] = [];

  constructor(options: Options) {
    super(options);
    this.ranks = this.selectedCombatant.getTalentRank(spells.HIGH_TOLERANCE_TALENT);
    this.active = this.ranks > 0;

    this.addEventListener(
      Events.cast.spell(spells.PURIFYING_BREW_TALENT).by(SELECTED_PLAYER),
      this.elevatedStaggerCdr,
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.ELEVATED_STAGGER_BUFF),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.ELEVATED_STAGGER_BUFF),
      this.onRemoveBuff,
    );
    this.addEventListener(Events.fightend, this.finalize);
  }

  private elevatedStaggerCdr(_event: CastEvent): void {
    if (this.selectedCombatant.hasBuff(SPELLS.ELEVATED_STAGGER_BUFF)) {
      // note: this is NOT shared brew CDR! it is only Purifying Brew!
      const actualCdr = this.deps.spellUsable.reduceCooldown(
        spells.PURIFYING_BREW_TALENT.id,
        this.ranks * CDR_PER_RANK,
      );
      this.cdrAmount += actualCdr;
      this.wastedCdr += this.ranks * CDR_PER_RANK - actualCdr;
    }
  }

  private onApplyBuff(event: ApplyBuffEvent) {
    const uptime: Uptime = {
      start: event.timestamp,
      end: event.timestamp,
    };

    this.uptime.push(uptime);
  }

  private onRemoveBuff(event: RemoveBuffEvent) {
    const last = this.uptime[this.uptime.length - 1];
    if (last) {
      last.end = event.timestamp;
    } else {
      const uptime: Uptime = {
        start: this.owner.fight.start_time,
        end: event.timestamp,
      };

      this.uptime.push(uptime);
    }
  }

  private finalize() {
    const last = this.uptime[this.uptime.length - 1];
    if (!last || last.end !== last.start) {
      return;
    }

    last.end = this.owner.fight.end_time;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringValue
          label={
            <>
              <SpellLink spell={spells.HIGH_TOLERANCE_TALENT} /> Purify CDR
            </>
          }
        >
          {formatDurationMinSec(this.cdrAmount / 1000)}
        </BoringValue>
      </Statistic>
    );
  }
}

export default HighTolerance;
