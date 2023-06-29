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
        title={<>Mana Efficiency</>}
        explanation={
          <>
            <>
              <SpellLink id={SPELLS.RESURGENCE.id} /> mana gained is removed from the spell, meaning
              the mana spent of that spell will be lower.
              <br />
              Healing that is caused by the <SpellLink id={TALENTS.UNLEASH_LIFE_TALENT.id} /> buff,
              is added to <SpellLink id={TALENTS.UNLEASH_LIFE_TALENT.id} /> instead of the spell
              that was buffed.
              <br />
              <SpellLink id={TALENTS.EARTH_SHIELD_TALENT.id} /> is given the healing from its
              healing buff and is removed from the spells that were buffed.
            </>
            <br />
            <>
              <SpellLink id={TALENTS.PRIMORDIAL_WAVE_TALENT.id} /> is given the healing from its
              created <SpellLink id={TALENTS.RIPTIDE_TALENT.id} /> &{' '}
              <SpellLink id={TALENTS.HEALING_WAVE_TALENT.id} /> and is removed from those spells.
            </>
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
