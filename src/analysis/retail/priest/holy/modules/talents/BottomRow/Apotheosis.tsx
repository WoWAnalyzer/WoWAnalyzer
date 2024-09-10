import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemManaGained from 'parser/ui/ItemManaGained';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { HOLY_WORD_LIST } from '../../../constants';
import SpellManaCost from 'parser/shared/modules/SpellManaCost';
import PRIEST_TALENTS from 'common/TALENTS/priest';
import SpellLink from 'interface/SpellLink';

// Example Log: /report/NfFqTvxrQ8GLWDpY/12-Normal+Fetid+Devourer+-+Kill+(1:25)/6-Yrret
class Apotheosis extends Analyzer {
  static dependencies = {
    spellManaCost: SpellManaCost,
  };
  protected spellManaCost!: SpellManaCost;
  apotheosisCasts = 0;
  apotheosisActive = false;
  manaSavedFromSerenity = 0;
  manaSavedFromSanctify = 0;
  manaSavedFromChastise = 0;

  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS.APOTHEOSIS_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS.ANSWERED_PRAYERS_TALENT);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(HOLY_WORD_LIST), this.handleCast);
  }

  handleCast(event: CastEvent) {
    if (this.selectedCombatant.hasBuff(TALENTS.APOTHEOSIS_TALENT)) {
      if (event.ability.guid === TALENTS.HOLY_WORD_SERENITY_TALENT.id) {
        this.manaSavedFromSerenity += this.spellManaCost.getRawResourceCost(event);
      } else if (event.ability.guid === TALENTS.HOLY_WORD_SANCTIFY_TALENT.id) {
        this.manaSavedFromSanctify += this.spellManaCost.getRawResourceCost(event);
      } else if (event.ability.guid === TALENTS.HOLY_WORD_CHASTISE_TALENT.id) {
        this.manaSavedFromChastise += this.spellManaCost.getRawResourceCost(event);
      }
    }
  }

  get totalManaSaved() {
    return this.manaSavedFromChastise + this.manaSavedFromSanctify + this.manaSavedFromSerenity;
  }

  statistic() {
    return (
      <Statistic
        tooltip={
          <>
            For Holy Word CDR see the Holy Word module at the top.
            <br />
            <br />
            This includes <SpellLink spell={PRIEST_TALENTS.ANSWERED_PRAYERS_TALENT} />. <br />
            <SpellLink spell={PRIEST_TALENTS.HOLY_WORD_SERENITY_TALENT} />:{' '}
            {this.manaSavedFromSerenity} Mana saved <br />
            <SpellLink spell={PRIEST_TALENTS.HOLY_WORD_SANCTIFY_TALENT} />:{' '}
            {this.manaSavedFromSanctify} Mana saved <br />
            <SpellLink spell={PRIEST_TALENTS.HOLY_WORD_CHASTISE_TALENT} />:{' '}
            {this.manaSavedFromChastise} Mana saved
          </>
        }
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(7)}
      >
        <BoringSpellValueText spell={TALENTS.APOTHEOSIS_TALENT}>
          <>
            <ItemManaGained amount={this.totalManaSaved} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Apotheosis;
