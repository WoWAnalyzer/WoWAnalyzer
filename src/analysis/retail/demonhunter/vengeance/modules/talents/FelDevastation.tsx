import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/demonhunter';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS/demonhunter';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Enemies from 'parser/shared/modules/Enemies';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';
import VulnerabilityExplanation from 'analysis/retail/demonhunter/vengeance/modules/core/VulnerabilityExplanation';
import FieryDemiseExplanation from 'analysis/retail/demonhunter/vengeance/modules/core/FieryDemiseExplanation';
import DemonicExplanation from 'analysis/retail/demonhunter/vengeance/modules/core/DemonicExplanation';
import { ChecklistUsageInfo, SpellUse, UsageInfo } from 'parser/core/SpellUsage/core';
import MajorCooldown, {
  CooldownTrigger,
  createChecklistItem,
  createSpellUse,
} from 'parser/core/MajorCooldowns/MajorCooldown';
import { getDamageEvents } from 'analysis/retail/demonhunter/vengeance/normalizers/FelDevastationLinkNormalizer';
import { isDefined } from 'common/typeGuards';

const PERFECT_FRAILTY_STACKS = 3;
const GOOD_FRAILTY_STACKS = 2;
const OK_FRAILTY_STACKS = 1;

interface FelDevastationDamage {
  targetStacksOfFrailty: number;
  hasFieryBrandDebuff: boolean;
}

interface FelDevastationCooldownCast extends CooldownTrigger<CastEvent> {
  damage: FelDevastationDamage[];
}

export default class FelDevastation extends MajorCooldown<FelDevastationCooldownCast> {
  static dependencies = {
    ...MajorCooldown.dependencies,
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  constructor(options: Options) {
    super({ spell: TALENTS.FEL_DEVASTATION_TALENT }, options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.FEL_DEVASTATION_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.FEL_DEVASTATION_TALENT),
      this.onCast,
    );
  }

  description() {
    return (
      <>
        <section style={{ marginBottom: 20 }}>
          <strong>
            <SpellLink spell={TALENTS.FEL_DEVASTATION_TALENT} />
          </strong>{' '}
          is a large burst of damage and healing.
        </section>
        <section>
          <DemonicExplanation lineBreak />
          <VulnerabilityExplanation lineBreak numberOfFrailtyStacks={PERFECT_FRAILTY_STACKS} />
          <FieryDemiseExplanation includeDownInFlames lineBreak />
        </section>
      </>
    );
  }

  explainPerformance(cast: FelDevastationCooldownCast): SpellUse {
    if (cast.damage.length === 0) {
      return createSpellUse(cast, [
        createChecklistItem('hit-targets', cast, {
          performance: QualitativePerformance.Fail,
          summary: <div>Hit 1+ target</div>,
          details: (
            <div>
              You hit 0 targets with your <SpellLink spell={TALENTS.FEL_DEVASTATION_TALENT} />. To
              maximize damage, always try to hit targets with it.
            </div>
          ),
        }),
      ]);
    }

    const {
      performance: frailtyPerf,
      summary: frailtyLabel,
      details: frailtyDetails,
    } = this.frailtyPerformance(cast) ?? {};
    const {
      performance: fieryDemisePerf,
      summary: fieryDemiseLabel,
      details: fieryDemiseDetails,
    } = this.fieryDemisePerformance(cast) ?? {};

    const overallPerf = combineQualitativePerformances(
      [frailtyPerf, fieryDemisePerf].filter(isDefined),
    );
    const checklistItems: ChecklistUsageInfo[] = [];
    if (frailtyPerf && frailtyLabel && frailtyDetails) {
      checklistItems.push({
        check: 'frailty',
        timestamp: cast.event.timestamp,
        performance: frailtyPerf,
        summary: frailtyLabel,
        details: frailtyDetails,
      });
    }
    if (fieryDemisePerf && fieryDemiseLabel && fieryDemiseDetails) {
      checklistItems.push({
        check: 'fiery-demise',
        timestamp: cast.event.timestamp,
        performance: fieryDemisePerf,
        summary: fieryDemiseLabel,
        details: fieryDemiseDetails,
      });
    }

    return {
      event: cast.event,
      checklistItems: checklistItems,
      performance: overallPerf,
      performanceExplanation:
        overallPerf !== QualitativePerformance.Fail ? `${overallPerf} Usage` : 'Bad Usage',
    };
  }

