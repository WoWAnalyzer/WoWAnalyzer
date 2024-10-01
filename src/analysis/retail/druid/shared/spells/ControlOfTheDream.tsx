import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_DRUID } from 'common/TALENTS';
import { Options } from 'parser/core/Module';
import Events, { UpdateSpellUsableEvent, UpdateSpellUsableType } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const MAJOR_SPELLS = [
  TALENTS_DRUID.FORCE_OF_NATURE_TALENT,
  TALENTS_DRUID.CELESTIAL_ALIGNMENT_TALENT,
  TALENTS_DRUID.INCARNATION_CHOSEN_OF_ELUNE_TALENT,
  TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT,
  TALENTS_DRUID.NATURES_SWIFTNESS_TALENT,
  TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_TALENT,
];

const MAX_CDR = 15_000;

const deps = {
  spellUsable: SpellUsable,
};

// TODO TWW - module is sufficient to make CDs show correctly on chart,
//            but would be nice to also have a user facing element showing how effective it was
/**
 * **Control of the Dream**
 * Keeper of the Grove Hero Talent
 *
 * Time elapsed while your major abilities are available to be used is subtracted from that
 * ability's cooldown after the next time you use it, up to 15 seconds.
 * Balance: Force of Nature, Celestial Alignment, Convoke the Spirits
 * Resto: Nature's Swiftness, Incarnation: ToL, Convoke the Spirits
 */
export default class ControlOfTheDream extends Analyzer.withDependencies(deps) {
  /**
   * Mapping from major ability spellID to the timestamp it last became available.
   * When there's no mapping (beginning of encounter), we presume maxed CDR.
   */
  cotdBecameAvailableTimestamps: Map<number, number> = new Map();

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.CONTROL_OF_THE_DREAM_TALENT);

    this.addEventListener(
      Events.UpdateSpellUsable.by(SELECTED_PLAYER).spell(MAJOR_SPELLS),
      this.onMajorSpellCdUpdate,
    );
  }

  onMajorSpellCdUpdate(event: UpdateSpellUsableEvent) {
    if (event.updateType === UpdateSpellUsableType.BeginCooldown) {
      // we just used a major ability - apply the appropriate amount of CDR
      const spellId = event.ability.guid;
      const lastBecameAvailable = this.cotdBecameAvailableTimestamps.get(spellId);
      const cdr =
        lastBecameAvailable === undefined
          ? MAX_CDR
          : Math.min(MAX_CDR, this.owner.currentTimestamp - lastBecameAvailable);
      this.deps.spellUsable.reduceCooldown(spellId, cdr);
    } else if (event.updateType === UpdateSpellUsableType.EndCooldown) {
      // a major ability just finished CD, register it
      const spellId = event.ability.guid;
      this.cotdBecameAvailableTimestamps.set(spellId, this.owner.currentTimestamp);
    }
  }
}
