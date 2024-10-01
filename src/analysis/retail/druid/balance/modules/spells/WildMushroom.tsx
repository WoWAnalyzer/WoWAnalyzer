import Analyzer, { Options } from 'parser/core/Analyzer';
import { TALENTS_DRUID } from 'common/TALENTS';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import SpellLink from 'interface/SpellLink';
import CastEfficiencyPanel from 'interface/guide/components/CastEfficiencyPanel';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';

const deps = {
  castEfficiency: CastEfficiency,
};

// TODO TWW - average targets hit calc
/**
 * **Wild Mushroom**
 * Spec Talent
 *
 * Grow a magical mushroom at the target enemy's location.
 * After 1 sec, the mushroom detonates, dealing X Nature damage and then an additional
 * X Nature damage over 10 sec. Affected targets are slowed by 50%.
 *
 * Generates up to 16 Astral Power based on targets hit.
 */
export default class WildMushroom extends Analyzer.withDependencies(deps) {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.WILD_MUSHROOM_TALENT);
  }

  get guideSubsection() {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={TALENTS_DRUID.WILD_MUSHROOM_TALENT} />
        </strong>{' '}
        is a charge based AoE spell. It's only useful as an instant movement filler in ST, but is
        strong in AoE. It's acceptable to cap charges during ST, but remember to use them in AoE.
      </p>
    );

    const data = <CastEfficiencyPanel spell={TALENTS_DRUID.WILD_MUSHROOM_TALENT} useThresholds />;

    return explanationAndDataSubsection(explanation, data);
  }
}
