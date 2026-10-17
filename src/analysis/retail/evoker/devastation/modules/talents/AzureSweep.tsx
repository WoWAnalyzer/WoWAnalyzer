import { Options } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/evoker';
import SPELLS from 'common/SPELLS/evoker';
import { CastEvent } from 'parser/core/Events';
import { getAzureSweepConsumeEvent } from '../normalizers/CastLinkNormalizer';
import { AZURE_SWEEP_BASE_STACKS, MID1_4P_AZURE_SWEEP_EXTRA_STACKS } from '../../constants';
import { TIERS } from 'game/TIERS';
import ProcBuffAnalyzer, {
  BuffRemoveEvent,
} from 'analysis/retail/evoker/shared/modules/core/ProcBuffAnalyzer';

/** Eternity Surge upgrades your next Azure Strike to Azure Sweep,
 * damaging all nearby enemies and dealing 75% additional damage. */
class AzureSweep extends ProcBuffAnalyzer<CastEvent> {
  constructor(options: Options) {
    const has4Piece = options.owner.selectedCombatant.has4PieceByTier(TIERS.MID1);
    super(options, {
      buff: SPELLS.AZURE_SWEEP_BUFF,
      stacksPerProc: AZURE_SWEEP_BASE_STACKS + (has4Piece ? MID1_4P_AZURE_SWEEP_EXTRA_STACKS : 0),
      maxStacks: 2,
    });
    this.active = this.selectedCombatant.hasTalent(TALENTS.AZURE_SWEEP_TALENT);
  }

  protected getConsumeEvent(event: BuffRemoveEvent) {
    return getAzureSweepConsumeEvent(event);
  }
}

export default AzureSweep;
