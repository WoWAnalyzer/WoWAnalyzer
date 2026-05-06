import SPELLS from 'common/SPELLS/evoker';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/evoker';
import Events, {
  ApplyBuffStackEvent,
  EventType,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { TEMPORAL_BURST_CDR_MODIFIER_PER_STACK } from 'analysis/retail/evoker/shared';
/**
 * Casting Tip the Scales grants you 30% Haste, CDR, and movement speed, decaying over 30 sec.
 */
class TemporalBurst extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  currentCDRMod = 1;

  spellIdsToCDR = [
    SPELLS.UPHEAVAL,
    SPELLS.UPHEAVAL_FONT,
    SPELLS.FIRE_BREATH,
    SPELLS.FIRE_BREATH_FONT,
    SPELLS.DEEP_BREATH,
    TALENTS.BREATH_OF_EONS_TALENT,
    TALENTS.BLISTERING_SCALES_TALENT,
    TALENTS.SPATIAL_PARADOX_TALENT,
    TALENTS.PRESCIENCE_TALENT,
    TALENTS.BESTOW_WEYRNSTONE_TALENT,
    TALENTS.QUELL_TALENT,
    SPELLS.HOVER,
    SPELLS.WING_BUFFET,
    SPELLS.TAIL_SWIPE,
    TALENTS.TIME_SPIRAL_TALENT,
    TALENTS.ZEPHYR_TALENT,
    TALENTS.RESCUE_TALENT,
    SPELLS.EMERALD_BLOSSOM,
    TALENTS.UNRAVEL_TALENT,
    TALENTS.OPPRESSING_ROAR_TALENT,
    TALENTS.CAUTERIZING_FLAME_TALENT,
    TALENTS.SLEEP_WALK_TALENT,
    TALENTS.VERDANT_EMBRACE_TALENT,
    TALENTS.LANDSLIDE_TALENT,
    TALENTS.OBSIDIAN_SCALES_TALENT,
    TALENTS.EXPUNGE_TALENT,
    TALENTS.EBON_MIGHT_TALENT,
    TALENTS.TIP_THE_SCALES_TALENT,
    TALENTS.TIME_SKIP_TALENT,
    SPELLS.BLESSING_OF_THE_BRONZE,
    SPELLS.FURY_OF_THE_ASPECTS,
    TALENTS.DREAM_BREATH_TALENT,
    SPELLS.DREAM_BREATH_FONT,
    TALENTS.REVERSION_TALENT,
    TALENTS.REWIND_TALENT,
    TALENTS.TIME_DILATION_TALENT,
    TALENTS.TEMPORAL_ANOMALY_TALENT,
    TALENTS.TEMPORAL_BARRIER_TALENT,
    TALENTS.DREAM_FLIGHT_TALENT,
    TALENTS.STASIS_TALENT,
    SPELLS.NATURALIZE,
  ].map((x) => x.id);

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.TEMPORAL_BURST_TALENT);
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.TEMPORAL_BURST_BUFF),
      this.onStackUpdate,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.TEMPORAL_BURST_BUFF),
      this.onStackUpdate,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.TEMPORAL_BURST_BUFF),
      this.onStackUpdate,
    );
  }

  onStackUpdate(event: ApplyBuffStackEvent | RemoveBuffStackEvent | RemoveBuffEvent) {
    this.spellUsable.removeCooldownRateChange(this.spellIdsToCDR, this.currentCDRMod);
    if (event.type === EventType.RemoveBuff) {
      this.currentCDRMod = 1;
    } else {
      this.currentCDRMod = 1 + event.stack * TEMPORAL_BURST_CDR_MODIFIER_PER_STACK;
    }
    this.spellUsable.applyCooldownRateChange(this.spellIdsToCDR, this.currentCDRMod);
  }
}

export default TemporalBurst;