  private onCast(event: CastEvent) {
    this.recordCooldown({
      event,
      damage: getDamageEvents(event).map((event) => ({
        targetStacksOfFrailty: this.getTargetStacksOfFrailty(event),
        hasFieryBrandDebuff: this.doesTargetHaveFieryBrand(event),
      })),
    });
  }

  private getTargetStacksOfFrailty(event: DamageEvent | undefined) {
    if (!event) {
      return 0;
    }
    const enemy = this.enemies.getEntity(event);
    if (!enemy) {
      return 0;
    }
    return enemy.getBuffStacks(SPELLS.FRAILTY.id, event.timestamp);
  }

  private doesTargetHaveFieryBrand(event: DamageEvent | undefined) {
    if (!event) {
      return false;
    }
    const enemy = this.enemies.getEntity(event);
    if (!enemy) {
      return false;
    }
    return enemy.hasBuff(SPELLS.FRAILTY.id, event.timestamp);
  }

  private fieryDemisePerformance(cast: FelDevastationCooldownCast): UsageInfo | undefined {
    if (!this.selectedCombatant.hasTalent(TALENTS.FIERY_DEMISE_TALENT)) {
      return undefined;
    }
    if (!cast.damage.some((it) => it.hasFieryBrandDebuff)) {
      return {
        performance: QualitativePerformance.Fail,
        summary: (
          <div>
            <SpellLink spell={TALENTS.FIERY_BRAND_TALENT} /> not applied to target
          </div>
        ),
        details: (
          <div>
            <SpellLink spell={TALENTS.FIERY_BRAND_TALENT} /> not applied to target. Make sure to
            apply <SpellLink spell={TALENTS.FIERY_BRAND_TALENT} /> before casting{' '}
            <SpellLink spell={TALENTS.FEL_DEVASTATION_TALENT} /> so that you benefit from{' '}
            <SpellLink spell={TALENTS.FIERY_DEMISE_TALENT} />.
          </div>
        ),
      };
    }
    return {
      performance: QualitativePerformance.Perfect,
      summary: (
        <div>
          <SpellLink spell={TALENTS.FIERY_BRAND_TALENT} /> applied to target
        </div>
      ),
      details: (
        <div>
          <SpellLink spell={TALENTS.FIERY_BRAND_TALENT} /> applied to target.
        </div>
      ),
    };
  }

