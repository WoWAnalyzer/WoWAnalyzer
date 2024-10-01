import { Section } from 'interface/guide';
import Spell from 'common/SPELLS/Spell';
import { Enchant } from 'common/ITEMS/Item';

import EnchantmentSubSection from './EnchantmentSubSection';
import ConsumablesSubSection from './ConsumablesSubSection';
import EnhancementSubSection from 'interface/guide/components/Preparation/EnhancementSubSection';
import Expansion, { isRetailExpansion, RETAIL_EXPANSION } from 'game/Expansion';

interface Props {
  recommendedEnchantments?: Record<number, Enchant[]>;
  recommendedFlasks?: Spell[];
  recommendedFoods?: Spell[];
  recommendedWeaponEnhancements?: Record<number, Enchant[]>;
  expansion?: Expansion;
}
const PreparationSection = ({
  recommendedEnchantments,
  recommendedFlasks,
  recommendedFoods,
  recommendedWeaponEnhancements,
  expansion = RETAIL_EXPANSION,
}: Props) => (
  <Section title="Preparation">
    <EnchantmentSubSection recommendedEnchantments={recommendedEnchantments} />
    {isRetailExpansion(expansion) && (
      <EnhancementSubSection recommendedWeaponEnhancements={recommendedWeaponEnhancements} />
    )}
    <ConsumablesSubSection
      recommendedFlasks={recommendedFlasks}
      recommendedFoods={recommendedFoods}
      expansion={expansion}
    />
  </Section>
);

export default PreparationSection;
