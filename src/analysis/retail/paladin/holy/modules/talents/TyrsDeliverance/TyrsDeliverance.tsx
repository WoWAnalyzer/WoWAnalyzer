import { formatNumber } from 'common/format';
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
const BUFFED_SPELLS = [
  SPELLS.HOLY_SHOCK_HEAL,
  SPELLS.FLASH_OF_LIGHT,
  SPELLS.HOLY_LIGHT,
  SPELLS.RESPLENDENT_LIGHT_HEAL,
];

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

  incHealing: Record<number, number> = {};
  incOverhealing: Record<number, number> = {};

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
    this.addEventListener(Events.heal.spell(BUFFED_SPELLS).by(SELECTED_PLAYER), this.onBuffedHeal);
  }

  onApply(event: ApplyBuffEvent) {
    this.casts += 1;
    this.lastApply = event.timestamp;
  }

  onRemove(event: RemoveBuffEvent | FightEndEvent) {
    if (!this.selectedCombatant.hasBuff(TALENTS.TYRS_DELIVERANCE_TALENT.id)) {
      return;
    }

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
      const spellId = event.ability.guid;
      this.incHealing[spellId] = (this.incHealing[spellId] || 0) + effectiveHealingBoost;

      this.incOverhealing[spellId] =
        (this.incOverhealing[spellId] || 0) +
        (event.amount + (event.absorbed || 0) + (event.overheal || 0)) * HEALING_INC -
        effectiveHealingBoost;
    }
  }

  totalHealing() {
    return this.healing + Object.values(this.incHealing).reduce((sum, val) => sum + val, 0);
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
            {BUFFED_SPELLS.map((spell) => (
              <div key={spell.id}>
                <SpellLink spell={spell} /> healing increased:{' '}
                {formatNumber(this.incHealing[spell.id])}
              </div>
            ))}
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
          {this.owner.formatItemHealingDone(this.totalHealing())} <br />
        </BoringValueText>
      </Statistic>
    );
  }
}
export default TyrsDeliverance;
