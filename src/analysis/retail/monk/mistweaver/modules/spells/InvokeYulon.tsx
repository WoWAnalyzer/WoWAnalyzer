import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, {
  AbsorbedEvent,
  CastEvent,
  HealEvent,
  RemoveBuffEvent,
  GetRelatedEvents,
} from 'parser/core/Events';
import BoringValueText from 'parser/ui/BoringValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { getAveragePerf, QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Statistic from 'parser/ui/Statistic';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BaseCelestialAnalyzer, { BaseCelestialTracker } from './BaseCelestialAnalyzer';
import { getCurrentRSKTalent } from '../../constants';
import { Talent } from 'common/TALENTS/types';
import { SOOTHING_MIST_CHANNEL_END } from '../../normalizers/EventLinks/EventLinkConstants';
import { PerformanceMark } from 'interface/guide';
import { Arrow } from 'interface/icons';

interface YulonCastTracker extends BaseCelestialTracker {
  soomWindows: number;
  envmOutsideSoom: number;
}

class InvokeYulon extends BaseCelestialAnalyzer {
  castTrackers: YulonCastTracker[] = [];
  soothHealing = 0;
  envelopHealing = 0;
  chiCocoonHealing = 0;
  currentRskTalent: Talent;
  soothingMistWindows: Array<{ start: number; end: number }> = [];

