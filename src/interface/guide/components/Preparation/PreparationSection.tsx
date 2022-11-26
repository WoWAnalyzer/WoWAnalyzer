import { Section } from 'interface/guide';
import Spell, { Enchant } from 'common/SPELLS/Spell';

import EnchantmentSubSection from './EnchantmentSubSection';
import ConsumablesSubSection from './ConsumablesSubSection';
import WeaponEnhancementSubSection from 'interface/guide/components/Preparation/WeaponEnhancementSubSection';

interface Props {
  recommendedEnchantments?: Record<number, Enchant[]>;
  recommendedFlasks?: Spell[];
  recommendedFoods?: Spell[];
  recommendedWeaponEnhancements?: Record<number, Enchant[]>;
}
const PreparationSection = ({
  recommendedEnchantments,
  recommendedFlasks,
  recommendedFoods,
  recommendedWeaponEnhancements,
}: Props) => (
  <Section title="Preparation">
    <EnchantmentSubSection recommendedEnchantments={recommendedEnchantments} />
    <WeaponEnhancementSubSection recommendedWeaponEnhancements={recommendedWeaponEnhancements} />
    <ConsumablesSubSection
      recommendedFlasks={recommendedFlasks}
      recommendedFoods={recommendedFoods}
    />
  </Section>
);

export default PreparationSection;
