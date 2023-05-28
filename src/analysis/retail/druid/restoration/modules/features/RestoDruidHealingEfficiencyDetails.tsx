import { Trans } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import HealingEfficiencyBreakdown from 'parser/core/healingEfficiency/HealingEfficiencyBreakdown';
import HealingEfficiencyDetails from 'parser/core/healingEfficiency/HealingEfficiencyDetails';
import HealingEfficiencyTracker from 'parser/core/healingEfficiency/HealingEfficiencyTracker';
import Panel from 'parser/ui/Panel';
import { TALENTS_DRUID } from 'common/TALENTS';

/** Display module for healing efficiency data */
class RestoDruidHealingEfficiencyDetails extends HealingEfficiencyDetails {
  static dependencies = {
    ...HealingEfficiencyDetails.dependencies,
    healingEfficiencyTracker: HealingEfficiencyTracker,
  };

  protected healingEfficiencyTracker!: HealingEfficiencyTracker;

  statistic() {
    return (
      <Panel
        title={<Trans id="shared.healingEfficiency.title">Mana Efficiency</Trans>}
        explanation={
          <>
            These stats include only your hardcasts - procs and casts due to{' '}
            <SpellLink id={SPELLS.CONVOKE_SPIRITS.id} /> are not included in this chart. <br />
            Additional healing enabled by a HoT's mastery stack ARE counted here, but further
            implications of the cast (like a{' '}
            <SpellLink id={TALENTS_DRUID.SOUL_OF_THE_FOREST_RESTORATION_TALENT.id} /> proc from
            Swiftmend) are not counted.
          </>
        }
        position={120}
      >
        <HealingEfficiencyBreakdown tracker={this.healingEfficiencyTracker} />
      </Panel>
    );
  }
}

export default RestoDruidHealingEfficiencyDetails;
