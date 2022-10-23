import BuffStackTracker from 'parser/shared/modules/BuffStackTracker';
import { Options } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/demonhunter';

export default class SoulFragmentBuffStackTracker extends BuffStackTracker {
  constructor(options: Options) {
    super(options);
    this.buff = SPELLS.SOUL_FRAGMENT_STACK;
  }
}
