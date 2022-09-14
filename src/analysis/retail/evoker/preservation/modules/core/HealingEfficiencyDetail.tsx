import { Trans } from '@lingui/macro';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { SpellLink } from 'interface';
import HealingEfficiencyBreakdown from 'parser/core/healingEfficiency/HealingEfficiencyBreakdown';
import CoreHealingEfficiencyDetails from 'parser/core/healingEfficiency/HealingEfficiencyDetails';
import HealingEfficiencyTracker from 'parser/core/healingEfficiency/HealingEfficiencyTracker';
import Panel from 'parser/ui/Panel';

class HealingEfficiencyDetails extends CoreHealingEfficiencyDetails {
  static dependencies = {
    ...CoreHealingEfficiencyDetails.dependencies,
    HealingEfficiencyTracker: HealingEfficiencyTracker,
  };

  protected healingEfficiencyTracker!: HealingEfficiencyTracker;

  statistic() {
    return (
      <Panel
        title={<Trans id="shared.healingEfficiency.title">Mana Efficiency</Trans>}
        explanation={
          <>
            <Trans id="evoker.preservation.healingEfficiencyDetails">
              <SpellLink id={TALENTS_EVOKER.DREAM_BREATH_PRESERVATION_TALENT.id} />
            </Trans>
          </>
        }
        pad={false}
        position={120}
      >
        <HealingEfficiencyBreakdown tracker={this.healingEfficiencyTracker} />
      </Panel>
    );
  }
}

export default HealingEfficiencyDetails;
