import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { hardcastTargetsHit } from '../../normalizers/CastLinkNormalizer';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { currentEclipse } from 'analysis/retail/druid/balance/constants';
import GradiatedPerformanceBar from 'interface/guide/components/GradiatedPerformanceBar';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';

// TODO TWW - look at these numbers again after TWW talent changes / sims
const MIN_STARFIRE_TARGETS_LUNAR = 3;
const MIN_STARFIRE_TARGETS_CA = 4;

export default class FillerUsage extends Analyzer {
  /** Total number of wrath hardcasts */
  totalWraths: number = 0;
  /** Wrath hardcasts during Lunar Eclipse */
  lunarWraths: number = 0;

  /** Total number of starfire hardcasts */
  totalStarfires: number = 0;
  /** Starfire hardcasts that hit too few targets */
  lowTargetStarfires: number = 0;
  /** Starfire hardcasts during Solar Eclipse */
  solarStarfires: number = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.STARFIRE), this.onStarfire);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.WRATH_MOONKIN),
      this.onWrath,
    );
  }

  onStarfire(event: CastEvent) {
    this.totalStarfires += 1;
    const targetsHit = hardcastTargetsHit(event);
    const eclipse = currentEclipse(this.selectedCombatant);

    if (eclipse === 'solar') {
      addInefficientCastReason(
        event,
        `Use Wrath instead of Starfire in Solar Eclipse, regardless of target count`,
      );
      this.solarStarfires += 1;
    } else if (eclipse === 'lunar') {
      if (targetsHit < MIN_STARFIRE_TARGETS_LUNAR) {
        addInefficientCastReason(
          event,
          `You hit too few targets: ${targetsHit} - use Wrath instead`,
        );
        this.lowTargetStarfires += 1;
      }
    } else if (eclipse === 'both') {
      if (targetsHit < MIN_STARFIRE_TARGETS_CA) {
        addInefficientCastReason(
          event,
          `You hit too few targets: ${targetsHit} - use Wrath instead`,
        );
        this.lowTargetStarfires += 1;
      }
    }
  }

  onWrath(event: CastEvent) {
    this.totalWraths += 1;
    const eclipse = currentEclipse(this.selectedCombatant);

    if (eclipse === 'lunar') {
      this.lunarWraths += 1;
    }
  }

  get totalFillers() {
    return this.totalWraths + this.totalStarfires;
  }

  get goodFillers() {
    return this.totalFillers - this.okFillers - this.badFillers;
  }

  get okFillers() {
    return this.lunarWraths;
  }

  get badFillers() {
    return this.lowTargetStarfires + this.solarStarfires;
  }

  get percentGoodFillers() {
    return this.totalFillers === 0 ? 1 : this.goodFillers / this.totalFillers;
  }

  get guideSubsection() {
    const explanation = (
      <>
        <p>
          <strong>Filler spells</strong> are{' '}
          <strong>
            <SpellLink spell={SPELLS.WRATH} />
          </strong>{' '}
          and{' '}
          <strong>
            <SpellLink spell={SPELLS.STARFIRE} />
          </strong>
          .
        </p>
        <p>
          They are spammable direct damage spells that generate Astral Power. You should generally
          use <SpellLink spell={SPELLS.WRATH} />, but against {MIN_STARFIRE_TARGETS_LUNAR} stacked
          targets in Lunar Eclipse or {MIN_STARFIRE_TARGETS_CA} stacked targets in Celestial
          Alignment you should swap to <SpellLink spell={SPELLS.STARFIRE} />.
        </p>
        <p>
          Your fillers are greatly buffed by their corresponding{' '}
          <SpellLink spell={SPELLS.ECLIPSE} /> - aim to enter an Eclipse that matches your current
          target count.
        </p>
        <p>
          If you make a mistake and find yourself in Lunar Eclipse with no stacked targets or in
          Solar Eclipse with stacked targets, you should use <SpellLink spell={SPELLS.WRATH} />.
        </p>
      </>
    );

    const goodFillerData = {
      count: this.goodFillers,
      label: 'Good Fillers',
    };
    const okFillerData = {
      count: this.okFillers,
      label: 'Wraths during Lunar Eclipse (did you enter the wrong Eclipse?)',
    };
    const badFillerData = {
      count: this.badFillers,
      label: 'Starfires during Solar Eclipse or that hit too few targets',
    };

    const data = (
      <div>
        <strong>Filler cast breakdown</strong>
        <small>
          {' '}
          - Green is a good cast, Yellow is a Wrath during Lunar Eclipse, Red is a Starfire on too
          few targets or during Solar Eclipse. Mouseover for more details.
        </small>
        <GradiatedPerformanceBar good={goodFillerData} ok={okFillerData} bad={badFillerData} />
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }
}
