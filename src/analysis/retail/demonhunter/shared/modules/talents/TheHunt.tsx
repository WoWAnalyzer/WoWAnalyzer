import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS/demonhunter';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import { SpellLink } from 'interface';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, HealEvent } from 'parser/core/Events';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import Enemies from 'parser/shared/modules/Enemies';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import VulnerabilityExplanation from 'analysis/retail/demonhunter/vengeance/modules/core/VulnerabilityExplanation';
import { Trans } from '@lingui/macro';
import InitiativeExplanation from 'analysis/retail/demonhunter/havoc/guide/InitiativeExplanation';
import { ChecklistUsageInfo, SpellUse, UsageInfo } from 'parser/core/SpellUsage/core';
import MajorCooldown, { SpellCast } from 'parser/core/MajorCooldowns/MajorCooldown';
import SPECS from 'game/SPECS';
import {
  getAppliedDots,
  getChargeImpact,
  getDamageEvents,
} from 'analysis/retail/demonhunter/shared/normalizers/TheHuntNormalizer';
import { getPreviousVengefulRetreat } from 'analysis/retail/demonhunter/havoc/normalizers/TheHuntVengefulRetreatNormalizer';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';
import { isDefined } from 'common/typeGuards';

const PERFECT_FRAILTY_STACKS = 5;
const GOOD_FRAILTY_STACKS = 3;
const OK_FRAILTY_STACKS = 1;

interface TheHuntCooldownCast extends SpellCast {
  damage: number;
  hasInitiativeOnCast: boolean;
  primaryTargetStacksOfFrailty: number;
  numberOfDotsApplied: number;
}

class TheHunt extends MajorCooldown<TheHuntCooldownCast> {
  static dependencies = {
    ...MajorCooldown.dependencies,
    enemies: Enemies,
  };

  damage = 0;
  heal = 0;

  protected enemies!: Enemies;

