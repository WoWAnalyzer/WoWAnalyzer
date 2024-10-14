import Analyzer, { Options } from 'parser/core/Analyzer';
import CombatLogParser from 'parser/core/CombatLogParser';
import Tempest from './Tempest';
import { Section, SubSection } from 'interface/guide';
import SpellLink from 'interface/SpellLink';
import TALENTS from 'common/TALENTS/shaman';
import SPECS from 'game/SPECS';
import SPELLS from 'common/SPELLS/shaman';
import { TooltipElement } from 'interface/Tooltip';
import { formatPercentage } from 'common/format';
import ResourceLink from 'interface/ResourceLink';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

type props = {
  parser: CombatLogParser;
  tempest: Tempest;
};

const numberColumnStyle = { width: 50, paddingRight: 5, textAlign: 'center' } as const;

export const StormbringerTabContent = (props: props) => {
  const sources = [
    {
      ...props.tempest.tempestSources['maelstrom'],
      ability: (
        <>
          {props.parser.selectedCombatant.spec === SPECS.ENHANCEMENT_SHAMAN ? (
            <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} />
          ) : (
            <ResourceLink id={RESOURCE_TYPES.MAELSTROM.id} />
          )}{' '}
          <span style={{ color: '#fab700' }}>spent</span>
        </>
      ),
    },
    {
      ...props.tempest.tempestSources['awakening-storms'],
      ability: <SpellLink spell={TALENTS.AWAKENING_STORMS_TALENT} />,
    },
  ];

  const total = sources.reduce(
    (sum, ability) => {
      sum.generated += ability.generated;
      sum.wasted += ability.wasted;
      return sum;
    },
    { generated: 0, wasted: 0 },
  );

  return (
    <div className="guide-container">
      <h1>Stormbringer</h1>
      <Section title="Tempest">
        <SubSection>
          {props.parser.selectedCombatant.spec === SPECS.ENHANCEMENT_SHAMAN ? (
            <>
              <p>
                Cycling <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} /> as quickly as possible to
                trigger <SpellLink spell={TALENTS.TEMPEST_TALENT} />, then spending quickly to avoid
                wasting follow-up procs from <SpellLink spell={TALENTS.AWAKENING_STORMS_TALENT} />{' '}
                is extremely important to performing well with Stormbringer.
              </p>
            </>
          ) : null}
        </SubSection>
        <SubSection>
          <p>
            The graph below shows the progress towards the next{' '}
            <SpellLink spell={TALENTS.TEMPEST_TALENT} /> from both spending{' '}
            {props.parser.selectedCombatant.spec === SPECS.ENHANCEMENT_SHAMAN ? (
              <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} />
            ) : (
              <ResourceLink id={RESOURCE_TYPES.MAELSTROM.id} />
            )}{' '}
            and
            <SpellLink spell={TALENTS.AWAKENING_STORMS_TALENT} /> procs.{' '}
            <span style={{ color: '#fab700', fontWeight: 'bold' }}>Yellow</span> lines show when you
            cast <SpellLink spell={TALENTS.TEMPEST_TALENT} />
          </p>
          <p className="strong">
            Note: Due to the maelstrom spent towards <SpellLink spell={TALENTS.TEMPEST_TALENT} />{' '}
            not resetting between pulls and start of dungeons, the initial value is a "best guess"
            and may not match what you see in game. Until such time the progress resets, this graph
            may have some inaccuracies.
          </p>
          {props.tempest.graph}
        </SubSection>
        <SubSection
          title={
            <>
              <SpellLink spell={TALENTS.TEMPEST_TALENT} /> Sources
            </>
          }
        >
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Source</th>
                  <th colSpan={2}>Procs</th>
                  <th colSpan={2}>Wasted</th>
                </tr>
              </thead>
              <tbody>
                <tr className="poor">
                  <td>Total</td>
                  <td style={numberColumnStyle}>{total.generated.toFixed(0)}</td>
                  <td></td>
                  <td style={numberColumnStyle}>{total.wasted.toFixed(0)}</td>
                  <td></td>
                </tr>
                {sources.map((source, index) => (
                  <tr key={index}>
                    <td style={{ width: '30%' }}>{source.ability}</td>
                    <td style={numberColumnStyle}>
                      <TooltipElement
                        content={`${formatPercentage(source.generated / total.generated)} %`}
                      >
                        {source.generated.toFixed(0)}
                      </TooltipElement>
                    </td>
                    <td style={{ width: '40%' }}>
                      <div
                        className="performance-bar"
                        style={{ width: `${(source.generated / total.generated) * 100}%` }}
                      />
                    </td>
                    <td style={numberColumnStyle}>
                      <TooltipElement
                        content={`${formatPercentage(source.wasted / total.wasted)} %`}
                      >
                        {source.wasted.toFixed(0)}
                      </TooltipElement>
                    </td>
                    <td style={{ width: '30%' }}>
                      <div
                        className="performance-bar"
                        style={{ width: `${(source.wasted / total.wasted) * 100}%` }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        </SubSection>
      </Section>
    </div>
  );
};

export class StormbringerTab extends Analyzer {
  static dependencies = {
    ...Analyzer.dependencies,
    tempest: Tempest,
  };

  protected tempest!: Tempest;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.TEMPEST_TALENT);
  }

  tab() {
    return {
      title: 'Hero Talents',
      url: 'hero',
      render: () => <StormbringerTabContent parser={this.owner} tempest={this.tempest} />,
    };
  }
}
