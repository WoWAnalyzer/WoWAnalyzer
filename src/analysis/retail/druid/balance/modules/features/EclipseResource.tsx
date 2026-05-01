import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import SPELLS from 'common/SPELLS';
import { ResourceLink, SpellLink } from 'interface';
import AstralPowerTracker from 'analysis/retail/druid/balance/modules/core/astralpower/AstralPowerTracker';
import { TALENTS_DRUID } from 'common/TALENTS';
import Events, { CastEvent } from 'parser/core/Events';
import CastSummaryAndBreakdown from 'interface/guide/components/CastSummaryAndBreakdown';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

/**
 * Wide statistics box for tracking the most important Balance DoT uptimes
 */
class EclipseResource extends Analyzer {
  static dependencies = {
    astralPowerTracker: AstralPowerTracker,
  };

  protected astralPowerTracker!: AstralPowerTracker;

  private astralPowerBeginEclipseArray: AstralPowerBeginEclipse[] = [];

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([
          SPELLS.SOLAR_ECLIPSE,
          SPELLS.LUNAR_ECLIPSE,
          SPELLS.CELESTIAL_ALIGNMENT,
          SPELLS.CELESTIAL_ALIGNMENT_ORBITAL_STRIKE,
          SPELLS.INCARNATION_ORBITAL_STRIKE,
          SPELLS.INCARNATION_CHOSEN_OF_ELUNE,
        ]),
      this.onEnteringEclipse,
    );
  }

  onEnteringEclipse(event: CastEvent) {
    const astralPower = this.astralPowerTracker.current / 10;
    const astralPowerBeginEclipse: AstralPowerBeginEclipse = {
      eclipseEvent: event,
      astralPower: astralPower,
    };
    this.astralPowerBeginEclipseArray.push(astralPowerBeginEclipse);
  }

  get guideSubsection() {
    const explanation = (
      <>
        <p>
          Before entering an Eclipse, pool <ResourceLink id={RESOURCE_TYPES.ASTRAL_POWER.id} /> in
          order to cast <SpellLink spell={SPELLS.STARSURGE_MOONKIN} /> or{' '}
          <SpellLink spell={SPELLS.STARFALL} /> <strong>3 times</strong> as soon as possible during
          the Eclipse.
        </p>
        <p>
          This maximizes the output of talents like{' '}
          <SpellLink spell={TALENTS_DRUID.STARLORD_TALENT} />,{' '}
          <SpellLink spell={TALENTS_DRUID.HARMONY_OF_THE_HEAVENS_TALENT} /> and{' '}
          <SpellLink spell={TALENTS_DRUID.BALANCE_OF_ALL_THINGS_TALENT} />.
        </p>
      </>
    );

    // Starsurge is cheaper than Starfall, so let's assume
    // we need to be able to cast 3 Starsurges
    const STARSURGE_BASE_COST = 40;
    const starsurgeCost =
      STARSURGE_BASE_COST *
      (this.selectedCombatant.hasTalent(TALENTS_DRUID.RATTLE_THE_STARS_TALENT) ? 0.9 : 1);

    const castEntries: BoxRowEntry[] = this.astralPowerBeginEclipseArray.map(
      (astralPowerBeginEclipse) => {
        let spendersCastPossible: number =
          (astralPowerBeginEclipse.astralPower +
            (this.selectedCombatant.hasTalent(TALENTS_DRUID.ASTRAL_COMMUNION_TALENT) ? 15 : 0)) /
          starsurgeCost;

        if (
          this.selectedCombatant.hasBuff(
            SPELLS.TOUCH_THE_COSMOS.id,
            astralPowerBeginEclipse.eclipseEvent.timestamp,
          )
        ) {
          spendersCastPossible += 1;
        }

        if (
          this.selectedCombatant.hasBuff(
            SPELLS.STARWEAVERS_WARP.id,
            astralPowerBeginEclipse.eclipseEvent.timestamp,
          )
        ) {
          spendersCastPossible += 1;
        }

        if (
          this.selectedCombatant.hasBuff(
            SPELLS.STARWEAVERS_WEFT.id,
            astralPowerBeginEclipse.eclipseEvent.timestamp,
          )
        ) {
          spendersCastPossible += 1;
        }

        const getQualitativePerformance = (
          spendersCastPossible: number,
        ): QualitativePerformance => {
          if (spendersCastPossible >= 3) return QualitativePerformance.Perfect;
          if (spendersCastPossible >= 2) return QualitativePerformance.Good;
          if (spendersCastPossible >= 1) return QualitativePerformance.Ok;
          return QualitativePerformance.Fail;
        };

        return {
          value: getQualitativePerformance(spendersCastPossible),
          tooltip: (
            <>
              @{' '}
              <strong>
                {this.owner.formatTimestamp(astralPowerBeginEclipse.eclipseEvent.timestamp)}
              </strong>{' '}
              - {astralPowerBeginEclipse.eclipseEvent.ability.name}
            </>
          ),
        };
      },
    );

    const data = (
      <RoundedPanel>
        <CastSummaryAndBreakdown
          spell={TALENTS_DRUID.ECLIPSE_TALENT}
          castEntries={castEntries}
          perfectExtraExplanation={'resources for 3+ spenders'}
          goodExtraExplanation={'resources for 2 spenders'}
          okExtraExplanation={'resources for 1 spender'}
          badExtraExplanation={'resources for 0 spender'}
        />
      </RoundedPanel>
    );

    return explanationAndDataSubsection(explanation, data);
  }
}

interface AstralPowerBeginEclipse {
  eclipseEvent: CastEvent;
  astralPower: number;
}

export default EclipseResource;