  get totalHealing() {
    return this.soothHealing + this.envelopHealing + this.chiCocoonHealing;
  }

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(
      TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT,
    );
    this.currentRskTalent = getCurrentRSKTalent(this.selectedCombatant);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER_PET).spell(SPELLS.SOOTHING_BREATH),
      this.handleSoothingBreath,
    );
    this.addEventListener(
      Events.absorbed.by(SELECTED_PLAYER).spell(SPELLS.CHI_COCOON_BUFF_YULON),
      this.handleChiCocoon,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.ENVELOPING_MIST_TALENT),
      this.onEnvmCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.SOOTHING_MIST_TALENT),
      this.onSoothingMistCast,
    );
  }

  onCast(event: CastEvent) {
    this.castTrackers.push({
      ...this.createBaseTracker(event),
      soomWindows: 0,
      envmOutsideSoom: 0,
    });
  }

  onEnvmCast(event: CastEvent) {
    if (!this.celestialActive) {
      return;
    }
    this.castTrackers.at(-1)!.totalEnvM += 1;

    const isInSoomWindow = this.soothingMistWindows.some(
      (window) => event.timestamp >= window.start && event.timestamp <= window.end,
    );
    if (!isInSoomWindow) {
      this.castTrackers.at(-1)!.envmOutsideSoom += 1;
    }
  }

  onSoothingMistCast(event: CastEvent) {
    const channelEndEvents = GetRelatedEvents(event, SOOTHING_MIST_CHANNEL_END);
    if (channelEndEvents.length > 0) {
      const endEvent = channelEndEvents[0] as RemoveBuffEvent;
      this.soothingMistWindows.push({
        start: event.timestamp,
        end: endEvent.timestamp,
      });

      if (this.celestialActive) {
        this.castTrackers.at(-1)!.soomWindows += 1;
      }
    }
  }

  handleSoothingBreath(event: HealEvent) {
    this.soothHealing += (event.amount || 0) + (event.absorbed || 0);
  }

  handleChiCocoon(event: AbsorbedEvent) {
    this.chiCocoonHealing += event.amount;
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT} />}
        value={`${formatPercentage(
          this.owner.getPercentageOfTotalHealingDone(this.totalHealing),
        )} %`}
      />
    );
  }

  get guideCastBreakdown() {
    const explanationPercent = 47.5;
    const explanation = (
      <>
        <p>
          <strong>
            <SpellLink spell={TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT} />
          </strong>
        </p>
        <p>
          Before casting <SpellLink spell={TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT} />,
          make sure that <SpellLink spell={this.currentRskTalent} /> is on cooldown, and make to
          sure cast{' '}
          {this.selectedCombatant.hasTalent(TALENTS_MONK.GIFT_OF_THE_CELESTIALS_TALENT) ? (
            <>at least one </>
          ) : (
            <>all </>
          )}{' '}
          <SpellLink spell={SPELLS.RENEWING_MIST_CAST} />
          (s) to prevent overcapping charges during Yulon's duration, and be sure to have at least 1
          proc of <SpellLink spell={TALENTS_MONK.SPIRITFONT_1_MISTWEAVER_TALENT} /> available.{' '}
        </p>
        <hr />
        <p>
          It is crucial to pair <SpellLink spell={TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT} /> with{' '}
          <SpellLink spell={TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT} /> for the several
          buffs that <SpellLink spell={TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT} /> provides,
          including:
        </p>
        <ol>
          <li>
            <SpellLink spell={TALENTS_MONK.SPIRITFONT_2_MISTWEAVER_TALENT} />
          </li>
          <li>
            <SpellLink spell={TALENTS_MONK.FLOWING_WISDOM_TALENT} /> via{' '}
            <SpellLink spell={TALENTS_MONK.HEART_OF_THE_JADE_SERPENT_TALENT} />
          </li>
          <li>
            <SpellLink spell={TALENTS_MONK.ZEN_PULSE_TALENT} /> via{' '}
            <SpellLink spell={TALENTS_MONK.DEEP_CLARITY_TALENT} />
          </li>
          <li>
            <SpellLink spell={TALENTS_MONK.SECRET_INFUSION_TALENT} />
          </li>
        </ol>
        <p>
          If <SpellLink spell={TALENTS_MONK.SECRET_INFUSION_TALENT} /> talented, use{' '}
          <SpellLink spell={TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT} /> with{' '}
          <SpellLink spell={SPELLS.RENEWING_MIST_CAST} /> for a multiplicative haste bonus
        </p>
        <hr />
        <p>
          Be sure to cast <SpellLink spell={this.currentRskTalent} /> before your first{' '}
          <SpellLink spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} /> and{' '}
          <SpellLink spell={TALENTS_MONK.RAPID_DIFFUSION_TALENT} />{' '}
          <SpellLink spell={SPELLS.RENEWING_MIST_CAST} /> falls off to extend their duration.
        </p>
        <hr />
        <p>
          Be sure to follow up your{' '}
          <SpellLink spell={TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT} /> with casts of{' '}
          <SpellLink spell={SPELLS.VIVIFY} /> to consume your{' '}
          <SpellLink spell={TALENTS_MONK.ZEN_PULSE_TALENT} /> with the highest amount of{' '}
          <SpellLink spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} />s and{' '}
          <SpellLink spell={SPELLS.RENEWING_MIST_CAST} />s possible.
        </p>
      </>
    );

    const data = (
      <div>
        <strong>Per-Cast Breakdown</strong>
        <small> - click to expand</small>
        {this.castTrackers.map((cast, ix) => {
          const header = (
            <>
              @ {this.owner.formatTimestamp(cast.timestamp)} &mdash;{' '}
              <SpellLink spell={TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT} />
            </>
          );
          const superList = super.getCooldownExpandableItems(cast);
          const allPerfs = superList[0];
          const checklistItems: CooldownExpandableItem[] = superList[1];

          // env inside of soom channel
          let soomPerf = QualitativePerformance.Fail;
          if (cast.envmOutsideSoom === 0 && cast.totalEnvM > 0) {
            soomPerf = QualitativePerformance.Good;
          } else if (cast.envmOutsideSoom < cast.totalEnvM) {
            soomPerf = QualitativePerformance.Ok;
          }
          allPerfs.splice(1, 0, soomPerf);
          checklistItems.splice(1, 0, {
            label: (
              <span style={{ paddingLeft: '1.5em' }}>
                <Arrow /> Cast during <SpellLink spell={TALENTS_MONK.SOOTHING_MIST_TALENT} />
              </span>
            ),
            result: <PerformanceMark perf={soomPerf} />,
            details: <>{cast.totalEnvM - cast.envmOutsideSoom}</>,
          });

          // rising mist check
          if (this.selectedCombatant.hasTalent(TALENTS_MONK.RISING_MIST_TALENT)) {
            const rval = this.getRskCastPerfAndItem(cast);
            allPerfs.push(rval[0]);
            checklistItems.push(rval[1]);
          }

          const avgPerf = getAveragePerf(allPerfs);
          return (
            <CooldownExpandable
              header={header}
              checklistItems={checklistItems}
              perf={avgPerf}
              key={ix}
            />
          );
        })}
      </div>
    );

    return explanationAndDataSubsection(explanation, data, explanationPercent);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.CORE(7)}
        size="flexible"
        tooltip={
          <>
            Healing Breakdown:
            <ul>
              <li>
                {formatNumber(this.soothHealing)} healing from{' '}
                <SpellLink spell={SPELLS.SOOTHING_BREATH} />.
              </li>
              <li>
                {formatNumber(this.chiCocoonHealing)}{' '}
                <SpellLink spell={SPELLS.CHI_COCOON_BUFF_YULON} /> healing from{' '}
                <SpellLink spell={TALENTS_MONK.CELESTIAL_HARMONY_TALENT} />.
              </li>
            </ul>
          </>
        }
      >
        <BoringValueText
          label={
            <>
              <SpellLink spell={TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT} /> and
              <SpellLink spell={TALENTS_MONK.CELESTIAL_HARMONY_TALENT} />
            </>
          }
        >
          <ItemHealingDone amount={this.totalHealing} />
        </BoringValueText>
      </Statistic>
    );
  }
}

export default InvokeYulon;
