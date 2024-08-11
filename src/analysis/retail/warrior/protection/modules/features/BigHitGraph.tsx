import SPELLS from 'common/SPELLS';
import { Panel } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyDebuffEvent,
  DamageEvent,
  HealEvent,
  RemoveDebuffEvent,
} from 'parser/core/Events';
import BaseChart, { formatTime } from 'parser/ui/BaseChart';
import { VisualizationSpec } from 'react-vega';
import AutoSizer from 'react-virtualized-auto-sizer';

import IgnorePainTracker from '../spells/IgnorePainTracker';

type SpellTracker = {
  timestamp: number;
  hitPoints: number;
  ignorePain: number;
};

type BigHit = {
  timestamp: number;
  hitPoints: number;
  ignorePain: number;
  hadShieldBlock: boolean;
  hadLastStand: boolean;
  hadShieldWall: boolean;
  mobHadDemoShout: boolean;
  spell: string;
};

type TrackedHit = DamageEvent & {
  lastHP: number;
  lastIP: number;
  targetHadDemo: boolean;
};

class BigHitGraph extends Analyzer {
  static dependencies = {
    ignorePainTracker: IgnorePainTracker,
  };

  protected ignorePainTracker!: IgnorePainTracker;

  areas: SpellTracker[] = [];
  bigHits: BigHit[] = [];

  _lastHp: number = 0;

  demoTargets: Set<string> = new Set<string>();

