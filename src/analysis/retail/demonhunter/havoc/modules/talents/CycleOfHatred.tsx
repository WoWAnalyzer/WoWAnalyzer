import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS/demonhunter';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { CYCLE_OF_HATRED_SCALING } from 'analysis/retail/demonhunter/havoc/constants';

/*
  example report: https://www.warcraftlogs.com/reports/QxHJ9MTtmVYNXPLd/#fight=1&source=2
 */

const MS_IN_SECOND = 1000;
const TRIGGER_SPELLS = [
  SPELLS.CHAOS_STRIKE,
  SPELLS.ANNIHILATION,
  SPELLS.BLADE_DANCE,
  SPELLS.DEATH_SWEEP,
  TALENTS_DEMON_HUNTER.GLAIVE_TEMPEST_TALENT,
];

class CycleOfHatred extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  totalCooldownReduction = 0;
  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.CYCLE_OF_HATRED_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(TRIGGER_SPELLS), this.onCastEvent);
  }

  onCastEvent(_: CastEvent) {
    if (!this.spellUsable.isOnCooldown(TALENTS_DEMON_HUNTER.EYE_BEAM_TALENT.id)) {
      return;
    }
    const effectiveReduction = this.spellUsable.reduceCooldown(
      TALENTS_DEMON_HUNTER.EYE_BEAM_TALENT.id,
      MS_IN_SECOND *
        CYCLE_OF_HATRED_SCALING[
          this.selectedCombatant.getTalentRank(TALENTS_DEMON_HUNTER.CYCLE_OF_HATRED_TALENT.id)
        ],
    );
    this.totalCooldownReduction += effectiveReduction;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(7)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spellId={TALENTS_DEMON_HUNTER.CYCLE_OF_HATRED_TALENT.id}>
          <>
            {formatNumber(this.totalCooldownReduction / 1000)} sec{' '}
            <small>
              total <SpellIcon id={TALENTS_DEMON_HUNTER.EYE_BEAM_TALENT.id} /> Eye Beam cooldown
              reduction
            </small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default CycleOfHatred;
