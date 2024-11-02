import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import EventHistory from 'parser/shared/modules/EventHistory';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import GradiatedPerformanceBar from 'interface/guide/components/GradiatedPerformanceBar';

class UnfurlingDarkness extends Analyzer {
  static dependencies = {
    eventHistory: EventHistory,
    abilityTracker: AbilityTracker,
  };
  protected eventHistory!: EventHistory;
  protected abilityTracker!: AbilityTracker;

  procsGained: number = 0;
  procsWasted: number = 0;
  lastProcTime: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.UNFURLING_DARKNESS_TALENT);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.UNFURLING_DARKNESS_BUFF),
      this.onBuffApplied,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.UNFURLING_DARKNESS_BUFF),
      this.onBuffRemoved,
    );
  }

  onBuffApplied(event: ApplyBuffEvent) {
    this.procsGained += 1; // Add a proc to the counter
    this.lastProcTime = event.timestamp;
  }

  onBuffRemoved(event: RemoveBuffEvent) {
    const durationHeld = event.timestamp - this.lastProcTime;
    if (durationHeld >= 7990) {
      this.procsWasted += 1;
    }
  }

  getProcsUsed() {
    return this.procsGained - this.procsWasted;
  }

  getMaxProcs() {
    return Math.floor(this.owner.fightDuration / 15000); //Proc can only occur every 15 seconds.
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
        <BoringSpellValueText spell={SPELLS.UNFURLING_DARKNESS_BUFF}>
          <>
            {this.getProcsUsed()}/{this.procsGained}{' '}
            <small>Procs out of {this.getMaxProcs()} possible </small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  get guideSubsection(): JSX.Element {
    const goodUD = {
      count: this.getProcsUsed(),
      label: 'Unfurling Darkness procs used',
    };

    const badUD = {
      count: this.procsWasted,
      label: 'Unfurling Darkness procs wasted',
    };

    const missedUD = {
      count: this.getMaxProcs(),
      label: 'Unfurling Darkness possible procs',
    };

    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS.UNFURLING_DARKNESS_TALENT} />
        </b>{' '}
        can be gained every 15 seconds by casting <SpellLink spell={SPELLS.VAMPIRIC_TOUCH} />.<br />
        Cast <SpellLink spell={SPELLS.VAMPIRIC_TOUCH} /> while the buff is active to avoid wasting
        procs.
      </p>
    );

    const data = (
      <div>
        <strong>Unfurling Darkness Usage</strong>
        <GradiatedPerformanceBar good={goodUD} bad={badUD} />
        <strong>Unfurling Darkness Procs</strong>
        <GradiatedPerformanceBar good={goodUD} ok={missedUD} />
      </div>
    );
    return explanationAndDataSubsection(explanation, data, 50);
  }
}

export default UnfurlingDarkness;
