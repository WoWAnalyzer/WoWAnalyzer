import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import { TIERS } from 'game/TIERS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, SummonEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { SpellLink } from 'interface';
import ItemSetLink from 'interface/ItemSetLink';
import { WARLOCK_TWW2_ID } from 'common/ITEMS';

import DemoPets from '../../pets/DemoPets';
import PETS from '../../pets/PETS';

/**
 * TWW Season 2 Tier Set for Demonology Warlock
 *
 * 2-Set: Your spells and abilities have a chance to hit a Jackpot! that summons a Greater Dreadstalker at 265% effectiveness.
 *        Casting Summon Demonic Tyrant always hits a Jackpot!
 *        Tracks Jackpot procs via multiple detection methods including Tyrant casts and spell events.
 * 4-Set: Casting Hand of Gul'dan causes your active Dreadstalkers to cast Dreadbite at 20% effectiveness.
 *        This damage is increased by 10% for each Soul Shard spent on Hand of Gul'dan.
 *        Tracks Hand of Gul'dan casts but not enhanced damage due to shared spell IDs.
 */
class TWW2TierSet extends Analyzer {
  static dependencies = {
    demoPets: DemoPets,
  };

  protected demoPets!: DemoPets;

  private jackpotProcs = 0;
  private tyrantCasts = 0;
  private handOfGuldanCasts = 0;
  private empoweredHandOfGuldanCasts = 0;

  constructor(options: Options) {
    super(options);
    // Only activate if player has tier set equipped
    this.active = this.selectedCombatant.has2PieceByTier(TIERS.TWW2);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HAND_OF_GULDAN_CAST),
      this.onHandOfGuldanCast,
    );

    // Track Tyrant casts to know when procs are from Tyrant
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.SUMMON_DEMONIC_TYRANT_TALENT),
      this.onTyrantCast,
    );

    // Listen for the actual Jackpot proc summon (Greater Dreadstalkers)
    // Using summon event to track actual summons, not just casts
    this.addEventListener(
      Events.summon.by(SELECTED_PLAYER).spell(SPELLS.CALL_GREATER_DREADSTALKER),
      this.onJackpotProc,
    );
  }

  onTyrantCast(event: CastEvent) {
    // Count Tyrant casts (each one guarantees a Jackpot proc)
    this.tyrantCasts += 1;
  }

  onJackpotProc(event: SummonEvent) {
    // This is the actual Greater Dreadstalker summon from tier set Jackpot proc
    this.jackpotProcs += 1;
  }

  onHandOfGuldanCast(event: CastEvent) {
    this.handOfGuldanCasts += 1;

    // For 4-set: only count as empowered if we have active Dreadstalkers when Hand of Gul'dan is cast
    if (this.has4Piece) {
      // Filter pets by GUID since getPetCount uses pet.id (instance ID) not pet.guid (pet type)
      const activeDreadstalkers = this.demoPets
        ._getPets(event.timestamp)
        .filter((pet) => pet.guid === PETS.DREADSTALKER.guid).length;
      if (activeDreadstalkers > 0) {
        this.empoweredHandOfGuldanCasts += 1;
      }
    }
  }

  get has2Piece() {
    return this.selectedCombatant.has2PieceByTier(TIERS.TWW2);
  }

  get has4Piece() {
    return this.selectedCombatant.has4PieceByTier(TIERS.TWW2);
  }

  statistic() {
    // Only show the statistic if:
    // 1. Player has 2-piece tier set
    // 2. There were actual Jackpot procs detected
    if (!this.has2Piece || this.jackpotProcs === 0) {
      return null;
    }

    return (
      <Statistic
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
        tooltip={
          <>
            <strong>2-Set Bonus (Jackpot!):</strong>
            <ul>
              <li>Total Jackpot! procs: {this.jackpotProcs}</li>
              <li>Random procs: {this.jackpotProcs - this.tyrantCasts}</li>
              <li>Tyrant procs: {this.tyrantCasts}</li>
              <li>Summons Greater Dreadstalkers at 265% effectiveness</li>
            </ul>
            {this.has4Piece && (
              <>
                <strong>4-Set Bonus (Enhanced Dreadbite):</strong>
                <ul>
                  <li>
                    <SpellLink spell={SPELLS.HAND_OF_GULDAN_CAST} /> casts: {this.handOfGuldanCasts}
                  </li>
                  <li>
                    Empowered <SpellLink spell={SPELLS.HAND_OF_GULDAN_CAST} /> casts:{' '}
                    {this.empoweredHandOfGuldanCasts}
                  </li>
                  <li>Only counts casts when Dreadstalkers were active</li>
                </ul>
              </>
            )}
            <br />
            <small>
              Note: Tracks tier set procs and empowered abilities. Damage attribution between
              Greater and regular Dreadstalkers is complex.
            </small>
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.CALL_GREATER_DREADSTALKER}>
          <small>
            <ItemSetLink id={WARLOCK_TWW2_ID}>TWW Season 2 Tier Set</ItemSetLink>
          </small>
          <br />
          {this.jackpotProcs} <small>procs</small>
          <br />
          {this.has4Piece && (
            <>
              {this.empoweredHandOfGuldanCasts}{' '}
              <small>
                empowered <SpellLink spell={SPELLS.HAND_OF_GULDAN_CAST} /> casts
              </small>
              <br />
            </>
          )}
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default TWW2TierSet;
