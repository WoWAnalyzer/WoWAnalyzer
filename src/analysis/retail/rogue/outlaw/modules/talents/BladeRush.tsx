import RESOURCE_TYPES, { getResource } from 'game/RESOURCE_TYPES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  ResourceChangeEvent,
  UpdateSpellUsableEvent,
  UpdateSpellUsableType,
} from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import TALENTS from 'common/TALENTS/rogue';
import { BadColor, GoodColor } from 'interface/guide';
import DonutChart from 'parser/ui/DonutChart';
import { SpellLink } from 'interface';
import { RoundedPanel, SideBySidePanels } from 'interface/guide/components/GuideDivs';
import { Uptime } from 'parser/ui/UptimeBar';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

const MIN_ENERGY_TRESHOLD = 70;
const MAX_ENERGY_TRESHOLD = 90;
const ACCEPTABLE_ENERGY_TRESHOLD = 80;


//-- TODO: MAX_ENERGY_TRESHOLD should scale with targets hit to support aoe fights
// Not entirely sure if this is the optimal way to display this information, will have to come back to this

class BladeRush extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    spellUsable: SpellUsable,
  };

  protected abilities!: Abilities;
  protected spellUsable!: SpellUsable;

  lastTimeStamp: number = 0;
  timeSpentUnderTreshold: number = 0;

  castsTotal: number = 0;
  castsOverEnergyTreshold: number = 0;

  timestampFromCD: number = 0;
  totalTimeOffCD: number = 0;
  isFirstCast: boolean = true;

  unusableUptimes: Uptime[] = [];
  isInUsablePeriod: boolean = false;
  castEntries: BoxRowEntry[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.BLADE_RUSH_TALENT);

    this.addEventListener(Events.resourcechange.by(SELECTED_PLAYER), this.onResourceChange);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.BLADE_RUSH_TALENT),
      this.onBladeRush,
    );

    this.addEventListener(
      Events.UpdateSpellUsable.by(SELECTED_PLAYER).spell(TALENTS.BLADE_RUSH_TALENT),
      this.onBladeRushUsable,
    );
    
    this.unusableUptimes.push({
      start: this.owner.fight.start_time,
      end: -1,
    });
  }

  endUsablePeriod(timestamp: number) {
    if(this.isInUsablePeriod)
    {
      this.isInUsablePeriod = false;
      this.unusableUptimes.push({
        start: timestamp,
        end: -1,
      });
    }
  }

  startUsablePeriod(timestamp: number) {
    if(!this.isInUsablePeriod)
    {
      this.isInUsablePeriod = true;
      this.unusableUptimes.at(-1)!.end = timestamp;
    }
  }

  // Count total BR casts and casts over energy treshold
  protected onBladeRush(event: CastEvent) {
    let value = QualitativePerformance.Good;
    const energy = getResource(event.classResources, RESOURCE_TYPES.ENERGY.id);
    const tooltip = (
      <>
        Cast @ {this.owner.formatTimestamp(event.timestamp)}: You cast 
        <SpellLink id={TALENTS.BLADE_RUSH_TALENT}/> at {energy!.amount} energy
      </>
    );

    this.castsTotal += 1;

    if (energy!.amount > MAX_ENERGY_TRESHOLD) {
      this.castsOverEnergyTreshold += 1;
      value = QualitativePerformance.Fail;
    }
    else if(energy!.amount > ACCEPTABLE_ENERGY_TRESHOLD){
      this.castsOverEnergyTreshold += 1;
      value = QualitativePerformance.Ok;
    }
    this.castEntries.push({ value, tooltip });
  }

  // Count time spent under MIN_ENERGY_TRESHOLD with BR off cd
  protected onResourceChange(event: ResourceChangeEvent) {
    const energy = getResource(event.classResources, RESOURCE_TYPES.ENERGY.id);
    const energyAmount = energy?.amount;
    if (!energy || !energyAmount) {
      return;
    }

    if (this.spellUsable.isOnCooldown(TALENTS.BLADE_RUSH_TALENT.id)) {
      this.lastTimeStamp = 0;
      return;
    }

    if (energyAmount <= MIN_ENERGY_TRESHOLD) {
      if (this.lastTimeStamp !== 0) {
        this.timeSpentUnderTreshold += event.timestamp - this.lastTimeStamp;
      }
      this.lastTimeStamp = event.timestamp;

      this.startUsablePeriod(event.timestamp);
      
    } else {
      this.endUsablePeriod(event.timestamp);
      this.lastTimeStamp = 0;
    }
  }

  // Count blade rush time spent off cd
  onBladeRushUsable(event: UpdateSpellUsableEvent) {
    switch (event.updateType) {
      case UpdateSpellUsableType.BeginCooldown: {
        if (!this.isFirstCast) {
          this.totalTimeOffCD += event.timestamp - this.timestampFromCD;
        } else {
          this.isFirstCast = false;
        }
        this.endUsablePeriod(event.timestamp);

        break;
      }

      case UpdateSpellUsableType.EndCooldown: {
        this.timestampFromCD = event.timestamp;
        break;
      }
    }
  }

  get castsChart() {
    const items = [
      {
        color: GoodColor,
        label: 'Effective casts',
        value: this.castsTotal - this.castsOverEnergyTreshold,
      },
      {
        color: BadColor,
        label: 'Wasted casts',
        value: this.castsOverEnergyTreshold,
      },
    ];

    return <DonutChart items={items} />;
  }

  get cooldownChart() {
    const items = [
      {
        color: GoodColor,
        label: 'Time off cd above energy treshold',
        value: (this.totalTimeOffCD - this.timeSpentUnderTreshold) / 1000,
      },
      {
        color: BadColor,
        label: 'Time off cd under energy treshold',
        value: this.timeSpentUnderTreshold / 1000,
      },
    ];

    return <DonutChart items={items} />;
  }

  get guideOld(): JSX.Element {
    return (
      <p>
        <p>
          <strong>
            <SpellLink id={TALENTS.BLADE_RUSH_TALENT} />
          </strong>{' '}
          should be used whenever your energy drop under 70-80, this energy treshold increase with
          target count. At around 9 targets it is safe to use{' '}
          <SpellLink id={TALENTS.BLADE_RUSH_TALENT} /> on cooldown regardless of energy.
        </p>
        <SideBySidePanels>
          <RoundedPanel>
            <div>
              This chart display the percentage of <SpellLink id={TALENTS.BLADE_RUSH_TALENT} />{' '}
              casts used at an higher than recommended energy treshold. (Ignore this if aoe fights
              for now)
            </div>
            {this.castsChart}
          </RoundedPanel>
          <RoundedPanel>
            <div>
              This chart display the amount of time (in seconds) that you spent under the energy
              threshold without pressing <SpellLink id={TALENTS.BLADE_RUSH_TALENT} />.
            </div>
            {this.cooldownChart}
          </RoundedPanel>
        </SideBySidePanels>
        <small>
          Grey periods indicate times that you should have used 
          <SpellLink id={TALENTS.BLADE_RUSH_TALENT}/>, but did not.
        </small>
        {uptimeBarSubStatistic(
            this.owner.fight,
            {
              spells: [TALENTS.BLADE_RUSH_TALENT],
              uptimes: this.unusableUptimes,
            },
            undefined,
            undefined,
            undefined,
            'utilization',
          )}
      </p>
    );
  }

  get guide(): JSX.Element {
    this.unusableUptimes.at(-1)!.end = this.owner.fight.end_time;
    const explanation = (
      <p>
          <strong>
            <SpellLink id={TALENTS.BLADE_RUSH_TALENT} />
          </strong>{' '}
          should be used whenever your energy drop under 70-80, this energy treshold increase with
          target count. At around 9 targets it is safe to use{' '}
          <SpellLink id={TALENTS.BLADE_RUSH_TALENT} /> on cooldown regardless of energy.
      </p>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
          <SpellLink id={TALENTS.BLADE_RUSH_TALENT} /> utilization
          </strong>
          <div>
          <small>
            Grey periods indicate periods where your energy went under the
            recommended energy treshold but you did not use <SpellLink id={TALENTS.BLADE_RUSH_TALENT}/>.
          </small>
          {uptimeBarSubStatistic(
            this.owner.fight,
            {
              spells: [TALENTS.BLADE_RUSH_TALENT],
              uptimes: this.unusableUptimes,
            },
            undefined,
            undefined,
            undefined,
            'utilization',
          )}
          <strong>Casts </strong>
            <small>
              - Green indicates a good cast under 80 energy, yellow indicate a cast slighlty above the recommended energy treshold, 
              while red indicates a "wasted" cast casted above the recommended energy treshold (Ignore this section in aoe for now)
            </small>
          <PerformanceBoxRow values={this.castEntries}/>
          </div>
        </RoundedPanel>
      </div>
    );
    return explanationAndDataSubsection(explanation, data, 40);
  }
}

export default BladeRush;
