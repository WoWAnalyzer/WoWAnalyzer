import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_DRUID } from 'common/TALENTS';
import { Options } from 'parser/core/Module';
import Events, { UpdateSpellUsableEvent, UpdateSpellUsableType } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Abilities from 'parser/core/modules/Abilities';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { SpellIcon } from 'interface';
import SPELLS from 'common/SPELLS';

const DEBUG = false;

const MAJOR_SPELLS = [
  TALENTS_DRUID.FORCE_OF_NATURE_TALENT,
  SPELLS.INCARNATION_ORBITAL_STRIKE,
  SPELLS.INCARNATION_CHOSEN_OF_ELUNE,
  SPELLS.CELESTIAL_ALIGNMENT_ORBITAL_STRIKE,
  SPELLS.CELESTIAL_ALIGNMENT,
  SPELLS.CONVOKE_SPIRITS,
  SPELLS.NATURES_SWIFTNESS,
  TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_TALENT,
];

const MAX_CDR = 15_000;

/** **Control of the Dream**
 *
 * https://www.wowhead.com/spell=434249/control-of-the-dream
 *
 * Keeper of the Grove Hero Talent
 *
 * (as-of 12.0.5)
 * Time elapsed while your major abilities are available to be used or at maximum charges
 * is subtracted from that ability's cooldown after the next time you use it, up to 15 seconds.
 * Balance: Force of Nature, Celestial Alignment, Incarnation: CoE, Convoke the Spirits
 * Resto: Nature's Swiftness, Incarnation: ToL, Convoke the Spirits
 */
