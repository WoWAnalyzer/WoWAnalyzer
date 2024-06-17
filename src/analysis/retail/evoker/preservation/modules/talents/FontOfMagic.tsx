import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { TALENTS_EVOKER } from 'common/TALENTS';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { getHealEvents } from '../../normalizers/EventLinking/helpers';
import { formatNumber } from 'common/format';

const FONT_SPLIT_TARGETS = 3; // level 4 empower sb = 3 additional targets

class FontOfMagic extends Analyzer {
  totalHits: number = 0;
  totalHealing: number = 0;
  totalOverhealing: number = 0;
  countedTimestamps: Set<number> = new Set<number>();

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(
      TALENTS_EVOKER.FONT_OF_MAGIC_PRESERVATION_TALENT,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.SPIRITBLOOM_SPLIT),
      this.onHealBatch,
    );
  }

  onHealBatch(event: HealEvent) {
    if (this.countedTimestamps.has(event.timestamp)) {
      return;
    }

    const allHealingEvents = getHealEvents(event);
    if (allHealingEvents.length < FONT_SPLIT_TARGETS) {
      return;
    }
    this.totalHits += 1;
    const fontEvent = allHealingEvents.at(-1)!;
    this.totalHealing += fontEvent.amount + (fontEvent.absorbed || 0);
    this.totalOverhealing += fontEvent.overheal || 0;

    allHealingEvents.forEach((ev) => this.countedTimestamps.add(ev.timestamp));
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <ul>
            <li>Total effective healing: {formatNumber(this.totalHealing)}</li>
            <li>Total overhealing: {formatNumber(this.totalOverhealing)}</li>
            <li>Total extra hits: {this.totalHits}</li>
          </ul>
        }
      >
        <TalentSpellText talent={TALENTS_EVOKER.FONT_OF_MAGIC_PRESERVATION_TALENT}>
          <ItemHealingDone amount={this.totalHealing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default FontOfMagic;
