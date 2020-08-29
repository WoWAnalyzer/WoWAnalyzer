import React from 'react';
import { Trans } from '@lingui/macro';

import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Events from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValue from 'interface/statistics/components/BoringSpellValue';

/* ---------------------------- Log URLs for testing --------------------------

for DIVINE_PURPOSE testing (A):

    A1: 100% uptime with precast:
        https://www.warcraftlogs.com/reports/wgfFpV4zrckHdhYt#fight=4&type=auras&sourceclass=Any&target=1&ability=53563
        Results Expected: 100%, precasted BoL: true, precasted BoF: null
        Passed: true
    A2: < 100% uptime with precast:
        https://www.warcraftlogs.com/reports/wgfFpV4zrckHdhYt#fight=6&type=auras&source=1&by=target&ability=53563
        Results Expected: 92%, precasted BoL: true, precasted BoF: null
        passed: true
    A3: < 100% without precast:
        https://www.warcraftlogs.com/reports/MPFA4THXv6gmG1VD#fight=30&type=auras&source=3&by=target&ability=53563
        Results Expected: 88%, precasted BoL: true, precasted BoF: null
        Passed: true
    A4: 100% uptime with precast with BoL swap:
        https://www.warcraftlogs.com/reports/MPFA4THXv6gmG1VD#fight=12&type=auras&source=3&by=target&ability=53563
        Results Expected: 100%, precasted BoL: true, precasted BoF: null
        Passed: true
    A5: < 100% uptime with precast with BoL swap:
        https://www.warcraftlogs.com/reports/MPFA4THXv6gmG1VD#fight=12&type=auras&source=3&by=target&ability=53563
        Results Expected: 100%, precasted BoL: true, precasted BoF: null
        Passed: true
    A6: < 100% without precast with BoL swap:

        Results Expected: %, precasted BoL: , precasted BoF: null
        Passed:

for BEACON_OF_FAITH testing (B):

    BoF uptime (B1*):
        B11: 100% uptime with precast:
            https://www.warcraftlogs.com/reports/DPwyKpWBZ6F947mx/#fight=2&source=7&type=auras&by=target&ability=53563
            Results Expected: BoL uptime 100%, BoF uptime 100%, precasted BoL: true, precasted BoF: true
            Passed: true
        B12: < 100% uptime with precast:
            https://www.warcraftlogs.com/reports/DPwyKpWBZ6F947mx/#fight=13&source=7&type=auras&by=target&ability=156910
            Results Expected: BoL uptime 95%, BoF uptime 94%, precasted BoL: true, precasted BoF: true
            Passed: true
        B13: < 100% without precast:
            https://www.warcraftlogs.com/reports/DPwyKpWBZ6F947mx/#fight=10&source=7&type=auras&by=target&ability=156910
            Results Expected: BoL uptime 46%, BoF uptime 74%, precasted BoL: false, precasted BoF: false
            Passed: true
        B14: 100% uptime with precast with BoF swap:
            https://www.warcraftlogs.com/reports/DPwyKpWBZ6F947mx/#fight=11&source=7&type=auras&by=target&ability=156910
            Results Expected: BoL uptime 100%, BoF uptime 100%, precasted BoL: true, precasted BoF: true
            Passed: true
        B15: < 100% uptime with precast with BoF swap:
            https://www.warcraftlogs.com/reports/DPwyKpWBZ6F947mx/#fight=8&source=7&type=auras&by=target&ability=156910
            Results Expected: BoL uptime 100%, BoF uptime 82%, precasted BoL: true, precasted BoF: true
            Passed: true
        B16: < 100% without precast with BoF swap:
            https://www.warcraftlogs.com/reports/DPwyKpWBZ6F947mx/#fight=14&source=7&type=auras&by=target&ability=156910
            Results Expected: BoL uptime 73%, BoF uptime 99%, precasted BoL: false, precasted BoF: false
            Passed: true
    BoL uptime (B2*):
        B21: 100% uptime with precast:
            https://www.warcraftlogs.com/reports/DPwyKpWBZ6F947mx/#fight=2&source=7&type=auras&by=target&ability=53563
            Results Expected: BoL uptime 100%, BoF uptime 100%, precasted BoL: true, precasted BoF: true
            Passed: true
        B22: < 100% uptime with precast:
            https://www.warcraftlogs.com/reports/DPwyKpWBZ6F947mx/#fight=9&source=7&type=auras&by=target&ability=53563
            Results Expected: BoL uptime 83%, BoF uptime 90%, precasted BoL: true, precasted BoF: true
            Passed: true
        B23: < 100% without precast:
            https://www.warcraftlogs.com/reports/DPwyKpWBZ6F947mx/#fight=14&source=7&type=auras&by=target&ability=53563
            Results Expected: BoL uptime 73%, BoF uptime 99%, precasted BoL: false, precasted BoF: false
            Passed: true
        B24: 100% uptime with precast with BoL swap:
            https://www.warcraftlogs.com/reports/DPwyKpWBZ6F947mx/#fight=8&source=7&type=auras&by=target&ability=53563
            Results Expected: BoL uptime 100%, BoF uptime 82%, precasted BoL: true, precasted BoF: true
            Passed: true
        B25: < 100% uptime with precast with BoL swap:
            https://www.warcraftlogs.com/reports/DPwyKpWBZ6F947mx/#fight=19&source=7&type=auras&by=target&ability=53563
            Results Expected: BoL uptime 97%, BoF uptime 98%, precasted BoL: true, precasted BoF: true
            Passed: true
        B26: < 100% without precast with BoL swap:
            https://www.warcraftlogs.com/reports/DPwyKpWBZ6F947mx/#fight=10&source=7&type=auras&by=target&ability=53563
            Results Expected: BoL uptime 46%, BoF uptime 74%, precasted BoL: false, precasted BoF: false
            Passed: true

For Beacon of Virtue (C)
    C:
        https://www.warcraftlogs.com/reports/pW4kHGPwYKL8ryvm/#fight=1&source=14&type=auras&ability=200025
        Results Expected: 31%
        Passed: true


-----------------------------------------------------------------------------*/

