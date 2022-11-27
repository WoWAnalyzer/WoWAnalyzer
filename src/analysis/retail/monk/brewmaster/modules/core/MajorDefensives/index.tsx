import talents from 'common/TALENTS/monk';
import { Section, SubSection, useAnalyzers, useEvents, useInfo } from 'interface/guide';
import Explanation from 'interface/guide/components/Explanation';
import { GapHighlight } from 'parser/ui/CooldownBar';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import BaseChart, { formatTime } from 'parser/ui/BaseChart';
import { VisualizationSpec } from 'react-vega';
import { AutoSizer } from 'react-virtualized';
import { DamageEvent, EventType } from 'parser/core/Events';
import { DampenHarm } from 'analysis/retail/monk/shared';
import { FortifyingBrew } from './FortifyingBrew';
import { DiffuseMagic } from './DiffuseMagic';
import { ZenMeditation } from './ZenMeditation';
import CelestialBrew from '../../spells/CelestialBrew';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';

const MAJOR_DEFENSIVES = [
  talents.CELESTIAL_BREW_TALENT,
  talents.FORTIFYING_BREW_TALENT,
  talents.DAMPEN_HARM_TALENT,
  talents.DIFFUSE_MAGIC_TALENT,
  talents.ZEN_MEDITATION_TALENT,
];

const MAJOR_ANALYZERS = [CelestialBrew, FortifyingBrew, DampenHarm, DiffuseMagic, ZenMeditation];

const rekey = (key: string) =>
  function <T>(value: T): T & { key: string } {
    return { ...value, key };
  };

const DamageMitigationChart = () => {
  const events = useEvents();
  const info = useInfo();
  const physicalData = events
    .filter(
      (event): event is DamageEvent =>
        event.type === EventType.Damage &&
        event.targetID === info?.combatant.id &&
        event.ability.type === MAGIC_SCHOOLS.ids.PHYSICAL,
    )
    .map(rekey('physical'));

  const magicData = events
    .filter(
      (event): event is DamageEvent =>
        event.type === EventType.Damage &&
        event.targetID === info?.combatant.id &&
        event.ability.type !== MAGIC_SCHOOLS.ids.PHYSICAL,
    )
    .map(rekey('magic'));

  const mitigationData = useAnalyzers(MAJOR_ANALYZERS).flatMap((analyzer) => {
    if (!analyzer) {
      return [];
    }

    return analyzer.mitigations
      .flatMap((mit) => mit.mitigated)
      .map((mit) => ({ ...mit, amount: mit.mitigatedAmount, timestamp: mit.event.timestamp }))
      .map(rekey('.mitigated'));
  });

  const data = {
    events: (physicalData as Array<Pick<DamageEvent, 'amount' | 'timestamp'> & { key: string }>)
      .concat(magicData)
      .concat(mitigationData),
  };

  const spec: VisualizationSpec = {
    mark: {
      type: 'area',
      interpolate: 'monotone',
    },
    data: {
      name: 'events',
    },
    transform: [
      { calculate: `datum.timestamp - ${info?.fightStart ?? 0}`, as: 'timestamp' },
      { calculate: 'floor(datum.timestamp / 1000)', as: 'binIx' },
      {
        aggregate: [
          { op: 'sum', as: 'amount', field: 'amount' },
          { op: 'min', as: 'timestamp', field: 'binIx' },
        ],
        groupby: ['key', 'binIx'],
      },
      { calculate: 'datum.timestamp * 1000', as: 'timestamp' },
      {
        impute: 'amount',
        key: 'timestamp',
        keyvals: { start: 0, stop: info?.fightDuration ?? 0, step: 1000 },
        value: 0,
        groupby: ['key'],
      },
      {
        window: [{ op: 'mean', field: 'amount', as: 'amount' }],
        frame: [-2, 2],
        sort: [{ field: 'binIx' }],
        groupby: ['key'],
      },
    ],
    encoding: {
      x: {
        field: 'timestamp',
        type: 'quantitative',
        axis: {
          labelExpr: formatTime('datum.value'),
        },
        title: null,
        scale: { zero: true, nice: false },
      },
      y: {
        field: 'amount',
        type: 'quantitative',
        axis: {
          format: '~s',
        },
        scale: { zero: true, domainMin: 0 },
        stack: true,
      },
      color: {
        field: 'key',
        type: 'nominal',
      },
      tooltip: [{ field: 'binIx' }, { field: 'timestamp' }, { field: 'amount' }],
    },
  };

  return (
    <div>
      <AutoSizer disableHeight>
        {({ width }) => <BaseChart data={data} width={width} height={200} spec={spec} />}
      </AutoSizer>
    </div>
  );
};

export default function MajorDefensivesSection(): JSX.Element | null {
  const info = useInfo();

  if (!info) {
    return null;
  }

  return (
    <Section title="Major Defensives">
      <Explanation>
        In Dragonflight, Brewmaster Monk has gained multiple major defensive cooldowns. Using these
        effectively is critical for your survival, especially while undergeared.
      </Explanation>
      <SubSection>
        <DamageMitigationChart />
      </SubSection>
      <SubSection>
        {MAJOR_DEFENSIVES.map(
          (talent) =>
            info.combatant.hasTalent(talent) && (
              <CastEfficiencyBar
                spellId={talent.id}
                gapHighlightMode={GapHighlight.FullCooldown}
                useThresholds
                key={talent.id}
              />
            ),
        )}
      </SubSection>
    </Section>
  );
}
