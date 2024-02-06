import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { SpellLink } from 'interface';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GapHighlight } from 'parser/ui/CooldownBar';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/mage/frost/Guide';

const REDUCTION_MS = 300;

class FrozenOrb extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  constructor(props: Options) {
    super(props);
    this.active = this.selectedCombatant.hasTalent(TALENTS.ICE_CALLER_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.BLIZZARD_DAMAGE),
      this._reduceCooldown,
    );
  }

  _reduceCooldown() {
    if (this.spellUsable.isOnCooldown(TALENTS.FROZEN_ORB_TALENT.id)) {
      this.spellUsable.reduceCooldown(TALENTS.FROZEN_ORB_TALENT.id, REDUCTION_MS);
    }
  }

  get guideSubsection(): JSX.Element {
    const frozenOrb = <SpellLink spell={TALENTS.FROZEN_ORB_TALENT} />;
    const fingersOfFrost = <SpellLink spell={TALENTS.FINGERS_OF_FROST_TALENT} />;

    const explanation = (
      <>
        <p>Try to mantain {frozenOrb} on CD as much as you can.</p>
        {this.selectedCombatant.hasTalent(TALENTS.FREEZING_WINDS_TALENT) && (
          <p>
            As it will generate {fingersOfFrost} procs, don't cast it when you have 2{' '}
            {fingersOfFrost} procs.
          </p>
        )}
      </>
    );
    const data = (
      <div>
        <RoundedPanel>
          <strong>{frozenOrb} cast efficiency</strong>
          <div className="flex-main chart" style={{ padding: 15 }}>
            {this.subStatistic()}
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(
      explanation,
      data,
      GUIDE_CORE_EXPLANATION_PERCENT,
      'Frozen Orb',
    );
  }

  /** Guide subsection describing the proper usage of Frozen Orb */
  subStatistic() {
    return (
      <CastEfficiencyBar
        spellId={TALENTS.FROZEN_ORB_TALENT.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        minimizeIcons
        slimLines
        useThresholds
      />
    );
  }
}

export default FrozenOrb;
