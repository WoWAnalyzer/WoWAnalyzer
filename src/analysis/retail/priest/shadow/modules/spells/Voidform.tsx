import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RemoveBuffEvent, ResourceChangeEvent } from 'parser/core/Events';
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
  durationSustainedPotency = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.VOIDFORM_TALENT);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.VOIDFORM_BUFF),
      this.enterVoidform,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.VOIDFORM_BUFF),
      this.leaveVoidform,
    );

    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(TALENTS.HALO_SHADOW_TALENT),
      this.onHalo,
    );
  }

  onHalo(event: ResourceChangeEvent) {
    //When Halo occurs during voidform, it extends it's duration by 1 second.
    //console.log("HALO")

    if (this.selectedCombatant.hasBuff(SPELLS.VOIDFORM_BUFF.id)) {
      this.durationSustainedPotency += 1;
    }
  }

  enterVoidform(event: ApplyBuffEvent) {
    //Voidform restores all charges of mindblast.
    this.VFtime = event.timestamp;
    this.casts += 1;
    this.mindblast += 2 - this.spellUsable.chargesAvailable(SPELLS.MIND_BLAST.id);
    this.spellUsable.endCooldown(SPELLS.MIND_BLAST.id, event.timestamp, true, true);

    //Voidform gains extension from Archon talent Sustained Potencey,

    //For some reason, the buffer does not get the stacks of this buff if it falls off before voidform starts, even at high values.
    //So we jsut look 10ms before the event to see how many stacks we had at that time.
    //Usually, the buff falls off 1-3ms after the voidform cast finishes, but 1-3ms before the voidform buff starts, so 10ms is plenty.
    this.durationSustainedPotency += this.selectedCombatant.getBuffStacks(
      SPELLS.SHADOW_PRIEST_ARCHON_SUSTAINED_POTENCY_BUFF.id,
      event.timestamp - 10,
      50,
      0,
    );
    //console.log("sustained start", this.durationSustainedPotency)
  }

  leaveVoidform(event: RemoveBuffEvent) {
    const extension = (event.timestamp - this.VFtime) / 1000 - VOID_FORM_DURATION;

    if (this.selectedCombatant.hasTalent(TALENTS.SUSTAINED_POTENCY_TALENT)) {
      this.durationSustainedPotency = 0;
    }

    this.VFExtensionTotal += extension;
    const tooltip = (
      <>
        @<strong>{this.owner.formatTimestamp(this.VFtime)}</strong>, Extension:
        <strong>{extension.toFixed(1)}</strong>
      </>
    );
    let value = QualitativePerformance.Good;
    if (extension <= 75) {
      value = QualitativePerformance.Ok;
    }
    if (extension <= 60) {
      value = QualitativePerformance.Fail;
    }
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
          <SpellLink spell={TALENTS.VOIDFORM_TALENT} />
        </b>{' '}
        is a powerful cooldown.
        <br />
        Entering <SpellLink spell={SPELLS.VOIDFORM_BUFF} />, causes you to regain all charges of{' '}
        <SpellLink spell={SPELLS.MIND_BLAST} />. It is not a priority to regain charges in this way.
        <br />
        Casting <SpellLink spell={TALENTS.SHADOW_WORD_MADNESS_TALENT} /> during{' '}
        <SpellLink spell={SPELLS.VOIDFORM_BUFF} /> extends its duration by 2.5 seconds.
        {this.selectedCombatant.hasTalent(TALENTS.SUSTAINED_POTENCY_TALENT) && (
          <>
            <br />
            With <SpellLink spell={TALENTS.SUSTAINED_POTENCY_TALENT} />, every{' '}
            <SpellLink spell={TALENTS.HALO_SHADOW_TALENT} /> extends the duration of the current
            Void Form or next Void Form by 1 second.
          </>
        )}
        <br />
        Try to extend voidform for as much as possible.
      </p>
    );

    const data = (
      <div>
        <strong>Mind Blast Resets</strong>
        <GradiatedPerformanceBar good={mbGained} ok={mbWasted} />
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
