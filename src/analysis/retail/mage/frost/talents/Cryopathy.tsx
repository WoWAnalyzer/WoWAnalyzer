import Analyzer, { Options } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/mage';
import RayOfFrost from 'analysis/retail/mage/frost/talents/RayOfFrost';
import React from 'react';
import SPELLS from 'common/SPELLS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import { formatNumber } from 'common/format';
import ItemDamageDone from 'parser/ui/ItemDamageDone';

const STACK_DMG_INCREASE = 0.05;

export default class Cryopathy extends Analyzer {
  static dependencies = {
    rayOfFrost: RayOfFrost,
  };

  protected rayOfFrost!: RayOfFrost;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.CRYOPATHY_TALENT);
  }

  statistic(): React.ReactNode {
    let cryopathyTotalDamage = 0;

    this.rayOfFrost.rayOfFrost.forEach((ray) => {
      if (typeof ray.damage !== 'undefined') {
        const cryopathyStacks = this.selectedCombatant.getBuffStacks(
          SPELLS.CRYOPATHY_BUFF.id,
          ray.timestamp,
        );
        const cryopathyAmount =
          ray.damage.reduce(
            (totalAmount, damage) => totalAmount + damage.amount + (damage.absorbed || 0),
            0,
          ) *
          STACK_DMG_INCREASE *
          cryopathyStacks;
        cryopathyTotalDamage += cryopathyAmount;
      }
    });
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.TALENTS}>
        <BoringSpellValueText spell={TALENTS.CRYOPATHY_TALENT}>
          <>
            <p>
              {formatNumber(cryopathyTotalDamage)} <small>Damage contribution</small>
            </p>
            <ItemDamageDone amount={cryopathyTotalDamage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
