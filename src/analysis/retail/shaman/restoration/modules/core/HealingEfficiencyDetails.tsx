import { Trans } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { SpellLink } from 'interface';
import HealingEfficiencyBreakdown from 'parser/core/healingEfficiency/HealingEfficiencyBreakdown';
import CoreHealingEfficiencyDetails from 'parser/core/healingEfficiency/HealingEfficiencyDetails';
import Panel from 'parser/ui/Panel';

class HealingEfficiencyDetails extends CoreHealingEfficiencyDetails {
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
