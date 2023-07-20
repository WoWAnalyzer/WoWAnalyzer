import ThresholdPerformancePercentage, {
  LTEThreshold,
  GTEThreshold,
} from './shared/ThresholdPerformancePercentage';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { Talent } from 'common/TALENTS/types';
import { formatDuration } from 'common/format';
import { SpellIcon, SpellLink, TooltipElement } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import { ON_CAST_BUFF_REMOVAL_GRACE_MS } from '../../constants';

interface ActiveSpenderWindow {
  timestamp: number;
  motePresent: boolean;
  flameshockPresent: boolean;
}

interface FinishedSpenderWindow extends ActiveSpenderWindow {
  elshocksPresent: boolean;
  sopUse: CastEvent;
}

const SOP_SPENDERS = [
  SPELLS.LIGHTNING_BOLT,
  TALENTS.CHAIN_LIGHTNING_TALENT,
  SPELLS.FLAME_SHOCK,
  TALENTS.FROST_SHOCK_TALENT,
  TALENTS.LAVA_BURST_TALENT,
];

const GOOD_SOP_SPENDERS = [SPELLS.LIGHTNING_BOLT.id, TALENTS.CHAIN_LIGHTNING_TALENT.id];

const PERFECT_WINDOWS_THRESHOLD: GTEThreshold = {
  type: 'gte',
  perfect: 0.9,
  good: 0.8,
  ok: 0.7,
};
const WRONG_SOP_THRESHOLD: LTEThreshold = {
  type: 'lte',
  perfect: 0,
  good: 0.1,
  ok: 0.15,
};
const MISSING_ELSHOCKS_THRESHOLD: LTEThreshold = {
  type: 'lte',
  perfect: 0,
  good: 0.2,
  ok: 0.3,
};
const MISSING_MOTE_THRESHOLD: LTEThreshold = {
  type: 'lte',
  perfect: 0,
  good: 0.2,
  ok: 0.3,
};
const MISSING_FLAMESHOCK_THRESHOLD: LTEThreshold = {
  type: 'lte',
  perfect: 0,
  good: 0.2,
  ok: 0.3,
};

