import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS/demonhunter';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyDebuffEvent, CastEvent, DamageEvent, HealEvent } from 'parser/core/Events';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import Enemies from 'parser/shared/modules/Enemies';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import {
  CooldownExpandable,
  CooldownExpandableItem,
} from 'analysis/retail/druid/restoration/Guide';
import { PerformanceMark } from 'interface/guide';

interface TheHuntCast {
  timestamp: number;
  damage: number;
  hasInitiativeOnCast: boolean;
  primaryTargetStacksOfFrailty: number;
  numberOfDotsApplied: number;
}

class TheHunt extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  damage = 0;
  heal = 0;
  cast = 0;
  theHuntTracker: TheHuntCast[] = [];

  protected enemies!: Enemies;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.THE_HUNT_TALENT.id);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell([SPELLS.THE_HUNT_CHARGE, SPELLS.THE_HUNT_DOT]),
      this.onDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.THE_HUNT_CHARGE),
      this.onChargeDamage,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell([SPELLS.THE_HUNT_HEAL]),
      this.onHeal,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_DEMON_HUNTER.THE_HUNT_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.THE_HUNT_DOT),
      this.onDebuffApply,
    );
  }

  onDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
    this.theHuntTracker[this.cast].damage += event.amount + (event.absorbed || 0);
  }

  onChargeDamage(event: DamageEvent) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy) {
      return;
    }
    this.theHuntTracker[this.cast].primaryTargetStacksOfFrailty = enemy.getBuffStacks(
      SPELLS.FRAILTY.id,
      event.timestamp,
    );
  }

  onHeal(event: HealEvent) {
    this.heal += event.amount + (event.absorbed || 0);
  }

  onCast(event: CastEvent) {
    this.cast += 1;
    this.theHuntTracker[this.cast] = {
      timestamp: event.timestamp,
      damage: 0,
      hasInitiativeOnCast: this.selectedCombatant.hasBuff(
        SPELLS.INITIATIVE_BUFF.id,
        event.timestamp,
      ),
      primaryTargetStacksOfFrailty: 0,
      numberOfDotsApplied: 0,
    };
  }

  onDebuffApply(_: ApplyDebuffEvent) {
    this.theHuntTracker[this.cast].numberOfDotsApplied += 1;
  }

  statistic() {
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

  havocGuideCastBreakdown() {
    const initiativeExplanation = (
      <>
        {' '}
        Always use with the buff from <SpellLink id={TALENTS_DEMON_HUNTER.INITIATIVE_TALENT} /> so
        that you benefit from the increased Critical Strike Chance.
      </>
    );
    const explanation = (
      <>
        <strong>
          <SpellLink id={TALENTS_DEMON_HUNTER.THE_HUNT_TALENT} />
        </strong>{' '}
        is a powerful burst of damage that also provides some healing with the DoT that it applies.
        {this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.INITIATIVE_TALENT) &&
          initiativeExplanation}
      </>
    );

    const data = (
      <div>
        <strong>Per-Cast Breakdown</strong>
        <small> - click to expand</small>

        {this.theHuntTracker.map((cast, idx) => {
          const header = (
            <>
              @ {this.owner.formatTimestamp(cast.timestamp)} &mdash;{' '}
              <SpellLink id={TALENTS_DEMON_HUNTER.THE_HUNT_TALENT} />
            </>
          );

          let initiativePerf = QualitativePerformance.Good;
          if (
            this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.INITIATIVE_TALENT) &&
            !cast.hasInitiativeOnCast
          ) {
            initiativePerf = QualitativePerformance.Fail;
          }

          const overallPerf = initiativePerf;

          const checklistItems: CooldownExpandableItem[] = [
            {
              label: (
                <>
                  Had <SpellLink id={TALENTS_DEMON_HUNTER.INITIATIVE_TALENT} /> buff
                </>
              ),
              result: <PerformanceMark perf={initiativePerf} />,
            },
          ];

          return (
            <CooldownExpandable
              header={header}
              checklistItems={checklistItems}
              perf={overallPerf}
              key={idx}
            />
          );
        })}
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }

  vengeanceGuideCastBreakdown() {
    const vulnerabilityExplanation = (
      <>
        {' '}
        Always use with stacks of <SpellLink id={SPELLS.FRAILTY} /> applied to the target in order
        to maximise the damage dealt.
      </>
    );
    const explanation = (
      <>
        <strong>
          <SpellLink id={TALENTS_DEMON_HUNTER.THE_HUNT_TALENT} />
        </strong>{' '}
        is a powerful burst of damage that also provides some healing with the DoT that it applies.
        {this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.VULNERABILITY_TALENT) &&
          vulnerabilityExplanation}
      </>
    );

    const data = (
      <div>
        <strong>Per-Cast Breakdown</strong>
        <small> - click to expand</small>

        {this.theHuntTracker.map((cast, idx) => {
          const header = (
            <>
              @ {this.owner.formatTimestamp(cast.timestamp)} &mdash;{' '}
              <SpellLink id={TALENTS_DEMON_HUNTER.THE_HUNT_TALENT} />
            </>
          );

          let frailtyPerf = QualitativePerformance.Good;
          if (cast.primaryTargetStacksOfFrailty <= 1) {
            frailtyPerf = QualitativePerformance.Fail;
          } else if (cast.primaryTargetStacksOfFrailty <= 3) {
            frailtyPerf = QualitativePerformance.Ok;
          }

          const overallPerf = frailtyPerf;

          const checklistItems: CooldownExpandableItem[] = [
            {
              label: (
                <>
                  Stacks of <SpellLink id={SPELLS.FRAILTY} /> on primary target
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

          return (
            <CooldownExpandable
              header={header}
              checklistItems={checklistItems}
              perf={overallPerf}
              key={idx}
            />
          );
        })}
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }
}

export default TheHunt;
