import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import HealingEfficiencyBreakdown from 'parser/core/healingEfficiency/HealingEfficiencyBreakdown';
import HealingEfficiencyDetails from 'parser/core/healingEfficiency/HealingEfficiencyDetails';
import HealingEfficiencyTracker from 'parser/core/healingEfficiency/HealingEfficiencyTracker';
import Panel from 'parser/ui/Panel';

class MistweaverHealingEfficiencyDetails extends HealingEfficiencyDetails {
  static dependencies = {
    ...HealingEfficiencyDetails.dependencies,
    healingEfficiencyTracker: HealingEfficiencyTracker,
  };

  protected healingEfficiencyTracker!: HealingEfficiencyTracker;

  statistic() {
    return (
      <Panel
        title="Mana efficiency"
        explanation={
          <>
            <SpellLink id={SPELLS.GUSTS_OF_MISTS.id} /> healing is added to the appropriate spell
            that caused the gust. <br /> <SpellLink id={TALENTS_MONK.ESSENCE_FONT_TALENT.id} /> is
            given the healing from duplicated gusts, since without{' '}
            <SpellLink id={TALENTS_MONK.ESSENCE_FONT_TALENT.id} /> the second gust would not have
            happened. <br /> <SpellLink id={TALENTS_MONK.RENEWING_MIST_TALENT.id} /> is given the
            splash healing of <SpellLink id={SPELLS.VIVIFY.id} />
            's heal since without <SpellLink id={TALENTS_MONK.RENEWING_MIST_TALENT.id} />,{' '}
            <SpellLink id={SPELLS.VIVIFY.id} /> wouldn't have splashed. <br />{' '}
            <SpellLink id={TALENTS_MONK.ENVELOPING_MIST_TALENT.id} /> is given the healing of{' '}
            <SpellLink id={TALENTS_MONK.ENVELOPING_BREATH_TALENT.id} /> since without casting{' '}
            <SpellLink id={TALENTS_MONK.ENVELOPING_MIST_TALENT.id} />,{' '}
            <SpellLink id={TALENTS_MONK.ENVELOPING_BREATH_TALENT.id} /> healing would not occur.
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
