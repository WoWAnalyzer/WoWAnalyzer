import SPELLS from 'common/SPELLS/rogue';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { NumberThreshold, ThresholdStyle } from 'parser/core/ParseResults';
import type { ReactElement } from 'react';
import TALENTS from 'common/TALENTS/rogue';

import RollTheBonesCastTracker, { RTBCast } from '../features/RollTheBonesCastTracker';

const HIGH_TIER_REFRESH_TIME = 3000;

export interface RTBSuggestion {
  label: string;
  pass: number;
  total: number;
  extraSuggestion: ReactElement;
  suggestionThresholds: NumberThreshold;
}

class RollTheBonesEfficiency extends Analyzer {
  static dependencies = {
    rollTheBonesCastTracker: RollTheBonesCastTracker,
  };
  protected rollTheBonesCastTracker!: RollTheBonesCastTracker;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.DISPATCH, SPELLS.BETWEEN_THE_EYES]),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    if (
      event.ability.guid !== SPELLS.DISPATCH.id &&
      event.ability.guid !== SPELLS.BETWEEN_THE_EYES.id
    ) {
      return;
    }
  }
}

export default RollTheBonesEfficiency;
