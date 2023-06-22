import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import TALENTS from 'common/TALENTS/priest';
import { SpellLink } from 'interface';
import GradiatedPerformanceBar from 'interface/guide/components/GradiatedPerformanceBar';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import UptimeIcon from 'interface/icons/Uptime';
import { VOID_FORM_DURATION } from '../../constants';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

class Voidform extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    spellUsable: SpellUsable,
  };
  protected abilities!: Abilities;
  protected spellUsable!: SpellUsable;

  casts = 0; //casts of voidform
  VFExtension: BoxRowEntry[] = [];
  VFExtensionTotal = 0;
  VFtime = 0;
  mindblast = 0; //number of mindblasts gained by entering voidform

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.VOID_ERUPTION_TALENT);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.VOIDFORM_BUFF),
      this.enterVoidform,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.VOIDFORM_BUFF),
      this.leaveVoidform,
    );
  }

  enterVoidform(event: ApplyBuffEvent) {
    //Voidform restores all charges of mindblast.
    this.VFtime = event.timestamp;
    this.casts += 1;
    this.mindblast += 2 - this.spellUsable.chargesAvailable(SPELLS.MIND_BLAST.id);
    this.spellUsable.endCooldown(SPELLS.MIND_BLAST.id, event.timestamp, true, true);
  }

  leaveVoidform(event: RemoveBuffEvent) {
    const extension = (event.timestamp - this.VFtime) / 1000 - VOID_FORM_DURATION;
    this.VFExtensionTotal += extension;
    const tooltip = (
      <>
        @<strong>{this.owner.formatTimestamp(this.VFtime)}</strong>, Extension:
        <strong>{extension.toFixed(1)}</strong>
      </>
    );
    const value = QualitativePerformance.Good;
    //The Performance value of the extension is complicated, and needs to be tested further.
    //for now, at least having the extension time per voidform is useful.
    this.VFExtension.push({ value, tooltip });
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
        <strong>Voidform Extension</strong>
        <br />
        <UptimeIcon /> <strong>{this.VFExtensionTotal.toFixed(1)}</strong> <small> seconds</small>
        <PerformanceBoxRow values={this.VFExtension} />
      </div>
    );
    return explanationAndDataSubsection(explanation, data, 50);
  }
}

export default Voidform;
