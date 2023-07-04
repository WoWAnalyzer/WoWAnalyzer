import {
  POWER_WORD_RADIANCE_ATONEMENT_DUR,
  POWER_WORD_SHIELD_ATONEMENT_DUR,
  RENEW_ATONEMENT_DUR,
  FLASH_HEAL_ATONEMENT_DUR,
} from 'analysis/retail/priest/discipline/constants';
import { formatThousands } from 'common/format';
import { TALENTS_PRIEST } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, HealEvent, RefreshBuffEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';

const EVANGELISM_BONUS_MS = 6000;

//Needed to count healing for the rare situations where atonement heal events happens at the exact moment it expires
const FAIL_SAFE_MS = 300;

class AtonementApplicatorBreakdown extends Analyzer {
  _powerWordShieldsCasts = [];
  _RenewsCasts = [];
  _flashHealsCasts = [];

  _castsApplyBuffsMap = new Map(); // Keys = Cast, Values = Atonement buff associated to the cast
  _lastRadianceCastTimestamp = 0; // Setting a dummy timestamp to 0

  _atonementHealingFromRenews = 0;
  _atonementHealingFromFlashHeals = 0;
  _atonementHealingFromPowerWordRadiances = 0;
  _atonementHealingFromPowerWordShields = 0;
  _prepullApplicatorHealing = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_PRIEST.EVANGELISM_TALENT),
      this.handleEvangelismCasts,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FLASH_HEAL),
      this.storeFlashHealsCasts,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_PRIEST.RENEW_TALENT),
      this.storeRenewsCasts,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.POWER_WORD_SHIELD),
      this.storePowerWordShieldsCasts,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.POWER_WORD_RADIANCE),
      this.storePowerWordRadiancesCastTimestamp,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.ATONEMENT_BUFF),
      this.assignAtonementBuffToApplicator,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.ATONEMENT_BUFF),
      this.assignAtonementBuffToApplicator,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ATONEMENT_HEAL_NON_CRIT),
      this.handleAtonementsHits,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ATONEMENT_HEAL_CRIT),
      this.handleAtonementsHits,
    );
  }

  storeFlashHealsCasts(event: CastEvent) {
    this._castsApplyBuffsMap.set(
      {
        event: event,
        applicatorId: SPELLS.FLASH_HEAL.id,
      },
      null,
    );
  }

  storeRenewsCasts(event: CastEvent) {
    this._castsApplyBuffsMap.set(
      {
        event: event,
        applicatorId: TALENTS_PRIEST.RENEW_TALENT.id,
      },
      null,
    );
  }

  storePowerWordShieldsCasts(event: CastEvent) {
    this._castsApplyBuffsMap.set(
      {
        event: event,
        applicatorId: SPELLS.POWER_WORD_SHIELD.id,
      },
      null,
    );
  }

  storePowerWordRadiancesCastTimestamp(event: CastEvent) {
    this._lastRadianceCastTimestamp = event.timestamp;
  }

  assignAtonementBuffToApplicator(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (event.__fabricated === true) {
      return;
    }

    if (event.timestamp === this._lastRadianceCastTimestamp) {
      // Power Word: Radiance

      //Set the wasRefreshed property of the old atonement on the same target to true
      //so we can stop attributing atonement healing to the old atonement
      if (event.type === 'refreshbuff') {
        this.setWasRefreshedProperty(event, true);
      }

      //Putting a custom event object for Radiances since there is only 1 cast for 5 buffs
      this._castsApplyBuffsMap.set(
        {
          event: {
            timestamp: this._lastRadianceCastTimestamp,
          },
          applicatorId: SPELLS.POWER_WORD_RADIANCE.id,
        },
        {
          applyBuff: event,
          atonementEvents: [],
          extendedByEvangelism: false,
          wasRefreshed: false,
        },
      );
    } else {
      //Shadow Mend and Power Word: Shield
      if (event.type === 'refreshbuff') {
        this.setWasRefreshedProperty(event, true);
      }

      //Get the latest cast with the corresponding targetID
      const playerWithAtonement = event.targetID;
      const reversedMapKeys = Array.from(this._castsApplyBuffsMap.keys()).slice().reverse();
      const mostRecentCastApplyBuff = reversedMapKeys.find(
        (cast) => cast.event && cast.event.targetID === playerWithAtonement,
      );
      if (mostRecentCastApplyBuff) {
        this._castsApplyBuffsMap.set(mostRecentCastApplyBuff, {
          applyBuff: event,
          atonementEvents: [],
          extendedByEvangelism: false,
          wasRefreshed: false,
        });
      }
    }
  }

  getAtonementDuration(cast: any) {
    let duration = 0;
    if (cast.applicatorId === SPELLS.POWER_WORD_RADIANCE.id) {
      duration += POWER_WORD_RADIANCE_ATONEMENT_DUR;
    } else if (cast.applicatorId === SPELLS.POWER_WORD_SHIELD.id) {
      duration += POWER_WORD_SHIELD_ATONEMENT_DUR;
    } else if (cast.applicatorId === SPELLS.FLASH_HEAL.id) {
      duration += FLASH_HEAL_ATONEMENT_DUR;
    } else if (cast.applicatorId === TALENTS_PRIEST.RENEW_TALENT.id) {
      duration += RENEW_ATONEMENT_DUR;
    }
    return duration + FAIL_SAFE_MS;
  }

  assignAtonementHit(cast: any, atonement: any, healEvent: HealEvent) {
    const lowerBound = atonement.applyBuff.timestamp;
    const upperBound =
      atonement.applyBuff.timestamp +
      (atonement.extendedByEvangelism ? EVANGELISM_BONUS_MS : 0) +
      this.getAtonementDuration(cast);
    if (
      healEvent.targetID === atonement.applyBuff.targetID &&
      healEvent.timestamp > lowerBound &&
      healEvent.timestamp < upperBound
    ) {
      if (!atonement.wasRefreshed) {
        atonement.atonementEvents.push(healEvent);
        return healEvent.amount;
      }
    }

    return 0;
  }

  handleAtonementsHits(event: HealEvent) {
    //Healing from atonements pre-applied before entering combat
    //will assume PW:S as the applicator since it's usually the most common one used pre-pull,
    const atonementBuffs = this._castsApplyBuffsMap.values();
    if (
      Array.from(atonementBuffs).find(
        (atonement) => atonement === null || atonement.applyBuff.targetID === event.targetID,
      ) === undefined
    ) {
      this._prepullApplicatorHealing += event.amount;
    }

    this._castsApplyBuffsMap.forEach((atonement, cast) => {
      //Sometimes an atonement heal event from the already active atonements happens after an applicator cast and before the next atonement buff is applied
      //so this null check is necessary
      if (atonement === null) {
        return;
      }

      if (cast.applicatorId === SPELLS.POWER_WORD_RADIANCE.id) {
        this._atonementHealingFromPowerWordRadiances += this.assignAtonementHit(
          cast,
          atonement,
          event,
        );
      } else if (cast.applicatorId === SPELLS.POWER_WORD_SHIELD.id) {
        this._atonementHealingFromPowerWordShields += this.assignAtonementHit(
          cast,
          atonement,
          event,
        );
      } else if (cast.applicatorId === SPELLS.FLASH_HEAL.id) {
        this._atonementHealingFromFlashHeals += this.assignAtonementHit(cast, atonement, event);
      } else if (cast.applicatorId === TALENTS_PRIEST.RENEW_TALENT.id) {
        this._atonementHealingFromRenews += this.assignAtonementHit(cast, atonement, event);
      }
    });
  }

  handleEvangelismCasts(event: CastEvent) {
    this._castsApplyBuffsMap.forEach((atonement, cast) => {
      if (atonement === null) {
        return;
      }

      if (cast.applicatorId === SPELLS.POWER_WORD_RADIANCE.id) {
        if (
          event.timestamp > atonement.applyBuff.timestamp &&
          event.timestamp < atonement.applyBuff.timestamp + POWER_WORD_RADIANCE_ATONEMENT_DUR
        ) {
          atonement.extendedByEvangelism = true;
        }
      } else if (cast.applicatorId === SPELLS.POWER_WORD_SHIELD.id) {
        if (
          event.timestamp > atonement.applyBuff.timestamp &&
          event.timestamp < atonement.applyBuff.timestamp + POWER_WORD_SHIELD_ATONEMENT_DUR
        ) {
          atonement.extendedByEvangelism = true;
        }
      } else if (cast.applicatorId === TALENTS_PRIEST.RENEW_TALENT.id) {
        if (
          event.timestamp > atonement.applyBuff.timestamp &&
          event.timestamp < atonement.applyBuff.timestamp + RENEW_ATONEMENT_DUR
        ) {
          atonement.extendedByEvangelism = true;
        }
      } else if (cast.applicatorId === SPELLS.FLASH_HEAL.id) {
        if (
          event.timestamp > atonement.applyBuff.timestamp &&
          event.timestamp < atonement.applyBuff.timestamp + FLASH_HEAL_ATONEMENT_DUR
        ) {
          atonement.extendedByEvangelism = true;
        }
      }
    });
  }

  setWasRefreshedProperty(applyBuffEvent: ApplyBuffEvent | RefreshBuffEvent, isRefreshed: boolean) {
    const playerWithAtonement = applyBuffEvent.targetID;
    const reversedMapKeys = Array.from(this._castsApplyBuffsMap.keys()).slice().reverse();

    const mostRecentCastApplyBuff = reversedMapKeys.find(
      (cast) => cast.event && cast.event.targetID === playerWithAtonement,
    );
    if (mostRecentCastApplyBuff) {
      const atonementBuff = this._castsApplyBuffsMap.get(mostRecentCastApplyBuff);
      if (atonementBuff !== null) {
        atonementBuff.wasRefreshed = isRefreshed;
      }
    }
  }

  renderAtonementApplicatorChart() {
    const items = [
      {
        color: '#fff',
        label: 'Power Word: Shield',
        spellId: SPELLS.POWER_WORD_SHIELD.id,
        value: this._atonementHealingFromPowerWordShields + this._prepullApplicatorHealing,
        valueTooltip: formatThousands(
          this._atonementHealingFromPowerWordShields + this._prepullApplicatorHealing,
        ),
      },
      {
        color: '#fcba03',
        label: 'Power Word: Radiance',
        spellId: SPELLS.POWER_WORD_RADIANCE.id,
        value: this._atonementHealingFromPowerWordRadiances,
        valueTooltip: formatThousands(this._atonementHealingFromPowerWordRadiances),
      },
      {
        color: '#0cd368',
        label: 'Renew',
        spellId: TALENTS_PRIEST.RENEW_TALENT.id,
        value: this._atonementHealingFromRenews,
        valueTooltip: formatThousands(this._atonementHealingFromRenews),
      },
      {
        color: '#fcd45e',
        label: 'Flash Heal',
        spellId: SPELLS.FLASH_HEAL.id,
        value: this._atonementHealingFromFlashHeals,
        valueTooltip: formatThousands(this._atonementHealingFromFlashHeals),
      },
    ];

    return <DonutChart items={items} />;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(20)}
        size="flexible"
        tooltip="The Atonement healing contributed by each Atonement applicator."
      >
        <div className="pad">
          <label>
            <SpellLink spell={SPELLS.ATONEMENT_BUFF}>Atonement</SpellLink> applicators breakdown
          </label>
          {this.renderAtonementApplicatorChart()}
        </div>
      </Statistic>
    );
  }
}

export default AtonementApplicatorBreakdown;
