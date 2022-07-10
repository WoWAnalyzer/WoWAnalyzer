import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import SpellLink from 'interface/SpellLink';
import Events from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import BuffCountGraph, { GraphedSpellSpec } from 'parser/shared/modules/BuffCountGraph';
import Panel from 'parser/ui/Panel';

import ConvokeSpiritsResto from '../../modules/shadowlands/covenants/ConvokeSpiritsResto';

const CONVOKE_SPEC_NAME = 'Convoke';
const CONVOKE_WITH_FLOURISH_SPEC_NAME = 'Convoke w/ Flourish';

class HotCountGraph extends BuffCountGraph {
  static dependencies = {
    convokeSpirits: ConvokeSpiritsResto,
  };
  convokeSpirits!: ConvokeSpiritsResto;

  constructor(options: Options) {
    super(options);
    if (this.selectedCombatant.hasCovenant(COVENANTS.NIGHT_FAE.id)) {
      this.addEventListener(Events.fightend, this.onFightEndConvokeCount);
    }
  }

  buffSpecs(): GraphedSpellSpec[] {
    const buffSpecs: GraphedSpellSpec[] = [];
    buffSpecs.push({
      spells: [SPELLS.REJUVENATION, SPELLS.REJUVENATION_GERMINATION],
      color: '#900090',
    });
    buffSpecs.push({ spells: SPELLS.WILD_GROWTH, color: '#00b000' });
    if (this.selectedCombatant.hasTalent(SPELLS.CENARION_WARD_TALENT)) {
      buffSpecs.push({ spells: SPELLS.CENARION_WARD_HEAL, color: '#44ffcc' });
    }
    if (this.selectedCombatant.hasCovenant(COVENANTS.NECROLORD.id)) {
      buffSpecs.push({
        spells: [SPELLS.ADAPTIVE_SWARM_HEAL, SPELLS.ADAPTIVE_SWARM_DAMAGE],
        color: '#cc7722',
      });
    }
    return buffSpecs;
  }

  castRuleSpecs(): GraphedSpellSpec[] {
    const castSpecs: GraphedSpellSpec[] = [];
    castSpecs.push({ spells: SPELLS.TRANQUILITY_CAST, color: '#bbbbbb' });
    if (this.selectedCombatant.hasTalent(SPELLS.FLOURISH_TALENT)) {
      castSpecs.push({ spells: SPELLS.FLOURISH_TALENT, color: '#ffbb22' });
    }
    if (this.selectedCombatant.hasCovenant(COVENANTS.NIGHT_FAE.id)) {
      // these custom specs will get filled in manually from Convoke module data
      castSpecs.push({ name: 'Convoke', spells: [], color: '#0000bb' });
      castSpecs.push({ name: 'Convoke w/ Flourish', spells: [], color: '#00aacc' });
    }
    return castSpecs;
  }

  onFightEndConvokeCount() {
    this.convokeSpirits.convokeTracker.forEach((cast) => {
      // show different color rule line depending on if Convoke procced Flourish
      if (cast.spellIdToCasts[SPELLS.FLOURISH_TALENT.id]) {
        this.addRuleLine(CONVOKE_WITH_FLOURISH_SPEC_NAME, cast.timestamp);
      } else {
        this.addRuleLine(CONVOKE_SPEC_NAME, cast.timestamp);
      }
    });
  }

  statistic() {
    return (
      <Panel
        title="Hot Graph"
        position={100}
        explanation={
          <>
            This graph shows the number of HoTs you had active over the course of the encounter. It
            can help you evaluate how effective you were at 'ramping' before using your cooldowns.
            Having a <SpellLink id={SPELLS.WILD_GROWTH.id} /> and several{' '}
            <SpellLink id={SPELLS.REJUVENATION.id} /> out before casting{' '}
            <SpellLink id={SPELLS.FLOURISH_TALENT.id} /> or{' '}
            <SpellLink id={SPELLS.CONVOKE_SPIRITS.id} /> can drastically increase their
            effectiveness. Even ramping before <SpellLink id={SPELLS.TRANQUILITY_CAST.id} /> can be
            helpful because the additional mastery stacks will boost the direct healing.
          </>
        }
      >
        {this.plot}
      </Panel>
    );
  }
}

export default HotCountGraph;
