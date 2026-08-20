import TALENTS from 'common/TALENTS/deathknight';
import { SpellLink } from 'interface';
import { PassFailCheckmark, PerformanceMark } from 'interface/guide';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

export const OPENER_DURATION_MS = 20_000;
const COOLDOWN_ALIGNMENT_MS = 2_000;

export const FROST_OPENER_IDS = {
  riderBreathMethod: 'frost.opener.rider-breath.method',
  riderBreathWowhead: 'frost.opener.rider-breath.wowhead',
  deathbringerBreathMethod: 'frost.opener.deathbringer-breath.method',
  deathbringerBreathWowhead: 'frost.opener.deathbringer-breath.wowhead',
  riderShatteringMethod: 'frost.opener.rider-shattering.method',
  deathbringerShatteringMethod: 'frost.opener.deathbringer-shattering.method',
} as const;

export interface OpenerVariant {
  id: (typeof FROST_OPENER_IDS)[keyof typeof FROST_OPENER_IDS];
  label: string;
  /** Ordered stages; spells inside one stage may occur in any order. */
  stages: number[][];
}

export interface OpenerMatch {
  variant: OpenerVariant;
  matchedStages: number;
  passed: boolean;
  stageResults: OpenerStageResult[];
  trackedCasts: CastEvent[];
}

export interface OpenerStageResult {
  expected: number[];
  actual: CastEvent[];
  matched: boolean;
}

const ids = {
  obliterate: TALENTS.OBLITERATE_TALENT.id,
  frostStrike: TALENTS.FROST_STRIKE_TALENT.id,
  erw: TALENTS.EMPOWER_RUNE_WEAPON_TALENT.id,
  pillar: TALENTS.PILLAR_OF_FROST_TALENT.id,
  breath: TALENTS.BREATH_OF_SINDRAGOSA_TALENT.id,
  frostwyrm: TALENTS.FROSTWYRMS_FURY_TALENT.id,
  mark: TALENTS.REAPERS_MARK_TALENT.id,
};

function stage(...spells: Array<number | false>): number[] {
  return spells.filter((spell): spell is number => spell !== false);
}

export function openerVariants({
  deathbringer,
  breath,
  frostwyrm,
}: {
  deathbringer: boolean;
  breath: boolean;
  frostwyrm: boolean;
}): OpenerVariant[] {
  const fwf = frostwyrm && ids.frostwyrm;
  if (breath && deathbringer) {
    return [
      {
        id: FROST_OPENER_IDS.deathbringerBreathMethod,
        label: 'Method — Deathbringer Breath opener',
        stages: [
          stage(ids.obliterate),
          stage(ids.mark, ids.erw),
          stage(ids.pillar, ids.breath, ids.obliterate),
          stage(ids.obliterate),
          stage(ids.frostStrike),
          stage(ids.obliterate),
          ...(fwf ? [stage(fwf)] : []),
        ],
      },
      {
        id: FROST_OPENER_IDS.deathbringerBreathWowhead,
        label: 'Wowhead — Deathbringer Breath opener',
        stages: [
          stage(ids.erw),
          stage(ids.mark),
          stage(ids.pillar),
          stage(ids.breath),
          stage(ids.obliterate),
          ...(fwf ? [stage(fwf)] : []),
        ],
      },
    ];
  }

  if (breath) {
    return [
      {
        id: FROST_OPENER_IDS.riderBreathMethod,
        label: 'Method — Rider Breath opener',
        stages: [stage(ids.obliterate), stage(ids.erw), stage(ids.pillar, ids.breath, fwf)],
      },
      {
        id: FROST_OPENER_IDS.riderBreathWowhead,
        label: 'Wowhead — Rider Breath opener',
        stages: [
          stage(ids.erw),
          stage(ids.obliterate),
          stage(ids.breath),
          stage(ids.pillar),
          ...(fwf ? [stage(fwf)] : []),
          stage(ids.erw),
          stage(ids.obliterate),
        ],
      },
    ];
  }

  return [
    deathbringer
      ? {
          id: FROST_OPENER_IDS.deathbringerShatteringMethod,
          label: 'Method — Deathbringer Shattering opener',
          stages: [stage(ids.erw), stage(ids.pillar, fwf), stage(ids.mark)],
        }
      : {
          id: FROST_OPENER_IDS.riderShatteringMethod,
          label: 'Method — Rider Shattering opener',
          stages: [stage(ids.erw), stage(ids.pillar, fwf)],
        },
  ];
}

