import { useState, type JSX } from 'react';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { TALENTS_DRUID } from 'common/TALENTS';
import Events, {
  ApplyBuffEvent,
  ApplyDebuffEvent,
  CastEvent,
  DamageEvent,
  RefreshBuffEvent,
  RefreshDebuffEvent,
} from 'parser/core/Events';
import { SpellLink } from 'interface';
import { SubSection } from 'interface/guide';
import { formatNumber } from 'common/format';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { encodeEventTargetString } from 'parser/shared/modules/Enemies';
import EnergyTracker from 'analysis/retail/druid/feral/modules/core/energy/EnergyTracker';
import ComboPointTracker from 'analysis/retail/druid/feral/modules/core/combopoints/ComboPointTracker';
import {
  FB_IDS,
  getTigersFuryDamageBonus,
  getTigersFuryDuration,
  TIGERS_FURY_BOOSTED,
} from 'analysis/retail/druid/feral/constants';
import { isConvoking } from 'analysis/retail/druid/shared/spells/ConvokeSpirits';

const MELEE_SPELL_ID = 1;
const COLLAPSED_CAST_LIMIT = 6;

/** DoT spells whose ticks carry the TF damage bonus only when the *snapshot* was taken under TF. */
const TF_SNAPSHOT_DEBUFFS = [SPELLS.RIP, SPELLS.RAKE_BLEED, SPELLS.MOONFIRE_FERAL];

/**
 * Per-window breakdown of casts inside each Tiger's Fury, modeled on Warcraft Logs' ability
 * window view. Auto-attacks are filtered out; Convoke-triggered casts are tagged so they can
 * be distinguished from manual rotation choices.
 *
 * Each window also reports the damage attributable specifically to TF's damage bonus (the bonus
 * portion of TIGERS_FURY_BOOSTED hits that land in the window). Direct hits count when the player
 * has the TF buff up; snapshotted DoT ticks count when their last application was made under TF,
 * mirroring CarnivorousInstinct.
 */
class TigersFuryWindows extends Analyzer {
  static dependencies = {
    energyTracker: EnergyTracker,
    comboPointTracker: ComboPointTracker,
  };

  protected energyTracker!: EnergyTracker;
  protected comboPointTracker!: ComboPointTracker;

  windows: TfWindow[] = [];
  /** Full TF damage bonus, including Carnivorous Instinct rank. Constant per fight. */
  private tfDamageBonus = 0;

  /** Targets whose current Rip was applied with TF up — its ticks are TF-boosted. */
  private targetsWithTfRip: Set<string> = new Set();
  private targetsWithTfRakeBleed: Set<string> = new Set();
  private targetsWithTfMoonfire: Set<string> = new Set();

