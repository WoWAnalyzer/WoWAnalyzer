import type { JSX } from 'react';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { TALENTS_DRUID } from 'common/TALENTS';
import Events, { ApplyBuffEvent, CastEvent, RefreshBuffEvent } from 'parser/core/Events';
import { SpellLink } from 'interface';
import { SubSection } from 'interface/guide';
import { SpellSequence, type CastInSequence } from 'interface/guide/components/CastSequence';
import EnergyTracker from 'analysis/retail/druid/feral/modules/core/energy/EnergyTracker';
import ComboPointTracker from 'analysis/retail/druid/feral/modules/core/combopoints/ComboPointTracker';
import { FB_IDS, getTigersFuryDuration } from 'analysis/retail/druid/feral/constants';
import { isConvoking } from 'analysis/retail/druid/shared/spells/ConvokeSpirits';

const MELEE_SPELL_ID = 1;

/**
 * Per-window breakdown of casts inside each Tiger's Fury, modeled on the Warlock Demon Tyrant
 * view. Auto-attacks are filtered out; Convoke-triggered casts are tagged so they can be
 * distinguished from manual rotation choices.
 */
class TigersFuryWindows extends Analyzer {
  static dependencies = {
    energyTracker: EnergyTracker,
    comboPointTracker: ComboPointTracker,
  };

  protected energyTracker!: EnergyTracker;
  protected comboPointTracker!: ComboPointTracker;

  windows: TfWindow[] = [];

  constructor(options: Options) {
    super(options);

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
  }

  onTfBuff(event: ApplyBuffEvent | RefreshBuffEvent) {
    this.windows.push({
      castTimestamp: event.timestamp,
      durationMs: getTigersFuryDuration(this.selectedCombatant),
      energyAtStart: this.energyTracker.current,
      cpsAtStart: this.comboPointTracker.current,
      casts: [],
    });
  }

  onAnyCast(event: CastEvent) {
    const window = this.windows[this.windows.length - 1];
    if (!window || event.timestamp > window.castTimestamp + window.durationMs) {
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
      timestamp: event.timestamp,
      spellId: event.ability.guid,
      spellName: event.ability.name,
      icon,
      tooltip: (
        <div>
          <strong>{event.ability.name}</strong>
          <div>
            <small>
              +{((event.timestamp - window.castTimestamp) / 1000).toFixed(1)}s into window
            </small>
          </div>
          {fromConvoke && (
            <div>
              <em>From Convoke the Spirits</em>
            </div>
          )}
        </div>
      ),
      ghosted: fromConvoke,
    });
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
  const fbCount = win.casts.filter((c) => FB_IDS.includes(c.spellId)).length;
  const ripCount = win.casts.filter((c) => c.spellId === SPELLS.RIP.id).length;
  const builderIds = new Set([
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
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <strong>@ {owner.formatTimestamp(win.castTimestamp)}</strong>
        <small style={{ opacity: 0.7 }}>
          {(win.durationMs / 1000).toFixed(0)}s window · {win.casts.length} cast
          {win.casts.length === 1 ? '' : 's'} · {builderCount} builder
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
          )}{' '}
          · started at {win.energyAtStart} energy / {win.cpsAtStart} CPs
        </small>
      </div>
      {win.casts.length > 0 ? (
        <SpellSequence casts={win.casts} iconSize={32} />
      ) : (
        <div style={{ opacity: 0.6 }}>
          <em>No casts during this window.</em>
        </div>
      )}
    </div>
  );
}

interface TfWindow {
  castTimestamp: number;
  durationMs: number;
  energyAtStart: number;
  cpsAtStart: number;
  casts: CastInSequence[];
}

export default TigersFuryWindows;
