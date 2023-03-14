import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import TALENTS from 'common/TALENTS/priest';
import { SpellLink } from 'interface';
import GradiatedPerformanceBar from 'interface/guide/components/GradiatedPerformanceBar';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import SpellUsable from 'parser/shared/modules/SpellUsable';

class Voidform extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    spellUsable: SpellUsable,
  };

  protected abilities!: Abilities;
  protected spellUsable!: SpellUsable;

  mindblast = 0;
  casts = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.VOIDFORM_BUFF),
      this.enterVoidform,
    );
  }

  enterVoidform(event: ApplyBuffEvent) {
    //Voidform restores all charges of mindblast.
    this.casts += 1;
    this.mindblast += 2 - this.spellUsable.chargesAvailable(SPELLS.MIND_BLAST.id);
    this.spellUsable.endCooldown(SPELLS.MIND_BLAST.id, event.timestamp, true, true);
  }

  get guideSubsection(): JSX.Element {
    const mbGained = {
      count: this.mindblast,
      label: 'Mind Blast Reset',
    };

    const mbWasted = {
      count: this.casts * 2 - this.mindblast,
      label: 'Missed Resets',
    };

    const explanation = (
      <p>
        <b>
          <SpellLink id={TALENTS.VOID_ERUPTION_TALENT.id} />
        </b>{' '}
        is a powerful cooldown.
        <br />
        Try to have all charges of <SpellLink id={SPELLS.MIND_BLAST.id} /> on cooldown before
        entering <SpellLink id={SPELLS.VOIDFORM_BUFF.id} />, since it will cause you to regain all
        charges.
      </p>
    );

    const data = (
      <div>
        <strong>Mind Blast Resets</strong>
        <GradiatedPerformanceBar good={mbGained} bad={mbWasted} />
      </div>
    );
    return explanationAndDataSubsection(explanation, data, 50);
  }
}

export default Voidform;
