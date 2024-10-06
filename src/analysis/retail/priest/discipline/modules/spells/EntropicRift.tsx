import spells from 'common/SPELLS/priest';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import SpellLink from 'interface/SpellLink';
import talents from 'common/TALENTS/priest';
import GradiatedPerformanceBar from 'interface/guide/components/GradiatedPerformanceBar';

class EntropicRift extends Analyzer {
  totalCasts = 0;
  buffedCasts = 0;
  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(spells.MIND_BLAST), this.castRift);
  }

  castRift() {
    this.totalCasts += 1;
    if (this.selectedCombatant.hasBuff(spells.SHADOW_COVENANT_BUFF)) {
      this.buffedCasts += 1;
    }
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <>
        <p>
          <b>
            <SpellLink spell={talents.ENTROPIC_RIFT_TALENT} />
          </b>{' '}
          should be casted as often as possible with{' '}
          <SpellLink spell={talents.SHADOW_COVENANT_TALENT} /> to increase the damage it will do and
          how much in turn it will heal. Try to aim for a 50% usage at least.
        </p>
      </>
    );

    const data = (
      <div>
        <strong>
          <SpellLink spell={talents.ENTROPIC_RIFT_TALENT} /> buffed casts
        </strong>
        <small> - Green indicates casts while buffed, while red indicates regular casts.</small>
        <GradiatedPerformanceBar good={this.buffedCasts} bad={this.totalCasts - this.buffedCasts} />
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }
}

export default EntropicRift;
