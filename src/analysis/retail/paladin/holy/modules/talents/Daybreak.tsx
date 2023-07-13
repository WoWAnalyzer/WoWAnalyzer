import TALENTS from 'common/TALENTS/paladin';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, {
  AnyEvent,
  CastEvent,
  DamageEvent,
  GetRelatedEvents,
  HealEvent,
  ResourceChangeEvent,
} from 'parser/core/Events';
import BoringValueText from 'parser/ui/BoringValueText';
import ItemManaGained from 'parser/ui/ItemManaGained';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import {
  DAYBREAK_DAMAGE,
  DAYBREAK_HEALING,
  DAYBREAK_MANA,
} from '../../normalizers/CastLinkNormalizer';

class Daybreak extends Analyzer {
  casts: number = 0;
  glimmersAbsorbed: number = 0;

  healing: number = 0;
  overhealing: number = 0;
  damage: number = 0;

  manaGained: number = 0;
  manaWasted: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DAYBREAK_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast.spell(TALENTS.DAYBREAK_TALENT).by(SELECTED_PLAYER),
      this.cast,
    );
  }

  cast(event: CastEvent) {
    this.casts += 1;

    GetRelatedEvents(event, DAYBREAK_HEALING).forEach((e: AnyEvent) => {
      const he = e as HealEvent;
      this.healing += he.amount + (he.absorbed || 0);
      this.overhealing += he.overheal || 0;
    });

    GetRelatedEvents(event, DAYBREAK_DAMAGE).forEach((e: AnyEvent) => {
      const de = e as DamageEvent;
      this.damage += de.amount + (de.absorbed || 0);
    });

    const manaEvents = GetRelatedEvents(event, DAYBREAK_MANA);
    this.glimmersAbsorbed += manaEvents.length;
    manaEvents.forEach((e: AnyEvent) => {
      const rce = e as ResourceChangeEvent;
      this.manaGained += rce.resourceChange;
      this.manaWasted += rce.waste;
    });
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            Healing Done: {this.healing.toFixed(2)} <br />
            Overhealing Done: {this.overhealing.toFixed(2)} <br />
            Damage Done: {this.damage.toFixed(2)} <br />
            Mana gained: {this.manaGained} <br />
            Mana gain wasted: {this.manaWasted}
          </>
        }
      >
        <BoringValueText
          label={
            <>
              <SpellLink spell={TALENTS.DAYBREAK_TALENT} />
            </>
          }
        >
          {this.owner.formatItemHealingDone(this.healing)} <br />
          {this.owner.formatItemDamageDone(this.damage)} <br />
          <ItemManaGained amount={this.manaGained} useAbbrev /> <br />
          {(this.glimmersAbsorbed / this.casts).toFixed(1)} Glimmers/Cast
        </BoringValueText>
      </Statistic>
    );
  }
}
export default Daybreak;
