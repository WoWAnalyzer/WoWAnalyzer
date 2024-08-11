import Analyzer, { Options } from 'parser/core/Analyzer';
import { TALENTS_DRUID } from 'common/TALENTS';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import SpellLink from 'interface/SpellLink';
import CastEfficiencyPanel from 'interface/guide/components/CastEfficiencyPanel';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';

const deps = {
  castEfficiency: CastEfficiency,
};

/**
 * **New Moon**
 * Spec Talent
 *
 * Deals X Astral damage to the target and empowers New Moon to become Half Moon.
 */
export default class NewMoon extends Analyzer.withDependencies(deps) {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.NEW_MOON_TALENT);
  }

  get guideSubsection() {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={TALENTS_DRUID.NEW_MOON_TALENT} />
        </strong>{' '}
        is a charge based nuke / AsP generator. It is stronger than your filler spells. Aim to never
        cap on charges.
      </p>
    );

    const data = <CastEfficiencyPanel spell={TALENTS_DRUID.NEW_MOON_TALENT} useThresholds />;

    return explanationAndDataSubsection(explanation, data);
  }
}
