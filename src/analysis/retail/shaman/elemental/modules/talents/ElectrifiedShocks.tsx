import { formatDuration } from 'common/format';
import TALENTS from 'common/TALENTS/shaman';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Icefury from './Icefury';
import { Expandable, SpellLink } from 'interface';
import { QualitativePerformance, getLowestPerf } from 'parser/ui/QualitativePerformance';
import { PerformanceMark, SectionHeader } from 'interface/guide';
import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_EXPLANATION_PERCENT_WIDTH } from '../../constants';

const IF_COOLDOWN_REMAINING_PERFECT = 1000;
const IF_COOLDOWN_REMAINING_GOOD = 5000;
const IF_COOLDOWN_REMAINING_OK = 9000;

const STACKS_USED_PEREFECT = 4;
const STACKS_USED_OK = 3;

export default class ElectrifiedShocks extends Analyzer {
  static dependencies = {
    icefury: Icefury,
  };

  protected icefury!: Icefury;

  constructor(options: Options) {
    super(options);

    // Don't need to check if Icefury is chosen here, as it is impoosible to take
    // electrified shocks without it.
    this.active = this.selectedCombatant.hasTalent(TALENTS.ELECTRIFIED_SHOCKS_TALENT);
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

    const casts = this.icefury.icefuryWindows.map((ifw) => {
      const header = (
        <>
          @ {this.owner.formatTimestamp(ifw.start)} &mdash;{' '}
          <SpellLink spell={TALENTS.ICEFURY_TALENT} />
        </>
      );

      let fsCastPerf = QualitativePerformance.Fail;
      if (ifw.empoweredCasts === STACKS_USED_PEREFECT) {
        fsCastPerf = QualitativePerformance.Perfect;
      } else if (ifw.empoweredCasts === STACKS_USED_OK) {
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

    return explanationAndDataSubsection(
      description,
      data,
      GUIDE_EXPLANATION_PERCENT_WIDTH,
      'Electrified Shocks',
    );
  }
}
