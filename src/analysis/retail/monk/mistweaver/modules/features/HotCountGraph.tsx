/* eslint-disable @typescript-eslint/no-useless-constructor */
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import BuffCountGraph, { GraphedSpellSpec } from 'parser/shared/modules/BuffCountGraph';
import { SPELL_COLORS } from '../../constants';
import BaseCelestialAnalyzer from '../spells/BaseCelestialAnalyzer';
import Revival from '../spells/Revival';
import Panel from 'parser/ui/Panel';
import { Options } from 'parser/core/Module';

class HotCountGraph extends BuffCountGraph {
  static dependencies = {
    ...BuffCountGraph.dependencies,
    celestial: BaseCelestialAnalyzer,
    revival: Revival,
  };
  protected revival!: Revival;
  protected celestial!: BaseCelestialAnalyzer;

  constructor(options: Options) {
    super(options);
  }

  buffSpecs(): GraphedSpellSpec[] {
    const buffSpecs: GraphedSpellSpec[] = [];
    buffSpecs.push(
      {
        spells: [TALENTS_MONK.ENVELOPING_MIST_TALENT],
        color: SPELL_COLORS.ENVELOPING_MIST,
      },
      {
        spells: [SPELLS.ENVELOPING_BREATH_HEAL],
        color: SPELL_COLORS.RENEWING_MIST,
      },
    );

    return buffSpecs;
  }

  castRuleSpecs(): GraphedSpellSpec[] {
    const castSpecs: GraphedSpellSpec[] = [];
    castSpecs.push({ spells: this.revival.getRevivalTalent(), color: SPELL_COLORS.REVIVAL });
    castSpecs.push({
      spells: this.celestial.getCelestialTalent(),
      color: SPELL_COLORS.GUSTS_OF_MISTS,
    });
    return castSpecs;
  }

  statistic() {
    return (
      <Panel
        title="Other Hots Graph"
        position={100}
        explanation={
          <>
            This graph shows the number of non-Renewing Mist HoTs you had active over the course of
            the encounter. It can help you evaluate how effective you were at prepping and executing
            your cooldowns. For example, the number of{' '}
            <SpellLink spell={SPELLS.ENVELOPING_BREATH_HEAL} /> that go out during{' '}
            <SpellLink spell={this.celestial.getCelestialTalent()} /> directly correlates to your
            hps during.
          </>
        }
      >
        {this.plot}
      </Panel>
    );
  }
}

export default HotCountGraph;
