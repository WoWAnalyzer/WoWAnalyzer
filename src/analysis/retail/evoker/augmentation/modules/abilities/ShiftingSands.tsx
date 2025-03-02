import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/evoker';
import Events from 'parser/core/Events';

import { ApplyBuffEvent } from 'parser/core/Events';
import { ChecklistUsageInfo, SpellUse } from 'parser/core/SpellUsage/core';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { SpellLink } from 'interface';
import ContextualSpellUsageSubSection from 'parser/core/SpellUsage/HideGoodCastsSpellUsageSubSection';
import Combatants from 'parser/shared/modules/Combatants';
import classColor from 'game/classColor';
import ROLES from 'game/ROLES';
import Combatant from 'parser/core/Combatant';
import SPECS from 'game/SPECS';
import { TALENTS_EVOKER } from 'common/TALENTS';

interface ShiftingSandsApplications {
  event: ApplyBuffEvent;
  ebonMightOn: boolean;
  prescienceOn: boolean;
  combatant: Combatant;
}

class ShiftingSands extends Analyzer {
  private uses: SpellUse[] = [];
  private shiftingSandsApplications: ShiftingSandsApplications[] = [];

  static dependencies = {
    combatants: Combatants,
  };
  protected combatants!: Combatants;

  constructor(options: Options) {
    super(options);
    this.active = !this.selectedCombatant.hasTalent(TALENTS_EVOKER.MOTES_OF_POSSIBILITY_TALENT);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SHIFTING_SANDS_BUFF),
      this.onCast,
    );

    this.addEventListener(Events.fightend, this.finalize);
  }

  private onCast(event: ApplyBuffEvent) {
    const target = this.combatants.players[event.targetID];

    /** The target isn't in the combatants list
     * Rare edgecase that appears to be caused by some form of log corruption.
     * Our analysis code will not work with this, so we'll just ignore this cast.
     *
     * Link for future reference:
     * /report/t6Nv7xz9XJy8DAdq/22-Heroic+Balakar+Khan+-+Kill+(0:53)/Modria/standard */
    if (!target) {
      return;
    }

    const shiftingSandsApplication: ShiftingSandsApplications = {
      event: event,
      ebonMightOn: target.hasBuff(SPELLS.EBON_MIGHT_BUFF_EXTERNAL.id) ?? false,
      prescienceOn: target.hasBuff(SPELLS.PRESCIENCE_BUFF.id) ?? false,
      combatant: target,
    };

    this.shiftingSandsApplications.push(shiftingSandsApplication);
  }

  private finalize() {
    // finalize performances
    this.uses = this.shiftingSandsApplications.map((application) =>
      this.explainPerformance(application),
    );
  }

  private explainPerformance(application: ShiftingSandsApplications): SpellUse {
    let performance = QualitativePerformance.Perfect;

    const ebonMightPerformance = this.getEbonMightPerformance(application);
    const presciencePerformance = this.getPresciencePerformance(application);
    const rolePerformance = this.getRolePerformance(application);

    if (
      ebonMightPerformance.performance === QualitativePerformance.Fail ||
      rolePerformance.performance === QualitativePerformance.Fail
    ) {
      performance = QualitativePerformance.Fail;
    } else if (presciencePerformance.performance === QualitativePerformance.Fail) {
      performance = QualitativePerformance.Good;
    }

    const checklistItems: ChecklistUsageInfo[] = [
      {
        check: 'ebon-might-active',
        timestamp: application.event.timestamp,
        ...ebonMightPerformance,
      },
      {
        check: 'prescience-active',
        timestamp: application.event.timestamp,
        ...presciencePerformance,
      },
      { check: 'role-performance', timestamp: application.event.timestamp, ...rolePerformance },
    ];

    return {
      event: application.event,
      performance: performance,
      checklistItems,
      performanceExplanation:
        performance !== QualitativePerformance.Fail ? `${performance} Usage` : 'Bad Usage',
    };
  }

  private getEbonMightPerformance(application: ShiftingSandsApplications) {
    let ebonMightPerformance;
    const ebonSummary = (
      <div>
        Have <SpellLink spell={SPELLS.EBON_MIGHT_BUFF_EXTERNAL} /> active
      </div>
    );
    if (!application.ebonMightOn) {
      ebonMightPerformance = {
        performance: QualitativePerformance.Fail,
        summary: ebonSummary,
        details: (
          <div>
            Target didn't have <SpellLink spell={SPELLS.EBON_MIGHT_BUFF_EXTERNAL} /> active. You
            should only be casting empowers inside your{' '}
            <SpellLink spell={SPELLS.EBON_MIGHT_BUFF_EXTERNAL} /> windows.
          </div>
        ),
      };
    } else {
      ebonMightPerformance = {
        performance: QualitativePerformance.Good,
        summary: ebonSummary,
        details: (
          <div>
            Target had <SpellLink spell={SPELLS.EBON_MIGHT_BUFF_EXTERNAL} /> active. Good job!
          </div>
        ),
      };
    }
    return ebonMightPerformance;
  }

  private getPresciencePerformance(application: ShiftingSandsApplications) {
    let presciencePerformance;
    const prescienceSummary = (
      <div>
        Have <SpellLink spell={SPELLS.PRESCIENCE_BUFF} /> active
      </div>
    );

    if (!application.prescienceOn) {
      presciencePerformance = {
        performance: QualitativePerformance.Fail,
        summary: prescienceSummary,
        details: (
          <div>
            Target didn't have <SpellLink spell={SPELLS.PRESCIENCE_BUFF} /> active.
          </div>
        ),
      };
    } else {
      presciencePerformance = {
        performance: QualitativePerformance.Good,
        summary: prescienceSummary,
        details: (
          <div>
            Target had <SpellLink spell={SPELLS.PRESCIENCE_BUFF} /> active. Good job!
          </div>
        ),
      };
    }
    return presciencePerformance;
  }

  private getRolePerformance(application: ShiftingSandsApplications) {
    const className = classColor(application.combatant);
    const roleSummary = <div>Buffed DPS player.</div>;
    let rolePerformance;

    if (
      !(application.combatant.spec?.role === ROLES.DPS.RANGED) &&
      !(application.combatant.spec?.role === ROLES.DPS.MELEE)
    ) {
      rolePerformance = {
        performance: QualitativePerformance.Fail,
        summary: roleSummary,
        details:
          application.combatant.spec?.role === ROLES.HEALER ? (
            <div>
              Buffed Healer: <span className={className}>{application.combatant.name}</span> with{' '}
              <SpellLink spell={SPELLS.SHIFTING_SANDS_BUFF} />. You should always try and buff DPS
              players.
            </div>
          ) : (
            <div>
              Buffed Tank: <span className={className}>{application.combatant.name}</span> with{' '}
              <SpellLink spell={SPELLS.SHIFTING_SANDS_BUFF} />. You should always try and buff DPS
              players.
            </div>
          ),
      };
    } else if (application.combatant.spec === SPECS.AUGMENTATION_EVOKER) {
      rolePerformance = {
        performance: QualitativePerformance.Fail,
        summary: roleSummary,
        details: (
          <div>
            Buffed Augmentation: <span className={className}>{application.combatant.name}</span>{' '}
            with <SpellLink spell={SPELLS.SHIFTING_SANDS_BUFF} />. This should never happen! Make
            sure you position yourself better to avoid this.
          </div>
        ),
      };
    } else {
      rolePerformance = {
        performance: QualitativePerformance.Good,
        summary: roleSummary,
        details: (
          <div>
            Buffed DPS: <span className={className}>{application.combatant.name}</span> with{' '}
            <SpellLink spell={SPELLS.SHIFTING_SANDS_BUFF} />. Good job!
          </div>
        ),
      };
    }
    return rolePerformance;
  }

  guideSubsection(): JSX.Element | null {
    if (!this.active) {
      return null;
    }

    let explanation = (
      <section>
        <strong>
          <SpellLink spell={SPELLS.SHIFTING_SANDS_BUFF} />
        </strong>{' '}
        gives a Versatility buff to one of your allies when you cast your empowers,{' '}
        <SpellLink spell={SPELLS.UPHEAVAL} /> and <SpellLink spell={SPELLS.FIRE_BREATH} />,
        preferring targets with <SpellLink spell={SPELLS.EBON_MIGHT_BUFF_EXTERNAL} /> active.
        Ideally you should try to buff targets that also have{' '}
        <SpellLink spell={SPELLS.PRESCIENCE_BUFF} /> active.
      </section>
    );

    if (this.selectedCombatant.hasTalent(TALENTS_EVOKER.MOTES_OF_POSSIBILITY_TALENT)) {
      explanation = (
        <section>
          <strong>
            <SpellLink spell={SPELLS.SHIFTING_SANDS_BUFF} />
          </strong>{' '}
          gives a Versatility buff to one of your allies when you cast your empowers,{' '}
          <SpellLink spell={SPELLS.UPHEAVAL} /> and <SpellLink spell={SPELLS.FIRE_BREATH} />,
          preferring targets with <SpellLink spell={SPELLS.EBON_MIGHT_BUFF_EXTERNAL} /> active.
          <br />
          <SpellLink spell={TALENTS_EVOKER.MOTES_OF_POSSIBILITY_TALENT} /> also have a 33% chance to
          give <SpellLink spell={SPELLS.SHIFTING_SANDS_BUFF} /> to players who consume them. If you
          personally consume a mote, it will instead apply as if you had cast an empower.
          <br />
          Ideally you should try to buff targets that also have{' '}
          <SpellLink spell={SPELLS.PRESCIENCE_BUFF} /> active.
        </section>
      );
    }

    return (
      <ContextualSpellUsageSubSection
        title="Shifting Sands"
        explanation={explanation}
        uses={this.uses}
        castBreakdownSmallText={
          <> - These boxes represent each cast, colored by how good the usage was.</>
        }
        abovePerformanceDetails={<div style={{ marginBottom: 10 }}></div>}
      />
    );
  }
}

export default ShiftingSands;