  constructor(options: Options) {
    super(options);

    this.tfDamageBonus = getTigersFuryDamageBonus(this.selectedCombatant);

    // applybuff (and refreshbuff for back-to-back recasts) fires before TF's energize, so reading
    // EnergyTracker.current here gives the pre-cast value. The cast event is too late.
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.TIGERS_FURY),
      this.onTfBuff,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.TIGERS_FURY),
      this.onTfBuff,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onAnyCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onAnyDamage);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TIGERS_FURY_BOOSTED),
      this.onBoostedDamage,
    );
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(TF_SNAPSHOT_DEBUFFS),
      this.onTfSnapshotApply,
    );
    this.addEventListener(
      Events.refreshdebuff.by(SELECTED_PLAYER).spell(TF_SNAPSHOT_DEBUFFS),
      this.onTfSnapshotApply,
    );
  }

  onTfBuff(event: ApplyBuffEvent | RefreshBuffEvent) {
    this.windows.push({
      castTimestamp: event.timestamp,
      durationMs: getTigersFuryDuration(this.selectedCombatant),
      energyAtStart: this.energyTracker.current,
      cpsAtStart: this.comboPointTracker.current,
      casts: [],
      tfBonusDamage: 0,
      totalDamage: 0,
    });
  }

  onAnyCast(event: CastEvent) {
    const window = this.currentWindow(event.timestamp);
    if (!window) {
      return;
    }
    // melee auto-attacks would spam the sequence
    if (event.ability.guid === MELEE_SPELL_ID) {
      return;
    }
    const icon = event.ability.abilityIcon
      ? event.ability.abilityIcon.replace('.jpg', '')
      : 'inv_misc_questionmark';
    const fromConvoke =
      event.ability.guid !== SPELLS.CONVOKE_SPIRITS.id && isConvoking(this.selectedCombatant);
    window.casts.push({
      offsetMs: event.timestamp - window.castTimestamp,
      spellId: event.ability.guid,
      spellName: event.ability.name,
      icon,
      fromConvoke,
    });
  }

  onAnyDamage(event: DamageEvent) {
    const window = this.currentWindow(event.timestamp);
    if (!window) {
      return;
    }
    window.totalDamage += (event.amount ?? 0) + (event.absorbed ?? 0);
  }

  onBoostedDamage(event: DamageEvent) {
    if (!this.damageBenefitsFromTf(event)) {
      return;
    }
    const window = this.currentWindow(event.timestamp);
    if (!window) {
      return;
    }
    window.tfBonusDamage += calculateEffectiveDamage(event, this.tfDamageBonus);
  }

  /** Mirrors CarnivorousInstinct: direct hits check the live buff, DoT ticks check the snapshot. */
  private damageBenefitsFromTf(event: DamageEvent): boolean {
    const spellId = event.ability.guid;
    const target = encodeEventTargetString(event) || '';
    if (spellId === SPELLS.RIP.id) {
      return this.targetsWithTfRip.has(target);
    }
    if (spellId === SPELLS.RAKE_BLEED.id) {
      return this.targetsWithTfRakeBleed.has(target);
    }
    if (spellId === SPELLS.MOONFIRE_FERAL.id) {
      return this.targetsWithTfMoonfire.has(target);
    }
    return this.selectedCombatant.hasBuff(SPELLS.TIGERS_FURY.id);
  }

  onTfSnapshotApply(event: ApplyDebuffEvent | RefreshDebuffEvent) {
    const spellId = event.ability.guid;
    const target = encodeEventTargetString(event) || '';
    const hasTf = this.selectedCombatant.hasBuff(SPELLS.TIGERS_FURY.id);
    const set =
      spellId === SPELLS.RIP.id
        ? this.targetsWithTfRip
        : spellId === SPELLS.RAKE_BLEED.id
          ? this.targetsWithTfRakeBleed
          : spellId === SPELLS.MOONFIRE_FERAL.id
            ? this.targetsWithTfMoonfire
            : undefined;
    if (!set) {
      return;
    }
    if (hasTf) {
      set.add(target);
    } else {
      set.delete(target);
    }
  }

  private currentWindow(timestamp: number): TfWindow | undefined {
    const window = this.windows[this.windows.length - 1];
    if (!window || timestamp > window.castTimestamp + window.durationMs) {
      return undefined;
    }
    return window;
  }

  get guideSubsection(): JSX.Element {
    return (
      <SubSection title="Tiger's Fury Windows">
        <p>
          Every <SpellLink spell={SPELLS.TIGERS_FURY} /> window below shows the casts you fit into
          it. Auto-attacks are hidden. Casts triggered by{' '}
          <SpellLink spell={TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT} /> are dimmed since they
          aren't part of your manual rotation.
        </p>
        {this.windows.length === 0 ? (
          <p>
            <em>No Tiger's Fury casts in this fight.</em>
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {this.windows.map((win, i) => (
              <TfWindowCard key={i} window={win} owner={this.owner} />
            ))}
          </div>
        )}
      </SubSection>
    );
  }
}

