import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import PlayerHits from 'parser/ui/PlayerHits';
import Statistic from 'parser/ui/Statistic';
import BoringSpellValue from 'parser/ui/BoringSpellValue';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../guide/Guide';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import SpellLink from 'interface/SpellLink';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GapHighlight } from 'parser/ui/CooldownBar';
import ResourceLink from 'interface/ResourceLink';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PerformanceMark } from 'interface/guide';

class HolyPrismTargetsHit extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  hasAC = false;

  castEntries: BoxRowEntry[] = [];
  casts = 0;
  targetsHit = 0;
  petsHit = 0;
  averageInjuredHumansHit = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.HOLY_PRISM_TALENT);
    this.hasAC = this.selectedCombatant.hasTalent(TALENTS.AVENGING_CRUSADER_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.HOLY_PRISM_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.HOLY_PRISM_HEAL),
      this.onAoEHeal,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.HOLY_PRISM_HEAL_DIRECT),
      this.onSTHeal,
    );
  }

  onCast(event: CastEvent) {
    this.casts += 1;

    const isWingsActive = this.selectedCombatant.hasBuff(
      this.hasAC ? SPELLS.AVENGING_CRUSADER.id : TALENTS.AVENGING_WRATH_TALENT.id,
    );
    let tooltip = null;
    let value = null;

    if (!event.targetIsFriendly) {
      value = QualitativePerformance.Good;
      tooltip = (
        <>
          <div>
            <SpellLink spell={TALENTS.HOLY_PRISM_TALENT} /> cast @{' '}
            {this.owner.formatTimestamp(event.timestamp)}
          </div>
          <div>
            Used on Enemy Target: <PerformanceMark perf={QualitativePerformance.Good} />
          </div>
          {isWingsActive && (
            <>
              <div>
                <SpellLink
                  spell={
                    this.hasAC ? SPELLS.AVENGING_CRUSADER.id : TALENTS.AVENGING_WRATH_TALENT.id
                  }
                />{' '}
                active: <PerformanceMark perf={QualitativePerformance.Good} />
              </div>
            </>
          )}
        </>
      );
    } else {
      value = QualitativePerformance.Ok;
      tooltip = (
        <>
          <div>
            <SpellLink spell={TALENTS.HOLY_PRISM_TALENT} /> cast @{' '}
            {this.owner.formatTimestamp(event.timestamp)}
          </div>
          <div>
            Used on Friendly Target: <PerformanceMark perf={QualitativePerformance.Ok} />
          </div>
          {isWingsActive && (
            <>
              <div>
                <SpellLink
                  spell={
                    this.hasAC ? SPELLS.AVENGING_CRUSADER.id : TALENTS.AVENGING_WRATH_TALENT.id
                  }
                />{' '}
                active: <PerformanceMark perf={QualitativePerformance.Good} />
              </div>
            </>
          )}
        </>
      );
    }
    this.castEntries.push({ value, tooltip });
  }

  // We don't care about these but we can't filter (easily) only AOE casts as they all come from the same spell
  onSTHeal() {
    this.casts -= 1;
  }

  onAoEHeal(event: HealEvent) {
    const pet = this.combatants.getEntities()[event.targetID];
    const injured = event.amount + (event.absorbed || 0) !== 0;

    this.targetsHit += 1;
    if (!pet) {
      this.petsHit += 1;
    }
    if (pet && injured) {
      this.averageInjuredHumansHit += 1;
    }
  }

  statistic() {
    const averageTargetsHit = (this.targetsHit / this.casts).toFixed(2);
    const averagePetsHit = (this.petsHit / this.casts).toFixed(2);
    const averageHurtHumansHit = (this.averageInjuredHumansHit / this.casts).toFixed(2);

    return (
      <Statistic
        key="Statistic"
        category={STATISTIC_CATEGORY.TALENTS}
        size="small"
        tooltip={
          <>
            Casts are AoE only Casts
            <br />
            Targets hit are ALL targets Hit including 100% overhealing
            <br />
            Pets hit are ONLY pets Hit including 100% overheal
            <br />
            Hurt Non-Pets hit are all non pets excluding 100% overheal
            <ul>
              <li>Casts: {this.casts}</li>
              <li>
                Target hit: {this.targetsHit} ({averageTargetsHit}){' '}
              </li>
              <li>
                Pets Hit: {this.petsHit} ({averagePetsHit})
              </li>
              <li>
                Hurt Non-Pets Hit: {this.averageInjuredHumansHit} ({averageHurtHumansHit})
              </li>
            </ul>
          </>
        }
      >
        <BoringSpellValue
          spell={TALENTS.HOLY_PRISM_TALENT.id}
          value={averageTargetsHit}
          label="Average Targets Hit per Cast"
          className="light-of-dawn-hits-per-cast"
          extra={<PlayerHits performance={Number(averageTargetsHit)} />}
        />
      </Statistic>
    );
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS.HOLY_PRISM_TALENT} />
        </b>{' '}
        is a powerful AoE or single-target heal depending on who you cast it on:
        <ol>
          <li>
            an enemy target for AoE healing (<span style={{ color: 'green' }}>best</span>)
          </li>
          <li>
            an ally for single-target spot healing (<span style={{ color: 'yellow' }}>ok</span>)
          </li>
        </ol>
        {this.selectedCombatant.hasTalent(TALENTS.DIVINE_FAVOR_TALENT) && (
          <>
            {' '}
            Casting <SpellLink spell={TALENTS.HOLY_PRISM_TALENT} /> also procs{' '}
            <SpellLink spell={TALENTS.DIVINE_FAVOR_TALENT} />, reducing the cast time and mana cost
            of the preferred consuming spell,
            <SpellLink spell={SPELLS.HOLY_LIGHT} />, significantly.
          </>
        )}
        {this.selectedCombatant.hasTalent(TALENTS.SUNS_AVATAR_TALENT) && (
          <>
            {' '}
            As Herald of the Sun, it is very important to line up your{' '}
            <SpellLink spell={TALENTS.HOLY_PRISM_TALENT} /> casts with{' '}
            <SpellLink
              spell={this.hasAC ? SPELLS.AVENGING_CRUSADER.id : TALENTS.AVENGING_WRATH_TALENT.id}
            />{' '}
            and <SpellLink spell={TALENTS.AWAKENING_TALENT} /> windows as you apply{' '}
            <SpellLink spell={TALENTS.DAWNLIGHT_TALENT} /> with your next two{' '}
            <ResourceLink id={RESOURCE_TYPES.HOLY_POWER.id} /> spenders after casting{' '}
            <SpellLink spell={TALENTS.HOLY_PRISM_TALENT} /> to take advantage of{' '}
            <SpellLink spell={TALENTS.SUNS_AVATAR_TALENT} />.
            <br />
          </>
        )}
      </p>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={TALENTS.HOLY_PRISM_TALENT} /> cast efficiency
          </strong>
          <div className="flex-main chart" style={{ padding: 15 }}>
            {this.subStatistic()} <br />
            <strong>Casts </strong>
            <small>
              - Green indicates a correct <SpellLink spell={TALENTS.HOLY_PRISM_TALENT} /> cast,
              while yellow indicates an ok cast.
            </small>
            <PerformanceBoxRow values={this.castEntries} />
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  subStatistic() {
    return (
      <CastEfficiencyBar
        spell={TALENTS.HOLY_PRISM_TALENT}
        gapHighlightMode={GapHighlight.FullCooldown}
        minimizeIcons
        slimLines
        useThresholds
      />
    );
  }
}

export default HolyPrismTargetsHit;
