import Analyzer from 'parser/core/Analyzer';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { TALENTS_DRUID } from 'common/TALENTS';
import SpellLink from 'interface/SpellLink';
import SPELLS from 'common/SPELLS';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import CastEfficiencyPanel from 'interface/guide/components/CastEfficiencyPanel';

/**
 * **Brutal Slash**
 * Spec Talent
 *
 * 25 Energy - Strikes all nearby enemies with a massive slash, inflicting X Physical damage.
 * Deals reduced damage beyond 5 targets. Awards 1 combo point. 3 Charges.
 *
 */
export default class BrutalSlash extends Analyzer {
  static dependencies = {
    castEfficiency: CastEfficiency,
  };

  castEfficiency!: CastEfficiency;

  get guideSubsection() {
    const explanation = (
      <p>
        <strong>
          <SpellLink id={TALENTS_DRUID.BRUTAL_SLASH_TALENT} />
        </strong>{' '}
        is a charge based point-blank AoE builder. It is better damage-per-energy than{' '}
        <SpellLink id={SPELLS.SHRED} /> even on single-target. Aim to never cap on charges.
      </p>
    );

    const data = <CastEfficiencyPanel spell={TALENTS_DRUID.BRUTAL_SLASH_TALENT} useThresholds />;

    return explanationAndDataSubsection(explanation, data);
  }
}