function sameStage(actual: number[], expected: number[]): boolean {
  if (actual.length !== expected.length) {
    return false;
  }
  const remaining = [...actual];
  return expected.every((spell) => {
    const index = remaining.indexOf(spell);
    if (index < 0) {
      return false;
    }
    remaining.splice(index, 1);
    return true;
  });
}

export function matchOpener(casts: CastEvent[], variants: OpenerVariant[]): OpenerMatch {
  const trackedSpells = new Set(variants.flatMap((variant) => variant.stages.flat()));
  const trackedCasts = casts.filter((cast) => trackedSpells.has(cast.ability.guid));

  const matches = variants.map((variant) => {
    let castIndex = 0;
    let matchedStages = 0;
    let matchingPrefix = true;
    const stageResults = variant.stages.map((expected) => {
      const actual = trackedCasts.slice(castIndex, castIndex + expected.length);
      const matched = sameStage(
        actual.map((cast) => cast.ability.guid),
        expected,
      );
      if (matchingPrefix && matched) {
        matchedStages += 1;
      } else {
        matchingPrefix = false;
      }
      castIndex += expected.length;
      return { expected, actual, matched };
    });
    return {
      variant,
      matchedStages,
      passed: matchedStages === variant.stages.length,
      stageResults,
      trackedCasts,
    };
  });

  return matches.reduce((best, result) =>
    result.passed || result.matchedStages > best.matchedStages ? result : best,
  );
}

function SpellSequence({ spellIds }: { spellIds: number[] }) {
  if (spellIds.length === 0) {
    return <em>None</em>;
  }

  return spellIds.map((spellId, index) => (
    <span key={`${spellId}-${index}`}>
      {index > 0 && ' + '}
      <SpellLink spell={spellId} />
    </span>
  ));
}

function CastSequence({ casts, fightStart }: { casts: CastEvent[]; fightStart: number }) {
  if (casts.length === 0) {
    return <em>None</em>;
  }

  return casts.map((cast, index) => (
    <span key={`${cast.timestamp}-${cast.ability.guid}-${index}`}>
      {index > 0 && ' → '}
      <SpellLink
        spell={{
          id: cast.ability.guid,
          name: cast.ability.name,
          icon: cast.ability.abilityIcon,
        }}
      />{' '}
      <small className="text-muted">(+{((cast.timestamp - fightStart) / 1000).toFixed(1)}s)</small>
    </span>
  ));
}

export default class FrostOpener extends Analyzer {
  openerCasts: CastEvent[] = [];
  cooldownCasts: CastEvent[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
  }

  onCast(event: CastEvent) {
    if (event.timestamp - this.owner.fight.start_time <= OPENER_DURATION_MS) {
      this.openerCasts.push(event);
    }
    if (
      event.ability.guid === ids.pillar ||
      event.ability.guid === ids.breath ||
      event.ability.guid === ids.frostwyrm ||
      event.ability.guid === ids.mark
    ) {
      this.cooldownCasts.push(event);
    }
  }

  get variants(): OpenerVariant[] {
    return openerVariants({
      deathbringer: this.selectedCombatant.hasTalent(TALENTS.REAPERS_MARK_TALENT),
      breath: this.selectedCombatant.hasTalent(TALENTS.BREATH_OF_SINDRAGOSA_TALENT),
      frostwyrm: this.selectedCombatant.hasTalent(TALENTS.FROSTWYRMS_FURY_TALENT),
    });
  }

  get openerMatch(): OpenerMatch {
    return matchOpener(this.openerCasts, this.variants);
  }

  private alignedWithPillar(cast: CastEvent): boolean {
    if (this.selectedCombatant.hasBuff(TALENTS.PILLAR_OF_FROST_TALENT.id, cast.timestamp)) {
      return true;
    }
    return this.cooldownCasts.some(
      (other) =>
        other.ability.guid === ids.pillar &&
        Math.abs(other.timestamp - cast.timestamp) <= COOLDOWN_ALIGNMENT_MS,
    );
  }

