import type { JSX } from 'react';
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

import {
  isFromConvoke,
  isFromHardcast,
} from 'analysis/retail/druid/restoration/normalizers/CastLinkNormalizer';
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
import PowerOfTheArchdruid from 'analysis/retail/druid/restoration/modules/spells/PowerOfTheArchdruid';

const SOTF_SPELLS = [SPELLS.REJUVENATION, SPELLS.REJUVENATION_GERMINATION, SPELLS.REGROWTH];

const REJUVENATION_HEALING_INCREASE = 0.6;
const REGROWTH_HEALING_INCREASE = 0.6;

const debug = false;

/**
 * **Soul of the Forest**
 * Spec Talent Tier 4
 *
 * Swiftmend increases the healing of your next Regrowth or Rejuvenation by 60%,
 */
class SoulOfTheForest extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerRestoDruid,
    powerOfTheArchdruid: PowerOfTheArchdruid,
  };

  hotTracker!: HotTrackerRestoDruid;
  powerOfTheArchdruid!: PowerOfTheArchdruid;

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
  sotfSpellInfo = {
    [SPELLS.REJUVENATION.id]: this.sotfRejuvInfo,
    [SPELLS.REJUVENATION_GERMINATION.id]: this.sotfRejuvInfo,
    [SPELLS.REGROWTH.id]: this.sotfRegrowthInfo,
  };

  lastTalliedSotF?: RemoveBuffEvent;
  lastBuffFromHardcast = false;
  wastedBuffs = 0;

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
    const fromConvoke: boolean = isFromConvoke(event);

    // tally healing
    const procInfo = this.sotfSpellInfo[event.ability.guid];
    if (!procInfo) {
      // should be impossible
      console.error("SoTF: Couldn't find spell info for SotF event!", event);
      return;
    }

    if (!this.lastTalliedSotF || this.lastTalliedSotF.timestamp !== sotf.timestamp) {
      this.lastTalliedSotF = sotf;
      if (fromHardcast) {
        procInfo.hardcastUses += 1;
        debug &&
          console.log(
            'SoTF: New HARDCAST ' +
              procInfo.attribution.name +
              ' @ ' +
              this.owner.formatTimestamp(event.timestamp, 1),
          );
      } else if (fromConvoke) {
        procInfo.convokeUses += 1;
        debug &&
          console.log(
            'SoTF: New CONVOKE ' +
              procInfo.attribution.name +
              ' @ ' +
              this.owner.formatTimestamp(event.timestamp, 1),
          );
      } else {
        console.warn(
          'SoTF: ' +
            event.ability.guid +
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
        this.wastedBuffs += 1;
      } else {
        if (!isFromHardcast(buffed[0]) && !isFromConvoke(buffed[0]) && !this.lastBuffFromHardcast) {
          // SM during Convoke also consumed during Convoke - don't count it
          return;
        }

        // even if generated during Convoke, we count it if consumed by hardcast
        const firstGuid = buffed[0].ability.guid;
        const hasPota = this.selectedCombatant.hasTalent(
          TALENTS_DRUID.POWER_OF_THE_ARCHDRUID_TALENT,
        );
        const incompletePota =
          hasPota &&
          isFromHardcast(buffed[0]) &&
          this.powerOfTheArchdruid.isIncompleteHardcastProcAt(event.timestamp);
        if (
          firstGuid === SPELLS.REJUVENATION.id ||
          firstGuid === SPELLS.REJUVENATION_GERMINATION.id
        ) {
          if (incompletePota) {
            useText = (
              <>
                <SpellLink spell={SPELLS.REJUVENATION} /> - fewer than 2{' '}
                <SpellLink spell={TALENTS_DRUID.POWER_OF_THE_ARCHDRUID_TALENT} /> extra HoTs
              </>
            );
            value = QualitativePerformance.Fail;
          } else {
            useText = <SpellLink spell={SPELLS.REJUVENATION} />;
            value = QualitativePerformance.Good;
          }
        } else if (firstGuid === SPELLS.REGROWTH.id) {
          if (incompletePota) {
            useText = (
              <>
                <SpellLink spell={SPELLS.REGROWTH} /> - fewer than 2{' '}
                <SpellLink spell={TALENTS_DRUID.POWER_OF_THE_ARCHDRUID_TALENT} /> extra HoTs
              </>
            );
            value = QualitativePerformance.Fail;
          } else {
            useText = <SpellLink spell={SPELLS.REGROWTH} />;
            value = QualitativePerformance.Good;
          }
        } else {
          console.warn('SoTF: SOTF reported as consumed by unexpected spell ID: ' + firstGuid);
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

  get rejuvConvokeUses() {
    return this.sotfRejuvInfo.convokeUses;
  }

  get regrowthConvokeUses() {
    return this.sotfRegrowthInfo.convokeUses;
  }

  get rejuvTotalUses() {
    return this.rejuvHardcastUses + this.rejuvConvokeUses;
  }

  get regrowthTotalUses() {
    return this.regrowthHardcastUses + this.regrowthConvokeUses;
  }

  get totalUses() {
    return this.rejuvTotalUses + this.regrowthTotalUses;
  }

  get totalHealing() {
    return this.sotfRegrowthInfo.attribution.healing + this.sotfRejuvInfo.attribution.healing;
  }

  /** Guide subsection describing the proper usage of Soul of the Forest */
  get guideSubsection(): JSX.Element {
    const hasPota = this.selectedCombatant.hasTalent(TALENTS_DRUID.POWER_OF_THE_ARCHDRUID_TALENT);

    const explanation = (
      <p>
        <strong>
          <SpellLink spell={TALENTS_DRUID.SOUL_OF_THE_FOREST_RESTORATION_TALENT} />
        </strong>{' '}
        procs should be consumed with <SpellLink spell={SPELLS.REJUVENATION} /> or{' '}
        <SpellLink spell={SPELLS.REGROWTH} />.{' '}
        {this.selectedCombatant.hasTalent(TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT) && (
          <>
            <SpellLink spell={SPELLS.CONVOKE_SPIRITS} /> can overwrite procs - always use your proc
            before casting Convoke. Never let a proc expire.
          </>
        )}
        {hasPota && (
          <>
            {' '}
            With <SpellLink spell={TALENTS_DRUID.POWER_OF_THE_ARCHDRUID_TALENT} />, make sure your
            target is within 20 yards of at least 2 other allies when consuming a proc.
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
          goodExtraExplanation={<>used on Rejuvenation or Regrowth</>}
          badExtraExplanation={
            hasPota ? (
              <>
                proc expired, was overwritten, or created less than 2 extra HoTs from Power of the
                Archdruid
              </>
            ) : (
              <>proc expired or was overwritten</>
            )
          }
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
            <br />
            Wasted (expired): <strong>{this.wastedBuffs}</strong>
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
            </ul>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.SOUL_OF_THE_FOREST_RESTORATION_TALENT}>
          <ItemPercentHealingDone amount={this.totalHealing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SoulOfTheForest;
