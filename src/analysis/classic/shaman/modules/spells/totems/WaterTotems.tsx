import { Options } from 'parser/core/Analyzer';

import { TotemElements } from '../../../totemConstants';
import TotemTracker from '../../features/TotemTracker';
import BaseTotem from './BaseTotem';

export default class WaterTotems extends BaseTotem {
  static dependencies = {
    ...BaseTotem.dependencies,
    totemTracker: TotemTracker,
  };

  protected totemTracker!: TotemTracker;

  constructor(options: Options) {
    super(options, TotemElements.Water);
  }
}
