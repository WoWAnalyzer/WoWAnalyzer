import Analyzer from 'parser/core/Analyzer';
import CombatLogParser from 'parser/core/CombatLogParser';
import Tempest from './Tempest';
import { Section, SubSection } from 'interface/guide';
import SpellLink from 'interface/SpellLink';
import TALENTS from 'common/TALENTS/shaman';
import SPECS from 'game/SPECS';
import SPELLS from 'common/SPELLS/shaman';
import { TooltipElement } from 'interface/Tooltip';
import { formatPercentage } from 'common/format';

type props = {
  parser: CombatLogParser;
  tempest: Tempest;
};

const numberColumnStyle = { width: 50, paddingRight: 5, textAlign: 'center' } as const;

export const Stormbringer = (props: props) => {
  const sources = [
    {
      ...props.tempest.tempestSources['maelstrom'],
      ability: <>Maelstorm Spent</>,
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
                Cycling <SpellLink spell={SPELLS.MAELSTROM_WEAPON} /> as quickly as possible to
                trigger <SpellLink spell={TALENTS.TEMPEST_TALENT} />, then spending quickly to avoid
                wasting follow-up procs from <SpellLink spell={TALENTS.AWAKENING_STORMS_TALENT} />{' '}
                is extremely important to performing well with Stormbringer.
              </p>
              <p>
                The graph below shows the progress towards the next{' '}
                <SpellLink spell={TALENTS.TEMPEST_TALENT} /> from both spending{' '}
                <SpellLink spell={SPELLS.MAELSTROM_WEAPON} /> and
                <SpellLink spell={TALENTS.AWAKENING_STORMS_TALENT} /> procs. Red lines indicate when
                you cast
                <SpellLink spell={TALENTS.TEMPEST_TALENT} />
              </p>
            </>
          ) : null}
        </SubSection>
        <SubSection
          title={
            <>
              <SpellLink spell={SPELLS.MAELSTROM_WEAPON} /> &{' '}
              <SpellLink spell={TALENTS.AWAKENING_STORMS_TALENT} />
            </>
          }
        >
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

  tab() {
    return {
      title: 'Hero Talents',
      url: 'hero',
      render: () => <Stormbringer parser={this.owner} tempest={this.tempest} />,
    };
  }
}
