import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS/demonhunter';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PerformanceMark } from 'interface/guide';
import Enemies from 'parser/shared/modules/Enemies';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';
import VulnerabilityExplanation from 'analysis/retail/demonhunter/vengeance/guide/VulnerabilityExplanation';
import FieryDemiseExplanation from 'analysis/retail/demonhunter/vengeance/guide/FieryDemiseExplanation';
import DemonicExplanation from 'analysis/retail/demonhunter/vengeance/guide/DemonicExplanation';
import { Trans } from '@lingui/macro';
import CastBreakdownSubSection, {
  Cast,
} from 'analysis/retail/demonhunter/shared/guide/CastBreakdownSubSection';
import { CooldownExpandableItem } from 'interface/guide/components/CooldownExpandable';

const GOOD_FRAILTY_STACKS = 2;
const OK_FRAILTY_STACKS = 1;

interface FelDevastationDamage {
  targetStacksOfFrailty: number;
  hasFieryBrandDebuff: boolean;
}

interface FelDevastationCast extends Cast {
  timestamp: number;
  damage: FelDevastationDamage[];
}

export default class FelDevastation extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  cast = 0;
  felDevastationTracker: FelDevastationCast[] = [];

  protected enemies!: Enemies;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.FEL_DEVASTATION_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_DEMON_HUNTER.FEL_DEVASTATION_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS_DEMON_HUNTER.FEL_DEVASTATION_TALENT),
      this.onDamage,
    );
  }

  onCast(event: CastEvent) {
    this.cast += 1;
    this.felDevastationTracker[this.cast] = {
      timestamp: event.timestamp,
      damage: [],
    };
  }

  onDamage(event: DamageEvent) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy) {
      return;
    }
    this.felDevastationTracker[this.cast]?.damage.push({
      targetStacksOfFrailty: enemy.getBuffStacks(SPELLS.FRAILTY.id, event.timestamp),
      hasFieryBrandDebuff: enemy.hasBuff(SPELLS.FIERY_BRAND_DOT.id, event.timestamp),
    });
  }

  guideBreakdown() {
    const explanation = (
      <Trans id="guide.demonhunter.vengeance.sections.cooldowns.felDevastation.explanation">
        <strong>
          <SpellLink id={TALENTS_DEMON_HUNTER.FEL_DEVASTATION_TALENT} />
        </strong>{' '}
        is a large burst of damage and healing.
        <DemonicExplanation />
        <VulnerabilityExplanation numberOfFrailtyStacks={GOOD_FRAILTY_STACKS} />
        <FieryDemiseExplanation includeDownInFlames />
      </Trans>
    );

    const felDevCastHeaderConverter = (cast: FelDevastationCast, _: number) => (
      <>
        @ {this.owner.formatTimestamp(cast.timestamp)} &mdash;{' '}
        <SpellLink id={TALENTS_DEMON_HUNTER.FEL_DEVASTATION_TALENT} />
      </>
    );
    const felDevCastPerformanceConverter = (cast: FelDevastationCast, _: number) => {
      const hasFieryDemise = this.selectedCombatant.hasTalent(
        TALENTS_DEMON_HUNTER.FIERY_DEMISE_TALENT,
      );

      let frailtyPerf = QualitativePerformance.Good;
      if (cast.damage.some((it) => it.targetStacksOfFrailty < GOOD_FRAILTY_STACKS)) {
        frailtyPerf = QualitativePerformance.Ok;
      } else if (cast.damage.some((it) => it.targetStacksOfFrailty <= OK_FRAILTY_STACKS)) {
        frailtyPerf = QualitativePerformance.Fail;
      }

      let fieryBrandPerf = QualitativePerformance.Good;
      if (hasFieryDemise && !cast.damage.some((it) => it.hasFieryBrandDebuff)) {
        fieryBrandPerf = QualitativePerformance.Fail;
      }

      const overallPerf = combineQualitativePerformances([frailtyPerf, fieryBrandPerf]);

      const checklistItems: CooldownExpandableItem[] = [
        {
          label: (
            <>
              At least {GOOD_FRAILTY_STACKS} stacks of <SpellLink id={SPELLS.FRAILTY} /> applied to
              at least one target
            </>
          ),
          result: <PerformanceMark perf={frailtyPerf} />,
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
        castPerformanceConverter={felDevCastPerformanceConverter}
        casts={this.felDevastationTracker}
        explanation={explanation}
        headerConverter={felDevCastHeaderConverter}
      />
    );
  }
}
