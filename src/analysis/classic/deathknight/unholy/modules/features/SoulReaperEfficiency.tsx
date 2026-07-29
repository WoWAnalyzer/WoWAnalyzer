import SPELLS from 'common/SPELLS/classic/deathknight';
import SharedSoulReaperEfficiency from 'analysis/classic/deathknight/shared/SoulReaperEfficiency';

/**
 * Unholy DK Soul Reaper — uses the shared tracker directly, just pointed at
 * the Unholy variant spell so the statistic box shows the right icon/name.
 * No HB AoE excuse for Unholy (HB is off-spec; AoE priority is DnD/Blood Boil).
 */
class SoulReaperEfficiency extends SharedSoulReaperEfficiency {
  protected override get soulReaperSpell() {
    return SPELLS.SOUL_REAPER_UNHOLY;
  }
}

export default SoulReaperEfficiency;
