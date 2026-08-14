import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import Analyzer, { Options } from 'parser/core/Analyzer';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import SpellLink from 'interface/SpellLink';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import { MaelstromWeaponTracker } from '../resourcetracker';

class VoltaicBlaze extends Analyzer.withDependencies({
  abilityTracker: AbilityTracker,
  maelstromTracker: MaelstromWeaponTracker,
}) {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.VOLTAIC_BLAZE_TALENT);
    if (!this.active) {
      return;
    }
  }

  statistic() {
    const vb = this.deps.abilityTracker.getAbility(SPELLS.VOLTAIC_BLAZE_CAST.id);
    const mw = this.deps.maelstromTracker.getGeneratedBySpell(SPELLS.VOLTAIC_BLAZE_CAST.id);

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            <ul>
              <li>
                <strong>{vb.casts}</strong> casts
              </li>
              <li>
                <strong>{formatNumber(mw)}</strong>{' '}
                <SpellLink spell={TALENTS.MAELSTROM_WEAPON_TALENT} /> generated
              </li>
            </ul>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.VOLTAIC_BLAZE_TALENT}>
          <ItemDamageDone amount={vb.damageVal.effective} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default VoltaicBlaze;
