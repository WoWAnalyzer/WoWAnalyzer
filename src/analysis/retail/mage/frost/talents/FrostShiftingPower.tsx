import { ShiftingPower } from 'analysis/retail/mage/shared';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import TALENTS from 'common/TALENTS/mage';
import { GapHighlight } from 'parser/ui/CooldownBar';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/mage/frost/Guide';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { SpellLink } from 'interface';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PerformanceMark } from 'interface/guide';

class ShiftingPowerFrost extends ShiftingPower {
  castEntries: BoxRowEntry[] = [];
  rayOfFrostActive: boolean = false;
  cometStormActive: boolean = false;
  frozenOrbActive: boolean = false;
  icyVeinsActive: boolean = false;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SHIFTING_POWER_TALENT);
    this.rayOfFrostActive = this.selectedCombatant.hasTalent(TALENTS.RAY_OF_FROST_TALENT);
    this.cometStormActive = this.selectedCombatant.hasTalent(TALENTS.COMET_STORM_TALENT);
    this.frozenOrbActive = this.selectedCombatant.hasTalent(TALENTS.FROZEN_ORB_TALENT);
    this.icyVeinsActive = this.selectedCombatant.hasTalent(TALENTS.ICY_VEINS_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.SHIFTING_POWER_TALENT),
      this.onShiftingPowerCast,
    );
  }

  onShiftingPowerCast(event: CastEvent) {
    const rayOfFrostLongCd =
      !this.rayOfFrostActive ||
      this.spellUsable.cooldownRemaining(TALENTS.RAY_OF_FROST_TALENT.id, event.timestamp) > 10000;
    const cometStormLongCd =
      !this.cometStormActive ||
      this.spellUsable.cooldownRemaining(TALENTS.COMET_STORM_TALENT.id, event.timestamp) > 10000;
    const frozenOrbLongCd =
      !this.frozenOrbActive ||
      this.spellUsable.cooldownRemaining(TALENTS.FROZEN_ORB_TALENT.id, event.timestamp) > 10000;
    const icyVeinsLowCd =
      !this.icyVeinsActive ||
      this.spellUsable.cooldownRemaining(TALENTS.ICY_VEINS_TALENT.id, event.timestamp) < 20000;

    let performance = QualitativePerformance.Fail;
    let exp = 'Cooldowns available';
    if (rayOfFrostLongCd && cometStormLongCd && frozenOrbLongCd) {
      performance = QualitativePerformance.Good;
      exp = 'All spells on CD';
    } else if (icyVeinsLowCd) {
      performance = QualitativePerformance.Good;
      exp = 'Icy Veins less than 20s';
    }
    const tooltip = (
      <>
        <b>@ {this.owner.formatTimestamp(event.timestamp)}</b>
        <br />
        <PerformanceMark perf={performance} /> {performance}: {exp}
      </>
    );
    this.castEntries.push({
      value: performance,
      tooltip,
    });
  }

  get guideSubsection(): JSX.Element {
    const shiftingPower = <SpellLink spell={TALENTS.SHIFTING_POWER_TALENT} />;

    const rayOfFrost = <SpellLink spell={TALENTS.RAY_OF_FROST_TALENT} />;
    const cometStorm = <SpellLink spell={TALENTS.COMET_STORM_TALENT} />;
    const frozenOrb = <SpellLink spell={TALENTS.FROZEN_ORB_TALENT} />;
    const icyVeins = <SpellLink spell={TALENTS.ICY_VEINS_TALENT} />;

    const explanation = (
      <>
        {shiftingPower} will reduce the cooldown of all your spells. In particular is very important
        because it will reduce the cooldown of {rayOfFrost}, {cometStorm}, {frozenOrb} and{' '}
        {icyVeins}. You should cast it when:
        <ul>
          <li>
            {rayOfFrost}, {cometStorm} and {frozenOrb} are more than 10 seconds of CD
          </li>
          <li>
            <b>OR</b>
          </li>
          <li>{icyVeins} is less than 20 seconds of CD</li>
        </ul>
      </>
    );
    const data = (
      <>
        <RoundedPanel>
          <strong>{shiftingPower} cast efficiency</strong>
          <div className="flex-main chart" style={{ padding: 15 }}>
            {this.subStatistic()}
          </div>
          <strong>{shiftingPower} cast details</strong>
          <PerformanceBoxRow values={this.castEntries} />
          <small>green (good) / red (fail) mouseover the rectangles to see more details</small>
        </RoundedPanel>
      </>
    );
    return explanationAndDataSubsection(
      explanation,
      data,
      GUIDE_CORE_EXPLANATION_PERCENT,
      'Shifting Power',
    );
  }

  subStatistic() {
    return (
      <CastEfficiencyBar
        spellId={TALENTS.SHIFTING_POWER_TALENT.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        minimizeIcons
        slimLines
        useThresholds
      />
    );
  }
}

export default ShiftingPowerFrost;
