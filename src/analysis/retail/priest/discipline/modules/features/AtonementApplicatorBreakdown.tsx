import {
  FLASH_HEAL_ATONEMENT_DUR,
  PENANCE_ATONEMENT_DUR,
  PLEA_ATONEMENT_DUR,
  POWER_WORD_RADIANCE_ATONEMENT_DUR,
  POWER_WORD_SHIELD_ATONEMENT_DUR,
} from 'analysis/retail/priest/discipline/constants';
import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, HealEvent, RefreshBuffEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';
import { TALENTS_PRIEST } from 'common/TALENTS';

// Needed to count healing for the rare situations where atonement heal events happens at the exact moment it expires
const FAIL_SAFE_MS = 300;

class AtonementApplicatorBreakdown extends Analyzer {
  _castsApplyBuffsMap = new Map(); // Keys = Cast, Values = Atonement buff associated to the cast
  _lastRadianceCastTimestamp = 0; // Setting a dummy timestamp to 0

  _atonementHealingFromRadiances = 0;
  _atonementHealingFromShields = 0;
  _atonementHealingFromFlashHeals = 0;
  _atonementHealingFromPleas = 0;
  _atonementHealingFromPenances = 0;
  _prepullApplicatorHealing = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_PRIEST.POWER_WORD_RADIANCE_TALENT),
      this.storeRadianceCastTimestamps,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.POWER_WORD_SHIELD),
      this.storeShieldCasts,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FLASH_HEAL),
      this.storeFlashHealCasts,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.PLEA), this.storePleaCasts);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.PENANCE_CAST),
      this.storePenanceCasts,
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
      this.handleAtonementHits,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ATONEMENT_HEAL_CRIT),
      this.handleAtonementHits,
    );
  }

  storeRadianceCastTimestamps(event: CastEvent) {
    this._lastRadianceCastTimestamp = event.timestamp;
  }

  storeShieldCasts(event: CastEvent) {
    this._castsApplyBuffsMap.set(
      {
        event: event,
        applicatorId: SPELLS.POWER_WORD_SHIELD.id,
      },
      null,
    );
  }

  storeFlashHealCasts(event: CastEvent) {
    this._castsApplyBuffsMap.set(
      {
        event: event,
        applicatorId: SPELLS.FLASH_HEAL.id,
      },
      null,
    );
  }

  storePleaCasts(event: CastEvent) {
    this._castsApplyBuffsMap.set(
      {
        event: event,
        applicatorId: SPELLS.PLEA.id,
      },
      null,
    );
  }

  storePenanceCasts(event: CastEvent) {
    this._castsApplyBuffsMap.set(
      {
        event: event,
        applicatorId: SPELLS.PENANCE_CAST.id,
      },
      null,
    );
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
          applicatorId: TALENTS_PRIEST.POWER_WORD_RADIANCE_TALENT.id,
        },
        {
          applyBuff: event,
          atonementEvents: [],
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
          wasRefreshed: false,
        });
      }
    }
  }

  getAtonementDuration(cast: any) {
    let duration = 0;
    if (cast.applicatorId === TALENTS_PRIEST.POWER_WORD_RADIANCE_TALENT.id) {
      duration += POWER_WORD_RADIANCE_ATONEMENT_DUR;
    } else if (cast.applicatorId === SPELLS.POWER_WORD_SHIELD.id) {
      duration += POWER_WORD_SHIELD_ATONEMENT_DUR;
    } else if (cast.applicatorId === SPELLS.FLASH_HEAL.id) {
      duration += FLASH_HEAL_ATONEMENT_DUR;
    } else if (cast.applicatorId === SPELLS.PLEA.id) {
      duration += PLEA_ATONEMENT_DUR;
    } else if (cast.applicatorId === SPELLS.PENANCE_CAST.id) {
      duration += PENANCE_ATONEMENT_DUR;
    }
    return duration + FAIL_SAFE_MS;
  }

  assignAtonementHit(cast: any, atonement: any, healEvent: HealEvent) {
    const lowerBound = atonement.applyBuff.timestamp;
    const upperBound = atonement.applyBuff.timestamp + this.getAtonementDuration(cast);
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

  handleAtonementHits(event: HealEvent) {
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

      if (cast.applicatorId === TALENTS_PRIEST.POWER_WORD_RADIANCE_TALENT.id) {
        this._atonementHealingFromRadiances += this.assignAtonementHit(cast, atonement, event);
      } else if (cast.applicatorId === SPELLS.POWER_WORD_SHIELD.id) {
        this._atonementHealingFromShields += this.assignAtonementHit(cast, atonement, event);
      } else if (cast.applicatorId === SPELLS.FLASH_HEAL.id) {
        this._atonementHealingFromFlashHeals += this.assignAtonementHit(cast, atonement, event);
      } else if (cast.applicatorId === SPELLS.PLEA.id) {
        this._atonementHealingFromPleas += this.assignAtonementHit(cast, atonement, event);
      } else if (cast.applicatorId === SPELLS.PENANCE_CAST.id) {
        this._atonementHealingFromPenances += this.assignAtonementHit(cast, atonement, event);
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
        color: '#e69f00',
        label: 'Power Word: Radiance',
        spellId: TALENTS_PRIEST.POWER_WORD_RADIANCE_TALENT.id,
        value: this._atonementHealingFromRadiances,
        valueTooltip: formatThousands(this._atonementHealingFromRadiances),
      },
      {
        color: '#fff',
        label: 'Power Word: Shield',
        spellId: SPELLS.POWER_WORD_SHIELD.id,
        value: this._atonementHealingFromShields + this._prepullApplicatorHealing,
        valueTooltip: formatThousands(
          this._atonementHealingFromShields + this._prepullApplicatorHealing,
        ),
      },
      {
        color: '#cc79a7',
        label: 'Flash Heal',
        spellId: SPELLS.FLASH_HEAL.id,
        value: this._atonementHealingFromFlashHeals,
        valueTooltip: formatThousands(this._atonementHealingFromFlashHeals),
      },
      {
        color: '#56b4e9',
        label: 'Plea',
        spellId: SPELLS.PLEA.id,
        value: this._atonementHealingFromPleas,
        valueTooltip: formatThousands(this._atonementHealingFromPleas),
      },
      {
        color: '#009e73',
        label: 'Penance',
        spellId: SPELLS.PENANCE_CAST.id,
        value: this._atonementHealingFromPenances,
        valueTooltip: formatThousands(this._atonementHealingFromPenances),
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
