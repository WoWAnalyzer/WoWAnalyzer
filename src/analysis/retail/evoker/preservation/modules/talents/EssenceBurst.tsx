import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { maybeGetSpell } from 'common/SPELLS';
import { SpellIcon } from 'interface';
import { ThresholdStyle } from 'parser/core/ParseResults';
import Events, {
  EventType,
  RefreshBuffEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import {
  didSparkProcEssenceBurst,
  isEbFromHardcast,
  isEbFromMerithras,
  isEbFromReversion,
} from '../../normalizers/EventLinking/helpers';
import { getEssenceBurstConsumeAbility } from 'analysis/retail/evoker/shared/modules/normalizers/EssenceBurstCastLinkNormalizer';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { SPELL_COLORS } from 'analysis/retail/evoker/preservation/constants';
import DonutChart from 'parser/ui/DonutChart';
import { SpellLink } from 'interface';
import ItemManaGained from 'parser/ui/ItemManaGained';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import CastDetail, { type PerCastData } from 'interface/guide/components/CastDetail';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';

export const ESSENCE_COSTS: Record<string, number> = {
  'Emerald Blossom': 3,
  Echo: 2,
  Disintegrate: 3,
};

enum EB_SOURCE {
  REVERSION,
  SPARK,
  LF_HARDCAST,
  MERITHRAS,
  NONE,
}

export const MANA_COSTS: Record<string, number> = {
  'Emerald Blossom': SPELLS.EMERALD_BLOSSOM_CAST.manaCost,
  Echo: TALENTS_EVOKER.ECHO_TALENT.manaCost,
  Disintegrate: 0,
};

interface CastInfo {
  spell: number;
  expired: boolean;
  refreshed: boolean;
  timestamp: number;
  source: EB_SOURCE;
}

class EssenceBurst extends Analyzer {
  totalConsumed = 0;
  totalExpired = 0;
  essenceSaved = 0;
  manaSaved = 0;
  casts: CastInfo[] = [];
  consumptionCount: Record<string, number> = { 'Emerald Blossom': 0, Echo: 0, Disintegrate: 0 };

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(
      TALENTS_EVOKER.ESSENCE_BURST_PRESERVATION_TALENT,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.ESSENCE_BURST_BUFF),
      this.onBuffRemove,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.ESSENCE_BURST_BUFF),
      this.onBuffRefresh,
    );
    if (this.selectedCombatant.hasTalent(TALENTS_EVOKER.ESSENCE_ATTUNEMENT_TALENT)) {
      this.addEventListener(
        Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.ESSENCE_BURST_BUFF),
        this.onBuffRemove,
      );
    }
  }

  getEbSource(event: RemoveBuffEvent | RemoveBuffStackEvent | RefreshBuffEvent): EB_SOURCE {
    let source = EB_SOURCE.NONE;
    if (didSparkProcEssenceBurst(event)) {
      source = EB_SOURCE.SPARK;
    } else if (isEbFromReversion(event)) {
      source = EB_SOURCE.REVERSION;
    } else if (isEbFromMerithras(event)) {
      source = EB_SOURCE.MERITHRAS;
    } else if (isEbFromHardcast(event)) {
      source = EB_SOURCE.LF_HARDCAST;
    }
    return source;
  }

  onBuffRemove(event: RemoveBuffEvent | RemoveBuffStackEvent) {
    const consumeAbility = getEssenceBurstConsumeAbility(event);
    const info: CastInfo = {
      timestamp: event.timestamp,
      expired: false,
      refreshed: false,
      spell: 0,
      source: this.getEbSource(event),
    };
    if (consumeAbility) {
      const spellName = consumeAbility.ability.name;
      info.spell = consumeAbility.ability.guid;
      this.totalConsumed += 1;
      this.essenceSaved += ESSENCE_COSTS[spellName];
      this.manaSaved += MANA_COSTS[spellName];
      this.consumptionCount[spellName] += 1;
    } else if (event.type === EventType.RemoveBuff) {
      this.totalExpired += 1;
      info.expired = true;
    } else {
      this.totalExpired += (event as RemoveBuffStackEvent).stack;
      info.expired = true;
    }
    this.casts.push(info);
  }

  onBuffRefresh(event: RefreshBuffEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.MERITHRAS_BLESSING_BUFF.id, event.timestamp - 1)) {
      this.casts.push({
        timestamp: event.timestamp,
        expired: false,
        refreshed: true,
        spell: 0,
        source: this.getEbSource(event),
      });
    }
  }

  get averageManaSavedForHealingSpells() {
    return this.manaSaved / (this.totalConsumed - this.consumptionCount.Disintegrate);
  }

  renderDonutChart() {
    const items = [
      {
        color: SPELL_COLORS.DISINTEGRATE,
        label: 'Disintegrate',
        spellId: SPELLS.DISINTEGRATE.id,
        value: this.consumptionCount['Disintegrate'],
        valueTooltip: this.consumptionCount['Disintegrate'],
      },
      {
        color: SPELL_COLORS.EMERALD_BLOSSOM,
        label: 'Emerald Blossom',
        spellId: SPELLS.EMERALD_BLOSSOM.id,
        value: this.consumptionCount['Emerald Blossom'],
        valueTooltip: this.consumptionCount['Emerald Blossom'],
      },
      {
        color: SPELL_COLORS.ECHO,
        label: 'Echo',
        spellId: TALENTS_EVOKER.ECHO_TALENT.id,
        value: this.consumptionCount['Echo'],
        valueTooltip: this.consumptionCount['Echo'],
      },
    ].filter((item) => {
      return item.value > 0;
    });
    return items.length > 0 ? <DonutChart items={items} /> : null;
  }

  renderSourceChart() {
    const sourceCount = new Map<EB_SOURCE, number>();
    this.casts.forEach((cast) => {
      sourceCount.set(cast.source, (sourceCount.get(cast.source) ?? 0) + 1);
    });
    const items = [
      {
        color: SPELL_COLORS.MERITHRAS_BLESSING,
        label: "Merithra's Blessing",
        spellId: SPELLS.MERITHRAS_BLESSING_CAST.id,
        value: sourceCount.get(EB_SOURCE.MERITHRAS) ?? 0,
        valueTooltip: sourceCount.get(EB_SOURCE.MERITHRAS),
      },
      {
        color: SPELL_COLORS.REVERSION,
        label: 'Reversion',
        spellId: TALENTS_EVOKER.REVERSION_TALENT.id,
        value: sourceCount.get(EB_SOURCE.REVERSION) ?? 0,
        valueTooltip: sourceCount.get(EB_SOURCE.REVERSION),
      },
      {
        color: SPELL_COLORS.LIVING_FLAME,
        label: 'Living Flame',
        spellId: SPELLS.LIVING_FLAME_CAST.id,
        value: sourceCount.get(EB_SOURCE.LF_HARDCAST) ?? 0,
        valueTooltip: sourceCount.get(EB_SOURCE.LF_HARDCAST),
      },
      {
        color: SPELL_COLORS.ECHO,
        label: 'Spark of Insight',
        spellId: TALENTS_EVOKER.SPARK_OF_INSIGHT_TALENT.id,
        value: sourceCount.get(EB_SOURCE.SPARK) ?? 0,
        valueTooltip: sourceCount.get(EB_SOURCE.SPARK),
      },
    ].filter((item) => {
      return item.value > 0;
    });
    return items.length > 0 ? <DonutChart items={items} /> : null;
  }

  get suggestionThresholds() {
    return {
      actual: this.totalExpired,
      isGreaterThan: {
        major: 0,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  get buffApplyThreshold() {
    return {
      actual: this.totalConsumed + this.totalExpired,
      isLessThan: {
        major: 3,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS_EVOKER.ESSENCE_BURST_PRESERVATION_TALENT} />
        </b>{' '}
        is a core buff that you should never let expire or refresh. In general, you should consume
        all of them with <SpellLink spell={SPELLS.EMERALD_BLOSSOM} /> unless you already have two
        stacks of <SpellLink spell={TALENTS_EVOKER.TWIN_ECHOES_TALENT} />, in which case you would
        consume them on <SpellLink spell={TALENTS_EVOKER.ECHO_TALENT} /> instead. If you choose to
        talent into <SpellLink spell={TALENTS_EVOKER.ENERGY_LOOP_TALENT} />, then you should use
        some procs on <SpellLink spell={SPELLS.DISINTEGRATE} />, but this talent should only be
        taken on scenarios where extra mana is really needed.
      </p>
    );

    const perCastData: PerCastData[] = this.casts.map((info) => {
      let performance = QualitativePerformance.Perfect;
      const twinEchoes =
        (info.spell === TALENTS_EVOKER.ECHO_TALENT.id ||
          info.spell === SPELLS.EMERALD_BLOSSOM_CAST.id) &&
        this.selectedCombatant.hasTalent(TALENTS_EVOKER.TWIN_ECHOES_TALENT)
          ? this.selectedCombatant.getBuffStacks(SPELLS.TWIN_ECHOES_BUFF.id, info.timestamp)
          : null;
      if (
        !this.selectedCombatant.hasTalent(TALENTS_EVOKER.ENERGY_LOOP_TALENT) &&
        info.spell === SPELLS.DISINTEGRATE.id
      ) {
        performance = QualitativePerformance.Fail;
      }
      if (info.spell === TALENTS_EVOKER.ECHO_TALENT.id) {
        if (
          !this.selectedCombatant.hasTalent(TALENTS_EVOKER.TWIN_ECHOES_TALENT) ||
          this.selectedCombatant.getBuffStacks(SPELLS.TWIN_ECHOES_BUFF.id, info.timestamp) !== 2
        ) {
          performance = QualitativePerformance.Good;
        }
      }
      if (info.spell === 0) {
        performance = QualitativePerformance.Fail;
      }

      const details =
        info.spell === 0 ? (
          `Wasted from ${info.expired ? 'expiration' : 'refresh'}`
        ) : (
          <>
            Consume ability: <SpellLink spell={info.spell} />
          </>
        );

      const spell = maybeGetSpell(info.spell) ?? { name: '' };
      const stats = [
        {
          label: 'Usage',
          value: info.spell === 0 ? 'Wasted' : <SpellIcon spell={info.spell} />,
          tooltip:
            info.spell === 0
              ? `Wasted from ${info.expired ? 'expiration' : 'refresh'}`
              : `Consumed with ${spell.name}.`,
        },
      ];

      if (twinEchoes !== null) {
        stats.push({
          label: 'Twin Echoes',
          value: twinEchoes.toString(),
          tooltip:
            info.spell === 0
              ? `Wasted from ${info.expired ? 'expiration' : 'refresh'}`
              : `Consumed with ${spell.name}.`,
        });
      }

      return {
        performance,
        timestamp: this.owner.formatTimestamp(info.timestamp),
        details,
        stats,
        tooltip: (
          <>
            <p>Buff removed @ {this.owner.formatTimestamp(info.timestamp)}</p>
            {details}
          </>
        ),
      };
    });

    const data = (
      <div>
        <CastDetail title="Essence Burst consumptions" casts={perCastData} />
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  subStatistic() {
    return (
      <CastEfficiencyBar
        spell={TALENTS_EVOKER.DREAM_BREATH_TALENT}
        gapHighlightMode={GapHighlight.FullCooldown}
        minimizeIcons
        slimLines
        useThresholds
      />
    );
  }

  statistic() {
    const donutChart = this.renderDonutChart();
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(4)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <div className="pad">
          <label>
            <SpellLink spell={TALENTS_EVOKER.ESSENCE_BURST_PRESERVATION_TALENT} /> consumption by
            spell
          </label>
          {donutChart ? (
            donutChart
          ) : (
            <small>
              You gained no <SpellLink spell={TALENTS_EVOKER.ESSENCE_BURST_PRESERVATION_TALENT} />{' '}
              buffs during the encounter
            </small>
          )}
          <ItemManaGained amount={this.manaSaved} useAbbrev />
        </div>
      </Statistic>
    );
  }
}

export class EssenceBurstSources extends Analyzer {
  protected eb!: EssenceBurst;
  static dependencies = {
    eb: EssenceBurst,
  };
  statistic() {
    const donutChart = this.eb.renderSourceChart();
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(4)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <div className="pad">
          <label>
            <SpellLink spell={TALENTS_EVOKER.ESSENCE_BURST_PRESERVATION_TALENT} /> source breakdown
          </label>
          {donutChart ? (
            donutChart
          ) : (
            <small>
              You gained no <SpellLink spell={TALENTS_EVOKER.ESSENCE_BURST_PRESERVATION_TALENT} />{' '}
              buffs during the encounter
            </small>
          )}
        </div>
      </Statistic>
    );
  }
}

export default EssenceBurst;
