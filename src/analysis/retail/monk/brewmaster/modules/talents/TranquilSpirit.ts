import talents from 'common/TALENTS/monk';
import { Options } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import { GIFT_OF_THE_OX_SPELLS } from '../../constants';
import StaggerAnalyzer from '../tools/StaggerAnalyzer';
import { tranquilSpiritClear } from '../../normalizers/StaggerClearSourceLinkNormalizer';
import SPELLS from '../../spell-list_Monk_Brewmaster.retail';
import { OkColor } from 'interface/guide';

// logs
// only gotox, no eh (no nr): https://www.warcraftlogs.com/reports/Hn9MRdgbpBfDmzqV
// niuzao's resolve: https://www.warcraftlogs.com/reports/3XxdLQpYf1KGvFWZ
export default class TranquilSpirit extends StaggerAnalyzer {
  missingClears = 0;

  constructor(options: Options) {
    super(talents.TRANQUIL_SPIRIT_TALENT, options);

    this.active = this.selectedCombatant.hasTalent(talents.TRANQUIL_SPIRIT_TALENT);

    this.addEventListener(
      Events.heal.spell([...GIFT_OF_THE_OX_SPELLS, SPELLS.EXPEL_HARM]),
      this.triggerTranquilSpirit,
    );
  }

  private triggerTranquilSpirit(event: HealEvent) {
    const clear = tranquilSpiritClear.first(event)!;

    if (!clear) {
      // if there's no clear, make note and move on.
      // there are cases where two staggerclear events SHOULD happen,
      // but only one is logged. unclear if this is a bug in game logging
      // or if the clear is actually missing. more investigation required
      //
      // example: https://www.warcraftlogs.com/reports/1qjfJt6V2nkBcZm8?fight=last&view=events&type=summary&pins=0%24Off%24%23244F4B%24expression%24type+%3D+%22staggerclear%22&start=5859390&end=5862391
      // at 01:06.816
      this.missingClears += 1;
      return;
    }

    const amount = clear.amount * this.deps.stagger.getPoolAtTime(event.timestamp).remainingTicks;
    this.removeStagger(event, amount);
    this.addDebugAnnotation(event, {
      summary: `Tranquil Spirit stagger clear (${clear.amount} per-tick, ${amount} total)`,
      color: OkColor,
    });
  }
}
