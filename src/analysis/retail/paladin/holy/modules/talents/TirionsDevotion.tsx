import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Statistic from 'parser/ui/Statistic';
import { SpellIcon, SpellLink } from 'interface';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Spell from 'common/SPELLS/Spell';
import { getLayOnHandsSpell, getWordofGlorySpell } from 'analysis/retail/paladin/shared/constants';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemCooldownReduction from 'parser/ui/ItemCooldownReduction';
import { formatNumber } from 'common/format';
import { TIRIONS_DEVOTION_REDUCTION } from '../../constants';

class TirionsDevotion extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;
  private readonly layOnHands: Spell;

  wastedCDR = 0;
  effectiveCDR = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.TIRIONS_DEVOTION_HOLY_TALENT);

    this.layOnHands = getLayOnHandsSpell(this.selectedCombatant);

    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([
          getWordofGlorySpell(this.selectedCombatant),
          TALENTS.LIGHT_OF_DAWN_TALENT,
          SPELLS.SHIELD_OF_THE_RIGHTEOUS,
        ]),
      this.cast,
    );
  }

  cast(event: CastEvent) {
    if (!event.classResources) {
      return;
    }

    const exists = event.classResources.find((e) => e.type === RESOURCE_TYPES.HOLY_POWER.id);

    if (!exists) {
      return;
    }

    const totalCDR = exists.amount * TIRIONS_DEVOTION_REDUCTION;

    const effectiveCdr = this.spellUsable.reduceCooldown(this.layOnHands.id, totalCDR);
    this.effectiveCDR += effectiveCdr;
    this.wastedCDR += totalCDR - effectiveCdr;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            Holy Power spent while <SpellLink spell={TALENTS.LAY_ON_HANDS_TALENT} /> was not on CD:{' '}
            {formatNumber(this.wastedCDR / TIRIONS_DEVOTION_REDUCTION)}
          </>
        }
      >
        <TalentSpellText talent={TALENTS.TIRIONS_DEVOTION_HOLY_TALENT}>
          <div>
            <SpellIcon spell={TALENTS.LAY_ON_HANDS_TALENT} />{' '}
            <ItemCooldownReduction effective={this.effectiveCDR} waste={this.wastedCDR} />
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default TirionsDevotion;
