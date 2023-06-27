
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import { Options } from 'parser/core/Analyzer';
import Events, { BeaconAppliedEvent, BeaconRemovedEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import BoringSpellValue from 'parser/ui/BoringSpellValue';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import BeaconAnalyzer from './BeaconAnalyzer';
import BeaconTargets from './BeaconTargets';

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

class BeaconUptime extends BeaconAnalyzer {
  static dependencies = {
    ...BeaconAnalyzer.dependencies,
    beaconTargets: BeaconTargets,
  };

  protected beaconTargets!: BeaconTargets;
  prepullSuggestion = true;

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.BeaconApplied, this.onApply);
    this.addEventListener(Events.BeaconRemoved, this.onRemove);
    this.addEventListener(Events.fightend, this.onEnd);

    if (this.selectedCombatant.hasTalent(TALENTS.BEACON_OF_VIRTUE_TALENT)) {
      this.prepullSuggestion = false;
    }
  }

  missingPrepull: { [buffId: number]: boolean } = {};

  fightStart = this.owner.fight.start_time;
  fightEnd = this.owner.fight.end_time;
  fightLength = this.fightEnd - this.fightStart;

  lastApplied: { [buffId: number]: number } = {};
  uptime: { [buffId: number]: number } = {};

  // BoL is placed on a new target before it is removed from old target
  // so if the count is 2 then it will not set missingBoL to true
  count = 0;

  get suggestionThresholdsBoLPrepull() {
    return {
      actual: !this.missingPrepull[SPELLS.BEACON_OF_LIGHT_CAST_AND_BUFF.id],
      isEqual: false,
      style: ThresholdStyle.BOOLEAN,
    };
  }

  get suggestionThresholdsBoLUptime() {
    return {
      actual: this.getUptime(SPELLS.BEACON_OF_LIGHT_CAST_AND_BUFF.id) / 100,
      isLessThan: {
        minor: 0.9,
        average: 0.9,
        major: 0.9,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get suggestionThresholdsBoFPrepull() {
    return {
      actual: !this.missingPrepull[TALENTS.BEACON_OF_FAITH_TALENT.id],
      isEqual: false,
      style: ThresholdStyle.BOOLEAN,
    };
  }

  get suggestionThresholdsBoFUptime() {
    return {
      actual: this.getUptime(TALENTS.BEACON_OF_FAITH_TALENT.id) / 100,
      isLessThan: {
        minor: 0.9,
        average: 0.9,
        major: 0.9,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get suggestionThresholdsBoVUptime() {
    return {
      actual: this.getUptime(TALENTS.BEACON_OF_VIRTUE_TALENT.id) / 100,
      isLessThan: {
        minor: 0.25,
        average: 0.15,
        major: 0.1,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  onApply(event: BeaconAppliedEvent) {
    const beaconId = event.trigger.ability.guid;
    if (this.lastApplied[beaconId] == null) {
      this.lastApplied[beaconId] = Math.max(event.timestamp, this.fightStart);
    }
  }

  onRemove(event: BeaconRemovedEvent) {
    const beaconId = event.trigger.ability.guid;
    const stillActive = this.beaconTargets.getNumBeaconTargetsForBeaconId(beaconId);
    if (stillActive === 0) {
      this.beaconRemoved(beaconId, event.timestamp);
    }
  }

  onEnd() {
    this.beaconBuffIds.forEach(
      (id) =>
        this.beaconTargets.getNumBeaconTargetsForBeaconId(id) > 0 &&
        this.beaconRemoved(id, this.fightEnd),
    );
  }

  beaconRemoved(beaconId: number, ts: number) {
    if (this.lastApplied[beaconId] == null) {
      this.error(`Beacon (${beaconId}) removed before apply`);
      return;
    }
    if (this.missingPrepull[beaconId] == null && ts > this.fightStart) {
      this.missingPrepull[beaconId] = this.lastApplied[beaconId] > this.fightStart;
    }
    this.uptime[beaconId] = (this.uptime[beaconId] ?? 0) + ts - this.lastApplied[beaconId];
    delete this.lastApplied[beaconId];
  }

  getUptime(beaconId: number) {
    if (beaconId in this.uptime) {
      return Math.round((this.uptime[beaconId] / this.fightLength) * 100);
    }
    return 0;
  }

  statistic() {
    //const boringSpellValueContainer = { display: 'flex', flexDirection: 'row' };
    const missingPrepullContainer = (
      <div style={{ color: 'red', margin: 'auto', textAlign: 'center' }}>
        <>
          Not
          <br />
          casted
          <br />
          prepull
        </>
      </div>
    );

    const getLabel = (beaconId: number): React.ReactNode => {
      switch (beaconId) {
        case SPELLS.BEACON_OF_LIGHT_CAST_AND_BUFF.id:
          return <>BoL Uptime</>;
        case TALENTS.BEACON_OF_FAITH_TALENT.id:
          return <>BoF Uptime</>;
        case TALENTS.BEACON_OF_VIRTUE_TALENT.id:
          return <>BoV Uptime</>;
      }
    };

    return (
      <Statistic position={STATISTIC_ORDER.CORE(60)} size="flexible">
        <label style={{ margin: '10px' }}>
          <>Beacon Uptime</>
        </label>

        {this.beaconBuffIds.map((beaconId) => {
          return (
            <div key={beaconId}>
              <BoringSpellValue
                spellId={beaconId}
                value={`${this.getUptime(beaconId)}%`}
                label={getLabel(beaconId)}
              ></BoringSpellValue>
              {this.prepullSuggestion && this.missingPrepull[beaconId] && missingPrepullContainer}
            </div>
          );
        })}
      </Statistic>
    );
  }
}

export default BeaconUptime;