class BeaconUptime extends Analyzer {
  constructor(...args) {
    super(...args);

    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER), this._onBuff);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER), this._offBuff);

    // Due to getBuffHistory for BoV, uptime is calculated at the end of the fight
    this.addEventListener(Events.fightend, this._endOfFight);

    // this is really has divine purpose talent
    this.hasBoL = this.selectedCombatant.hasTalent(SPELLS.DIVINE_PURPOSE_TALENT_HOLY.id);

    this.hasBoF = this.selectedCombatant.hasTalent(SPELLS.BEACON_OF_FAITH_TALENT.id);
    this.hasBoV = this.selectedCombatant.hasTalent(SPELLS.BEACON_OF_VIRTUE_TALENT.id);

    this.idBoL = SPELLS.BEACON_OF_LIGHT_CAST_AND_BUFF.id;
    this.idBoF = SPELLS.BEACON_OF_FAITH_TALENT.id;
    this.idBoV = SPELLS.BEACON_OF_VIRTUE_TALENT.id;

    this.BuffEventType = Object.freeze({
      REMOVEBUFF: 0,
      PREPULL: 1,
      POSTPULL: 2,
      UPDATE: 3,
      ENDOFFIGHT: 4,
    });
  }

  missingBoLPrepull = true;
  missingBoFPrepull = true;
  missingBoL = true;
  missingBoF = true;
  missingBoV = true;

  fightStart = this.owner.fight.start_time;
  fightEnd = this.owner.fight.end_time;
  fightLength = this.fightEnd - this.fightStart;

  lastBoLtimestamp = null;
  lastBoFtimestamp = null;
  lastBoVtimestamp = null;

  uptimeBoL = 0;
  uptimeBoF = 0;
  uptimeBoV = 0;

  // BoL is placed on a new target before it is removed from old target
  // so if the count is 2 then it will not set missingBoL to true
  countBoL = 0;
  countBoF = 0;

  get uptimeBoLPerc() {
    return Math.round((this.uptimeBoL / this.fightLength) * 100);
  }

  get uptimeBoFPerc() {
    return Math.round((this.uptimeBoF / this.fightLength) * 100);
  }

  get uptimeBoVPerc() {
    return Math.round((this.uptimeBoV / this.fightLength) * 100);
  }

  get suggestionThresholdsBoL() {
    return {
      actual: !this.missingBoLPrepull,
      isEqual: false,
      style: 'boolean',
    };
  }

  get suggestionThresholdsBoLUptime() {
    return {
      actual: this.uptimeBoLPerc / 100,
      isLessThan: {
        minor: 0.9,
        average: 0.8,
        major: 0.6,
      },
      style: 'percentage',
    };
  }

  get suggestionThresholdsBoF() {
    return {
      actual: !this.missingBoFPrepull,
      isEqual: false,
      style: 'boolean',
    };
  }

  get suggestionThresholdsBoFUptime() {
    return {
      actual: this.uptimeBoFPerc / 100,
      isLessThan: {
        minor: 0.9,
        average: 0.8,
        major: 0.6,
      },
      style: 'percentage',
    };
  }

  _updateBoL(event, type) {
    const { REMOVEBUFF, PREPULL, POSTPULL, UPDATE, ENDOFFIGHT } = this.BuffEventType;

    // buff removed
    if (type === REMOVEBUFF && this.countBoL < 2) {
      this.missingBoL = true;
      this.uptimeBoL += event.timestamp - this.lastBoLtimestamp;
      this.lastBoLtimestamp = event.timestamp;
      this.countBoL -= 1;
      return;
    }
    // checks for overlap of beacon application with beacon removal
    // should never be >2 but just in case
    if (type === REMOVEBUFF && this.countBoL >= 2) {
      this.countBoL -= 1;
      return;
    }
    //buff applied prepull
    if (type === PREPULL) {
      this.missingBoLPrepull = false;
      this.missingBoL = false;
      this.lastBoLtimestamp = this.fightStart;
      this.countBoL += 1;
      return;
    }
    // buff applied post pull, if death occurs and reapply happens before old buff goes away
    // wont override lastBoLtimestamp if countBoL > 0
    if (type === POSTPULL && this.countBoL === 0) {
      this.lastBoLtimestamp = event.timestamp;
      this.missingBoL = false;
      this.countBoL += 1;
      return;
    }
    // increases count without overriding lastBoLtimestamp to track double applications
    if (type === POSTPULL && this.countBoL > 0) {
      this.countBoL += 1;
      return;
    }
    //buff not changed but updated
    if (type === UPDATE || type === ENDOFFIGHT) {
      this.uptimeBoL += event.timestamp - this.lastBoLtimestamp;
      this.lastBoLtimestamp = event.timestamp;
      return;
    }
  }

  _updateBoF(event, type) {
    const { REMOVEBUFF, PREPULL, POSTPULL, UPDATE, ENDOFFIGHT } = this.BuffEventType;

    // buff removed
    if (type === REMOVEBUFF && this.countBoF < 2) {
      this.missingBoF = true;
      this.uptimeBoF += event.timestamp - this.lastBoFtimestamp;
      this.lastBoFtimestamp = event.timestamp;
      this.countBoF -= 1;
    }
    // checks for overlap of beacon application with beacon removal
    // should never be >2 but just in case
    if (type === REMOVEBUFF && this.countBoF >= 2) {
      this.countBoF -= 1;
      return;
    }
    // buff applied prepull
    if (type === PREPULL) {
      this.missingBoFPrepull = false;
      this.missingBoF = false;
      this.lastBoFtimestamp = this.fightStart;
      this.countBoF += 1;
      return;
    }
    // buff applied post pull, if death occurs and reapply happens before old buff goes away
    // wont override lastBoFtimestamp if countBoF > 0
    if (type === POSTPULL && this.countBoF === 0) {
      this.lastBoFtimestamp = event.timestamp;
      this.missingBoF = false;
      this.countBoF += 1;
      return;
    }
    // increases count without overriding lastBoFtimestamp to track double applications
    if (type === POSTPULL && this.countBoF > 0) {
      this.countBoF += 1;
      return;
    }
    //buff not changed but updated
    if (type === UPDATE || type === ENDOFFIGHT) {
      this.uptimeBoF += event.timestamp - this.lastBoFtimestamp;
      this.lastBoFtimestamp = event.timestamp;
      return;
    }
  }

  _handleBoLEvents(event) {
    const { POSTPULL, UPDATE, ENDOFFIGHT } = this.BuffEventType;

    // end of fight
    if (!event.ability && !this.missingBoL) {
      this._updateBoL(event, ENDOFFIGHT);
      return;
    }
    //post pull beacon of light cast
    if (event.ability !== undefined && event.ability.guid === this.idBoL) {
      this._updateBoL(event, POSTPULL);
      return;
    }

    //any buff even if it isn't BoL
    if (!this.missingBoL) {
      this._updateBoL(event, UPDATE);
      return;
    }
  }

  _handleBoFEvents(event) {
    const { POSTPULL, UPDATE, ENDOFFIGHT } = this.BuffEventType;

    // end of fight
    if (!event.ability && !this.missingBoF) {
      this._updateBoF(event, ENDOFFIGHT);
      return;
    }

    // post pull BoF buff applied
    if (event.ability && event.ability.guid === this.idBoF) {
      this._updateBoF(event, POSTPULL);
      return;
    }
    if (event.ability && event.ability.guid === this.idBoL) {
      this._updateBoL(event, POSTPULL);
      return;
    }
    // if both BoL and BoF are active
    if (!this.missingBoL && !this.missingBoF) {
      this._updateBoL(event, UPDATE);
      this._updateBoF(event, UPDATE);
      return;
    }
    // if BoF is active and BoL is not active
    if (!this.missingBoF && this.missingBoL) {
      this._updateBoF(event, UPDATE);
      return;
    }
    // if BoF is not active and BoL not active
    if (this.missingBoF && !this.missingBoL) {
      this._updateBoL(event, UPDATE);
      return;
    }
    // if BoF and BoL are not active do nothing
  }

  _handleBoVEvents() {
    const historyBoV = this.selectedCombatant.getBuffHistory(this.idBoV);
    historyBoV.forEach(event => {
      this.uptimeBoV += event.end - event.start;
    });
    return;
  }

  _endOfFight(event) {
    if (this.hasBoL) {
      this._handleBoLEvents(event);
      return;
    }

    if (this.hasBoF) {
      this._handleBoLEvents(event);
      this._handleBoFEvents(event);
      return;
    }

    if (this.hasBoV) {
      this._handleBoVEvents();
      return;
    }
  }

  _offBuff(event) {
    const { REMOVEBUFF } = this.BuffEventType;

    if (
      event.ability.guid !== this.idBoL &&
      event.ability.guid !== this.idBoF &&
      event.ability.guid !== this.idBoV
    ) {
      return;
    }

    if ((this.hasBoL || this.hasBoF) && event.ability.guid === this.idBoL) {
      this._updateBoL(event, REMOVEBUFF);
      return;
    }
    if (this.hasBoF && event.ability.guid === this.idBoF) {
      this._updateBoF(event, REMOVEBUFF);
      return;
    }
  }

  _onPrepull(event) {
    const { PREPULL } = this.BuffEventType;

    // prepull check for BoL active
    if (this.hasBoL && event.ability.guid === this.idBoL) {
      this._updateBoL(event, PREPULL);
      return;
    }

    // prepull check for BoF active
    if (this.hasBoF && event.ability.guid === this.idBoF) {
      this._updateBoF(event, PREPULL);
      return;
    }
    if (this.hasBoF && event.ability.guid === this.idBoL) {
      this._updateBoL(event, PREPULL);
      return;
    }
  }

  _onBuff(event) {
    if (
      event.ability.guid !== this.idBoL &&
      event.ability.guid !== this.idBoF &&
      event.ability.guid !== this.idBoV
    ) {
      return;
    }

    // prepull check
    if (event.prepull && event.timestamp <= this.fightStart) {
      this._onPrepull(event);
      return;
    }

    // all postpull checks

    if (this.hasBoL) {
      this._handleBoLEvents(event);
      return;
    }

    if (this.hasBoF) {
      this._handleBoFEvents(event);
      return;
    }
  }

  statistic() {
    const boringSpellValueContainer = { display: 'flex', flexDirection: 'row' };
    const missingPrepullContainer = (
      <div style={{ color: 'red', margin: 'auto', textAlign: 'center' }}>
        <Trans>
          Not
          <br />
          casted
          <br />
          prepull
        </Trans>
      </div>
    );

    return (
      <Statistic position={STATISTIC_ORDER.CORE(60)} size={'flexible'}>
        <label style={{ margin: '10px' }}>
          <Trans>Beacon Uptime</Trans>
        </label>

        {/*  adds a section for BoL stats if BoV talent is not taken */}
        {!this.hasBoV && (
          <div style={boringSpellValueContainer}>
            <BoringSpellValue
              spell={SPELLS.BEACON_OF_LIGHT_CAST_AND_BUFF}
              value={`${this.uptimeBoLPerc}%`}
              label={<Trans>BoL Uptime</Trans>}
            />
            {this.missingBoLPrepull && missingPrepullContainer}
          </div>
        )}

        {/* adds a section for BoF stats if BoF talent taken */}
        {this.hasBoF && (
          <div style={boringSpellValueContainer}>
            <BoringSpellValue
              spell={SPELLS.BEACON_OF_FAITH_TALENT}
              value={`${this.uptimeBoFPerc}%`}
              label={<Trans>BoF Uptime</Trans>}
            />

            {this.missingBoFPrepull && missingPrepullContainer}
          </div>
        )}

        {/* adds a section for BoV stats if BoV talent taken */}
        {this.hasBoV && (
          <div style={boringSpellValueContainer}>
            <BoringSpellValue
              spell={SPELLS.BEACON_OF_VIRTUE_TALENT}
              value={`${this.uptimeBoVPerc}%`}
              label={<Trans>BoV Uptime</Trans>}
            />
          </div>
        )}
      </Statistic>
    );
  }
}

export default BeaconUptime;
