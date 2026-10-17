import { BuffStackRefreshRemover, BuffStackRefreshPairing } from 'analysis/retail/evoker/shared';
import SPELLS from 'common/SPELLS/evoker';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

const PAIRINGS: BuffStackRefreshPairing[] = [
  { buff: SPELLS.IMMINENT_DESTRUCTION_AUG_BUFF, pairedWith: [EventType.ApplyBuffStack] },
];

class AugmentationBuffStackRefreshRemover extends BuffStackRefreshRemover {
  constructor(options: Options) {
    super(options, PAIRINGS);
  }
}

export default AugmentationBuffStackRefreshRemover;
