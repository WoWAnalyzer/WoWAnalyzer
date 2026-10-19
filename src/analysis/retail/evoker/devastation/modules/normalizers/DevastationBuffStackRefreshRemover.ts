import { BuffStackRefreshRemover, BuffStackRefreshPairing } from 'analysis/retail/evoker/shared';
import SPELLS from 'common/SPELLS/evoker';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

const PAIRINGS: BuffStackRefreshPairing[] = [
  { buff: SPELLS.AZURE_SWEEP_BUFF, pairedWith: [EventType.RemoveBuffStack] },
  { buff: SPELLS.IMMINENT_DESTRUCTION_DEV_BUFF, pairedWith: [EventType.ApplyBuffStack] },
  /** Mass Disintegrate randomly fires a refresh event when applying or removing a stack.
   * https://www.warcraftlogs.com/reports/g8zm4DBC2wpRJ6FP/?fight=45&source=6
   */
  {
    buff: SPELLS.MASS_DISINTEGRATE_BUFF,
    pairedWith: [EventType.ApplyBuffStack, EventType.RemoveBuffStack],
    bufferMs: 50,
  },
];

class DevastationBuffStackRefreshRemover extends BuffStackRefreshRemover {
  constructor(options: Options) {
    super(options, PAIRINGS);
  }
}

export default DevastationBuffStackRefreshRemover;
