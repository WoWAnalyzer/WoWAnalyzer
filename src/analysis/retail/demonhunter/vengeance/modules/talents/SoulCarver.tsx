import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS/demonhunter';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PerformanceMark } from 'interface/guide';
import Enemies from 'parser/shared/modules/Enemies';
import Events, { CastEvent } from 'parser/core/Events';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';
import VulnerabilityExplanation from 'analysis/retail/demonhunter/vengeance/modules/core/VulnerabilityExplanation';
import FieryDemiseExplanation from 'analysis/retail/demonhunter/vengeance/modules/core/FieryDemiseExplanation';
import { Trans } from '@lingui/macro';
import CastBreakdownSubSection, {
  Cast,
} from 'analysis/retail/demonhunter/shared/guide/CastBreakdownSubSection';
import { CooldownExpandableItem } from 'interface/guide/components/CooldownExpandable';

const GOOD_FRAILTY_STACKS = 5;
const OK_FRAILTY_STACKS = 3;

interface SoulCarverCast extends Cast {
  timestamp: number;
  primaryTargetStacksOfFrailty: number;
  hasFieryBrandDebuff: boolean;
}

export default class SoulCarver extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  cast = 0;
  soulCarverTracker: SoulCarverCast[] = [];

  protected enemies!: Enemies;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.SOUL_CARVER_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_DEMON_HUNTER.SOUL_CARVER_TALENT),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    this.cast += 1;
    this.soulCarverTracker[this.cast] = {
      timestamp: event.timestamp,
      primaryTargetStacksOfFrailty: 0,
      hasFieryBrandDebuff: false,
    };
    const enemy = this.enemies.getEntity(event);
    if (!enemy) {
      return;
    }
    this.soulCarverTracker[this.cast].primaryTargetStacksOfFrailty = enemy.getBuffStacks(
      SPELLS.FRAILTY.id,
      event.timestamp,
    );
    this.soulCarverTracker[this.cast].hasFieryBrandDebuff = enemy.hasBuff(
      SPELLS.FIERY_BRAND_DOT.id,
      event.timestamp,
    );
  }

  guideBreakdown() {
    const explanation = (
      <Trans id="guide.demonhunter.vengeance.sections.cooldowns.soulCarver.explanation">
        <strong>
          <SpellLink id={TALENTS_DEMON_HUNTER.SOUL_CARVER_TALENT} />
        </strong>{' '}
        is a burst of damage that also generates a decent chunk of Soul Fragments.
        <VulnerabilityExplanation numberOfFrailtyStacks={GOOD_FRAILTY_STACKS} />
        <FieryDemiseExplanation />
      </Trans>
    );

    const soulCarverCastHeaderConverter = (cast: SoulCarverCast, _: number) => (
      <>
        @ {this.owner.formatTimestamp(cast.timestamp)} &mdash;{' '}
        <SpellLink id={TALENTS_DEMON_HUNTER.SOUL_CARVER_TALENT} />
      </>
    );
    const soulCarverCastPerformanceConverter = (cast: SoulCarverCast, _: number) => {
      const hasFieryDemise = this.selectedCombatant.hasTalent(
        TALENTS_DEMON_HUNTER.FIERY_DEMISE_TALENT,
      );

      let frailtyPerf = QualitativePerformance.Good;
      if (cast.primaryTargetStacksOfFrailty <= OK_FRAILTY_STACKS) {
        frailtyPerf = QualitativePerformance.Fail;
      } else if (cast.primaryTargetStacksOfFrailty < GOOD_FRAILTY_STACKS) {
        frailtyPerf = QualitativePerformance.Ok;
      }

      let fieryBrandPerf = QualitativePerformance.Good;
      if (hasFieryDemise && !cast.hasFieryBrandDebuff) {
        fieryBrandPerf = QualitativePerformance.Fail;
      }

      const overallPerf = combineQualitativePerformances([frailtyPerf, fieryBrandPerf]);

      const checklistItems: CooldownExpandableItem[] = [
        {
          label: (
            <>
              At least {GOOD_FRAILTY_STACKS} stacks of <SpellLink id={SPELLS.FRAILTY} /> applied to
              target
            </>
          ),
          result: <PerformanceMark perf={frailtyPerf} />,
          details: (
            <>
              ({cast.primaryTargetStacksOfFrailty} stacks of <SpellLink id={SPELLS.FRAILTY} />)
            </>
          ),
        },
      ];
      if (hasFieryDemise) {
        checklistItems.push({
          label: (
            <>
              <SpellLink id={TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT} /> applied to target
            </>
          ),
          result: <PerformanceMark perf={fieryBrandPerf} />,
        });
      }
      return {
        overallPerf,
        checklistItems,
      };
    };

    return (
      <CastBreakdownSubSection
        castPerformanceConverter={soulCarverCastPerformanceConverter}
        casts={this.soulCarverTracker}
        explanation={explanation}
        headerConverter={soulCarverCastHeaderConverter}
      />
    );
  }
}
