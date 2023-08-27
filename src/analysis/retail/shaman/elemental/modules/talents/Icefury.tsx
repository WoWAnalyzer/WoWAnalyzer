import { formatDuration } from 'common/format';
import TALENTS from 'common/TALENTS/shaman';
import { Expandable, SpellLink } from 'interface';
import { PerformanceMark, SectionHeader } from 'interface/guide';
import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RefreshBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Enemies from 'parser/shared/modules/Enemies';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { getLowestPerf, QualitativePerformance } from 'parser/ui/QualitativePerformance';

const IF_COOLDOWN_REMAINING_PERFECT = 1000;
const IF_COOLDOWN_REMAINING_GOOD = 5000;
const IF_COOLDOWN_REMAINING_OK = 9000;

interface ActiveIFWindow {
  start: number;
  empoweredCasts: number;
}

interface FinishedIFWindow extends ActiveIFWindow {
  end: number;
  icefuryCooldownLeft: number;
}

class Icefury extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    spellUsable: SpellUsable,
    enemies: Enemies,
  };
  activeIFWindow: ActiveIFWindow | null;
  icefuryWindows: FinishedIFWindow[] = [];

  protected spellUsable!: SpellUsable;
  protected abilityTracker!: AbilityTracker;
  protected enemies!: Enemies;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.ICEFURY_TALENT);

    this.activeIFWindow = null;

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.FROST_SHOCK_TALENT),
      this.onFrostShockCast,
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS.ICEFURY_TALENT),
      this.onIcefuryBuff,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS.ICEFURY_TALENT),
      this.onIcefuryBuffDropoff,
    );
  }

  onIcefuryBuff(event: ApplyBuffEvent) {
    this.activeIFWindow = { start: event.timestamp, empoweredCasts: 0 };
  }

  onIcefuryRefresh(event: RefreshBuffEvent) {
    if (!this.activeIFWindow) {
      return;
    }
    this.icefuryWindows.push({
      ...this.activeIFWindow,
      end: event.timestamp,
      icefuryCooldownLeft: 0,
    });

    this.activeIFWindow = { start: event.timestamp, empoweredCasts: 0 };
  }

  onIcefuryBuffDropoff(event: RemoveBuffEvent) {
    if (!this.activeIFWindow) {
      return;
    }

    this.icefuryWindows.push({
      ...this.activeIFWindow,
      end: event.timestamp,
      icefuryCooldownLeft: Math.max(
        this.spellUsable.cooldownRemaining(TALENTS.ICEFURY_TALENT.id) - 9000,
        0,
      ),
    });
    this.activeIFWindow = null;
  }
  onFrostShockCast() {
    if (!this.activeIFWindow) {
      return;
    }

    this.activeIFWindow.empoweredCasts += 1;
  }

  get empoweredFrostShockCasts() {
    return this.icefuryWindows.map((e) => e.empoweredCasts).reduce((a, b) => a + b, 0);
  }

  get suggestionThresholds() {
    return {
      actual:
        this.empoweredFrostShockCasts /
        this.abilityTracker.getAbility(TALENTS.ICEFURY_TALENT.id).casts,
      isLessThan: {
        minor: 4,
        average: 3.5,
        major: 3,
      },
      style: ThresholdStyle.DECIMAL,
    };
  }

  get guideSubsection() {
    const description = (
      <>
        <p>
          When casting <SpellLink spell={TALENTS.ICEFURY_TALENT} />, your next 4
          <SpellLink spell={TALENTS.FROST_SHOCK_TALENT} /> casts apply{' '}
          <SpellLink spell={TALENTS.ELECTRIFIED_SHOCKS_TALENT} /> to affected target(s). Electrified
          shocks is a substantial damage multiplier to your other nature spells. You should
          therefore aim to keep this buff up on your target whenever you otherwise are dealing
          damage to the target.
        </p>
        <p>
          You can achieve continious uptime of{' '}
          <SpellLink spell={TALENTS.ELECTRIFIED_SHOCKS_TALENT} /> if you cast{' '}
          <SpellLink spell={TALENTS.FROST_SHOCK_TALENT} /> on average about every 7.5 seconds.
        </p>
      </>
    );

    const casts = this.icefuryWindows.map((ifw) => {
      const header = (
        <>
          @ {this.owner.formatTimestamp(ifw.start)} &mdash;{' '}
          <SpellLink spell={TALENTS.ICEFURY_TALENT} />
        </>
      );

      let fsCastPerf = QualitativePerformance.Fail;
      if (ifw.empoweredCasts === 4) {
        fsCastPerf = QualitativePerformance.Perfect;
      } else if (ifw.empoweredCasts === 3) {
        fsCastPerf = QualitativePerformance.Ok;
      }

      const fsCastChecklistItem: CooldownExpandableItem = {
        label: <>Frost shock casts</>,
        result: (
          <>
            <PerformanceMark perf={fsCastPerf} />
          </>
        ),
        details: <>{ifw.empoweredCasts} / 4 stacks used</>,
      };

      let fsSpreadPerf = QualitativePerformance.Fail;
      if (ifw.icefuryCooldownLeft <= IF_COOLDOWN_REMAINING_PERFECT) {
        fsSpreadPerf = QualitativePerformance.Perfect;
      } else if (ifw.icefuryCooldownLeft < IF_COOLDOWN_REMAINING_GOOD) {
        fsSpreadPerf = QualitativePerformance.Good;
      } else if (ifw.icefuryCooldownLeft < IF_COOLDOWN_REMAINING_OK) {
        fsSpreadPerf = QualitativePerformance.Ok;
      }

      const fsSpreadChecklistItem: CooldownExpandableItem = {
        label: (
          <>
            <SpellLink spell={TALENTS.ICEFURY_TALENT} /> cooldown remaining on window end
          </>
        ),
        result: (
          <>
            <PerformanceMark perf={fsSpreadPerf} />
          </>
        ),
        details: <>{formatDuration(ifw.icefuryCooldownLeft)}</>,
      };

      return {
        _key: 'icefury-' + ifw.start,
        header: header,
        perf: getLowestPerf([fsCastPerf, fsSpreadPerf]),
        checklistItems: [fsCastChecklistItem, fsSpreadChecklistItem],
      };
    });

    const imperfectWindows = casts
      .filter((c) => c.perf !== QualitativePerformance.Perfect)
      .map((c) => <CooldownExpandable key={c._key} {...c} />);
    const perfectWindows = casts
      .filter((c) => c.perf === QualitativePerformance.Perfect)
      .map((c) => <CooldownExpandable key={c._key} {...c} />);

    const data = (
      <div>
        <strong>Cast breakdown</strong> -{' '}
        <small>Breakdown of how well you used each Icefury window.</small>
        {imperfectWindows}
        <br />
        <Expandable
          header={
            <SectionHeader>
              {' '}
              <PerformanceMark perf={QualitativePerformance.Perfect} /> Perfect windows -{' '}
              {perfectWindows.length}
            </SectionHeader>
          }
          element="section"
        >
          {perfectWindows}
        </Expandable>
      </div>
    );

    return explanationAndDataSubsection(description, data);
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual) =>
      suggest(
        <>
          You should fully utilize your <SpellLink spell={TALENTS.ICEFURY_TALENT.id} /> casts by
          casting 4 <SpellLink spell={TALENTS.FROST_SHOCK_TALENT.id} />s before the{' '}
          <SpellLink spell={TALENTS.ICEFURY_TALENT.id} /> buff expires.Pay attention to the
          remaining duration of the buff to ensure you have time to use all of the stacks.
        </>,
      )
        .icon(TALENTS.ICEFURY_TALENT.icon)
        .actual(
          <>
            On average, only {actual.toFixed(2)} <SpellLink spell={TALENTS.ICEFURY_TALENT.id} />
            (s) stacks were consumed with <SpellLink spell={TALENTS.FROST_SHOCK_TALENT.id} /> casts
            before <SpellLink spell={TALENTS.ICEFURY_TALENT.id} /> buff expired.
          </>,
        )
        .recommended("It's recommended to always consume all 4 stacks."),
    );
  }
}

export default Icefury;
