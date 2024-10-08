import TALENTS from 'common/TALENTS/priest';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/priest/holy/Guide';
import { getCircleOfHealingEvents } from '../../normalizers/CastLinkNormalizer';
import GradiatedPerformanceBar from 'interface/guide/components/GradiatedPerformanceBar';
import { BadColor, OkColor, GoodColor } from 'interface/guide';
import CastEfficiencyPanel from 'interface/guide/components/CastEfficiencyPanel';
import { COH_MAX_TARGETS_HIT, COH_OVERHEAL_THRESHOLD } from '../../constants';

class CircleOfHealing extends Analyzer {
  circleOfHealingCasts = 0;
  circleOfHealingHealing = 0;
  circleOfHealingOverhealing = 0;
  circleOfHealingTargetsHit = 0;

  goodCasts = 0;
  okCasts = 0;
  badCasts = 0;

  orisonActive = false;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.CIRCLE_OF_HEALING_TALENT);

    this.orisonActive = this.selectedCombatant.hasTalent(TALENTS.ORISON_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.CIRCLE_OF_HEALING_TALENT),
      this.onCohCast,
    );
  }

  get overHealPercent() {
    return this.circleOfHealingOverhealing / this.rawHealing;
  }

  get rawHealing() {
    return this.circleOfHealingHealing + this.circleOfHealingOverhealing;
  }

  get averageTargetsHit() {
    return this.circleOfHealingTargetsHit / this.circleOfHealingCasts;
  }

  onCohCast(event: CastEvent) {
    // get linked heal events for this cast
    const heals = getCircleOfHealingEvents(event);
    let targetsHit = 0;
    let healing = 0;
    let overhealing = 0;
    for (const heal of heals) {
      targetsHit += 1;
      healing += (heal.amount || 0) + (heal.absorbed || 0);
      overhealing += heal.overheal || 0;
    }

    // ignore casts that did not heal during combat
    if (targetsHit === 0) {
      return;
    }

    // statistics
    this.circleOfHealingCasts += 1;
    this.circleOfHealingTargetsHit += targetsHit;
    this.circleOfHealingHealing += healing;
    this.circleOfHealingOverhealing += overhealing;

    // guide casts analysis
    const maxTargets = this.orisonActive ? COH_MAX_TARGETS_HIT + 1 : COH_MAX_TARGETS_HIT;
    if (targetsHit < maxTargets) {
      this.badCasts += 1;
    } else if (overhealing / (healing + overhealing) >= COH_OVERHEAL_THRESHOLD) {
      this.okCasts += 1;
    } else {
      this.goodCasts += 1;
    }
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS.CIRCLE_OF_HEALING_TALENT} />
        </b>{' '}
        is an extremely efficient group heal and should be cast anytime there are 4 or more injured
        targets in the raid. If you are running the{' '}
        <SpellLink spell={TALENTS.PRAYER_CIRCLE_TALENT} /> talent, make sure this is on cooldown
        before casting <SpellLink spell={TALENTS.PRAYER_OF_HEALING_TALENT} />.
      </p>
    );

    const goodCasts = {
      count: this.goodCasts,
      label: 'Good casts',
    };

    const highOverhealCasts = {
      count: this.okCasts,
      label: 'High-overheal casts',
    };

    const badCasts = {
      count: this.badCasts,
      label: 'Less than max targets hit',
    };

    const data = (
      <div>
        <strong> Circle of Healing cast breakdown</strong>
        <small>
          {' '}
          - <span style={{ color: GoodColor }}>Green</span> is a good cast,
          <span style={{ color: OkColor }}>Yellow</span> is a cast with very high overheal, and{' '}
          <span style={{ color: BadColor }}>Red</span> is a cast where less than the maximum number
          of targets were hit.
        </small>
        <GradiatedPerformanceBar good={goodCasts} ok={highOverhealCasts} bad={badCasts} />
        <br />
        <CastEfficiencyPanel spell={TALENTS.CIRCLE_OF_HEALING_TALENT} useThresholds />
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }
}

export default CircleOfHealing;
