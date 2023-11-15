import { Trans } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { SpellLink } from 'interface';
import HealingEfficiencyBreakdown from 'parser/core/healingEfficiency/HealingEfficiencyBreakdown';
import CoreHealingEfficiencyDetails from 'parser/core/healingEfficiency/HealingEfficiencyDetails';
import HealingEfficiencyTracker from 'parser/core/healingEfficiency/HealingEfficiencyTracker';
import Panel from 'parser/ui/Panel';

class HealingEfficiencyDetails extends CoreHealingEfficiencyDetails {
  static dependencies = {
    ...CoreHealingEfficiencyDetails.dependencies,
    healingEfficiencyTracker: HealingEfficiencyTracker,
  };

  protected healingEfficiencyTracker!: HealingEfficiencyTracker;

  statistic() {
    return (
      <Panel
        title={<Trans id="shared.healingEfficiency.title">Mana Efficiency</Trans>}
        explanation={
          <>
            <Trans id="shaman.restoration.healingEfficiencyDetails">
              <SpellLink spell={SPELLS.RESURGENCE} /> mana gained is removed from the spell, meaning
              the mana spent of that spell will be lower.
              <br />
              Healing that is caused by the <SpellLink spell={TALENTS.UNLEASH_LIFE_TALENT} /> buff,
              is added to <SpellLink spell={TALENTS.UNLEASH_LIFE_TALENT} /> instead of the spell
              that was buffed.
              <br />
              <SpellLink spell={TALENTS.EARTH_SHIELD_TALENT} /> is given the healing from its
              healing buff and is removed from the spells that were buffed.
            </Trans>
            <br />
            <Trans id="shaman.restoration.healingEfficiencyDetails2">
              <SpellLink spell={TALENTS.PRIMORDIAL_WAVE_RESTORATION_TALENT} /> is given the healing
              from its created <SpellLink spell={TALENTS.RIPTIDE_TALENT} /> &{' '}
              <SpellLink spell={TALENTS.HEALING_WAVE_TALENT} /> and is removed from those spells.
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
