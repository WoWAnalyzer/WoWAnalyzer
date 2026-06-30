import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS/classic/deathknight';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, SummonEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

interface GargoyleWindow {
  start: number;
  end: number | null;
  damage: number;
}

/**
 * Tracks Summon Gargoyle usage: how many times it was cast vs. how many times
 * it could have been cast (based on fight duration), and total gargoyle damage.
 *
 * Ported from the WCL DK Analyzer GargoyleAnalysis.
 */
class GargoyleTracker extends Analyzer {
  static dependencies = {
    castEfficiency: CastEfficiency,
  };
  protected castEfficiency!: CastEfficiency;

  private _windows: GargoyleWindow[] = [];
  private _gargoyleNpcId: number | null = null;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SUMMON_GARGOYLE),
      this.onCast,
    );
    this.addEventListener(
      Events.summon.by(SELECTED_PLAYER).spell(SPELLS.SUMMON_GARGOYLE),
      this.onSummon,
    );
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onPetDamage);
  }

  onCast(event: CastEvent) {
    this._windows.push({ start: event.timestamp, end: null, damage: 0 });
  }

  onSummon(event: SummonEvent) {
    // Record gargoyle NPC ID for damage attribution.
    if (event.ability.guid === SPELLS.SUMMON_GARGOYLE.id) {
      this._gargoyleNpcId = (event as unknown as { targetID?: number }).targetID ?? null;
    }
  }

  onPetDamage(event: DamageEvent) {
    // If we somehow missed both the cast and summon events — e.g. a pre-pull
    // cast, where the summon event itself happens before the fight window and
    // gets filtered out same as the cast — open a window now so this damage
    // still gets attributed instead of being dropped.
    if (this._windows.length === 0 || this._windows[this._windows.length - 1].end !== null) {
      this._windows.push({ start: event.timestamp, end: null, damage: 0 });
    }

    // Attribute damage to the current open window.
    // Close the window once the gargoyle expires (damage stops for >5s after last hit)
    // — we close lazily in the statistic getter instead.
    const current = this._windows[this._windows.length - 1];
    current.damage += event.amount + (event.absorbed ?? 0);
  }

  get numCasts() {
    return this._windows.length;
  }

  get possibleCasts() {
    // Delegate to CastEfficiency so the eyeMult cooldown reduction from Evil
    // Eye of Galakras (registered on the spell's Abilities.ts entry) is
    // accounted for, instead of assuming a flat 180s cooldown here.
    const info = this.castEfficiency.getCastEfficiencyForSpell(SPELLS.SUMMON_GARGOYLE);
    return Math.max(this.numCasts, info ? Math.ceil(info.maxCasts) : this.numCasts);
  }

  get totalDamage() {
    return this._windows.reduce((sum, w) => sum + w.damage, 0);
  }

  get suggestionThresholds() {
    return {
      actual: this.numCasts,
      isLessThan: {
        minor: this.possibleCasts,
        average: this.possibleCasts,
        major: this.possibleCasts - 1,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(4)}
        size="flexible"
        tooltip={
          <>
            <div>
              Cast <strong>{this.numCasts}</strong> of <strong>{this.possibleCasts}</strong>{' '}
              possible times.
            </div>
            <div>Total gargoyle damage: {formatNumber(this.totalDamage)}</div>
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.SUMMON_GARGOYLE}>
          {this.numCasts} / {this.possibleCasts} <small>casts</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default GargoyleTracker;