  constructor(options: Options) {
    super({ spell: TALENTS_DEMON_HUNTER.THE_HUNT_TALENT }, options);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell([SPELLS.THE_HUNT_HEAL]),
      this.onHeal,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_DEMON_HUNTER.THE_HUNT_TALENT),
      this.onCast,
    );
  }

  statistic() {
    if (this.damage === 0 && this.heal === 0) {
      return null;
    }
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            {formatThousands(this.damage)} Total damage
            <br />
            {formatThousands(this.heal)} Total heal
          </>
        }
      >
        <TalentSpellText talent={TALENTS_DEMON_HUNTER.THE_HUNT_TALENT}>
          <ItemDamageDone amount={this.damage} />
          <br />
          <ItemHealingDone amount={this.heal} />
        </TalentSpellText>
      </Statistic>
    );
  }

  description() {
    const isHavoc = this.owner.config.spec === SPECS.HAVOC_DEMON_HUNTER;
    if (isHavoc) {
      return (
        <Trans id="guide.demonhunter.havoc.sections.cooldowns.theHunt.explanation">
          <strong>
            <SpellLink id={TALENTS_DEMON_HUNTER.THE_HUNT_TALENT} />
          </strong>{' '}
          is a powerful burst of damage that also provides some healing with the DoT that it
          applies.
          <InitiativeExplanation />
        </Trans>
      );
    }
    return (
      <Trans id="guide.demonhunter.vengeance.sections.cooldowns.theHunt.explanation">
        <strong>
          <SpellLink id={TALENTS_DEMON_HUNTER.THE_HUNT_TALENT} />
        </strong>{' '}
        is a powerful burst of damage that also provides some healing with the DoT that it applies.
        <VulnerabilityExplanation numberOfFrailtyStacks={GOOD_FRAILTY_STACKS} />
      </Trans>
    );
  }

  explainPerformance(cast: TheHuntCooldownCast): SpellUse {
    const isHavoc = this.owner.config.spec === SPECS.HAVOC_DEMON_HUNTER;
    if (isHavoc) {
      return this.explainHavocPerformance(cast);
    }
    return this.explainVengeancePerformance(cast);
  }

  private explainHavocPerformance(cast: TheHuntCooldownCast): SpellUse {
    const {
      performance: initiativePerf,
      summary: initiativeLabel,
      details: initiativeDetails,
    } = this.initiativePerformance(cast) ?? {};

    const overallPerf = combineQualitativePerformances([initiativePerf].filter(isDefined));
    const checklistItems: ChecklistUsageInfo[] = [];
    if (initiativePerf && initiativeLabel && initiativeDetails) {
      checklistItems.push({
        check: 'initiative',
        timestamp: cast.event.timestamp,
        performance: initiativePerf,
        summary: initiativeLabel,
        details: initiativeDetails,
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

  private explainVengeancePerformance(cast: TheHuntCooldownCast): SpellUse {
    const {
      performance: frailtyPerf,
      summary: frailtyLabel,
      details: frailtyDetails,
    } = this.frailtyPerformance(cast) ?? {};

    const overallPerf = combineQualitativePerformances([frailtyPerf].filter(isDefined));
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

    return {
      event: cast.event,
      checklistItems: checklistItems,
      performance: overallPerf,
      performanceExplanation:
        overallPerf !== QualitativePerformance.Fail ? `${overallPerf} Usage` : 'Bad Usage',
    };
  }

  private onHeal(event: HealEvent) {
    this.heal += event.amount + (event.absorbed || 0);
  }

  private onCast(event: CastEvent) {
    const damage = getDamageEvents(event).reduce(
      (acc, next) => acc + next.amount + (next.absorbed ?? 0),
      0,
    );
    this.damage += damage;
    this.recordCooldown({
      event,
      damage,
      hasInitiativeOnCast: this.selectedCombatant.hasBuff(
        SPELLS.INITIATIVE_BUFF.id,
        event.timestamp,
      ),
      primaryTargetStacksOfFrailty: this.getTargetStacksOfFrailty(getChargeImpact(event)),
      numberOfDotsApplied: getAppliedDots(event).length,
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

  private initiativePerformance(cast: TheHuntCooldownCast): UsageInfo | undefined {
    if (!this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.INITIATIVE_TALENT)) {
      return undefined;
    }
    const previousVengefulRetreat = getPreviousVengefulRetreat(cast.event);
    if (cast.hasInitiativeOnCast) {
      return {
        performance: QualitativePerformance.Perfect,
        summary: (
          <div>
            Had <SpellLink id={TALENTS_DEMON_HUNTER.INITIATIVE_TALENT} /> buff
          </div>
        ),
        details: (
          <div>
            Had <SpellLink id={TALENTS_DEMON_HUNTER.INITIATIVE_TALENT} /> buff.
          </div>
        ),
      };
    }
    if (previousVengefulRetreat) {
      return {
        performance: QualitativePerformance.Good,
        summary: (
          <div>
            Cast shortly after casting{' '}
            <SpellLink id={TALENTS_DEMON_HUNTER.VENGEFUL_RETREAT_TALENT} />
          </div>
        ),
        details: (
          <div>
            Cast shortly after casting{' '}
            <SpellLink id={TALENTS_DEMON_HUNTER.VENGEFUL_RETREAT_TALENT} />. You might have been
            damaged and lost your <SpellLink id={TALENTS_DEMON_HUNTER.INITIATIVE_TALENT} /> buff,
            but that's okay, you still did your rotation correctly.
          </div>
        ),
      };
    }
    return {
      performance: QualitativePerformance.Fail,
      summary: (
        <div>
          Cast without previously casting{' '}
          <SpellLink id={TALENTS_DEMON_HUNTER.VENGEFUL_RETREAT_TALENT} />
        </div>
      ),
      details: (
        <div>
          Cast without previously casting{' '}
          <SpellLink id={TALENTS_DEMON_HUNTER.VENGEFUL_RETREAT_TALENT} />. Try casting{' '}
          <SpellLink id={TALENTS_DEMON_HUNTER.VENGEFUL_RETREAT_TALENT} /> before casting for the
          critical strike chance buff that it applies (courtesy of{' '}
          <SpellLink id={TALENTS_DEMON_HUNTER.INITIATIVE_TALENT} />
          ).
        </div>
      ),
    };
  }

  private frailtyPerformance(cast: TheHuntCooldownCast): UsageInfo | undefined {
    if (!this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.VULNERABILITY_TALENT)) {
      return undefined;
    }
    if (!this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.SOULCRUSH_TALENT)) {
      if (cast.primaryTargetStacksOfFrailty > 0) {
        return {
          performance: QualitativePerformance.Perfect,
          summary: (
            <div>
              <SpellLink id={SPELLS.FRAILTY} /> applied to target
            </div>
          ),
          details: (
            <div>
              <SpellLink id={SPELLS.FRAILTY} /> applied to target.
            </div>
          ),
        };
      }
      return {
        performance: QualitativePerformance.Fail,
        summary: (
          <div>
            <SpellLink id={SPELLS.FRAILTY} /> not applied to target
          </div>
        ),
        details: (
          <div>
            <SpellLink id={SPELLS.FRAILTY} /> not applied to target. Make sure to apply{' '}
            <SpellLink id={SPELLS.FRAILTY} /> before casting{' '}
            <SpellLink id={TALENTS_DEMON_HUNTER.THE_HUNT_TALENT} />.
          </div>
        ),
      };
    }

    if (cast.primaryTargetStacksOfFrailty >= PERFECT_FRAILTY_STACKS) {
      return {
        performance: QualitativePerformance.Perfect,
        summary: (
          <div>
            {cast.primaryTargetStacksOfFrailty} stack(s) of <SpellLink id={SPELLS.FRAILTY} />{' '}
            applied to target
          </div>
        ),
        details: (
          <div>
            Had {cast.primaryTargetStacksOfFrailty} stack(s) of <SpellLink id={SPELLS.FRAILTY} />{' '}
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
            {cast.primaryTargetStacksOfFrailty} stack(s) of <SpellLink id={SPELLS.FRAILTY} />{' '}
            applied to target
          </div>
        ),
        details: (
          <div>
            Only {cast.primaryTargetStacksOfFrailty} stack(s) of <SpellLink id={SPELLS.FRAILTY} />{' '}
            applied to target. Try applying at least {PERFECT_FRAILTY_STACKS} stack(s) of{' '}
            <SpellLink id={SPELLS.FRAILTY} /> before casting{' '}
            <SpellLink id={TALENTS_DEMON_HUNTER.THE_HUNT_TALENT} />.
          </div>
        ),
      };
    }
    if (cast.primaryTargetStacksOfFrailty >= OK_FRAILTY_STACKS) {
      return {
        performance: QualitativePerformance.Ok,
        summary: (
          <div>
            {cast.primaryTargetStacksOfFrailty} stack(s) of <SpellLink id={SPELLS.FRAILTY} />{' '}
            applied to target
          </div>
        ),
        details: (
          <div>
            Only {cast.primaryTargetStacksOfFrailty} stack(s) of <SpellLink id={SPELLS.FRAILTY} />{' '}
            applied to target. Try applying at least {PERFECT_FRAILTY_STACKS} stack(s) of{' '}
            <SpellLink id={SPELLS.FRAILTY} /> before casting{' '}
            <SpellLink id={TALENTS_DEMON_HUNTER.THE_HUNT_TALENT} />.
          </div>
        ),
      };
    }
    return {
      performance: QualitativePerformance.Fail,
      summary: (
        <div>
          {cast.primaryTargetStacksOfFrailty} stack(s) of <SpellLink id={SPELLS.FRAILTY} /> applied
          to target
        </div>
      ),
      details: (
        <div>
          Only {cast.primaryTargetStacksOfFrailty} stack(s) of <SpellLink id={SPELLS.FRAILTY} />{' '}
          applied to target. Try applying at least {PERFECT_FRAILTY_STACKS} stack(s) of{' '}
          <SpellLink id={SPELLS.FRAILTY} /> before casting{' '}
          <SpellLink id={TALENTS_DEMON_HUNTER.THE_HUNT_TALENT} />.
        </div>
      ),
    };
  }
}

export default TheHunt;
