import { formatNumber, formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class DampenHarm extends Analyzer {
  hitsReduced = 0;
  damageReduced = 0;
  constructor(options: Options) {
    super(options);
    if (!this.selectedCombatant.hasTalent(SPELLS.DAMPEN_HARM_TALENT.id)) {
      this.active = false;
      return;
    }
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.damageReduction);
  }

  damageReduction(event: DamageEvent) {
    if (event.ability.guid !== SPELLS.STAGGER_TAKEN.id) {
      if (this.selectedCombatant.hasBuff(SPELLS.DAMPEN_HARM_TALENT.id)) {
        this.hitsReduced += 1;
        const h = event.amount || 0;
        const a = event.absorbed || 0;
        const o = event.overkill || 0;
        // TODO: ACTUAL MAX HP TRACKING
        // event.maxHitPoints is insufficient as many events such as SPELL_ABSORBED are missing it and Keg of the Heavens is cursed.
        const maxHP = event.maxHitPoints || 0;
        const hitSize = h + a + o;
        if (maxHP > 0) {
          let drdh = 0;
          // given 1 - u / h = 0.2 + 0.3 * u, where u = hit size after all other dr effecs, h = current max hp
          // the following can be then produced algebraically:
          if (hitSize >= maxHP / 2) {
            drdh = 0.5;
          } else {
            drdh = 0.6 - 0.5 * Math.sqrt(0.64 - (6 * hitSize) / (5 * maxHP));
          }
          this.damageReduced += hitSize / (1 - drdh) - hitSize;
        }
      }
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spellId={SPELLS.DAMPEN_HARM_TALENT.id}>
          {formatNumber(this.hitsReduced)} hits were reduced for a total of{' '}
          {formatThousands(this.damageReduced)} damage reduced.
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DampenHarm;
