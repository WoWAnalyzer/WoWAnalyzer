import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import React from 'react';

class FlashConcentration extends Analyzer {
  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.ITEMS} tooltip={<>Hello World</>}>
        <ItemHealingDone amount={125} />
        <SpellLink id={SPELLS.FLASH_CONCENTRATION.id}></SpellLink>
      </Statistic>
    );
  }
}

export default FlashConcentration;
