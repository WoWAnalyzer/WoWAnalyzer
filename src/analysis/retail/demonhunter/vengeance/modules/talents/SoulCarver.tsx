import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS/demonhunter';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import {
  CooldownExpandable,
  CooldownExpandableItem,
} from 'analysis/retail/druid/restoration/Guide';
import { PerformanceMark } from 'interface/guide';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import Enemies from 'parser/shared/modules/Enemies';
import Events, { CastEvent } from 'parser/core/Events';
import { combineQualitativePerformances } from 'analysis/retail/demonhunter/vengeance/guide/combineQualitativePerformances';
import VulnerabilityExplanation from 'analysis/retail/demonhunter/vengeance/guide/VulnerabilityExplanation';
import FieryDemiseExplanation from 'analysis/retail/demonhunter/vengeance/guide/FieryDemiseExplanation';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';

const GOOD_FRAILTY_STACKS = 6;
const OK_FRAILTY_STACKS = 4;

interface SoulCarverCast {
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
      <>
        <strong>
          <SpellLink id={TALENTS_DEMON_HUNTER.SOUL_CARVER_TALENT} />
        </strong>{' '}
        is a burst of damage that also generates a decent chunk of Soul Fragments.
        {this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.VULNERABILITY_TALENT) && (
          <VulnerabilityExplanation numberOfFrailtyStacks={GOOD_FRAILTY_STACKS} />
        )}
        {this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.FIERY_DEMISE_TALENT) && (
          <FieryDemiseExplanation combatant={this.selectedCombatant} />
        )}
      </>
    );

    const data = (
      <RoundedPanel>
        <strong>Per-Cast Breakdown</strong>
        <small> - click to expand</small>

        {this.soulCarverTracker.map((cast, idx) => {
          const header = (
            <>
              @ {this.owner.formatTimestamp(cast.timestamp)} &mdash;{' '}
              <SpellLink id={TALENTS_DEMON_HUNTER.SOUL_CARVER_TALENT} />
            </>
          );

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
                  At least {GOOD_FRAILTY_STACKS} stacks of <SpellLink id={SPELLS.FRAILTY} /> applied
                  to target
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

          return (
            <CooldownExpandable
              header={header}
              checklistItems={checklistItems}
              perf={overallPerf}
              key={idx}
            />
          );
        })}
      </RoundedPanel>
    );

    return explanationAndDataSubsection(explanation, data);
  }
}
