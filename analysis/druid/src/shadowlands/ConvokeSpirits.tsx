import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import SPECS from 'game/SPECS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AbilityEvent,
  ApplyBuffEvent,
  CastEvent,
  TargettedEvent,
} from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';

import ActiveDruidForm, { DruidForm } from '../core/ActiveDruidForm';

/*
 * For several spells we include multiple IDs for the same spell -
 * probably only one ID is being used but as of this writing neither Abelito nor Sref
 * has cared enough to find out which.
 */

/** All convokable spells that 'hit' with a buff application */
const CONVOKE_BUFF_SPELLS = [
  SPELLS.REJUVENATION,
  SPELLS.REJUVENATION_GERMINATION,
  SPELLS.REGROWTH,
  SPELLS.IRONFUR,
  SPELLS.TIGERS_FURY,
  SPELLS.FERAL_FRENZY_TALENT,
  SPELLS.WILD_GROWTH,
  SPELLS.FLOURISH_TALENT,
  SPELLS.STARFALL_CAST, // apparently this is also the ID for the buff
];
/** All convokable spells that 'hit' with a debuff application */
const CONVOKE_DEBUFF_SPELLS = [
  SPELLS.MOONFIRE,
  SPELLS.MOONFIRE_BEAR,
  SPELLS.MOONFIRE_FERAL,
  SPELLS.RAKE_BLEED,
  SPELLS.THRASH_BEAR_DOT,
];
/** All convokable spells that 'hit' with direct healing */
const CONVOKE_HEAL_SPELLS = [SPELLS.SWIFTMEND];
/** All convokable spells that 'hit' with direct damage */
const CONVOKE_DAMAGE_SPELLS = [
  SPELLS.WRATH,
  SPELLS.WRATH_MOONKIN,
  SPELLS.STARSURGE_AFFINITY,
  SPELLS.STARSURGE_MOONKIN,
  SPELLS.FULL_MOON,
  SPELLS.FEROCIOUS_BITE,
  SPELLS.SHRED,
  SPELLS.MANGLE_BEAR,
  SPELLS.PULVERIZE_TALENT,
];
/** Convokable spells that have travel time */
const SPELLS_WITH_TRAVEL_TIME = [
  SPELLS.STARSURGE_AFFINITY,
  SPELLS.STARSURGE_MOONKIN,
  SPELLS.FULL_MOON,
  SPELLS.WRATH,
  SPELLS.WRATH_MOONKIN,
];
const SPELL_IDS_WITH_TRAVEL_TIME = SPELLS_WITH_TRAVEL_TIME.map((s) => s.id);
/** Convokable spells that can hit multiple targets */
const SPELL_IDS_WITH_AOE = [
  SPELLS.MOONFIRE.id,
  SPELLS.MOONFIRE_BEAR.id,
  SPELLS.MOONFIRE_FERAL.id,
  SPELLS.FULL_MOON.id,
  SPELLS.THRASH_BEAR_DOT.id,
  SPELLS.WILD_GROWTH.id,
];

const SPELLS_CAST = 16;
const SPELLS_CAST_RESTO = 12;

const AOE_BUFFER_MS = 100;
const AFTER_CHANNEL_BUFFER_MS = 50;
const TRAVEL_BUFFER_MS = 2_000;

/**
 * **Convoke the Spirits**
 * Covenant - Night Fae
 *
 * Call upon the Night Fae for an eruption of energy,
 * channeling a rapid flurry of 16 (12 for Resto) Druid spells and abilities over 4 sec.
 */
