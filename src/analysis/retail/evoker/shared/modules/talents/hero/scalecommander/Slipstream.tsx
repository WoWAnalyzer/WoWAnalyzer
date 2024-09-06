import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import { SoupIcon, WarningIcon } from 'interface/icons';
import SpellLink from 'interface/SpellLink';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { Options } from 'parser/core/EventSubscriber';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';

/** Deep Breath resets the cooldown of Hover. */
class Slipstream extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  chargesRecharged = 0;
  chargesWasted = 0;
  maxCharges = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SLIPSTREAM_TALENT);

    this.maxCharges = this.selectedCombatant.hasTalent(TALENTS.AERIAL_MASTERY_TALENT) ? 2 : 1;

    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([SPELLS.DEEP_BREATH_SCALECOMMANDER, SPELLS.BREATH_OF_EONS_SCALECOMMANDER]),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    if (event.prepull) {
      return;
    }

    const charges = this.spellUsable.chargesAvailable(SPELLS.HOVER.id);

    this.chargesRecharged += this.maxCharges - charges;
    this.chargesWasted += charges;

    this.spellUsable.endCooldown(SPELLS.HOVER.id, event.timestamp, false, true);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(1)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <TalentSpellText talent={TALENTS.SLIPSTREAM_TALENT}>
          <div>
            <SoupIcon /> {this.chargesRecharged}{' '}
            <small>
              <SpellLink spell={SPELLS.HOVER} /> charges gained
            </small>
          </div>
          {this.chargesWasted > 0 && (
            <div>
              <WarningIcon /> {this.chargesWasted}{' '}
              <small>
                <SpellLink spell={SPELLS.HOVER} /> charges overcapped
              </small>
            </div>
          )}
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Slipstream;