export default class ControlOfTheDream extends Analyzer.withDependencies({
  spellUsable: SpellUsable,
  abilities: Abilities,
}) {
  /** Info about each 'major abilities' CDR, indexed by spellId */
  cdrSpellInfos: CdrSpellInfo[] = [];

  get totalEarlyCastCount(): number {
    return this.cdrSpellInfos.reduce((sum, cdrSpellInfo) => sum + cdrSpellInfo.earlyCastCount, 0);
  }

  get totalEffectiveCdr(): number {
    return (
      this.cdrSpellInfos.reduce((sum, cdrSpellInfo) => sum + cdrSpellInfo.totalEffectiveCdr, 0) /
      1_000
    );
  }

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.CONTROL_OF_THE_DREAM_TALENT);

    this.addEventListener(
      Events.UpdateSpellUsable.by(SELECTED_PLAYER).spell(MAJOR_SPELLS),
      this.onMajorSpellCdUpdate,
    );

    // This Talent does not actually reduce the CD overall; it just gives the player a 15s window
    // to delay the cast without losing efficiency. But if we wait for 15s before casting again,
    // then the next CD will be 15s shorter, and that messes up the computed effective cooldown.
    // Therefore, the default implementation of "maxSpells" in "CastEfficiency",
    // based on the effective cooldown, is wrong.
    // Let's ignore this ability's CDR except for the first cast.
    if (this.active) {
      MAJOR_SPELLS.forEach((spell) => {
        const ability = (options.abilities as Abilities).getAbility(spell.id);
        const abilityMaxCharges = this.deps.abilities.getMaxCharges(spell.id) || 1;
        if (ability) {
          ability.castEfficiency.maxCasts = (cooldown) =>
            (this.owner.fightDuration + MAX_CDR) / (cooldown * 1_000) +
            // Take into account extra charges (e.g. Incarnation: CoE with Whirling Stars talent)
            (abilityMaxCharges - 1);
        }
      });
    }
  }

  onMajorSpellCdUpdate(event: UpdateSpellUsableEvent) {
    const spellId = event.ability.guid;
    if (!this.cdrSpellInfos[spellId]) {
      this.cdrSpellInfos[spellId] = {
        earlyCastCount: 0,
        totalEffectiveCdr: 0,
        lastCdrApplied: 0,
      };
    }
    const info = this.cdrSpellInfos[spellId];

    if (event.updateType === UpdateSpellUsableType.BeginCooldown) {
      // Check if this cast benefited from CotD by comparing against when the spell
      // would have been available without CotD's CDR (but with other sources like Cenarius' Guidance)
      if (info.lastAvailable !== undefined && info.lastCdrApplied > 0) {
        const lastAvailableWithoutCdrApplied = info.lastAvailable + info.lastCdrApplied;
        const earlyCastTimeGained = Math.max(0, lastAvailableWithoutCdrApplied - event.timestamp);
        if (earlyCastTimeGained > 0) {
          info.earlyCastCount += 1;
          info.totalEffectiveCdr += earlyCastTimeGained;
        }
      }
      const effectiveCDR = this.reduceCooldown(info, spellId, event);
      info.lastCdrApplied = effectiveCDR;
    } else if (event.updateType === UpdateSpellUsableType.EndCooldown) {
      // A major ability just finished CD, register it
      info.lastAvailable = event.timestamp;
    }
  }

  private reduceCooldown(
    info: CdrSpellInfo,
    spellId: number,
    event: UpdateSpellUsableEvent,
  ): number {
    // We can discard spells that do not have their max number of charges
    if (this.hasNotMaximumNumberOfCharges(spellId, event)) {
      DEBUG &&
        console.info(
          `[${event.timestamp}] Cooldown of ${spellId} is not reduced as it's below max number of charges`,
        );
      return 0;
    }

    const cdr = this.getCooldownReductionMs(info, event);
    return this.deps.spellUsable.reduceCooldown(spellId, cdr);
  }

  private hasNotMaximumNumberOfCharges(spellId: number, event: UpdateSpellUsableEvent): boolean {
    const abilityMaxCharges = this.deps.abilities.getMaxCharges(spellId);
    if (abilityMaxCharges && abilityMaxCharges > 1) {
      const ability = this.deps.abilities.getAbility(spellId);
      if (!ability) {
        return false;
      }

      const abilityCharges = this.deps.spellUsable.chargesAvailable(spellId);
      DEBUG &&
        console.info(`[${event.timestamp}] ${spellId} has ${abilityCharges} remaining charges.`);

      // This method is invoked after the ability has been cast, thus we add 1 charge
      // to the current number of charges to know how many charges were available before this cast.
      return abilityCharges + 1 < abilityMaxCharges;
    } else {
      // Ability with only 1 charge always has maximum number of charges (1) when cast
      return false;
    }
  }

  private getCooldownReductionMs(info: CdrSpellInfo, event: UpdateSpellUsableEvent): number {
    if (info.lastAvailable === undefined) {
      // Assume ability was available for at least the cap duration (15s) pre-pull.
      // We have no way of knowing exactly how long it was off CD pre-combat,
      // but this is a reasonnable assumption for most pull scenarios.
      return MAX_CDR;
    } else {
      // Otherwise, we need to compute how long the ability has been off CD
      const timeElapsedSinceSpellAvailable = event.timestamp - info.lastAvailable;

      // CD reduction is capped.
      return Math.min(timeElapsedSinceSpellAvailable, MAX_CDR);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(1)}
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        size="flexible"
        dropdown={
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Ability</th>
                  <th>Early casts</th>
                  <th>Eff. CDR</th>
                </tr>
              </thead>
              <tbody>
                {this.cdrSpellInfos.map((cdrInfo, spellId) => (
                  <tr>
                    <th>
                      <SpellIcon spell={spellId} />
                    </th>
                    <td>{cdrInfo.earlyCastCount}</td>
                    <td>{(cdrInfo.totalEffectiveCdr / 1_000).toFixed(0)}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        }
        tooltip={
          <>
            <p>
              <b>Early Cast:</b> A cast benefiting from this Talent’s CD reduction.
            </p>
            <p>
              <b>Effective CDR:</b> Total CD time saved via Early Casts.
            </p>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.CONTROL_OF_THE_DREAM_TALENT}>
          <>
            <div>
              {this.totalEarlyCastCount} <small>Early Casts</small>
            </div>
            <div>
              {this.totalEffectiveCdr.toFixed(0)}s <small>Effective CDR</small>
            </div>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

interface CdrSpellInfo {
  /** Timestamp spell last became available (cooldown finished) */
  lastAvailable?: number;
  /** CotD CDR applied during the previous cooldown cycle, in ms */
  lastCdrApplied: number;
  /** Times spell was cast earlier than would have been possible without CotD */
  earlyCastCount: number;
  /** Sum of effective 'early cast' CDR, in ms */
  totalEffectiveCdr: number;
}
