import { ReactNode } from 'react';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PerformanceMark } from 'interface/guide';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/mage/arcane/Guide';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';

import ArcaneBarrage from '../core/ArcaneBarrage';

class ArcaneBarrageGuide extends Analyzer {
  static dependencies = {
    arcaneBarrage: ArcaneBarrage,
  };

  protected arcaneBarrage!: ArcaneBarrage;

  generateGuideTooltip(
    performance: QualitativePerformance,
    tooltipText: ReactNode,
    timestamp: number,
  ) {
    const tooltip = (
      <>
        <div>
          <b>@ {this.owner.formatTimestamp(timestamp)}</b>
        </div>
        <div>
          <PerformanceMark perf={performance} /> {performance}: {tooltipText}
        </div>
      </>
    );
    return tooltip;
  }

  get arcaneBarrageData() {
    const data: BoxRowEntry[] = [];
    this.arcaneBarrage.barrageCasts.forEach((ab) => {
      if (ab.usage && ab.usage?.tooltip) {
        const tooltip = this.generateGuideTooltip(ab.usage?.value, ab.usage?.tooltip, ab.cast);
        data.push({ value: ab.usage?.value, tooltip });
      }
    });
    return data;
  }

  get guideSubsection(): JSX.Element {
    const arcaneCharge = <SpellLink spell={SPELLS.ARCANE_CHARGE} />;
    const netherPrecision = <SpellLink spell={TALENTS.NETHER_PRECISION_TALENT} />;
    const arcaneTempo = <SpellLink spell={TALENTS.ARCANE_TEMPO_TALENT} />;
    const touchOfTheMagi = <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} />;
    const evocation = <SpellLink spell={TALENTS.EVOCATION_TALENT} />;
    const arcaneBlast = <SpellLink spell={SPELLS.ARCANE_BLAST} />;
    const arcaneBarrage = <SpellLink spell={SPELLS.ARCANE_BARRAGE} />;
    const clearcasting = <SpellLink spell={SPELLS.CLEARCASTING_ARCANE} />;
    const arcaneOrb = <SpellLink spell={SPELLS.ARCANE_ORB} />;

    const explanation = (
      <>
        <div>
          Casting <b>{arcaneBarrage}</b> spends your {arcaneCharge}s, removing the increased damage
          and mana cost of your arcane spells. Since clearing {arcaneCharge} reduces your damage,
          refer to the below rules for when you should cast {arcaneBarrage}:
        </div>
        <div>
          <ul>
            <li>
              If {arcaneTempo} is about to expire, cast {arcaneBarrage} to refresh the buff.
            </li>
            <li>
              Do not cast {arcaneBarrage} if {touchOfTheMagi} is less than 5-6 seconds away.
            </li>
            <li>
              On Single Target: Cast {arcaneBarrage} if below 70% mana and {evocation} is more than
              45s away.
            </li>
            <li>
              If all of the following are true, start casting {arcaneBlast} and queue up an{' '}
              {arcaneBarrage} at the very end of the {arcaneBlast} cast:
            </li>
            <li>
              If you have 4 {arcaneCharge}s, 1 stack of {netherPrecision}, AND either {clearcasting}{' '}
              or {arcaneOrb}, then start casting {arcaneBlast} and queue an {arcaneBarrage} to the
              end of it.
            </li>
            <li>If you run out of mana, cast {arcaneBarrage}</li>
          </ul>
        </div>
      </>
    );
    const data = (
      <div>
        <RoundedPanel>
          <div>
            <strong>Arcane Barrage Usage</strong>
            <PerformanceBoxRow values={this.arcaneBarrageData} />
            <small>green (good) / red (fail) mouseover the rectangles to see more details</small>
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(
      explanation,
      data,
      GUIDE_CORE_EXPLANATION_PERCENT,
      'Arcane Barrage',
    );
  }
}

export default ArcaneBarrageGuide;
