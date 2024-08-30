import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  EventType,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { isFromHardcast } from 'analysis/retail/druid/restoration/normalizers/CastLinkNormalizer';
import {
  buffedBySotf,
  getSotfBuffs,
} from 'analysis/retail/druid/restoration/normalizers/SoulOfTheForestLinkNormalizer';
import HotTrackerRestoDruid from 'analysis/retail/druid/restoration/modules/core/hottracking/HotTrackerRestoDruid';
import { TALENTS_DRUID } from 'common/TALENTS';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import { isConvoking } from 'analysis/retail/druid/shared/spells/ConvokeSpirits';
import CastSummaryAndBreakdown from 'interface/guide/components/CastSummaryAndBreakdown';

const SOTF_SPELLS = [
  SPELLS.REJUVENATION,
  SPELLS.REJUVENATION_GERMINATION,
  SPELLS.WILD_GROWTH,
  SPELLS.REGROWTH,
];

const REJUVENATION_HEALING_INCREASE = 1.5;
const REGROWTH_HEALING_INCREASE = 1.5;
const WILD_GROWTH_HEALING_INCREASE = 0.5;

const debug = false;

/**
 * **Soul of the Forest**
 * Spec Talent Tier 6
 *
 * Swiftmend increases the healing of your next Regrowth or Rejuvenation by 150%,
 * or your next Wild Growth by 50%.
 */
