import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS/demonhunter';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Enemies from 'parser/shared/modules/Enemies';
import Events, { CastEvent } from 'parser/core/Events';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';
import VulnerabilityExplanation from 'analysis/retail/demonhunter/vengeance/modules/core/VulnerabilityExplanation';
import FieryDemiseExplanation from 'analysis/retail/demonhunter/vengeance/modules/core/FieryDemiseExplanation';

import { ChecklistUsageInfo, SpellUse, UsageInfo } from 'parser/core/SpellUsage/core';
import MajorCooldown, { SpellCast } from 'parser/core/MajorCooldowns/MajorCooldown';
import { isDefined } from 'common/typeGuards';

const PERFECT_FRAILTY_STACKS = 5;
const GOOD_FRAILTY_STACKS = 3;
const OK_FRAILTY_STACKS = 1;

interface SoulCarverCooldownCast extends SpellCast {
  primaryTargetStacksOfFrailty: number;
  hasFieryBrandDebuff: boolean;
}

export default class SoulCarver extends MajorCooldown<SoulCarverCooldownCast> {
  static dependencies = {
    ...MajorCooldown.dependencies,
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  constructor(options: Options) {
    super({ spell: TALENTS_DEMON_HUNTER.SOUL_CARVER_TALENT }, options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_DEMON_HUNTER.SOUL_CARVER_TALENT),
      this.onCast,
    );
  }

  description() {
    return (
      <>
        <strong>
          <SpellLink spell={TALENTS_DEMON_HUNTER.SOUL_CARVER_TALENT} />
        </strong>{' '}
        is a burst of damage that also generates a decent chunk of Soul Fragments.
        <VulnerabilityExplanation numberOfFrailtyStacks={GOOD_FRAILTY_STACKS} />
        <FieryDemiseExplanation />
      </>
    );
  }

