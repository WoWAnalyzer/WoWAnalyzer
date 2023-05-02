import talents from 'common/TALENTS/shaman';
import SpellLink from 'interface/SpellLink';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import ItemSetLink from 'interface/ItemSetLink';
import { SHAMAN_T30_ID } from 'common/ITEMS/dragonflight';

class Riptide extends Analyzer {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(options: Options) {
    super(options);
  }
  /** Guide subsection describing the proper usage of Riptide */
  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink id={talents.RIPTIDE_TALENT.id} />
        </b>{' '}
        is one of your core rotational abilities and primary sources of healing. It is your only
        source of <SpellLink id={talents.TIDAL_WAVES_TALENT} /> and has a numerous throughput
        synergies with talents like <SpellLink id={talents.PRIMORDIAL_WAVE_TALENT} />,{' '}
        <SpellLink id={talents.UNDERCURRENT_TALENT} />,{' '}
        <SpellLink id={talents.ECHO_OF_THE_ELEMENTS_TALENT} />,
        {this.selectedCombatant.hasTalent(talents.FLOW_OF_THE_TIDES_TALENT) && (
          <>
            <SpellLink id={talents.FLOW_OF_THE_TIDES_TALENT} />,{' '}
          </>
        )}
        {this.selectedCombatant.hasTalent(talents.PRIMAL_TIDE_CORE_TALENT) && (
          <>
            <SpellLink id={talents.PRIMAL_TIDE_CORE_TALENT} />,{' '}
          </>
        )}
        {this.selectedCombatant.hasTalent(talents.DEEPLY_ROOTED_ELEMENTS_TALENT) && (
          <>
            <SpellLink id={talents.DEEPLY_ROOTED_ELEMENTS_TALENT} />,{' '}
          </>
        )}{' '}
        etc. This spell should be kept on cooldown as often as possible, particularly with the
        addition of the{' '}
        <ItemSetLink id={SHAMAN_T30_ID}>
          <>Tier 30 Set Bonus</>
        </ItemSetLink>
        , whose power is directly tied to the number of active{' '}
        <SpellLink id={talents.RIPTIDE_TALENT} /> HoTs out on the raid
      </p>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink id={talents.RIPTIDE_TALENT} /> cast efficiency
          </strong>
          <div className="flex-main chart" style={{ padding: 15 }}>
            {this.subStatistic()}
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  subStatistic() {
    return (
      <CastEfficiencyBar
        spellId={talents.RIPTIDE_TALENT.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        minimizeIcons
        slimLines
        useThresholds
      />
    );
  }
}

export default Riptide;
