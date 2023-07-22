import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import getDamageBonus from '../../core/GetDamageBonus';
import SharedBrews from '../../core/SharedBrews';

const PTA_DMG_MODIFIER = 0.01;
const PTA_BREW_CDR = 500;

const deps = {
  brews: SharedBrews,
};

export default class PressTheAdvantage extends Analyzer.withDependencies(deps) {
  private buffDamageContribution = 0;
  private directDamageContribution = 0;
  public brewCDRTotal = 0;
  public wastedBrewCDR = 0;
  public meleeCount = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(talents.PRESS_THE_ADVANTAGE_TALENT);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.accumulateBuffedDamage);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.accumulateBuffedDamage);
    this.addEventListener(
      Events.damage.spell(SPELLS.PRESS_THE_ADVANTAGE_DMG),
      this.accumulateDirectDamage,
    );
  }

  private accumulateBuffedDamage(event: DamageEvent) {
    if (event.ability.guid === SPELLS.PRESS_THE_ADVANTAGE_DMG.id) {
      // yes, this buffs itself. don't want to double-count the damage
      return;
    }
    const currentStackCount = this.selectedCombatant.getBuffStacks(
      SPELLS.PRESS_THE_ADVANTAGE_BUFF.id,
    );
    this.buffDamageContribution += getDamageBonus(event, PTA_DMG_MODIFIER * currentStackCount);
  }

  private accumulateDirectDamage(event: DamageEvent) {
    this.directDamageContribution += event.amount + (event.absorbed ?? 0);
    // every direct damage hit generates cdr
    this.applyBrewCdr();
    this.meleeCount += 1;
  }

  private applyBrewCdr() {
    const amount = this.deps.brews.reduceCooldown(PTA_BREW_CDR);
    this.brewCDRTotal += amount;
    this.wastedBrewCDR += PTA_BREW_CDR - amount;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <ul>
            <li>
              Damage Bonus: <ItemDamageDone amount={this.buffDamageContribution} />
            </li>
            <li>
              On-Hit Damage: <ItemDamageDone amount={this.directDamageContribution} />
            </li>
          </ul>
        }
      >
        <TalentSpellText talent={talents.PRESS_THE_ADVANTAGE_TALENT}>
          <ItemDamageDone amount={this.buffDamageContribution + this.directDamageContribution} />
        </TalentSpellText>
      </Statistic>
    );
  }
}
