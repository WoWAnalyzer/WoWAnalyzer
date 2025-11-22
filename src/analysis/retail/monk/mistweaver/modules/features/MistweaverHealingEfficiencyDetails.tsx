import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import HealingEfficiencyBreakdown from 'parser/core/healingEfficiency/HealingEfficiencyBreakdown';
import HealingEfficiencyDetails from 'parser/core/healingEfficiency/HealingEfficiencyDetails';
import Panel from 'parser/ui/Panel';

class MistweaverHealingEfficiencyDetails extends HealingEfficiencyDetails {
  statistic() {
    return (
      <Panel
        title="Mana efficiency"
        explanation={
          <>
            <SpellLink spell={SPELLS.GUSTS_OF_MISTS} /> healing is added to the appropriate spell
            that caused the gust. <br />
            {this.selectedCombatant.hasTalent(TALENTS_MONK.JADEFIRE_TEACHINGS_TALENT) && (
              <>
                <SpellLink spell={TALENTS_MONK.JADEFIRE_TEACHINGS_TALENT} /> is given to{' '}
                <SpellLink spell={TALENTS_MONK.JADEFIRE_STOMP_TALENT} /> since it is the spell that
                applied the buff. <br />
              </>
            )}
            <SpellLink spell={SPELLS.RENEWING_MIST_CAST} /> healing from{' '}
            {this.selectedCombatant.hasTalent(TALENTS_MONK.RAPID_DIFFUSION_TALENT) && (
              <>
                <SpellLink spell={TALENTS_MONK.RAPID_DIFFUSION_TALENT} /> is given to the spell that
                procced it. <br />
              </>
            )}
            {this.selectedCombatant.hasTalent(TALENTS_MONK.MISTY_PEAKS_TALENT) && (
              <>
                <SpellLink spell={TALENTS_MONK.MISTY_PEAKS_TALENT} /> healing is attributed to the
                source cast of the <SpellLink spell={SPELLS.RENEWING_MIST_CAST} /> that procced it.
              </>
            )}
            {this.selectedCombatant.hasTalent(TALENTS_MONK.ZEN_PULSE_TALENT) && (
              <>
                <SpellLink spell={TALENTS_MONK.ZEN_PULSE_TALENT} /> healing is attributed to{' '}
                <SpellLink spell={SPELLS.VIVIFY} />.
              </>
            )}
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

export default MistweaverHealingEfficiencyDetails;