  explainPerformance(cast: SoulCarverCooldownCast): SpellUse {
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
      primaryTargetStacksOfFrailty: this.getTargetStacksOfFrailty(event),
      hasFieryBrandDebuff: this.doesTargetHaveFieryBrand(event),
    });
  }

  private getTargetStacksOfFrailty(event: CastEvent | undefined) {
    if (!event) {
      return 0;
    }
    const enemy = this.enemies.getEntity(event);
    if (!enemy) {
      return 0;
    }
    return enemy.getBuffStacks(SPELLS.FRAILTY.id, event.timestamp);
  }

  private doesTargetHaveFieryBrand(event: CastEvent | undefined) {
    if (!event) {
      return false;
    }
    const enemy = this.enemies.getEntity(event);
    if (!enemy) {
      return false;
    }
    return enemy.hasBuff(SPELLS.FRAILTY.id, event.timestamp);
  }

  private fieryDemisePerformance(cast: SoulCarverCooldownCast): UsageInfo | undefined {
    if (!this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.FIERY_DEMISE_TALENT)) {
      return undefined;
    }
    if (!cast.hasFieryBrandDebuff) {
      return {
        performance: QualitativePerformance.Fail,
        summary: (
          <div>
            <SpellLink spell={TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT} /> not applied to target
          </div>
        ),
        details: (
          <div>
            <SpellLink spell={TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT} /> not applied to target.
            Make sure to apply <SpellLink spell={TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT} /> before
            casting <SpellLink spell={TALENTS_DEMON_HUNTER.SOUL_CARVER_TALENT} /> so that you
            benefit from <SpellLink spell={TALENTS_DEMON_HUNTER.FIERY_DEMISE_TALENT} />.
          </div>
        ),
      };
    }
    return {
      performance: QualitativePerformance.Perfect,
      summary: (
        <div>
          <SpellLink spell={TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT} /> applied to target
        </div>
      ),
      details: (
        <div>
          <SpellLink spell={TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT} /> applied to target.
        </div>
      ),
    };
  }

  private frailtyPerformance(cast: SoulCarverCooldownCast): UsageInfo | undefined {
    if (!this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.VULNERABILITY_TALENT)) {
      return undefined;
    }
    if (!this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.SOULCRUSH_TALENT)) {
      if (cast.primaryTargetStacksOfFrailty > 0) {
        return {
          performance: QualitativePerformance.Perfect,
          summary: (
            <div>
              <SpellLink spell={SPELLS.FRAILTY} /> applied to target
            </div>
          ),
          details: (
            <div>
              <SpellLink spell={SPELLS.FRAILTY} /> applied to target.
            </div>
          ),
        };
      }
      return {
        performance: QualitativePerformance.Fail,
        summary: (
          <div>
            <SpellLink spell={SPELLS.FRAILTY} /> not applied to target
          </div>
        ),
        details: (
          <div>
            <SpellLink spell={SPELLS.FRAILTY} /> not applied to target. Make sure to apply{' '}
            <SpellLink spell={SPELLS.FRAILTY} /> before casting{' '}
            <SpellLink spell={TALENTS_DEMON_HUNTER.SOUL_CARVER_TALENT} />.
          </div>
        ),
      };
    }

    if (cast.primaryTargetStacksOfFrailty >= PERFECT_FRAILTY_STACKS) {
      return {
        performance: QualitativePerformance.Perfect,
        summary: (
          <div>
            {cast.primaryTargetStacksOfFrailty} stack(s) of <SpellLink spell={SPELLS.FRAILTY} />{' '}
            applied to target
          </div>
        ),
        details: (
          <div>
            Had {cast.primaryTargetStacksOfFrailty} stack(s) of <SpellLink spell={SPELLS.FRAILTY} />{' '}
            applied to target.
          </div>
        ),
      };
    }
    if (cast.primaryTargetStacksOfFrailty >= GOOD_FRAILTY_STACKS) {
      return {
        performance: QualitativePerformance.Good,
        summary: (
          <div>
            {cast.primaryTargetStacksOfFrailty} stack(s) of <SpellLink spell={SPELLS.FRAILTY} />{' '}
            applied to target
          </div>
        ),
        details: (
          <div>
            Only {cast.primaryTargetStacksOfFrailty} stack(s) of{' '}
            <SpellLink spell={SPELLS.FRAILTY} /> applied to target. Try applying at least{' '}
            {PERFECT_FRAILTY_STACKS} stack(s) of <SpellLink spell={SPELLS.FRAILTY} /> before casting{' '}
            <SpellLink spell={TALENTS_DEMON_HUNTER.SOUL_CARVER_TALENT} />.
          </div>
        ),
      };
    }
    if (cast.primaryTargetStacksOfFrailty >= OK_FRAILTY_STACKS) {
      return {
        performance: QualitativePerformance.Ok,
        summary: (
          <div>
            {cast.primaryTargetStacksOfFrailty} stack(s) of <SpellLink spell={SPELLS.FRAILTY} />{' '}
            applied to target
          </div>
        ),
        details: (
          <div>
            Only {cast.primaryTargetStacksOfFrailty} stack(s) of{' '}
            <SpellLink spell={SPELLS.FRAILTY} /> applied to target. Try applying at least{' '}
            {PERFECT_FRAILTY_STACKS} stack(s) of <SpellLink spell={SPELLS.FRAILTY} /> before casting{' '}
            <SpellLink spell={TALENTS_DEMON_HUNTER.SOUL_CARVER_TALENT} />.
          </div>
        ),
      };
    }
    return {
      performance: QualitativePerformance.Fail,
      summary: (
        <div>
          {cast.primaryTargetStacksOfFrailty} stack(s) of <SpellLink spell={SPELLS.FRAILTY} />{' '}
          applied to target
        </div>
      ),
      details: (
        <div>
          Only {cast.primaryTargetStacksOfFrailty} stack(s) of <SpellLink spell={SPELLS.FRAILTY} />{' '}
          applied to target. Try applying at least {PERFECT_FRAILTY_STACKS} stack(s) of{' '}
          <SpellLink spell={SPELLS.FRAILTY} /> before casting{' '}
          <SpellLink spell={TALENTS_DEMON_HUNTER.SOUL_CARVER_TALENT} />.
        </div>
      ),
    };
  }
}
