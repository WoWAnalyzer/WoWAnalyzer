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

    const explanation = <>Try to mantain {frozenOrb} on CD as much as you can.</>;
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

    return explanationAndDataSubsection(explanation, data, 20, 'Frozen Orb');
  }

  /** Guide subsection describing the proper usage of Ray of Frost */
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
