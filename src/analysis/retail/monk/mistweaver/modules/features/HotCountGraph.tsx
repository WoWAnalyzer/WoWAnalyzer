import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import BuffCountGraph, { GraphedSpellSpec } from 'parser/shared/modules/BuffCountGraph';
import { SPELL_COLORS } from '../../constants';
import BaseCelestialAnalyzer from '../spells/BaseCelestialAnalyzer';
import EssenceFont from '../spells/EssenceFont';
import Revival from '../spells/Revival';
import Panel from 'parser/ui/Panel';
import { Options } from 'parser/core/Module';

class HotCountGraph extends BuffCountGraph {
  static dependencies = {
    ...BuffCountGraph.dependencies,
    celestial: BaseCelestialAnalyzer,
    essenceFont: EssenceFont,
    revival: Revival,
  };
  protected revival!: Revival;
  protected celestial!: BaseCelestialAnalyzer;

  constructor(options: Options) {
    super(options);
    //throwing this in here to avoid a useless constructor linter warning
    if (!this.selectedCombatant.hasTalent(TALENTS_MONK.ENVELOPING_BREATH_TALENT)) {
      return;
    }
  }

  buffSpecs(): GraphedSpellSpec[] {
    const buffSpecs: GraphedSpellSpec[] = [];
    buffSpecs.push(
      {
        spells: [SPELLS.ESSENCE_FONT_BUFF, SPELLS.FAELINE_STOMP_ESSENCE_FONT],
        color: SPELL_COLORS.ESSENCE_FONT,
      },
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
            your cooldowns. Having several <SpellLink id={TALENTS_MONK.ESSENCE_FONT_TALENT.id} />{' '}
            out before casting <SpellLink id={this.revival.getRevivalTalent()} /> or{' '}
            <SpellLink id={this.celestial.getCelestialTalent()} /> will drastically increase their
            effectiveness, and the number of{' '}
            <SpellLink id={TALENTS_MONK.ENVELOPING_BREATH_TALENT.id} /> that go out during{' '}
            <SpellLink id={this.celestial.getCelestialTalent()} /> directly correlates to your hps
            during.
          </>
        }
      >
        {this.plot}
      </Panel>
    );
  }
}

export default HotCountGraph;
