import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Panel from 'interface/statistics/Panel';
import CoreHealingEfficiencyDetails from 'parser/core/healingEfficiency/HealingEfficiencyDetails';
import HealingEfficiencyTracker from 'parser/core/healingEfficiency/HealingEfficiencyTracker';
import HealingEfficiencyBreakdown from 'parser/core/healingEfficiency/HealingEfficiencyBreakdown';
import { Trans } from '@lingui/macro';

class HealingEfficiencyDetails extends CoreHealingEfficiencyDetails {
  static dependencies = {
    healingEfficiencyTracker: HealingEfficiencyTracker,
  };

  protected healingEfficiencyTracker!: HealingEfficiencyTracker;

  statistic() {
    return (
      <Panel
        title={<Trans id="shared.healingEfficiency.title">Mana Efficiency</Trans>}
        explanation={(
          <>
            <Trans id="shaman.restoration.healingEfficiencyDetails">
              <SpellLink id={SPELLS.RESURGENCE.id} /> mana gained is removed from the spell, meaning the mana spent of that spell will be lower.<br />
            Healing that is caused by the <SpellLink id={SPELLS.UNLEASH_LIFE_TALENT.id} /> buff, is added to <SpellLink id={SPELLS.UNLEASH_LIFE_TALENT.id} /> instead of the spell that was buffed.<br />
              <SpellLink id={SPELLS.EARTH_SHIELD_HEAL.id} /> is given the healing from its healing buff and is removed from the spells that were buffed.
          </Trans>
            <Trans id="shaman.restoration.healingEfficiencyDetails2">
              <SpellLink id={SPELLS.PRIMORDIAL_WAVE_CAST.id} /> is given the healing from its created <SpellLink id={SPELLS.RIPTIDE.id} /> & <SpellLink id={SPELLS.HEALING_WAVE.id} /> and is removed from those spells.
          </Trans>
          </>
        )}
        pad={false}
        position={120}
      >
        <HealingEfficiencyBreakdown tracker={this.healingEfficiencyTracker} />
      </Panel>
    );
  }
}

export default HealingEfficiencyDetails;
