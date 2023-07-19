import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/evoker';
import Events from 'parser/core/Events';

import { ApplyBuffEvent } from 'parser/core/Events';
import { ChecklistUsageInfo, SpellUse } from 'parser/core/SpellUsage/core';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { SpellLink } from 'interface';
import HideGoodCastsSpellUsageSubSection from 'parser/core/SpellUsage/HideGoodCastsSpellUsageSubSection';
import { logSpellUseEvent } from 'parser/core/SpellUsage/SpellUsageSubSection';
import Combatants from 'parser/shared/modules/Combatants';
import ROLES from 'game/ROLES';
import Combatant from 'parser/core/Combatant';

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

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SHIFTING_SANDS_BUFF),
      this.onCast,
    );

    this.addEventListener(Events.fightend, this.finalize);
  }

  private onCast(event: ApplyBuffEvent) {
    const shiftingSandsApplications: ShiftingSandsApplications = {
      event: event,
      ebonMightOn: this.combatants.players[event.targetID].hasBuff(
        SPELLS.EBON_MIGHT_BUFF_EXTERNAL.id,
      ),
      prescienceOn: this.combatants.players[event.targetID].hasBuff(SPELLS.PRESCIENCE_BUFF.id),
      combatant: this.combatants.players[event.targetID],
    };

    this.shiftingSandsApplications.push(shiftingSandsApplications);
  }

  private finalize() {
    // finalize performances
    this.uses = this.shiftingSandsApplications.map(this.explainPerformance);
  }

  private explainPerformance(application: ShiftingSandsApplications): SpellUse {
    const className = application.combatant.spec?.className.replace(/\s/g, '') ?? '';
    let ebonMightPerformance;
    let presciencePerformance;
    let rolePerformance;
    let performance = QualitativePerformance.Fail;

    if (application.ebonMightOn && application.prescienceOn) {
      performance = QualitativePerformance.Perfect;
    } else if (application.ebonMightOn && !application.prescienceOn) {
      performance = QualitativePerformance.Good;
    }
    if (application.combatant.spec?.role === ROLES.HEALER) {
      performance = QualitativePerformance.Fail;
    } else if (
      application.combatant.spec?.role === ROLES.TANK &&
      performance !== QualitativePerformance.Fail
    ) {
      performance = QualitativePerformance.Ok;
    }

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

    const roleSummary = <div>Buffed DPS player.</div>;

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

  guideSubsection(): JSX.Element | null {
    if (!this.active) {
      return null;
    }

    const explanation = (
      <section>
        <strong>
          <SpellLink spell={SPELLS.SHIFTING_SANDS_BUFF} />
        </strong>{' '}
        gives a Versatility buff to one of your allies when you cast your empowers:{' '}
        <SpellLink spell={SPELLS.UPHEAVAL} /> and <SpellLink spell={SPELLS.FIRE_BREATH} />,
        preferring targets with <SpellLink spell={SPELLS.EBON_MIGHT_BUFF_EXTERNAL} /> active.
        Ideally you should try to buff targets that also have{' '}
        <SpellLink spell={SPELLS.PRESCIENCE_BUFF} /> active.
      </section>
    );

    return (
      <HideGoodCastsSpellUsageSubSection
        title="Shifting Sands"
        explanation={explanation}
        uses={this.uses}
        castBreakdownSmallText={
          <> - These boxes represent each cast, colored by how good the usage was.</>
        }
        onPerformanceBoxClick={logSpellUseEvent}
        abovePerformanceDetails={<div style={{ marginBottom: 10 }}></div>}
      />
    );
  }
}

export default ShiftingSands;