function TfWindowCard({
  window: win,
  owner,
}: {
  window: TfWindow;
  owner: TigersFuryWindows['owner'];
}): JSX.Element {
  const [expanded, setExpanded] = useState(false);
  const collapsible = win.casts.length > COLLAPSED_CAST_LIMIT;
  const visibleCasts = expanded ? win.casts : win.casts.slice(0, COLLAPSED_CAST_LIMIT);

  const startLabel = owner.formatTimestamp(win.castTimestamp);
  const endLabel = owner.formatTimestamp(win.castTimestamp + win.durationMs);

  const fbCount = win.casts.filter((c) => FB_IDS.includes(c.spellId)).length;
  const ripCount = win.casts.filter((c) => c.spellId === SPELLS.RIP.id).length;
  const builderIds = new Set<number>([
    SPELLS.SHRED.id,
    SPELLS.RAKE.id,
    SPELLS.SWIPE_CAT.id,
    SPELLS.MOONFIRE_FERAL.id,
    TALENTS_DRUID.FERAL_FRENZY_TALENT.id,
  ]);
  const builderCount = win.casts.filter((c) => builderIds.has(c.spellId)).length;

  return (
    <div
      style={{
        padding: '10px 14px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 6,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 14,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            flexShrink: 0,
            borderRadius: 6,
            border: '1px solid rgba(0, 0, 0, 0.8)',
            overflow: 'hidden',
            marginTop: 28,
          }}
        >
          <img
            src={`https://wow.zamimg.com/images/wow/icons/large/${SPELLS.TIGERS_FURY.icon}.jpg`}
            alt="Tiger's Fury"
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 8,
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <strong style={{ color: '#fab700', fontSize: '1.05em' }}>
              Tiger's Fury ({startLabel} {'→'} {endLabel})
            </strong>
            <small style={{ opacity: 0.7 }}>
              started at {win.energyAtStart} energy / {win.cpsAtStart} CPs · {builderCount} builder
              {builderCount === 1 ? '' : 's'} · {fbCount}{' '}
              <SpellLink spell={SPELLS.FEROCIOUS_BITE} icon={false}>
                FB
              </SpellLink>
              {ripCount > 0 && (
                <>
                  {' '}
                  · {ripCount}{' '}
                  <SpellLink spell={SPELLS.RIP} icon={false}>
                    Rip
                  </SpellLink>
                </>
              )}
            </small>
          </div>

          {win.casts.length === 0 ? (
            <div style={{ opacity: 0.6 }}>
              <em>No casts during this window.</em>
            </div>
          ) : (
            <>
              <ol
                style={{
                  listStyle: 'none',
                  margin: 0,
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                {visibleCasts.map((cast, i) => (
                  <CastRow key={i} cast={cast} />
                ))}
              </ol>
              {collapsible && (
                <div style={{ marginTop: 6, fontSize: '0.9em' }}>
                  <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: '#fab700',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    {expanded
                      ? 'Show less'
                      : `Show more (${win.casts.length - COLLAPSED_CAST_LIMIT})`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        <div
          style={{
            textAlign: 'right',
            flexShrink: 0,
            minWidth: 110,
            marginTop: 4,
          }}
        >
          <div title="Damage attributable specifically to TF's damage bonus, for boosted hits landing in this window.">
            <div style={{ fontSize: '1.6em', fontWeight: 600, lineHeight: 1.1 }}>
              {formatNumber(win.tfBonusDamage)}
            </div>
            <div style={{ opacity: 0.7, fontSize: '0.85em' }}>damage from TF</div>
          </div>
          <div
            style={{
              marginTop: 6,
              paddingTop: 6,
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            }}
            title="Total damage you dealt during this Tiger's Fury window (any spell, boosted or not)."
          >
            <div style={{ fontSize: '1.05em', fontWeight: 500, opacity: 0.85, lineHeight: 1.1 }}>
              {formatNumber(win.totalDamage)}
            </div>
            <div style={{ opacity: 0.55, fontSize: '0.8em' }}>total in window</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CastRow({ cast }: { cast: WindowCast }): JSX.Element {
  const offsetSec = cast.offsetMs / 1000;
  return (
    <li
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        opacity: cast.fromConvoke ? 0.55 : 1,
        fontStyle: cast.fromConvoke ? 'italic' : 'normal',
      }}
    >
      <span
        style={{
          minWidth: 56,
          textAlign: 'right',
          opacity: 0.7,
          fontVariantNumeric: 'tabular-nums',
          fontSize: '0.9em',
        }}
      >
        +{offsetSec.toFixed(3)}
      </span>
      <img
        src={`https://wow.zamimg.com/images/wow/icons/large/${cast.icon}.jpg`}
        alt=""
        style={{
          width: 22,
          height: 22,
          borderRadius: 3,
          border: '1px solid rgba(0, 0, 0, 0.8)',
          filter: cast.fromConvoke ? 'grayscale(0.7)' : 'none',
          flexShrink: 0,
        }}
      />
      <SpellLink spell={cast.spellId} icon={false}>
        {cast.spellName}
      </SpellLink>
    </li>
  );
}

interface WindowCast {
  offsetMs: number;
  spellId: number;
  spellName: string;
  icon: string;
  fromConvoke: boolean;
}

interface TfWindow {
  castTimestamp: number;
  durationMs: number;
  energyAtStart: number;
  cpsAtStart: number;
  casts: WindowCast[];
  /** Damage attributable to TF's damage bonus for boosted hits landing in this window. */
  tfBonusDamage: number;
  /** Raw player damage (any spell) that landed inside this window. */
  totalDamage: number;
}

export default TigersFuryWindows;
