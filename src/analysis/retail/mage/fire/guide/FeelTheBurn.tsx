import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import GuideSection from 'interface/guide/components/GuideSection';
import BuffUptimeBar from 'interface/guide/components/BuffUptimeBar';

import { FEEL_THE_BURN_MAX_STACKS } from '../../shared';
import FeelTheBurn from '../talents/FeelTheBurn';

const BURN_COLOR = '#df631b';
const BURN_BG_COLOR = '#aa0c09';

class FeelTheBurnGuide extends Analyzer {
  static dependencies = {
    feelTheBurn: FeelTheBurn,
  };

  protected feelTheBurn!: FeelTheBurn;

  get guideSubsection(): JSX.Element {
    const feelTheBurn = <SpellLink spell={TALENTS.FEEL_THE_BURN_TALENT} />;
    const ignite = <SpellLink spell={SPELLS.IGNITE} />;
    const combustion = <SpellLink spell={TALENTS.COMBUSTION_TALENT} />;
    const fireblast = <SpellLink spell={SPELLS.FIRE_BLAST} />;

    const explanation = (
      <>
        <b>{feelTheBurn}</b> grants a high amount of mastery which increases your ticking {ignite}{' '}
        damage. You should use {fireblast} to keep this buff at max stacks as long as possible, and
        for as much of {combustion} as possible, to maximize your {ignite} damage.
      </>
    );

    const buffHistory = this.selectedCombatant.getBuffHistory(SPELLS.FEEL_THE_BURN_BUFF.id);

    return (
      <GuideSection spell={TALENTS.FEEL_THE_BURN_TALENT} explanation={explanation}>
        <BuffUptimeBar
          spell={TALENTS.FEEL_THE_BURN_TALENT}
          buffHistory={buffHistory}
          startTime={this.owner.fight.start_time}
          endTime={this.owner.fight.end_time}
          maxStacks={FEEL_THE_BURN_MAX_STACKS}
          barColor={BURN_COLOR}
          backgroundBarColor={BURN_BG_COLOR}
        />
      </GuideSection>
    );
  }
}

export default FeelTheBurnGuide;
