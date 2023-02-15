import { t } from '@lingui/macro';
import { formatNumber, formatPercentage, formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SpellLink } from 'interface';
import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, HealEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import ItemManaGained from 'parser/ui/ItemManaGained';
import { getLowestPerf, QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import RenewingMistDuringManaTea from './RenewingMistDuringManaTea';
import { PerformanceMark } from 'interface/guide';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';

interface ManaTeaTracker {
  timestamp: number;
  manaSaved: number;
  totalVivifyCleaves: number;
  numVivifyCasts: number;
  castEf: boolean;
  overhealing: number;
  healing: number;
}

class ManaTea extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    renewingMistDuringManaTea: RenewingMistDuringManaTea,
  };

  protected renewingMistDuringManaTea!: RenewingMistDuringManaTea;

  manaSavedMT: number = 0;
  manateaCount: number = 0;
  casts: Map<string, number> = new Map<string, number>();
  castTrackers: ManaTeaTracker[] = [];
  effectiveHealing: number = 0;
  manaPerManaTeaGoal: number = 0;
  overhealing: number = 0;
  protected abilityTracker!: AbilityTracker;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.MANA_TEA_TALENT);
    if (!this.active) {
      return;
    }
    this.manaPerManaTeaGoal = this.selectedCombatant.hasTalent(
      TALENTS_MONK.REFRESHING_JADE_WIND_TALENT,
    )
      ? 6700
      : 7500;

    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.handleCast);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.heal);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS_MONK.MANA_TEA_TALENT),
      this.applyBuff,
    );
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.VIVIFY), this.onVivHeal);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.VIVIFY), this.onVivCast);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.ESSENCE_FONT_TALENT),
      this.onEfCast,
    );
  }

  applyBuff(event: ApplyBuffEvent) {
    this.manateaCount += 1; //count the number of mana teas to make an average over teas
    this.castTrackers.push({
      timestamp: event.timestamp,
      totalVivifyCleaves: 0,
      numVivifyCasts: 0,
      manaSaved: 0,
      castEf: false,
      healing: 0,
      overhealing: 0,
    });
  }

  onEfCast(event: CastEvent) {
    if (!this.selectedCombatant.hasBuff(TALENTS_MONK.MANA_TEA_TALENT.id)) {
      return;
    }
    this.castTrackers.at(-1)!.castEf = true;
  }

  heal(event: HealEvent) {
    if (this.selectedCombatant.hasBuff(TALENTS_MONK.MANA_TEA_TALENT.id)) {
      //if this is in a mana tea window
      this.effectiveHealing += (event.amount || 0) + (event.absorbed || 0);
      this.castTrackers.at(-1)!.healing += (event.amount || 0) + (event.absorbed || 0);
      this.castTrackers.at(-1)!.overhealing += event.overheal || 0;
      this.overhealing += event.overheal || 0;
    }
  }

  handleCast(event: CastEvent) {
    const name = event.ability.name;
    const manaEvent = event.classResources?.find(
      (resource) => resource.type === RESOURCE_TYPES.MANA.id,
    );
    if (manaEvent === undefined) {
      return;
    }

    if (
      this.selectedCombatant.hasBuff(TALENTS_MONK.MANA_TEA_TALENT.id) &&
      event.ability.guid !== TALENTS_MONK.MANA_TEA_TALENT.id
    ) {
      //we check both since melee doesn't havea classResource
      if (manaEvent.cost !== undefined) {
        //checks if the spell costs anything (we don't just use cost since some spells don't play nice)
        this.manaSavedMT += manaEvent.cost / 2;
        this.castTrackers.at(-1)!.manaSaved += manaEvent.cost / 2;
      }
      if (this.casts.has(name)) {
        this.casts.set(name, (this.casts.get(name) || 0) + 1);
      } else {
        this.casts.set(name, 1);
      }
    }
  }

  onVivCast(event: CastEvent) {
    if (!this.selectedCombatant.hasBuff(TALENTS_MONK.MANA_TEA_TALENT.id)) {
      return;
    }
    this.castTrackers.at(-1)!.totalVivifyCleaves -= 1; // this is overcounted in vivHeal func
    this.castTrackers.at(-1)!.numVivifyCasts += 1;
  }

  onVivHeal(event: HealEvent) {
    if (!this.selectedCombatant.hasBuff(TALENTS_MONK.MANA_TEA_TALENT.id)) {
      return;
    }
    this.castTrackers.at(-1)!.totalVivifyCleaves += 1;
  }

  get avgMtSaves() {
    return this.manaSavedMT / this.manateaCount || 0;
  }

  get suggestionThresholds() {
    return {
      actual: this.avgMtSaves,
      isLessThan: {
        minor: this.manaPerManaTeaGoal,
        average: this.manaPerManaTeaGoal - 1000,
        major: this.manaPerManaTeaGoal - 2000,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  get avgOverhealing() {
    return parseFloat(
      (this.overhealing / (this.overhealing + this.effectiveHealing) || 0).toFixed(4),
    );
  }

  get suggestionThresholdsOverhealing() {
    return {
      actual: this.avgOverhealing,
      isGreaterThan: {
        minor: 0.2,
        average: 0.3,
        major: 0.4,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your mana spent during <SpellLink id={TALENTS_MONK.MANA_TEA_TALENT.id} /> can be improved.
          Aim to prioritize as many <SpellLink id={SPELLS.VIVIFY.id} /> casts until the last second
          of the buff and then cast <SpellLink id={TALENTS_MONK.ESSENCE_FONT_TALENT.id} />.{' '}
          <SpellLink id={TALENTS_MONK.ESSENCE_FONT_TALENT.id} />
          's mana cost is taken at the beginning of the channel, so you gain the benefit of{' '}
          <SpellLink id={TALENTS_MONK.MANA_TEA_TALENT.id} /> even if the channel continues past the
          buff.
        </>,
      )
        .icon(TALENTS_MONK.MANA_TEA_TALENT.icon)
        .actual(
          `${formatNumber(this.avgMtSaves)}${t({
            id: 'monk.mistweaver.suggestions.manaTea.avgManaSaved',
            message: ` average mana saved per Mana Tea cast`,
          })}`,
        )
        .recommended(`${(recommended / 1000).toFixed(0)}k average mana saved is recommended`),
    );
    when(this.suggestionThresholdsOverhealing).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your average overhealing was high during your{' '}
          <SpellLink id={TALENTS_MONK.MANA_TEA_TALENT.id} /> usage. Consider using{' '}
          <SpellLink id={TALENTS_MONK.MANA_TEA_TALENT.id} /> during specific boss abilities or
          general periods of high damage to the raid. Also look to target low health raid members to
          avoid large amounts of overhealing.
        </>,
      )
        .icon(TALENTS_MONK.MANA_TEA_TALENT.icon)
        .actual(
          `${formatPercentage(this.avgOverhealing)}${t({
            id: 'monk.mistweaver.suggestions.manaTea.avgOverHealing',
            message: ` % average overhealing per Mana Tea cast`,
          })}`,
        )
        .recommended(`under ${formatPercentage(recommended)}% over healing is recommended`),
    );
  }

  getCastOverhealingPercent(cast: ManaTeaTracker) {
    return cast.overhealing / (cast.overhealing + cast.healing);
  }

  get guideCastBreakdown() {
    const explanation = (
      <p>
        <strong>
          <SpellLink id={TALENTS_MONK.MANA_TEA_TALENT.id} />
        </strong>{' '}
        is a powerful buff that can save a large amount of mana. Aim to use{' '}
        <SpellLink id={TALENTS_MONK.MANA_TEA_TALENT} /> in the following ways
        <ul>
          <li>
            If you have at least 8 <SpellLink id={TALENTS_MONK.RENEWING_MIST_TALENT} /> HoTs out on
            the raid and the raid is taking significant damage, then use{' '}
            <SpellLink id={TALENTS_MONK.MANA_TEA_TALENT} /> and spam{' '}
            <SpellLink id={SPELLS.VIVIFY} />
          </li>
          <li>
            If talented into <SpellLink id={TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT} />,
            use <SpellLink id={TALENTS_MONK.MANA_TEA_TALENT} /> during your celestial and spam
            <SpellLink id={TALENTS_MONK.ENVELOPING_MIST_TALENT} />
          </li>
        </ul>
        Regardless of how you choose to use <SpellLink id={TALENTS_MONK.MANA_TEA_TALENT} />, make
        sure to cast <SpellLink id={TALENTS_MONK.ESSENCE_FONT_TALENT} /> and use it at a time where
        your spells will not have significant overhealing.
      </p>
    );

    const data = (
      <div>
        <strong>Per-Cast Breakdown</strong>
        <small> - click to expand</small>
        {this.castTrackers.map((cast, ix) => {
          const header = (
            <>
              @ {this.owner.formatTimestamp(cast.timestamp)} &mdash;{' '}
              <SpellLink id={TALENTS_MONK.MANA_TEA_TALENT.id} />
            </>
          );
          const checklistItems: CooldownExpandableItem[] = [];
          let manaPerf = QualitativePerformance.Good;
          if (cast.manaSaved < 20000) {
            manaPerf = QualitativePerformance.Ok;
          } else if (cast.manaSaved < 15000) {
            manaPerf = QualitativePerformance.Fail;
          }
          checklistItems.push({
            label: (
              <>
                Mana saved during <SpellLink id={TALENTS_MONK.MANA_TEA_TALENT} />
              </>
            ),
            result: <PerformanceMark perf={manaPerf} />,
            details: <>{formatNumber(cast.manaSaved)} mana saved</>,
          });
          const efPerf = cast.castEf ? QualitativePerformance.Good : QualitativePerformance.Fail;
          checklistItems.push({
            label: (
              <>
                Cast <SpellLink id={TALENTS_MONK.ESSENCE_FONT_TALENT} /> during{' '}
                <SpellLink id={TALENTS_MONK.MANA_TEA_TALENT} />
              </>
            ),
            result: <PerformanceMark perf={efPerf} />,
          });
          const overhealingPercent = this.getCastOverhealingPercent(cast);
          let overhealingPerf = QualitativePerformance.Good;
          if (overhealingPercent > 0.65) {
            overhealingPerf = QualitativePerformance.Fail;
          } else if (overhealingPercent > 0.55) {
            overhealingPerf = QualitativePerformance.Ok;
          }
          checklistItems.push({
            label: (
              <>
                Overhealing during <SpellLink id={TALENTS_MONK.MANA_TEA_TALENT} />
              </>
            ),
            result: <PerformanceMark perf={overhealingPerf} />,
            details: <>{formatPercentage(overhealingPercent)}%</>,
          });
          const allPerfs = [manaPerf, overhealingPerf, efPerf];
          if (cast.numVivifyCasts > 0) {
            const avgCleaves = cast.totalVivifyCleaves / cast.numVivifyCasts;
            let vivCleavePerf = QualitativePerformance.Good;
            if (avgCleaves < 8) {
              vivCleavePerf = QualitativePerformance.Ok;
            } else if (avgCleaves < 6) {
              vivCleavePerf = QualitativePerformance.Fail;
            }
            checklistItems.push({
              label: (
                <>
                  Avg number of <SpellLink id={SPELLS.VIVIFY} /> cleaves per cast
                </>
              ),
              result: <PerformanceMark perf={vivCleavePerf} />,
              details: <>{avgCleaves.toFixed(1)} avg cleaves</>,
            });
            allPerfs.push(vivCleavePerf);
          }

          const lowestPerf = getLowestPerf(allPerfs);
          return (
            <CooldownExpandable
              header={header}
              checklistItems={checklistItems}
              perf={lowestPerf}
              key={ix}
            />
          );
        })}
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }

  statistic() {
    const arrayOfKeys = Array.from(this.casts.keys());
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(25)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            During your {this.manateaCount} casts of Mana Tea you saved mana on the following (
            {formatThousands((this.manaSavedMT / this.owner.fightDuration) * 1000 * 5)} MP5):
            <ul>
              {arrayOfKeys.map((spell) => (
                <li key={spell}>
                  {this.casts.get(spell)} {spell} casts
                </li>
              ))}
            </ul>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_MONK.MANA_TEA_TALENT}>
          <ItemManaGained amount={this.manaSavedMT} useAbbrev />
          <br />
          {formatNumber(this.avgMtSaves)} <small>mana saved per cast</small>
          <br />
          {this.renewingMistDuringManaTea.subStatistic()}
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default ManaTea;
