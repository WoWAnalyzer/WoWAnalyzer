import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Events, { CastEvent } from 'parser/core/Events';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ResourceGenerated from 'interface/others/ResourceGenerated';

const FERAL_SPIRIT = {
  INITIAL_MAELSTROM_WEAPON_GAIN: 1,
  MAELSTROM_WEAPON_GAIN_INTERVAL: 3000,
  MAELSTROM_WEAPON_GAIN_PER_INTERVAL: 1,
  MAELSTROM_WEAPON_GAIN_TOTAL_DURATION: 15000,
};

class FeralSpirit extends Analyzer {
  protected maelstromWeaponGained: number = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER)
        .spell(SPELLS.FERAL_SPIRIT),
      this.onFeralSpiritCast,
    );
  }

  onFeralSpiritCast(event: CastEvent): void {
    const expectedMaelstromGained =
      FERAL_SPIRIT.INITIAL_MAELSTROM_WEAPON_GAIN +
      FERAL_SPIRIT.MAELSTROM_WEAPON_GAIN_PER_INTERVAL *
      (FERAL_SPIRIT.MAELSTROM_WEAPON_GAIN_TOTAL_DURATION / FERAL_SPIRIT.MAELSTROM_WEAPON_GAIN_INTERVAL);

    this.maelstromWeaponGained += expectedMaelstromGained;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
      >
        <BoringSpellValueText spell={SPELLS.FERAL_SPIRIT}>
          <>
            <ResourceGenerated
              amount={this.maelstromWeaponGained}
              resourceType={SPELLS.MAELSTROM_WEAPON_BUFF}
              approximate
            />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FeralSpirit;
