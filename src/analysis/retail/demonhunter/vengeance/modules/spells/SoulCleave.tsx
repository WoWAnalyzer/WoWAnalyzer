import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import Events, { CastEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/demonhunter';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';
import Enemy from 'parser/core/Enemy';
import { getSoulCleaveDamages } from 'analysis/retail/demonhunter/vengeance/normalizers/SoulCleaveEventLinkNormalizer';
import {
  SPIRIT_BOMB_SOULS_IN_META,
  SPIRIT_BOMB_SOULS_OUT_OF_META,
} from 'analysis/retail/demonhunter/vengeance/constants';
import { SpellLink } from 'interface';
import TALENTS from 'common/TALENTS/demonhunter';
import {
  ChecklistUsageInfo,
  SpellUse,
  spellUseToBoxRowEntry,
  UsageInfo,
} from 'parser/core/SpellUsage/core';
import { logSpellUseEvent } from 'parser/core/SpellUsage/SpellUsageSubSection';
import CastPerformanceSummary from 'analysis/retail/demonhunter/shared/guide/CastPerformanceSummary';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ResourceLink from 'interface/ResourceLink';
import HideGoodCastsSpellUsageSubSection from 'parser/core/SpellUsage/HideGoodCastsSpellUsageSubSection';

export default class SoulCleave extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  enemies!: Enemies;
  private cooldownUses: SpellUse[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SOUL_CLEAVE), this.onCast);
  }

  guideSubsection() {
    const spiritBombSnippet = this.selectedCombatant.hasTalent(
      TALENTS_DEMON_HUNTER.SPIRIT_BOMB_TALENT,
    ) ? (
      <>
        {' '}
        Use <SpellLink spell={SPELLS.SOUL_CLEAVE} /> when you would not otherwise use{' '}
        <SpellLink spell={TALENTS.SPIRIT_BOMB_TALENT} />. Always try to press{' '}
        <SpellLink spell={SPELLS.SOUL_CLEAVE} /> at least once after every{' '}
        <SpellLink spell={TALENTS.SPIRIT_BOMB_TALENT} />.
      </>
    ) : null;
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={SPELLS.SOUL_CLEAVE} />
        </strong>{' '}
        is your primary <strong>spender</strong> of <ResourceLink id={RESOURCE_TYPES.FURY.id} /> and{' '}
        <SpellLink spell={SPELLS.SOUL_FRAGMENT_STACK} />
        s. It consumes up to 2 <SpellLink spell={SPELLS.SOUL_FRAGMENT_STACK} />
        s.
        {spiritBombSnippet}
      </p>
    );

    const performances = this.cooldownUses.map((it) =>
      spellUseToBoxRowEntry(it, this.owner.fight.start_time),
    );

    const goodCasts = performances.filter((it) => it.value === QualitativePerformance.Good).length;
    const totalCasts = performances.length;

    return (
      <HideGoodCastsSpellUsageSubSection
        explanation={explanation}
        uses={this.cooldownUses}
        castBreakdownSmallText={<> - Green is a good cast, Red is a bad cast.</>}
        onPerformanceBoxClick={logSpellUseEvent}
        abovePerformanceDetails={
          <CastPerformanceSummary
            spell={SPELLS.SOUL_CLEAVE}
            casts={goodCasts}
            performance={QualitativePerformance.Good}
            totalCasts={totalCasts}
          />
        }
      />
    );
  }

  private onCast(event: CastEvent) {
    const spiritBombBetterPerformance = this.getCastWhenSpiritBombBetterPerformance(event);

    const checklistItems: ChecklistUsageInfo[] = [];
    if (spiritBombBetterPerformance) {
      checklistItems.push({
        check: 'spirit-bomb-better',
        timestamp: event.timestamp,
        ...spiritBombBetterPerformance,
      });
    }
    const actualPerformance = combineQualitativePerformances(
      checklistItems.map((item) => item.performance),
      QualitativePerformance.Good,
    );
    this.cooldownUses.push({
      event,
      performance: actualPerformance,
      checklistItems,
      performanceExplanation:
        actualPerformance !== QualitativePerformance.Fail
          ? `${actualPerformance} Usage`
          : 'Bad Usage',
    });
  }

  private getCastWhenSpiritBombBetterPerformance(event: CastEvent): UsageInfo | undefined {
    // If we don't have SpB, can't cast it instead
    const hasSpiritBomb = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.SPIRIT_BOMB_TALENT);
    if (!hasSpiritBomb) {
      return undefined;
    }

    const hasFieryDemise = this.selectedCombatant.hasTalent(
      TALENTS_DEMON_HUNTER.FIERY_DEMISE_TALENT,
    );

    const damageEvents = getSoulCleaveDamages(event);
    const isAoE = damageEvents.length > 1;
    const targetsThatHadFieryBrand = damageEvents
      .map((event) => this.enemies.getEntity(event))
      .filter((enemy): enemy is Enemy => enemy !== null)
      .filter((enemy) => enemy.hasBuff(SPELLS.FIERY_BRAND_DOT.id, event.timestamp));
    const isFieryDemiseWindow = targetsThatHadFieryBrand.length > 1;
    const numberOfSoulFragmentsAvailable = this.selectedCombatant.getBuffStacks(
      SPELLS.SOUL_FRAGMENT_STACK.id,
      event.timestamp,
    );
    const hasMetamorphosis = this.selectedCombatant.hasBuff(
      SPELLS.METAMORPHOSIS_TANK.id,
      event.timestamp,
    );

    if (!isAoE) {
      return this.getCastWhenSpiritBombBetterSingleTargetPerformance(
        hasFieryDemise,
        isFieryDemiseWindow,
        hasMetamorphosis,
        numberOfSoulFragmentsAvailable,
      );
    }

    return this.getCastWhenSpiritBombBetterCleavePerformance(
      hasMetamorphosis,
      numberOfSoulFragmentsAvailable,
    );
  }

  private getCastWhenSpiritBombBetterCleavePerformance(
    hasMetamorphosis: boolean,
    numberOfSoulFragmentsAvailable: number,
  ): UsageInfo {
    const inMetamorphosisSummary = (
      <div>Cast at &lt; {SPIRIT_BOMB_SOULS_IN_META} Soul Fragments during Metamorphosis in AoE</div>
    );
    const nonMetamorphosisSummary = (
      <div>Cast at &lt; {SPIRIT_BOMB_SOULS_OUT_OF_META} Soul Fragments in AoE</div>
    );

    if (hasMetamorphosis) {
      if (numberOfSoulFragmentsAvailable < SPIRIT_BOMB_SOULS_IN_META) {
        return {
          performance: QualitativePerformance.Good,
          summary: inMetamorphosisSummary,
          details: (
            <div>
              You cast <SpellLink spell={SPELLS.SOUL_CLEAVE} /> while you had{' '}
              {numberOfSoulFragmentsAvailable} <SpellLink spell={SPELLS.SOUL_FRAGMENT_STACK} />s
              available during <SpellLink spell={SPELLS.METAMORPHOSIS_TANK} /> in AoE. Good job!
            </div>
          ),
        };
      }
      return {
        performance: QualitativePerformance.Fail,
        summary: inMetamorphosisSummary,
        details: (
          <div>
            You cast <SpellLink spell={SPELLS.SOUL_CLEAVE} /> while you had{' '}
            {numberOfSoulFragmentsAvailable}
            <SpellLink spell={SPELLS.SOUL_FRAGMENT_STACK} />s available during{' '}
            <SpellLink spell={SPELLS.METAMORPHOSIS_TANK} /> in AoE.{' '}
            <SpellLink spell={TALENTS_DEMON_HUNTER.SPIRIT_BOMB_TALENT} /> should be pressed at{' '}
            {SPIRIT_BOMB_SOULS_IN_META}+ <SpellLink spell={SPELLS.SOUL_FRAGMENT_STACK} />
            s in <SpellLink spell={SPELLS.METAMORPHOSIS_TANK} />; you should have pressed{' '}
            <SpellLink spell={TALENTS_DEMON_HUNTER.SPIRIT_BOMB_TALENT} /> instead.
          </div>
        ),
      };
    }
    if (numberOfSoulFragmentsAvailable < SPIRIT_BOMB_SOULS_OUT_OF_META) {
      return {
        performance: QualitativePerformance.Good,
        summary: nonMetamorphosisSummary,
        details: (
          <div>
            You cast <SpellLink spell={SPELLS.SOUL_CLEAVE} /> while you had{' '}
            {numberOfSoulFragmentsAvailable} <SpellLink spell={SPELLS.SOUL_FRAGMENT_STACK} />s
            available in AoE. Good job!
          </div>
        ),
      };
    }
    return {
      performance: QualitativePerformance.Fail,
      summary: nonMetamorphosisSummary,
      details: (
        <div>
          You cast <SpellLink spell={SPELLS.SOUL_CLEAVE} /> while you had{' '}
          {numberOfSoulFragmentsAvailable} <SpellLink spell={SPELLS.SOUL_FRAGMENT_STACK} />s
          available in AoE. <SpellLink spell={TALENTS_DEMON_HUNTER.SPIRIT_BOMB_TALENT} /> should be
          pressed at {SPIRIT_BOMB_SOULS_OUT_OF_META}+{' '}
          <SpellLink spell={SPELLS.SOUL_FRAGMENT_STACK} />
          s; you should have pressed <SpellLink
            spell={TALENTS_DEMON_HUNTER.SPIRIT_BOMB_TALENT}
          />{' '}
          instead.
        </div>
      ),
    };
  }

  private getCastWhenSpiritBombBetterSingleTargetPerformance(
    hasFieryDemise: boolean,
    isFieryDemiseWindow: boolean,
    hasMetamorphosis: boolean,
    numberOfSoulFragmentsAvailable: number,
  ): UsageInfo | undefined {
    if (!hasFieryDemise) {
      // if we don't have Fiery Demise, Spirit Bomb can't be better in Single Target
      return undefined;
    }
    if (!isFieryDemiseWindow) {
      return {
        performance: QualitativePerformance.Good,
        summary: <div>Cast outside of Fiery Demise window</div>,
        details: (
          <div>
            You cast <SpellLink spell={SPELLS.SOUL_CLEAVE} /> outside of a{' '}
            <SpellLink spell={TALENTS_DEMON_HUNTER.FIERY_DEMISE_TALENT} /> window.
          </div>
        ),
      };
    }

    const inMetamorphosisSummary = (
      <div>Cast at &lt; {SPIRIT_BOMB_SOULS_IN_META} Soul Fragments during Metamorphosis</div>
    );
    const nonMetamorphosisSummary = (
      <div>Cast at &lt; {SPIRIT_BOMB_SOULS_OUT_OF_META} Soul Fragments</div>
    );

    if (hasMetamorphosis) {
      if (numberOfSoulFragmentsAvailable < SPIRIT_BOMB_SOULS_IN_META) {
        return {
          performance: QualitativePerformance.Good,
          summary: inMetamorphosisSummary,
          details: (
            <div>
              You cast <SpellLink spell={SPELLS.SOUL_CLEAVE} /> while you had{' '}
              {numberOfSoulFragmentsAvailable} <SpellLink spell={SPELLS.SOUL_FRAGMENT_STACK} />s
              available during <SpellLink spell={SPELLS.METAMORPHOSIS_TANK} /> and a{' '}
              <SpellLink spell={TALENTS_DEMON_HUNTER.FIERY_DEMISE_TALENT} /> window. Good job!
            </div>
          ),
        };
      }
      return {
        performance: QualitativePerformance.Fail,
        summary: inMetamorphosisSummary,
        details: (
          <div>
            You cast <SpellLink spell={SPELLS.SOUL_CLEAVE} /> while you had{' '}
            {numberOfSoulFragmentsAvailable}
            <SpellLink spell={SPELLS.SOUL_FRAGMENT_STACK} />s available during{' '}
            <SpellLink spell={SPELLS.METAMORPHOSIS_TANK} /> in a{' '}
            <SpellLink spell={TALENTS_DEMON_HUNTER.FIERY_DEMISE_TALENT} /> window.{' '}
            <SpellLink spell={TALENTS_DEMON_HUNTER.SPIRIT_BOMB_TALENT} /> should be pressed at{' '}
            {SPIRIT_BOMB_SOULS_IN_META}+ <SpellLink spell={SPELLS.SOUL_FRAGMENT_STACK} />
            s in <SpellLink spell={SPELLS.METAMORPHOSIS_TANK} />; you should have pressed{' '}
            <SpellLink spell={TALENTS_DEMON_HUNTER.SPIRIT_BOMB_TALENT} /> instead.
          </div>
        ),
      };
    }
    if (numberOfSoulFragmentsAvailable < SPIRIT_BOMB_SOULS_OUT_OF_META) {
      return {
        performance: QualitativePerformance.Good,
        summary: nonMetamorphosisSummary,
        details: (
          <div>
            You cast <SpellLink spell={SPELLS.SOUL_CLEAVE} /> while you had{' '}
            {numberOfSoulFragmentsAvailable} <SpellLink spell={SPELLS.SOUL_FRAGMENT_STACK} />s
            available in a <SpellLink spell={TALENTS_DEMON_HUNTER.FIERY_DEMISE_TALENT} /> window.
            Good job!
          </div>
        ),
      };
    }
    return {
      performance: QualitativePerformance.Fail,
      summary: nonMetamorphosisSummary,
      details: (
        <div>
          You cast <SpellLink spell={SPELLS.SOUL_CLEAVE} /> while you had{' '}
          {numberOfSoulFragmentsAvailable} <SpellLink spell={SPELLS.SOUL_FRAGMENT_STACK} />s
          available in a <SpellLink spell={TALENTS_DEMON_HUNTER.FIERY_DEMISE_TALENT} /> window.{' '}
          <SpellLink spell={TALENTS_DEMON_HUNTER.SPIRIT_BOMB_TALENT} /> should be pressed at{' '}
          {SPIRIT_BOMB_SOULS_OUT_OF_META}+ <SpellLink spell={SPELLS.SOUL_FRAGMENT_STACK} />
          s; you should have pressed <SpellLink
            spell={TALENTS_DEMON_HUNTER.SPIRIT_BOMB_TALENT}
          />{' '}
          instead.
        </div>
      ),
    };
  }
}
