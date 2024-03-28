import talents from 'common/TALENTS/shaman';
import ITEMS from 'common/ITEMS';
import { TIERS } from 'game/TIERS';
import SpellLink from 'interface/SpellLink';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import ItemSetLink from 'interface/ItemSetLink';
import { SHAMAN_DF3_ID, SHAMAN_DF2_ID } from 'common/ITEMS/dragonflight';

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
          <SpellLink spell={talents.RIPTIDE_TALENT} />
        </b>{' '}
        is one of your core rotational abilities and primary sources of healing. It is your only
        source of <SpellLink spell={talents.TIDAL_WAVES_TALENT} /> and has numerous throughput
        synergies with talents like <SpellLink spell={talents.PRIMORDIAL_WAVE_RESTORATION_TALENT} />
        , <SpellLink spell={talents.UNDERCURRENT_TALENT} />,{' '}
        <SpellLink spell={talents.ECHO_OF_THE_ELEMENTS_TALENT} />,
        {this.selectedCombatant.hasTalent(talents.FLOW_OF_THE_TIDES_TALENT) && (
          <>
            <SpellLink spell={talents.FLOW_OF_THE_TIDES_TALENT} />,{' '}
          </>
        )}
        {this.selectedCombatant.hasTalent(talents.PRIMAL_TIDE_CORE_TALENT) && (
          <>
            <SpellLink spell={talents.PRIMAL_TIDE_CORE_TALENT} />,{' '}
          </>
        )}
        {this.selectedCombatant.hasTalent(talents.DEEPLY_ROOTED_ELEMENTS_TALENT) && (
          <>
            <SpellLink spell={talents.DEEPLY_ROOTED_ELEMENTS_TALENT} />,{' '}
          </>
        )}{' '}
        etc.{' '}
        {this.selectedCombatant.has4PieceByTier(TIERS.DF2) && (
          <>
            <SpellLink spell={talents.RIPTIDE_TALENT} /> should be kept on cooldown as often as
            possible, particularly with the addition of the{' '}
            <ItemSetLink id={SHAMAN_DF2_ID}>
              <>Tier 30 Set Bonus</>
            </ItemSetLink>
            , whose power is directly tied to the number of active{' '}
            <SpellLink spell={talents.RIPTIDE_TALENT} /> HoTs out on the raid
          </>
        )}
        {this.selectedCombatant.has4PieceByTier(TIERS.DF3) && (
          <>
            In season 3 of Dragonflight, the{' '}
            <ItemSetLink id={SHAMAN_DF3_ID}>
              <>Tier 31 Set Bonus</>
            </ItemSetLink>{' '}
            makes your <SpellLink spell={talents.RIPTIDE_TALENT} /> uptime even more critical, as{' '}
            every tick of <SpellLink spell={talents.RIPTIDE_TALENT} /> also heals every person
            buffed with <SpellLink spell={ITEMS.T31_TIDAL_RESERVOIR_HEAL} />. You should aim to have
            as many <SpellLink spell={talents.RIPTIDE_TALENT} />s rolling on the raid at all times,{' '}
            and maintain <SpellLink spell={ITEMS.T31_TIDAL_RESERVOIR_HEAL} /> on as many people as
            possible.
          </>
        )}
      </p>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={talents.RIPTIDE_TALENT} /> cast efficiency
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