  damageEvents: TrackedHit[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.heal.to(SELECTED_PLAYER), this.gotHealed);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.tookDamage);
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER), this.applyDemoShout);
    this.addEventListener(Events.removedebuff.by(SELECTED_PLAYER), this.removeDemoShout);
  }

  gotHealed(event: HealEvent) {
    this._lastHp = event.hitPoints ? event.hitPoints : this._lastHp;

    this.areas.push({
      timestamp: event.timestamp,
      hitPoints: event.hitPoints,
      ignorePain: this.ignorePainTracker.currentIgnorePain,
    });
  }

  tookDamage(event: DamageEvent) {
    this._lastHp = event.hitPoints ? event.hitPoints : this._lastHp;
    this.areas.push({
      timestamp: event.timestamp,
      hitPoints: event.hitPoints || this._lastHp,
      ignorePain: this.ignorePainTracker.currentIgnorePain,
    });

    if (!event.unmitigatedAmount || !event.maxHitPoints || !event.maxHitPoints) {
      return;
    }

    const damageTaken = event.amount + (event.absorb || 0);

    // first check for insane DR... probably a boss giving DR
    const drED = 1 - damageTaken / event.unmitigatedAmount;

    // bail out too much DR
    if (drED > 0.9) {
      return;
    }

    if (event.unmitigatedAmount < event.maxHitPoints * 0.1) {
      return;
    }

    let lastHP = 0;
    let lastIP = 0;
    if (this.areas.length !== 0 && this.areas.length !== 1) {
      lastHP = this.areas[this.areas.length - 2].hitPoints;
      lastIP = this.areas[this.areas.length - 2].ignorePain;
    }

    this.damageEvents.push({
      ...event,
      lastHP: lastHP,
      lastIP: lastIP,
      targetHadDemo: this.demoTargets.has(this.targetGUIDFromSource(event)),
    });
  }

  applyDemoShout(event: ApplyDebuffEvent) {
    const guid = this.targetGUID(event);
    this.demoTargets.add(guid);
  }

  removeDemoShout(event: RemoveDebuffEvent) {
    const guid = this.targetGUID(event);
    this.demoTargets.delete(guid);
  }

  targetGUID(event: ApplyDebuffEvent | RemoveDebuffEvent) {
    return String(event.targetID) + (event.targetInstance || 0);
  }

  targetGUIDFromSource(event: DamageEvent) {
    return String(event.sourceID) + (event.sourceInstance || 0);
  }

  filterEvents() {
    const umitigatedAmount = this.damageEvents.map(
      (event: { unmitigatedAmount?: number }) => event.unmitigatedAmount || 0,
    );

    if (umitigatedAmount.length === 0) {
      return;
    }

    const totalDamage = umitigatedAmount.reduce((a, b) => a + b);

    const length = this.damageEvents.length;
    const mean = totalDamage / length;
    const std = Math.sqrt(
      umitigatedAmount.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / length,
    );

    // all events 1.5 std above mean
    const onePointFiveSTDUp = mean + std * 1.5;
    const onePointFiveSTDaway = this.damageEvents.filter(
      (event) => (event.unmitigatedAmount || 0) > onePointFiveSTDUp,
    );

    // lets get all hits that just were big and low mitigation as well
    const bigHits = this.damageEvents.filter(
      (event) =>
        event.maxHitPoints && event.amount + (event.absorb || 0) > event.maxHitPoints * 0.5,
    );

    // combine 1.5 and bighits while removing duplicates
    const noDuplicates = new Set<TrackedHit>(onePointFiveSTDaway);
    bigHits.forEach((event) => noDuplicates.add(event));

    noDuplicates.forEach((event) => {
      this.bigHits.push({
        timestamp: event.timestamp,
        hitPoints: event.lastHP,
        ignorePain: event.lastIP,
        hadShieldBlock: this.selectedCombatant.hasBuff(SPELLS.SHIELD_BLOCK_BUFF.id),
        hadLastStand: this.selectedCombatant.hasBuff(SPELLS.LAST_STAND.id),
        hadShieldWall: this.selectedCombatant.hasBuff(SPELLS.SHIELD_WALL.id),
        mobHadDemoShout: event.targetHadDemo,
        spell: event.ability.name,
      });
    });
  }

  get plot() {
    const xAxis = {
      field: 'timestamp_shifted',
      type: 'quantitative' as const,
      axis: {
        labelExpr: formatTime('datum.value'),
        tickCount: 25,
        grid: false,
      },
      scale: {
        nice: false,
      },
      title: null,
    };

    const spec: VisualizationSpec = {
      data: {
        name: 'areas',
      },
      transform: [
        {
          filter: 'isValid(datum.hitPoints)',
        },
        {
          calculate: `datum.timestamp - ${this.owner.fight.start_time}`,
          as: 'timestamp_shifted',
        },
      ],
      encoding: {
        x: xAxis,
        tooltip: [
          {
            field: 'hitPoints',
            type: 'quantitative' as const,
            title: 'Hit Points',
            format: '.3~s',
          },
          {
            field: 'ignorePain',
            type: 'quantitative' as const,
            title: 'Ignore Pain',
            format: '.3~s',
          },
        ],
      },
      layer: [
        {
          mark: {
            type: 'area' as const,
            line: {
              interpolate: 'linear' as const,
              color: '#fab700',
              strokeWidth: 1,
            },
            color: 'rgba(250, 183, 0, 0.15)',
          },
          encoding: {
            y: {
              field: 'hitPoints',
              type: 'quantitative' as const,
              title: null,
              axis: {
                grid: false,
                format: '~s',
              },
            },
          },
        },
        {
          mark: {
            type: 'area' as const,
            line: {
              interpolate: 'linear' as const,
              color: 'rgb(255, 139, 45)',
              strokeWidth: 1,
            },
            color: 'rgba(255, 139, 45, 0.15)',
          },
          encoding: {
            y: {
              field: 'ignorePain',
              type: 'quantitative' as const,
              title: null,
              axis: {
                grid: false,
                format: '~s',
              },
            },
          },
        },
        {
          data: {
            name: 'bigHits',
          },
          mark: {
            type: 'point' as const,
            shape: 'circle',
            color: '#FF0000',
            filled: true,
            size: 70,
          },
          transform: [
            {
              calculate: `datum.timestamp - ${this.owner.fight.start_time}`,
              as: 'timestamp_shifted',
            },
          ],
          encoding: {
            x: xAxis,
            y: {
              field: 'hitPoints',
              type: 'quantitative' as const,
              title: null,
            },
            tooltip: [
              {
                field: 'spell',
                title: 'Damage Spell',
              },
              {
                field: 'hitPoints',
                type: 'quantitative' as const,
                title: 'Hit Points',
                format: '.3~s',
              },
              {
                field: 'ignorePain',
                type: 'quantitative' as const,
                title: 'Ignore Pain',
                format: '.3~s',
              },
              { field: 'hadShieldBlock', title: 'Shield Block' },
              { field: 'hadLastStand', title: 'Last Stand' },
              { field: 'hadShieldWall', title: 'Shield Wall' },
              { field: 'mobHadDemoShout', title: 'Demo Shout' },
            ],
          },
        },
      ],
    };

    return (
      <div
        className="graph-container"
        style={{
          width: '100%',
          minHeight: 200,
        }}
      >
        <AutoSizer>
          {({ width, height }) => (
            <BaseChart
              spec={spec}
              data={{
                areas: this.areas,
                bigHits: this.bigHits,
              }}
              width={width}
              height={height}
            />
          )}
        </AutoSizer>
      </div>
    );
  }

  tab() {
    this.filterEvents();
    return {
      title: 'Damage Intake',
      url: 'damageintake',
      render: () => (
        <Panel
          title="Damage Intake"
          explanation={
            <>
              This graph shows you very large hits you took and hits that did lots of damage to you.
              You can highlight over any point to see how much Ignore Pain shield you had as well as
              what defensives were active. The yellow area is your current Hit points while the
              orange area is your current Ignore Pain Shield.
            </>
          }
        >
          {this.plot}
        </Panel>
      ),
    };
  }
}

export default BigHitGraph;
