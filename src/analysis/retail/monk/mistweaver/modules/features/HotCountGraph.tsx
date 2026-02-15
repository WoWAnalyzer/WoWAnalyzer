import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import BuffCountGraph, { GraphedSpellSpec } from 'parser/shared/modules/BuffCountGraph';
import { getCurrentCelestialTalent, SPELL_COLORS } from '../../constants';
import Revival from '../spells/Revival';
import Panel from 'parser/ui/Panel';
import { Options } from 'parser/core/Module';

class HotCountGraph extends BuffCountGraph {
  static dependencies = {
    ...BuffCountGraph.dependencies,
    revival: Revival,
  };
  protected revival!: Revival;

  constructor(options: Options) {
    super(options);
  }

  buffSpecs(): GraphedSpellSpec[] {
    const buffSpecs: GraphedSpellSpec[] = [];
    buffSpecs.push({
      spells: [TALENTS_MONK.ENVELOPING_MIST_TALENT],
      color: SPELL_COLORS.ENVELOPING_MIST,
    });
    return buffSpecs;
  }

  castRuleSpecs(): GraphedSpellSpec[] {
    const castSpecs: GraphedSpellSpec[] = [];
    castSpecs.push({ spells: this.revival.getRevivalTalent(), color: SPELL_COLORS.REVIVAL });
    castSpecs.push({
      spells: getCurrentCelestialTalent(this.selectedCombatant),
      color: SPELL_COLORS.GUSTS_OF_MISTS,
    });
    return castSpecs;
  }

  statistic() {
    return (
      <Panel
        title="Healing Amps Graph"
        position={100}
        explanation={
          <>
            This graph shows the number of non-renewing mist healing buffs you had active over the
            course of the encounter. It can help you evaluate how effective you were at prepping and
            executing your cooldowns. For example, the number of{' '}
            <SpellLink spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} />s that go out during{' '}
            <SpellLink spell={getCurrentCelestialTalent(this.selectedCombatant)} /> directly
            correlates to your hps during.
          </>
        }
      >
        {this.plot}
      </Panel>
    );
  }
}

export default HotCountGraph;
