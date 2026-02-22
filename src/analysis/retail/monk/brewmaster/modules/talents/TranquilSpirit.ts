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
  constructor(options: Options) {
    super(talents.TRANQUIL_SPIRIT_TALENT, options);

    this.active = this.selectedCombatant.hasTalent(talents.TRANQUIL_SPIRIT_TALENT);

    this.addEventListener(
      Events.heal.spell([...GIFT_OF_THE_OX_SPELLS, SPELLS.EXPEL_HARM]),
      this.triggerTranquilSpirit,
    );
  }

  private triggerTranquilSpirit(event: HealEvent) {
    // accept failure if there's no clear
    const clear = tranquilSpiritClear.first(event)!;

    const amount = clear.amount * this.deps.stagger.getPoolAtTime(event.timestamp).remainingTicks;
    this.removeStagger(event, amount);
    this.addDebugAnnotation(event, {
      summary: `Tranquil Spirit stagger clear (${clear.amount} per-tick, ${amount} total)`,
      color: OkColor,
    });
  }
}
