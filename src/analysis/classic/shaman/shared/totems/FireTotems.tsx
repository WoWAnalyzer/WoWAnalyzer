import { Options } from 'parser/core/Analyzer';

import { TotemElements } from './totemConstants';
import BaseTotem from './BaseTotem';

export default class FireTotems extends BaseTotem {
  static dependencies = {
    ...BaseTotem.dependencies,
  };

  constructor(options: Options) {
    super(options, TotemElements.Fire);
  }
}
