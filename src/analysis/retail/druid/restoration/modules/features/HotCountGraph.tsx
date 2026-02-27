import SPELLS from 'common/SPELLS';
import SpellLink from 'interface/SpellLink';
import Events from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import BuffCountGraph, { GraphedSpellSpec } from 'parser/shared/modules/BuffCountGraph';
import Panel from 'parser/ui/Panel';

import ConvokeSpiritsResto from 'analysis/retail/druid/restoration/modules/spells/ConvokeSpiritsResto';
import { TALENTS_DRUID } from 'common/TALENTS';
import { isWildstalker } from 'analysis/retail/druid/shared/heroTree';

const CONVOKE_SPEC_NAME = 'Convoke';
const CONVOKE_WITH_FLOURISH_SPEC_NAME = 'Convoke w/ Flourish Tranquility';

/**
 * Graph showing player's HoTs out over an encounter, with CD usage superimposed on top.
 * Useful for visualizing player "HoT ramps".
 */
class HotCountGraph extends BuffCountGraph {
  static dependencies = {
    ...BuffCountGraph.dependencies,
    convokeSpirits: ConvokeSpiritsResto,
  };
  convokeSpirits!: ConvokeSpiritsResto;

  constructor(options: Options) {
    super(options);
    if (this.selectedCombatant.hasTalent(TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT)) {
      this.addEventListener(Events.fightend, this.onFightEndConvokeCount);
    }
  }

  buffSpecs(): GraphedSpellSpec[] {
    const buffSpecs: GraphedSpellSpec[] = [];
    buffSpecs.push({
      spells: [SPELLS.REJUVENATION, SPELLS.REJUVENATION_GERMINATION],
      color: '#a010a0',
    });
    buffSpecs.push({ spells: SPELLS.WILD_GROWTH, color: '#20b020' });
    if (isWildstalker(this.selectedCombatant)) {
      buffSpecs.push({
        spells: [SPELLS.SYMBIOTIC_BLOOMS_WILDSTALKER],
        color: '#cc7722',
      });
    }
    return buffSpecs;
  }

  castRuleSpecs(): GraphedSpellSpec[] {
    const castSpecs: GraphedSpellSpec[] = [];
    castSpecs.push({ spells: SPELLS.TRANQUILITY_CAST, color: '#bbbbbb' });
    if (this.selectedCombatant.hasTalent(TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT)) {
      // these custom specs will get filled in manually from Convoke module data
      castSpecs.push({ name: CONVOKE_SPEC_NAME, spells: [], color: '#2222bb' });
      if (this.selectedCombatant.hasTalent(TALENTS_DRUID.CENARIUS_GUIDANCE_TALENT) && this.selectedCombatant.hasTalent(TALENTS_DRUID.FLOURISH_TALENT)) {
        castSpecs.push({ name: CONVOKE_WITH_FLOURISH_SPEC_NAME, spells: [], color: '#22aacc' });
      }
    }
    return castSpecs;
  }

  onFightEndConvokeCount() {
    this.convokeSpirits.convokeTracker.forEach((cast) => {
      // show different color rule line depending on if Convoke procced Flourish
      if (cast.spellIdToCasts[SPELLS.TRANQUILITY_HEAL.id]) {
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
            Having a <SpellLink spell={SPELLS.WILD_GROWTH} /> and several{' '}
            <SpellLink spell={SPELLS.REJUVENATION} /> out before casting{' '}
            <SpellLink spell={SPELLS.TRANQUILITY_CAST} /> or{' '}
            <SpellLink spell={SPELLS.CONVOKE_SPIRITS} /> can drastically increase their
            effectiveness.
          </>
        }
      >
        {this.plot}
      </Panel>
    );
  }
}

export default HotCountGraph;
