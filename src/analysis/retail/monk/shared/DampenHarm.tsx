import { formatNumber, formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  DamageEvent,
  ResourceChangeEvent,
  DrainEvent,
  HealEvent,
} from 'parser/core/Events';
import BoringValue from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class DampenHarm extends Analyzer {
  hitsReduced = 0;
  damageReduced = 0;
  currentMaxHP = 0;

  constructor(options: Options) {
    super(options);
    if (!this.selectedCombatant.hasTalent(talents.DAMPEN_HARM_TALENT.id)) {
      this.active = false;
      return;
    }
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.updateMaxHP);
    this.addEventListener(Events.resourcechange.by(SELECTED_PLAYER), this.updateMaxHP);
    this.addEventListener(Events.drain.to(SELECTED_PLAYER), this.updateMaxHP);
    this.addEventListener(Events.heal.to(SELECTED_PLAYER), this.updateMaxHP);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.damageReduction);
  }

  damageReduction(event: DamageEvent) {
    if (event.ability.guid === SPELLS.STAGGER_TAKEN.id) {
      return;
    }
    if (!this.selectedCombatant.hasBuff(talents.DAMPEN_HARM_TALENT.id)) {
      return;
    }
    const maxHP = event.maxHitPoints || this.currentMaxHP;
    if (maxHP === 0) {
      return;
    }
    this.hitsReduced += 1;
    const h = event.amount || 0;
    const a = event.absorbed || 0;
    const o = event.overkill || 0;
    const hitSize = h + a + o;
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

  updateMaxHP(event: DamageEvent | ResourceChangeEvent | DrainEvent | HealEvent) {
    this.currentMaxHP = event.maxHitPoints || this.currentMaxHP;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            {formatNumber(this.hitsReduced)} hits were reduced for a total of{' '}
            {formatThousands(this.damageReduced)} damage reduced.
          </>
        }
      >
        <BoringValue
          label={
            <>
              <SpellLink id={talents.DAMPEN_HARM_TALENT} /> Damage Mitigated
            </>
          }
        >
          <img alt="Damage Mitigated" src="/img/shield.png" className="icon" />{' '}
          {formatThousands(this.damageReduced)} Damage
        </BoringValue>
      </Statistic>
    );
  }
}

export default DampenHarm;
