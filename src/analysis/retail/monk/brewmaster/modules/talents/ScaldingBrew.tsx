import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent, CastEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import Enemies from 'parser/shared/modules/Enemies';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';

const DAMAGE_AMP_PER_RANK = 0.0075;
const BASE_DAMAGE_AMP = 0.075;

export default class ScaldingBrew extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
  };

  protected enemies!: Enemies;
  protected combatants!: Combatants;

  bonusDamage = 0;
  // hits that did not trigger scalding brew
  // we don't count hits used to apply the KS debuff
  missedHits = 0;

  lastCast?: CastEvent;

  rank?: number;
  mult: number = 0;

  constructor(options: Options) {
    super(options);

    this.rank = 0;
    if (!this.rank) {
      this.active = false;
      return;
    }

    this.mult = BASE_DAMAGE_AMP + (this.rank - 1) * DAMAGE_AMP_PER_RANK;

    this.addEventListener(
      Events.damage.spell(talents.KEG_SMASH_TALENT).by(SELECTED_PLAYER),
      this.damage,
    );
    this.addEventListener(
      Events.cast.spell(talents.KEG_SMASH_TALENT).by(SELECTED_PLAYER),
      this.cast,
    );
  }

  private cast(event: CastEvent) {
    this.lastCast = event;
  }

  private damage(event: DamageEvent) {
    const target = this.enemies.getEntity(event) || this.combatants.getEntity(event);
    if (!target) {
      return;
    }
    if (target.hasBuff(SPELLS.BREATH_OF_FIRE_DEBUFF.id)) {
      this.bonusDamage += calculateEffectiveDamage(event, this.mult);
    } else if (target.hasBuff(talents.KEG_SMASH_TALENT.id, event.timestamp - 100)) {
      this.missedHits += 1;

      if (this.lastCast) {
        this.lastCast.meta = {
          isInefficientCast: true,
          inefficientCastReason: (
            <>
              This cast did not benefit from <SpellLink id={talents.SCALDING_BREW_TALENT.id} /> or
              freshly apply the <SpellLink id={talents.KEG_SMASH_TALENT.id} /> debuff.
            </>
          ),
        };
      }
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(0)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={`${this.missedHits} of your Keg Smash hits (besides the initial debuff application) were without the Breath of Fire debuff.`}
      >
        <BoringSpellValueText spellId={talents.SCALDING_BREW_TALENT.id}>
          <>
            <ItemDamageDone amount={this.bonusDamage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
