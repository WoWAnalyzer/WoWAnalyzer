import { type ReactNode } from 'react';
import { formatOverhealing } from 'analysis/retail/druid/restoration/format';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
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

const SOTF_SPELLS = [SPELLS.REJUVENATION, SPELLS.REJUVENATION_GERMINATION, SPELLS.REGROWTH];

const REJUVENATION_HEALING_INCREASE = 0.6;
const REGROWTH_HEALING_INCREASE = 0.6;

const debug = false;

/**
 * **Soul of the Forest**
 * Spec Talent
 *
 * Swiftmend increases the healing of your next Regrowth or Rejuvenation by 60%.
 *
 * Guide cast analysis lives in Swiftmend (TFT-style per-cast sequence).
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
  sotfSpellInfo = {
    [SPELLS.REJUVENATION.id]: this.sotfRejuvInfo,
    [SPELLS.REJUVENATION_GERMINATION.id]: this.sotfRejuvInfo,
    [SPELLS.REGROWTH.id]: this.sotfRegrowthInfo,
  };

  lastTalliedSotF?: RemoveBuffEvent;
  lastBuffFromHardcast = false;
  wastedBuffs = 0;

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

  onSwiftmendCast(_event: CastEvent) {
    this.lastBuffFromHardcast = true;
  }

  /**
   * Updates tracking logic then true iff the given event benefits from SotF
   */
  onSotfConsume(event: ApplyBuffEvent | RefreshBuffEvent | HealEvent) {
    const sotf: RemoveBuffEvent | undefined = buffedBySotf(event);
    if (!sotf) {
      return;
    }

    const fromHardcast: boolean = isFromHardcast(event);
    const fromConvoke: boolean = isFromConvoke(event);

    const procInfo = this.sotfSpellInfo[event.ability.guid];
    if (!procInfo) {
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
      procInfo.attribution.overheal += calculateOverhealing(event, procInfo.boost);
    } else {
      this.hotTracker.addBoostFromApply(
        procInfo.attribution,
        procInfo.boost,
        event as ApplyBuffEvent,
      );
    }
  }

  onSotfRemove(event: RemoveBuffEvent | RefreshBuffEvent) {
    if (event.type === EventType.RefreshBuff) {
      if (this.lastBuffFromHardcast) {
        this.wastedBuffs += 1;
      }
      this.lastBuffFromHardcast = false;
      return;
    }

    const buffed = getSotfBuffs(event);
    const consumedByHardcastOrConvoke =
      buffed.length > 0 && (isFromHardcast(buffed[0]) || isFromConvoke(buffed[0]));
    if (!consumedByHardcastOrConvoke && !this.lastBuffFromHardcast) {
      // SotF procced and consumed entirely within Convoke - don't count it
      return;
    }

    if (buffed.length === 0) {
      this.wastedBuffs += 1;
    }
    this.lastBuffFromHardcast = false;
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

  get totalOverhealing() {
    return this.sotfRegrowthInfo.attribution.overheal + this.sotfRejuvInfo.attribution.overheal;
  }

  _spellReportLine(totalUses: number, hardcastUses: number, healing: number): ReactNode {
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
        position={STATISTIC_ORDER.OPTIONAL(6)}
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
            <strong>
              Overhealing: {formatOverhealing(this.totalOverhealing, this.totalHealing)}
            </strong>
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