class ConvokeSpirits extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    activeDruidForm: ActiveDruidForm,
  };

  protected abilities!: Abilities;
  protected activeDruidForm!: ActiveDruidForm;

  /** The number of times Convoke has been cast */
  cast: number = 0;
  /** The number of spells cast by a full Convoke channel */
  spellsPerCast: number;
  /** Timestamp of the most recent AoE spell hit registered during Convoke - used to avoid double counts */
  mostRecentAoeTimestamp = 0;
  /** Mapping from convoke cast number to a tracker for that cast - note that index zero will always be empty */
  convokeTracker: ConvokeCast[] = [];
  /**
   * A mapping from spellId of a spell with travel time to the last cast for that ID.
   * If we register a 'hit' during convoke, but the cast was within plausible travel time and
   * had same target, we assume the hit was due to a hardcast (and not convoke).
   * Cast entries will be cleared when we find a matching 'hit'.
   */
  lastTravelingSpellCast: Array<CastEvent | undefined> = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasCovenant(COVENANTS.NIGHT_FAE.id);

    this.spellsPerCast =
      this.selectedCombatant.spec === SPECS.RESTORATION_DRUID ? SPELLS_CAST_RESTO : SPELLS_CAST;

    // watch for convokes
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.CONVOKE_SPIRITS),
      this.onConvoke,
    );

    // watch for spell 'hits'
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(CONVOKE_BUFF_SPELLS),
      this.onHit,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(CONVOKE_BUFF_SPELLS),
      this.onHit,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(CONVOKE_BUFF_SPELLS),
      this.onHit,
    );

    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(CONVOKE_DEBUFF_SPELLS),
      this.onHit,
    );
    this.addEventListener(
      Events.refreshdebuff.by(SELECTED_PLAYER).spell(CONVOKE_DEBUFF_SPELLS),
      this.onHit,
    );
    this.addEventListener(
      Events.applydebuffstack.by(SELECTED_PLAYER).spell(CONVOKE_DEBUFF_SPELLS),
      this.onHit,
    );

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(CONVOKE_HEAL_SPELLS), this.onHit);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(CONVOKE_DAMAGE_SPELLS),
      this.onHit,
    );

    // watch for travel time casts
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS_WITH_TRAVEL_TIME),
      this.onTravelTimeCast,
    );
  }

  onConvoke(_: ApplyBuffEvent) {
    this.cast += 1;
    this.convokeTracker[this.cast] = { spellIdToCasts: [], form: this.activeDruidForm.form };
  }

  onHit(event: AbilityEvent<any> & TargettedEvent<any>) {
    const spellId = event.ability.guid;

    const isNewHit = this.isNewHit(spellId);
    const isTravelTime = SPELL_IDS_WITH_TRAVEL_TIME.includes(spellId);
    const wasProbablyHardcast = isTravelTime && this.wasProbablyHardcast(event);
    const isConvoking = this.isConvoking();

    if (isNewHit && isConvoking && !wasProbablyHardcast) {
      // spell hit during convoke and was due to convoke
      this.registerConvokedSpell(spellId);
    } else if (isTravelTime && !wasProbablyHardcast && this.isWithinTravelFromConvoke()) {
      // spell hit soon after convoke but was due to convoke
      this.registerConvokedSpell(spellId);
    }

    if (isTravelTime) {
      this.onTravelTimeHit(spellId);
    }
  }

  /**
   * Tallies the given spellId as a convoked cast during the current convoke.
   */
  registerConvokedSpell(spellId: number): void {
    const currentConvoke = this.convokeTracker[this.cast];
    if (!currentConvoke.spellIdToCasts[spellId]) {
      currentConvoke.spellIdToCasts[spellId] = 0;
    }
    currentConvoke.spellIdToCasts[spellId] += 1;
  }

  /**
   * True iff the player is currently Convoking the Spirits.
   * Includes a small buffer after the end because occasionally the last convoked spell occurs
   * slightly after the end.
   */
  isConvoking(): boolean {
    return this.selectedCombatant.hasBuff(SPELLS.CONVOKE_SPIRITS.id, null, AFTER_CHANNEL_BUFFER_MS);
  }

  /**
   * True iff we're soon enough after Convoking that a convoked spell with travel time
   * could still plausibly be in the air.
   */
  isWithinTravelFromConvoke(): boolean {
    return this.selectedCombatant.hasBuff(SPELLS.CONVOKE_SPIRITS.id, null, TRAVEL_BUFFER_MS);
  }

  /**
   * True iff a hit with the given traveling spellId could plausibly have come from a hardcast
   */
  wasProbablyHardcast(event: AbilityEvent<any> & TargettedEvent<any>): boolean {
    const lastCast: CastEvent | undefined = this.lastTravelingSpellCast[event.ability.guid];
    return (
      lastCast !== undefined &&
      lastCast.timestamp + TRAVEL_BUFFER_MS > this.owner.currentTimestamp &&
      lastCast.targetID === event.targetID
    );
  }

  /**
   * Checks if the hit from the given spellId is 'new', and updates trackers appropriately.
   * A hit from a single target spell is always new.
   * A hit from an AoE spell is only new if there wasn't another very recent hit.
   */
  isNewHit(spellId: number): boolean {
    const isAoe: boolean = SPELL_IDS_WITH_AOE.includes(spellId);
    if (!isAoe) {
      return true;
    }
    if (this.owner.currentTimestamp <= this.mostRecentAoeTimestamp + AOE_BUFFER_MS) {
      return false; // still within the same AoE
    } else {
      // new AoE
      this.mostRecentAoeTimestamp = this.owner.currentTimestamp;
      return true;
    }
  }

  onTravelTimeCast(event: CastEvent) {
    this.lastTravelingSpellCast[event.ability.guid] = event;
  }

  onTravelTimeHit(spellId: number) {
    this.lastTravelingSpellCast[spellId] = undefined;
  }

  // TODO discount rejuvs procced from other sources?

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={
          <>
            Abilities cast by Convoke do not create cast events; this listing is created by tracking
            related events during the channel. Occasionally a Convoke will cast an ability that hits
            nothing (like Thrash when only immune targets are in range). In these cases we won't be
            able to track it and so the number of spells listed may not add up to{' '}
            {this.spellsPerCast}.
          </>
        }
        dropdown={
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Cast #</th>
                  <th>Form</th>
                  <th>Spells In Cast</th>
                </tr>
              </thead>
              <tbody>
                {this.convokeTracker.map((spellIdToCasts, index) => (
                  <tr key={index}>
                    <th scope="row">{index}</th>
                    <td>{spellIdToCasts.form}</td>
                    <td>
                      {spellIdToCasts.spellIdToCasts.map((casts, spellId) => (
                        <>
                          <SpellLink id={spellId} /> {casts} <br />
                        </>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.CONVOKE_SPIRITS}>-</BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ConvokeSpirits;

/** A tracker for things that happen in a single Convoke cast */
export interface ConvokeCast {
  /** A mapping from spellId to the number of times that spell was cast during the Convoke */
  spellIdToCasts: number[];
  /** The form the Druid was in during the cast */
  form: DruidForm;
}