class SoulOfTheForest extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerRestoDruid,
  };

  hotTracker!: HotTrackerRestoDruid;

  sotfRejuvInfo = {
    boost: REJUVENATION_HEALING_INCREASE,
    attribution: HotTrackerRestoDruid.getNewAttribution('SotF Rejuvenation'),
    hardcastUses: 0,
    convokeUses: 0,
  };
  sotfRegrowthInfo = {
    boost: REGROWTH_HEALING_INCREASE,
    attribution: HotTrackerRestoDruid.getNewAttribution('SotF Regrowth'),
    hardcastUses: 0,
    convokeUses: 0,
  };
  sotfWgInfo = {
    boost: WILD_GROWTH_HEALING_INCREASE,
    attribution: HotTrackerRestoDruid.getNewAttribution('SotF Wild Growth'),
    hardcastUses: 0,
    convokeUses: 0,
  };
  sotfSpellInfo = {
    [SPELLS.REJUVENATION.id]: this.sotfRejuvInfo,
    [SPELLS.REJUVENATION_GERMINATION.id]: this.sotfRejuvInfo,
    [SPELLS.REGROWTH.id]: this.sotfRegrowthInfo,
    [SPELLS.WILD_GROWTH.id]: this.sotfWgInfo,
  };

  lastTalliedSotF?: RemoveBuffEvent;
  lastBuffFromHardcast: boolean = false;

  /** Box row entry for SotF use */
  useEntries: BoxRowEntry[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(
      TALENTS_DRUID.SOUL_OF_THE_FOREST_RESTORATION_TALENT,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.SOUL_OF_THE_FOREST_BUFF),
      this.onSotfRemove,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.SOUL_OF_THE_FOREST_BUFF),
      this.onSotfRemove,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SWIFTMEND),
      this.onSwiftmendCast,
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SOTF_SPELLS),
      this.onSotfConsume,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SOTF_SPELLS),
      this.onSotfConsume,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH),
      this.onSotfConsume,
    );
  }

  onSwiftmendCast(event: CastEvent) {
    this.lastBuffFromHardcast = true;
  }

  /**
   * Updates tracking logic then true iff the given event benefits from SotF
   */
  onSotfConsume(event: ApplyBuffEvent | RefreshBuffEvent | HealEvent) {
    // check if buffed (link from normalizer)
    const sotf: RemoveBuffEvent | undefined = buffedBySotf(event);
    if (!sotf) {
      return;
    }

    // check source
    const fromHardcast: boolean = isFromHardcast(event);
    const fromConvoke: boolean = !fromHardcast && isConvoking(this.selectedCombatant);

    // tally healing
    const procInfo = this.sotfSpellInfo[event.ability.guid];
    if (!procInfo) {
      // should be impossible
      console.error("Couldn't find spell info for SotF event!", event);
      return;
    }

    if (!this.lastTalliedSotF || this.lastTalliedSotF.timestamp !== sotf.timestamp) {
      this.lastTalliedSotF = sotf;
      if (fromHardcast) {
        procInfo.hardcastUses += 1;
        debug &&
          console.log(
            'New HARDCAST ' +
              procInfo.attribution.name +
              ' @ ' +
              this.owner.formatTimestamp(event.timestamp, 1),
          );
      } else if (fromConvoke) {
        procInfo.convokeUses += 1;
        debug &&
          console.log(
            'New CONVOKE ' +
              procInfo.attribution.name +
              ' @ ' +
              this.owner.formatTimestamp(event.timestamp, 1),
          );
      } else {
        console.warn(
          procInfo.attribution.name +
            ' @ ' +
            this.owner.formatTimestamp(event.timestamp, 1) +
            ' not from hardcast or convoke??',
        );
      }
    }

    if (event.type === EventType.Heal) {
      procInfo.attribution.healing += calculateEffectiveHealing(event, procInfo.boost);
    } else {
      this.hotTracker.addBoostFromApply(
        procInfo.attribution,
        procInfo.boost,
        event as ApplyBuffEvent,
      );
    }
  }

  onSotfRemove(event: RemoveBuffEvent | RefreshBuffEvent) {
    // Text to show in tooltip for this SotF usage. Won't be filled for Convoke generated ones!
    let useText: React.ReactNode;
    let value: QualitativePerformance = QualitativePerformance.Fail;

    if (event.type === EventType.RefreshBuff) {
      if (this.lastBuffFromHardcast) {
        useText = 'Overwritten';
        value = QualitativePerformance.Fail;
      }
      this.lastBuffFromHardcast = false;
    } else {
      const buffed = getSotfBuffs(event);
      if (buffed.length === 0) {
        useText = 'Expired';
        value = QualitativePerformance.Fail;
      } else {
        if (!isFromHardcast(buffed[0]) && !this.lastBuffFromHardcast) {
          // SM during Convoke also consumed during Convoke - don't count it
          return;
        }

        // even if generated during Convoke, we count it if consumed by hardcast
        const firstGuid = buffed[0].ability.guid;
        if (
          firstGuid === SPELLS.REJUVENATION.id ||
          firstGuid === SPELLS.REJUVENATION_GERMINATION.id
        ) {
          useText = <SpellLink spell={SPELLS.REJUVENATION} />;
          value = QualitativePerformance.Ok;
        } else if (firstGuid === SPELLS.REGROWTH.id) {
          useText = <SpellLink spell={SPELLS.REGROWTH} />;
          value = QualitativePerformance.Ok;
        } else if (firstGuid === SPELLS.WILD_GROWTH.id) {
          useText = <SpellLink spell={SPELLS.WILD_GROWTH} />;
          value = QualitativePerformance.Good;
        } else {
          console.warn('SOTF reported as consumed by unexpected spell ID: ' + firstGuid);
        }
      }
      this.lastBuffFromHardcast = false;
    }

    // fill in box entry if needed
    if (useText !== undefined) {
      const tooltip = (
        <>
          @ <strong>{this.owner.formatTimestamp(event.timestamp)}</strong> -{' '}
          <strong>{useText}</strong>
        </>
      );
      this.useEntries.push({ value, tooltip });
    }
  }

  get rejuvHardcastUses() {
    return this.sotfRejuvInfo.hardcastUses;
  }

  get regrowthHardcastUses() {
    return this.sotfRegrowthInfo.hardcastUses;
  }

  get wgHardcastUses() {
    return this.sotfWgInfo.hardcastUses;
  }

  get rejuvConvokeUses() {
    return this.sotfRejuvInfo.convokeUses;
  }

  get regrowthConvokeUses() {
    return this.sotfRegrowthInfo.convokeUses;
  }

  get wgConvokeUses() {
    return this.sotfWgInfo.convokeUses;
  }

  get rejuvTotalUses() {
    return this.rejuvHardcastUses + this.rejuvConvokeUses;
  }

  get regrowthTotalUses() {
    return this.regrowthHardcastUses + this.regrowthConvokeUses;
  }

  get wgTotalUses() {
    return this.wgHardcastUses + this.wgConvokeUses;
  }

  get totalUses() {
    return this.rejuvTotalUses + this.regrowthTotalUses + this.wgTotalUses;
  }

  get totalHealing() {
    return (
      this.sotfWgInfo.attribution.healing +
      this.sotfRegrowthInfo.attribution.healing +
      this.sotfRejuvInfo.attribution.healing
    );
  }

  /** Guide subsection describing the proper usage of Soul of the Forest */
  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={TALENTS_DRUID.SOUL_OF_THE_FOREST_RESTORATION_TALENT} />
        </strong>{' '}
        procs are highest value consumed with <SpellLink spell={SPELLS.WILD_GROWTH} />, but{' '}
        <SpellLink spell={SPELLS.REJUVENATION} /> or <SpellLink spell={SPELLS.REGROWTH} /> are
        acceptable when one target needs big healing.{' '}
        {this.selectedCombatant.hasTalent(TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT) && (
          <>
            <SpellLink spell={SPELLS.CONVOKE_SPIRITS} /> can overwrite procs - always use your proc
            before casting Convoke. Never let a proc expire.
          </>
        )}
      </p>
    );

    const data = (
      <div>
        <CastSummaryAndBreakdown
          spell={TALENTS_DRUID.SOUL_OF_THE_FOREST_RESTORATION_TALENT}
          castEntries={this.useEntries}
          usesInsteadOfCasts
          goodExtraExplanation={<>used on Wild Growth</>}
          okExtraExplanation={<>used on Rejuvenation or Regrowth</>}
          badExtraExplanation={<>proc expired or was overwritten</>}
        />
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  _spellReportLine(totalUses: number, hardcastUses: number, healing: number): React.ReactNode {
    return this.selectedCombatant.hasTalent(TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT) ? (
      <>
        {' '}
        consumed <strong>{hardcastUses}</strong> hardcast /{' '}
        <strong>{totalUses - hardcastUses}</strong> convoke :{' '}
        <strong>{formatPercentage(this.owner.getPercentageOfTotalHealingDone(healing), 1)}%</strong>{' '}
        healing
      </>
    ) : (
      <>
        {' '}
        consumed <strong>{totalUses}</strong> procs :{' '}
        <strong>{formatPercentage(this.owner.getPercentageOfTotalHealingDone(healing), 1)}%</strong>{' '}
        healing
      </>
    );
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(6)} // number based on talent row
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            You used <strong>{this.totalUses}</strong> Soul of the Forest procs.
            <ul>
              <li>
                <SpellLink spell={SPELLS.REJUVENATION} />
                {this._spellReportLine(
                  this.rejuvTotalUses,
                  this.rejuvHardcastUses,
                  this.sotfRejuvInfo.attribution.healing,
                )}
              </li>
              <li>
                <SpellLink spell={SPELLS.REGROWTH} />
                {this._spellReportLine(
                  this.regrowthTotalUses,
                  this.regrowthHardcastUses,
                  this.sotfRegrowthInfo.attribution.healing,
                )}
              </li>
              <li>
                <SpellLink spell={SPELLS.WILD_GROWTH} />
                {this._spellReportLine(
                  this.wgTotalUses,
                  this.wgHardcastUses,
                  this.sotfWgInfo.attribution.healing,
                )}
              </li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.SOUL_OF_THE_FOREST_RESTORATION_TALENT}>
          <ItemPercentHealingDone amount={this.totalHealing} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SoulOfTheForest;
