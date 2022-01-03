import { SpellLink } from 'interface';
import { Options } from 'parser/core/Analyzer';

import * as SPELLS from '../../../SPELLS';
import { TotemElements } from '../../../totemConstants';
import TotemTracker from '../../features/TotemTracker';
import BaseTotem from './BaseTotem';

export default class WaterTotems extends BaseTotem {
  static dependencies = {
    totemTracker: TotemTracker,
  };

  protected totemTracker!: TotemTracker;

  constructor(options: Options) {
    super(options, TotemElements.Water);
  }
}
