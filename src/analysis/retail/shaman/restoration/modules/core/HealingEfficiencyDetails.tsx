import { Trans } from '@lingui/react/macro';
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
          <ul>
            <li>
              <Trans id="shaman.restoration.healingEfficiencyDetails.resurgence">
                <SpellLink spell={SPELLS.RESURGENCE} /> mana gained is removed from the spell,
                meaning the mana spent of that spell will be lower.
              </Trans>
            </li>
            {this.selectedCombatant.hasTalent(TALENTS.CURRENT_CONTROL_TALENT) && (
              <li>
                <Trans id="shaman.restoration.healingEfficiencyDetails.currentControl">
                  <SpellLink spell={TALENTS.CURRENT_CONTROL_TALENT} /> reduces the mana cost of{' '}
                  <SpellLink spell={SPELLS.HEALING_WAVE} /> and{' '}
                  <SpellLink spell={TALENTS.CHAIN_HEAL_TALENT} />.
                </Trans>
              </li>
            )}
            <li>
              <Trans id="shaman.restoration.healingEfficiencyDetails.unleashLife">
                Healing that is caused by the <SpellLink spell={TALENTS.UNLEASH_LIFE_TALENT} /> buff
                is added to <SpellLink spell={TALENTS.UNLEASH_LIFE_TALENT} /> instead of the spell
                that was buffed.
              </Trans>
            </li>
            <li>
              <Trans id="shaman.restoration.healingEfficiencyDetails.earthShield">
                <SpellLink spell={TALENTS.EARTH_SHIELD_TALENT} /> is given the healing from its
                healing buff and is removed from the spells that were buffed.
              </Trans>
            </li>
          </ul>
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
