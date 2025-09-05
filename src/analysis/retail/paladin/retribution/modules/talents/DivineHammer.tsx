import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { TALENTS_PALADIN } from 'common/TALENTS';
import Events, { CastEvent, FightEndEvent, RemoveBuffEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import { formatDurationMinSec } from 'common/format';

export default class DivineHammer extends Analyzer {
  private casts = 0;
  private mostRecentCastTimestamp = 0;
  private totalDivineHammerDurationMS = 0;
  private divineHammerActive = false;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_PALADIN.DIVINE_HAMMER_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.DIVINE_HAMMER_CAST),
      this.onCast,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS_PALADIN.DIVINE_HAMMER_TALENT),
      this.onRemoveBuff,
    );

    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  private onCast(event: CastEvent) {
    this.divineHammerActive = true;
    this.casts += 1;
    this.mostRecentCastTimestamp = event.timestamp;
  }

  private onRemoveBuff(event: RemoveBuffEvent) {
    this.divineHammerActive = false;
    const divineHammerDurationMS = event.timestamp - this.mostRecentCastTimestamp;
    this.totalDivineHammerDurationMS += divineHammerDurationMS;
  }

  private onFightEnd(event: FightEndEvent) {
    if (this.divineHammerActive) {
      const divineHammerDurationMS = event.timestamp - this.mostRecentCastTimestamp;
      this.totalDivineHammerDurationMS += divineHammerDurationMS;
    }
  }

  get averageDivineHammerDurationSeconds() {
    return this.totalDivineHammerDurationMS / this.casts / 1000 || 0;
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.TALENTS}>
        <BoringSpellValueText spell={TALENTS_PALADIN.DIVINE_HAMMER_TALENT}>
          {formatDurationMinSec(this.averageDivineHammerDurationSeconds)}{' '}
          <small>average duration</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