class SpenderWindow extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  enabled: boolean;

  protected enemies!: Enemies;

  activeSpenderWindow: ActiveSpenderWindow | null;
  spenderWindows: FinishedSpenderWindow[];

  private stSpender: Talent = TALENTS.EARTH_SHOCK_TALENT;

  constructor(options: Options) {
    super(options);

    this.activeSpenderWindow = null;
    this.spenderWindows = [];

    if (this.selectedCombatant.hasTalent(TALENTS.ELEMENTAL_BLAST_TALENT)) {
      this.stSpender = TALENTS.ELEMENTAL_BLAST_TALENT;
    }

    this.enabled = this.selectedCombatant.hasTalent(TALENTS.SURGE_OF_POWER_TALENT);

    /* There is no point in tracking this at all if the player doesn't have SoP */
    if (!this.enabled) {
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(this.stSpender), this.onSpender);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SOP_SPENDERS), this.onSopSpender);
  }

  onSpender(event: CastEvent) {
    if (this.activeSpenderWindow) {
      return;
    }

    this.activeSpenderWindow = {
      timestamp: event.timestamp,
      motePresent: this.selectedCombatant.hasBuff(
        SPELLS.MASTER_OF_THE_ELEMENTS_BUFF.id,
        null,
        ON_CAST_BUFF_REMOVAL_GRACE_MS,
      ),
      flameshockPresent:
        this.enemies.getEntity(event)?.hasBuff(SPELLS.FLAME_SHOCK.id, event.timestamp) || false,
    };
  }

  onSopSpender(event: CastEvent) {
    if (!this.activeSpenderWindow) {
      return;
    }
    if (
      !this.selectedCombatant.hasBuff(
        SPELLS.SURGE_OF_POWER_BUFF.id,
        null,
        ON_CAST_BUFF_REMOVAL_GRACE_MS,
      )
    ) {
      return;
    }

    const elshocksPresent =
      this.enemies
        .getEntity(event)
        ?.hasBuff(SPELLS.ELECTRIFIED_SHOCKS_DEBUFF.id, event.timestamp) || false;

    this.spenderWindows.push({
      ...this.activeSpenderWindow,
      elshocksPresent,
      sopUse: event,
    });
    this.activeSpenderWindow = null;
  }

  private spenderWindowsRow(
    subWindow: FinishedSpenderWindow[],
    header: JSX.Element,
    performanceThresholds: LTEThreshold | GTEThreshold,
    windowTimestampCallable: (windows: FinishedSpenderWindow[]) => JSX.Element[] = (windows) =>
      windows.map((w) => <>{formatDuration(w.timestamp - this.owner.fight.start_time)}, </>),
  ) {
    return (
      <p style={{ padding: 0, margin: 0 }}>
        {header}
        <ThresholdPerformancePercentage
          threshold={performanceThresholds}
          percentage={subWindow.length / this.spenderWindows.length}
          flatAmount={subWindow.length}
        />{' '}
        <TooltipElement content={<>@ {windowTimestampCallable(subWindow)}</>}>@</TooltipElement>
      </p>
    );
  }

  guideSubsection() {
    const explanation = (
      <>
        <p>
          In single target, when you intend to cast <SpellLink spell={this.stSpender} />
          , you should perform the following cast sequence (sometimes called the "Spender window"):
          <br />
          <small>For more information, see the written guides</small>
        </p>
        <p>
          (<SpellIcon spell={SPELLS.FLAME_SHOCK} />
          <SpellIcon spell={TALENTS.ELECTRIFIED_SHOCKS_TALENT} /> &rarr;)
          <SpellIcon spell={TALENTS.LAVA_BURST_TALENT} /> &rarr;
          <SpellIcon spell={this.stSpender} /> &rarr;
          <SpellIcon spell={SPELLS.LIGHTNING_BOLT} />
        </p>
        <p>
          <small>
            Note: This subsection does not exclude data from &gt; 1 targets automatically. You have
            to account for this yourself if relevant.
          </small>
        </p>
      </>
    );

    const hasMote = this.selectedCombatant.hasTalent(TALENTS.MASTER_OF_THE_ELEMENTS_TALENT);
    const hasElshocks = this.selectedCombatant.hasTalent(TALENTS.ELECTRIFIED_SHOCKS_TALENT);

    type WindowBreakdown = {
      perfect: FinishedSpenderWindow[];
      wrongSop: FinishedSpenderWindow[];
      missingElshocks: FinishedSpenderWindow[];
      missingMote: FinishedSpenderWindow[];
      missingFlameshock: FinishedSpenderWindow[];
    };

    const windowBreakdown: WindowBreakdown = {
      perfect: [],
      wrongSop: [],
      missingElshocks: [],
      missingMote: [],
      missingFlameshock: [],
    };

    this.spenderWindows.forEach((w) => {
      let perfect = true;
      if (!GOOD_SOP_SPENDERS.includes(w.sopUse?.ability.guid || 0)) {
        windowBreakdown.wrongSop.push(w);
        perfect = false;
      }

      if (hasElshocks && !w.elshocksPresent) {
        windowBreakdown.missingElshocks.push(w);
        perfect = false;
      }

      if (hasMote && !w.motePresent) {
        windowBreakdown.missingMote.push(w);
        perfect = false;
      }

      if (!w.flameshockPresent) {
        windowBreakdown.missingFlameshock.push(w);
        perfect = false;
      }

      if (perfect) {
        windowBreakdown.perfect.push(w);
      }
    });
    const data = (
      <div>
        <p>
          {this.spenderWindowsRow(
            windowBreakdown.perfect,
            <>Perfect spender windows: </>,
            PERFECT_WINDOWS_THRESHOLD,
          )}
        </p>
        <p style={{ paddingBottom: 0, marginBottom: 0 }}>
          <strong>Imperfect window breakdown</strong>
          <small>- Note: One window might be included multiple times. </small>
        </p>
        {this.spenderWindowsRow(
          windowBreakdown.wrongSop,
          <>
            <SpellLink spell={TALENTS.SURGE_OF_POWER_TALENT} /> used on inefficient spell:{' '}
          </>,
          WRONG_SOP_THRESHOLD,
          (windows) =>
            windows.map((w) => (
              <>
                {formatDuration(w.sopUse.timestamp - this.owner.fight.start_time)}
                <SpellIcon spell={w.sopUse.ability.guid} />,
              </>
            )),
        )}
        {hasElshocks &&
          this.spenderWindowsRow(
            windowBreakdown.missingElshocks,
            <>
              <SpellLink spell={TALENTS.ELECTRIFIED_SHOCKS_TALENT} /> missing:{' '}
            </>,
            MISSING_ELSHOCKS_THRESHOLD,
          )}
        {hasMote &&
          this.spenderWindowsRow(
            windowBreakdown.missingMote,
            <>
              <SpellLink spell={this.stSpender} /> cast without{' '}
              <SpellLink spell={TALENTS.MASTER_OF_THE_ELEMENTS_TALENT} />:{' '}
            </>,
            MISSING_MOTE_THRESHOLD,
          )}
        {this.spenderWindowsRow(
          windowBreakdown.missingFlameshock,
          <>
            <SpellLink spell={SPELLS.FLAME_SHOCK} /> missing:{' '}
          </>,
          MISSING_FLAMESHOCK_THRESHOLD,
        )}
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }
}

export default SpenderWindow;
