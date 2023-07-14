import { formatDuration, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Combatant from 'parser/core/Combatant';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, {
  ApplyBuffEvent,
  FightEndEvent,
  HealEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

const HEALING_INC = 0.25;

class TyrsDeliverance extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  casts: number = 0;
  duration: number = 0;
  lastApply: number = 0;

  healing: number = 0;
  overhealing: number = 0;

  incHealing: number = 0;
  incOverhealing: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.TYRS_DELIVERANCE_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.applybuff.spell([TALENTS.TYRS_DELIVERANCE_TALENT]).by(SELECTED_PLAYER),
      this.onApply,
    );
    this.addEventListener(
      Events.removebuff.spell([TALENTS.TYRS_DELIVERANCE_TALENT]).by(SELECTED_PLAYER),
      this.onRemove,
    );
    this.addEventListener(Events.fightend, this.onRemove);

    this.addEventListener(
      Events.heal.spell([SPELLS.TYRS_DELIVERANCE_HEALING_INCREASE]).by(SELECTED_PLAYER),
      this.onDirectHeal,
    );
    this.addEventListener(
      Events.heal
        .spell([
          SPELLS.HOLY_SHOCK_HEAL,
          SPELLS.FLASH_OF_LIGHT,
          SPELLS.HOLY_LIGHT,
          SPELLS.RESPLENDENT_LIGHT_HEAL,
        ])
        .by(SELECTED_PLAYER),
      this.onBuffedHeal,
    );
  }

  onApply(event: ApplyBuffEvent) {
    this.casts += 1;
    this.lastApply = event.timestamp;
    console.log('GLIMDEBUG apply buff', this.owner.formatTimestamp(event.timestamp));
  }

  onRemove(event: RemoveBuffEvent | FightEndEvent) {
    if (!this.selectedCombatant.hasBuff(TALENTS.TYRS_DELIVERANCE_TALENT.id)) {
      return;
    }
    console.log(
      'GLIMDEBUG remove buff',
      this.owner.formatTimestamp(this.lastApply),
      this.owner.formatTimestamp(event.timestamp),
      event.type,
    );

    if (this.lastApply === 0) {
      this.lastApply = this.owner.fight.start_time;
    }
    this.duration += event.timestamp - this.lastApply;
    this.lastApply = 0;
  }

  onDirectHeal(event: HealEvent) {
    this.healing += event.amount + (event.absorbed || 0);
    this.overhealing += event.overheal || 0;
  }

  onBuffedHeal(event: HealEvent) {
    const healTarget: Combatant | null = this.combatants.getEntity(event);
    if (
      healTarget !== null &&
      healTarget.hasBuff(
        SPELLS.TYRS_DELIVERANCE_HEALING_INCREASE.id,
        undefined,
        undefined,
        undefined,
        this.selectedCombatant.id,
      )
    ) {
      const effectiveHealingBoost = calculateEffectiveHealing(event, HEALING_INC);
      this.incHealing += effectiveHealingBoost;

      this.incOverhealing +=
        (event.amount + (event.absorbed || 0) + (event.overheal || 0)) * HEALING_INC -
        effectiveHealingBoost;
    }
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            Direct Healing Done: {formatNumber(this.healing)} <br />
            Direct Overhealing Done: {formatNumber(this.overhealing)} <br />
            Other spells' healing increased: {formatNumber(this.incHealing)} <br />
            Other spells' overhealing increased: {formatNumber(this.incOverhealing)} <br />
          </>
        }
      >
        <BoringValueText
          label={
            <>
              <SpellLink spell={TALENTS.TYRS_DELIVERANCE_TALENT} />
            </>
          }
        >
          {this.owner.formatItemHealingDone(this.healing + this.incHealing)} <br />
          {formatDuration(this.duration / this.casts)} <small>average buff duration</small>
        </BoringValueText>
      </Statistic>
    );
  }
}
export default TyrsDeliverance;