  private frailtyPerformance(cast: FelDevastationCooldownCast): UsageInfo | undefined {
    if (!this.selectedCombatant.hasTalent(TALENTS.VULNERABILITY_TALENT)) {
      return undefined;
    }
    if (!this.selectedCombatant.hasTalent(TALENTS.SOULCRUSH_TALENT)) {
      const atLeastOneTargetHasFrailty = cast.damage.some((it) => it.targetStacksOfFrailty > 0);
      if (atLeastOneTargetHasFrailty) {
        return {
          performance: QualitativePerformance.Perfect,
          summary: (
            <div>
              <SpellLink spell={SPELLS.FRAILTY} /> applied to target(s)
            </div>
          ),
          details: (
            <div>
              <SpellLink spell={SPELLS.FRAILTY} /> applied to target(s).
            </div>
          ),
        };
      }
      return {
        performance: QualitativePerformance.Fail,
        summary: (
          <div>
            <SpellLink spell={SPELLS.FRAILTY} /> not applied to target(s)
          </div>
        ),
        details: (
          <div>
            <SpellLink spell={SPELLS.FRAILTY} /> not applied to target(s). Make sure to apply{' '}
            <SpellLink spell={SPELLS.FRAILTY} /> before casting{' '}
            <SpellLink spell={TALENTS.SOUL_CARVER_TALENT} />.
          </div>
        ),
      };
    }

    const atLeastOneTargetHasPerfectFrailty = cast.damage.find(
      (it) => it.targetStacksOfFrailty >= PERFECT_FRAILTY_STACKS,
    );
    const atLeastOneTargetHasGoodFrailty = cast.damage.find(
      (it) => it.targetStacksOfFrailty >= GOOD_FRAILTY_STACKS,
    );
    const atLeastOneTargetHasOkFrailty = cast.damage.find(
      (it) => it.targetStacksOfFrailty >= OK_FRAILTY_STACKS,
    );
    const mostStacksOfFrailty = Math.max(...cast.damage.map((it) => it.targetStacksOfFrailty), 0);

    if (atLeastOneTargetHasPerfectFrailty) {
      return {
        performance: QualitativePerformance.Perfect,
        summary: (
          <div>
            {atLeastOneTargetHasPerfectFrailty.targetStacksOfFrailty} stack(s) of{' '}
            <SpellLink spell={SPELLS.FRAILTY} /> applied to 1+ target(s).
          </div>
        ),
        details: (
          <div>
            {atLeastOneTargetHasPerfectFrailty.targetStacksOfFrailty} stack(s) of{' '}
            <SpellLink spell={SPELLS.FRAILTY} /> applied to 1+ target(s).
          </div>
        ),
      };
    }
    if (atLeastOneTargetHasGoodFrailty) {
      return {
        performance: QualitativePerformance.Good,
        summary: (
          <div>
            {atLeastOneTargetHasGoodFrailty.targetStacksOfFrailty} stack(s) of{' '}
            <SpellLink spell={SPELLS.FRAILTY} /> applied to 1+ target(s)
          </div>
        ),
        details: (
          <div>
            Only {atLeastOneTargetHasGoodFrailty.targetStacksOfFrailty} stack(s) of{' '}
            <SpellLink spell={SPELLS.FRAILTY} /> applied to 1+ target(s). Try applying at least{' '}
            {PERFECT_FRAILTY_STACKS} stack(s) of <SpellLink spell={SPELLS.FRAILTY} /> before casting{' '}
            <SpellLink spell={TALENTS.SOUL_CARVER_TALENT} />.
          </div>
        ),
      };
    }
    if (atLeastOneTargetHasOkFrailty) {
      return {
        performance: QualitativePerformance.Ok,
        summary: (
          <div>
            {atLeastOneTargetHasOkFrailty.targetStacksOfFrailty} stack(s) of{' '}
            <SpellLink spell={SPELLS.FRAILTY} /> applied to 1+ target
          </div>
        ),
        details: (
          <div>
            Only {atLeastOneTargetHasOkFrailty.targetStacksOfFrailty} stack(s) of{' '}
            <SpellLink spell={SPELLS.FRAILTY} /> applied to 1+ target(s). Try applying at least{' '}
            {PERFECT_FRAILTY_STACKS} stack(s) of <SpellLink spell={SPELLS.FRAILTY} /> before casting{' '}
            <SpellLink spell={TALENTS.FEL_DEVASTATION_TALENT} />.
          </div>
        ),
      };
    }
    return {
      performance: QualitativePerformance.Fail,
      summary: (
        <div>
          {mostStacksOfFrailty} stack(s) of <SpellLink spell={SPELLS.FRAILTY} /> applied to target
        </div>
      ),
      details: (
        <div>
          Only {mostStacksOfFrailty} stack(s) of <SpellLink spell={SPELLS.FRAILTY} /> applied to
          target. Try applying at least {PERFECT_FRAILTY_STACKS} stack(s) of{' '}
          <SpellLink spell={SPELLS.FRAILTY} /> before casting{' '}
          <SpellLink spell={TALENTS.FEL_DEVASTATION_TALENT} />.
        </div>
      ),
    };
  }
}
