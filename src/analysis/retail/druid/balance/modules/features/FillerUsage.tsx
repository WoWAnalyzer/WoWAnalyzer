import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { hardcastTargetsHit } from '../../normalizers/CastLinkNormalizer';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { currentEclipse } from 'analysis/retail/druid/balance/constants';
import GradiatedPerformanceBar from 'interface/guide/components/GradiatedPerformanceBar';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';
import { TALENTS_DRUID } from 'common/TALENTS';

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
  /** Starefire casts w/ Lunar Calling outside of Eclipse (must wrath to enter Eclipse) */
  noEclipseLcStarfires: number = 0;

  hasLunarCalling: boolean;

  constructor(options: Options) {
    super(options);

    this.hasLunarCalling = this.selectedCombatant.hasTalent(TALENTS_DRUID.LUNAR_CALLING_TALENT);

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
    } else if (eclipse === 'lunar' && !this.hasLunarCalling) {
      if (targetsHit < MIN_STARFIRE_TARGETS_LUNAR) {
        addInefficientCastReason(
          event,
          `You hit too few targets: ${targetsHit} - use Wrath instead`,
        );
        this.lowTargetStarfires += 1;
      }
    } else if (eclipse === 'both' && !this.hasLunarCalling) {
      if (targetsHit < MIN_STARFIRE_TARGETS_CA) {
        addInefficientCastReason(
          event,
          `You hit too few targets: ${targetsHit} - use Wrath instead`,
        );
        this.lowTargetStarfires += 1;
      }
    } else if (eclipse === 'none' && this.hasLunarCalling) {
      addInefficientCastReason(
        event,
        `You cast Starfire while not in eclipse. Because you took Lunar Calling, you need to use Wrath to reenter eclipse.`,
      );
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
    return this.lowTargetStarfires + this.solarStarfires + this.noEclipseLcStarfires;
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
          They are spammable and generate Astral Power. Use <SpellLink spell={SPELLS.WRATH} /> in
          single target and <SpellLink spell={SPELLS.STARFIRE} /> against multiple stacked targets.
        </p>
        <p>
          Your fillers are greatly buffed by their corresponding{' '}
          <SpellLink spell={SPELLS.ECLIPSE} /> - aim to enter an Eclipse that matches your current
          target count.
        </p>
        {this.hasLunarCalling && (
          <p>
            <i>
              However, because you took <SpellLink spell={TALENTS_DRUID.LUNAR_CALLING_TALENT} />,
              you can only enter Lunar Eclipse. When Eclipse drops you must use Wrath to reenter
              Eclipse.
            </i>
          </p>
        )}
        {!this.hasLunarCalling && (
          <p>
            If you make a mistake and find yourself in Lunar Eclipse with no stacked targets or in
            Solar Eclipse with stacked targets, you should use <SpellLink spell={SPELLS.WRATH} />.
          </p>
        )}
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
      label: this.hasLunarCalling
        ? 'Starfire when out of Eclipse (with Lunar Calling, you must Wrath to enter eclipse)'
        : 'Starfires during Solar Eclipse or that hit too few targets',
    };

    const data = (
      <div>
        <strong>Filler cast breakdown</strong>
        <small>
          {' '}
          - Green is a good cast, Yellow is a Wrath during Lunar Eclipse, Red is a bad Starfire.
          Mouseover for more details.
        </small>
        <GradiatedPerformanceBar good={goodFillerData} ok={okFillerData} bad={badFillerData} />
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }
}
