import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import SpellLink from 'interface/SpellLink';
import CastEfficiencyPanel from 'interface/guide/components/CastEfficiencyPanel';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';

export default class Mangle extends Analyzer {
  get guideSubsection() {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={SPELLS.MANGLE_BEAR} />
        </strong>{' '}
        does direct damage and generates rage. Use it on cooldown. The very short cooldown combined
        with jammed GCDs means 100% usage will be practically impossible, but get as close as you
        can.
      </p>
    );

    const data = <CastEfficiencyPanel spell={SPELLS.MANGLE_BEAR} useThresholds />;

    return explanationAndDataSubsection(explanation, data);
  }
}
