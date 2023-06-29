import { formatDuration, formatNth, formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { SpellIcon } from 'interface';
import { SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { AbsorbedEvent, CastEvent, DamageEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Combatants from 'parser/shared/modules/Combatants';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import StatisticBox, { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';

const RECOMMENDED_EFFICIENCY = 0.8;
const MAGHAR_ORC_PET_HEALTH_INCREASE = 0.1;

interface EarthenWallTotemInfo {
  potentialHealing: number;
  effectiveHealing: number;
  timestamp: number;
}

/**
 * Earthen Wall Totem
 * Summons a totem with the players health for 15 sec.
 * Some damage from each attack against allies within 10 yards of the totem is redirected to the totem.
 *
 * https://user-images.githubusercontent.com/2842471/48328510-96fb0d00-e644-11e8-8eb8-d2d2c40373a2.png
 * The efficiency can go higher than 100% as the totem doesn't instantly realize that it absorbed more damage than its supposed to.
 */
class EarthenWallTotem extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  earthenWallTotems: EarthenWallTotemInfo[] = [];
  castNumber = 0;
  prePullCast = true;
  isMaghar: boolean | null = false;

  protected combatants!: Combatants;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.EARTHEN_WALL_TOTEM_TALENT);
    this.isMaghar =
      this.selectedCombatant.race && this.selectedCombatant.race.name === "Mag'har Orc";

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.EARTHEN_WALL_TOTEM_TALENT),
      this._onCast,
    );
    this.addEventListener(
      Events.damage.to(SELECTED_PLAYER_PET).spell(SPELLS.EARTHEN_WALL_TOTEM_SELF_DAMAGE),
      this._updateTotemHealth,
    );
    this.addEventListener(
      Events.absorbed.by(SELECTED_PLAYER_PET).spell(SPELLS.EARTHEN_WALL_TOTEM_ABSORB),
      this._onAbsorbed,
    );
  }

  _onCast(event: CastEvent) {
    if (this.prePullCast) {
      this.prePullCast = false;
    }

    this.castNumber += 1;
    this.earthenWallTotems[this.castNumber] = {
      potentialHealing: this.isMaghar
        ? Math.floor(event.maxHitPoints || 0 * (1 + MAGHAR_ORC_PET_HEALTH_INCREASE))
        : event.maxHitPoints || 0,
      effectiveHealing: 0,
      timestamp: event.timestamp,
    };
  }

  _updateTotemHealth(event: DamageEvent) {
    if (this.prePullCast) {
      this.earthenWallTotems[this.castNumber] = {
        potentialHealing: event.maxHitPoints || 0, // this is taking the totems max HP, which is the same result as the players unless Mag'har Orc
        effectiveHealing:
          (this.earthenWallTotems[this.castNumber] &&
            this.earthenWallTotems[this.castNumber].effectiveHealing) ||
          0,
        timestamp: this.owner.fight.start_time,
      };
      this.prePullCast = false;
    }

    // If for some reason something goes wrong with the race detection, this should be the only reason for differences in health
    // The reason this isn't always using the totems health, is that you need to account for totems that never had damage taken events (0% efficiency)
    if (
      event.maxHitPoints &&
      this.earthenWallTotems[this.castNumber].potentialHealing !== event.maxHitPoints
    ) {
      this.isMaghar = true; // likely
      this.earthenWallTotems[this.castNumber].potentialHealing = event.maxHitPoints;
    }
  }

  _onAbsorbed(event: AbsorbedEvent) {
    // Filtering out pets as healing on them is pointless, sadly
    const combatant = this.combatants.getEntity(event);
    if (!combatant) {
      return;
    }
    // Prepull EWT casts will have absorb events first, but those don't have any health information
    if (!this.earthenWallTotems[this.castNumber]) {
      this.earthenWallTotems[this.castNumber] = {
        effectiveHealing: 0,
        potentialHealing: 0,
        timestamp: event.timestamp, // maybe change to combat start timestamp
      };
    }
    this.earthenWallTotems[this.castNumber].effectiveHealing += event.amount;
  }

  get totalEffectiveHealing() {
    return Object.values(this.earthenWallTotems).reduce(
      (sum, cast) => sum + cast.effectiveHealing,
      0,
    );
  }

  get totalPotentialHealing() {
    return Object.values(this.earthenWallTotems).reduce(
      (sum, cast) => sum + cast.potentialHealing,
      0,
    );
  }

  get earthenWallEfficiency() {
    return this.totalEffectiveHealing / this.totalPotentialHealing;
  }

  suggestions(when: When) {
    when(this.earthenWallEfficiency)
      .isLessThan(RECOMMENDED_EFFICIENCY)
      .addSuggestion((suggest, actual, recommended) =>
        suggest(
          <>
            Try to cast <SpellLink id={TALENTS.EARTHEN_WALL_TOTEM_TALENT.id} /> at times - and
            positions where there will be as many people taking damage possible inside of it to
            maximize the amount it absorbs.
          </>,
        )
          .icon(TALENTS.EARTHEN_WALL_TOTEM_TALENT.icon)
          .actual(`${this.earthenWallEfficiency.toFixed(2)}%`)
          .recommended(`${recommended}%`)
          .regular(recommended - 0.15)
          .major(recommended - 0.3),
      );
  }

  get suggestionThreshold() {
    return {
      actual: this.earthenWallEfficiency,
      isLessThan: {
        minor: 0.75,
        average: 0.6,
        major: 0.45,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  statistic() {
    const casts = this.earthenWallTotems.filter((cast) => cast.timestamp > 0).length;

    return (
      <StatisticBox
        icon={<SpellIcon id={TALENTS.EARTHEN_WALL_TOTEM_TALENT.id} />}
        value={`${formatPercentage(this.earthenWallEfficiency)} %`}
        category={STATISTIC_CATEGORY.THEORYCRAFT}
        position={STATISTIC_ORDER.OPTIONAL(60)}
        label={<>Earthen Wall Totem efficiency</>}
        tooltip={
          <>
            The percentage of the potential absorb of Earthen Wall Totem that was actually used. You
            cast a total of {casts} Earthen Wall Totems with a combined health of{' '}
            {formatNumber(this.totalPotentialHealing)}, which absorbed a total of{' '}
            {formatNumber(this.totalEffectiveHealing)} damage.
            <br />
            <br />
            This can be higher than 100% because it sometimes absorbs a few more damage hits before
            the totem realizes it is supposed to be dead already.
            <br />
            <br />
            <strong>Pet healing is filtered out.</strong>
          </>
        }
      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>
                <>Cast</>
              </th>
              <th>
                <>Time</>
              </th>
              <th>
                <>Efficiency</>
              </th>
            </tr>
          </thead>
          <tbody>
            {this.earthenWallTotems
              .filter((cast) => cast.timestamp > 0)
              .map((cast, index) => {
                const castEfficiency = cast.effectiveHealing / cast.potentialHealing;
                return (
                  <tr key={index}>
                    <th scope="row">{formatNth(index + 1)}</th>
                    <td>{formatDuration(cast.timestamp - this.owner.fight.start_time) || 0}</td>
                    <td
                      style={
                        castEfficiency < RECOMMENDED_EFFICIENCY
                          ? { color: 'red', fontWeight: 'bold' }
                          : {}
                      }
                    >
                      {formatPercentage(castEfficiency)} %
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </StatisticBox>
    );
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink id={TALENTS.EARTHEN_WALL_TOTEM_TALENT.id} />}
        value={`${formatPercentage(
          this.owner.getPercentageOfTotalHealingDone(this.totalEffectiveHealing),
        )} %`}
        valueTooltip={<>Pet healing is filtered out</>}
      />
    );
  }

  /** Guide subsection describing the proper usage of Earthen Wall Totem */
  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink id={TALENTS.EARTHEN_WALL_TOTEM_TALENT.id} />
        </b>{' '}
        does a lot of healing, particularly on stacked fights or whenever a fight has several damage
        moments happen in quick succession. This totem does a ton of healing per cast and is an
        excellent choice for <SpellLink id={TALENTS.TOTEMIC_RECALL_TALENT} />
      </p>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink id={TALENTS.EARTHEN_WALL_TOTEM_TALENT} /> cast efficiency
          </strong>
          <div className="flex-main chart" style={{ padding: 15 }}>
            {this.guideSubStatistic()}
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  guideSubStatistic() {
    return (
      <CastEfficiencyBar
        spellId={TALENTS.EARTHEN_WALL_TOTEM_TALENT.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        useThresholds
      />
    );
  }
}

export default EarthenWallTotem;