  get windowChecks() {
    return this.cooldownCasts
      .filter((cast) => cast.ability.guid !== ids.pillar)
      .map((cast) => ({
        cast,
        passed: this.alignedWithPillar(cast),
      }));
  }

  get guideSubsection() {
    const opener = this.openerMatch;
    const windowChecks = this.windowChecks;
    const aligned = windowChecks.filter((check) => check.passed).length;
    const firstMismatch = opener.stageResults.findIndex((stageResult) => !stageResult.matched);
    const fightStart = this.owner.fight.start_time;
    const explanation = (
      <p>
        The opener is matched against every supported Wowhead and Method variant for your build.
        Steps remain ordered, while actions listed in the same step may occur in any order. Later
        cooldown uses check that Breath, Frostwyrm's Fury, and Reaper's Mark remain aligned with
        Pillar rather than requiring a single exact cast sequence for the whole fight.
      </p>
    );
    const data = (
      <div>
        <p>
          <PerformanceMark
            perf={opener.passed ? QualitativePerformance.Good : QualitativePerformance.Fail}
          />{' '}
          Opener: the first {opener.matchedStages}/{opener.variant.stages.length} stages matched.{' '}
          Closest supported sequence: {opener.variant.label}
        </p>
        {firstMismatch >= 0 && (
          <p>
            <strong>First difference:</strong> Stage {firstMismatch + 1} expected{' '}
            <SpellSequence spellIds={opener.stageResults[firstMismatch].expected} />, but{' '}
            {opener.stageResults[firstMismatch].actual.length === 0 ? (
              <>you had no corresponding tracked cast</>
            ) : (
              <>
                your corresponding tracked cast
                {opener.stageResults[firstMismatch].actual.length === 1 ? '' : 's'}{' '}
                {opener.stageResults[firstMismatch].actual.length === 1 ? 'was' : 'were'}{' '}
                <CastSequence
                  casts={opener.stageResults[firstMismatch].actual}
                  fightStart={fightStart}
                />
              </>
            )}
            .
          </p>
        )}
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Stage</th>
              <th>Expected</th>
              <th>Your tracked casts</th>
            </tr>
          </thead>
          <tbody>
            {opener.stageResults.map((stageResult, index) => (
              <tr key={index}>
                <td>
                  <PassFailCheckmark pass={index < opener.matchedStages} /> {index + 1}
                </td>
                <td>
                  <SpellSequence spellIds={stageResult.expected} />
                </td>
                <td>
                  <CastSequence casts={stageResult.actual} fightStart={fightStart} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!opener.passed && (
          <p className="text-muted">
            Tracked casts are grouped using the expected stage sizes. Rows after the first
            difference are approximate because one missing or early cast can shift the remaining
            sequence.
          </p>
        )}
        <p>
          <strong>Your full first {OPENER_DURATION_MS / 1000} seconds:</strong>{' '}
          <CastSequence casts={this.openerCasts} fightStart={fightStart} />
        </p>
        <p>
          <PerformanceMark
            perf={
              aligned === windowChecks.length
                ? QualitativePerformance.Good
                : QualitativePerformance.Fail
            }
          />{' '}
          Cooldown alignment: {aligned}/{windowChecks.length} uses aligned with{' '}
          <SpellLink spell={TALENTS.PILLAR_OF_FROST_TALENT} />
        </p>
        {windowChecks.length > 0 && (
          <table className="table table-condensed">
            <thead>
              <tr>
                <th>Cooldown use</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {windowChecks.map(({ cast, passed }, index) => (
                <tr key={`${cast.timestamp}-${cast.ability.guid}-${index}`}>
                  <td>
                    <CastSequence casts={[cast]} fightStart={fightStart} />
                  </td>
                  <td>
                    <PassFailCheckmark pass={passed} />{' '}
                    {passed
                      ? 'Aligned with Pillar'
                      : `Outside the ${COOLDOWN_ALIGNMENT_MS / 1000}s Pillar alignment window`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
    return explanationAndDataSubsection(explanation, data);
  }
}
