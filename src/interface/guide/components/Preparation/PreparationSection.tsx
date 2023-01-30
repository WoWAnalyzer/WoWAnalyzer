import { Section } from 'interface/guide';
import Spell, { Enchant } from 'common/SPELLS/Spell';

import EnchantmentSubSection from './EnchantmentSubSection';
import ConsumablesSubSection from './ConsumablesSubSection';
import EnhancementSubSection from 'interface/guide/components/Preparation/EnhancementSubSection';

interface Props {
  recommendedEnchantments?: Record<number, Enchant[]>;
  recommendedFlasks?: Spell[];
  recommendedFoods?: Spell[];
  recommendedWeaponEnhancements?: Record<number, Enchant[]>;
  recommendedLegEnhancements?: Enchant[];
}
const PreparationSection = ({
  recommendedEnchantments,
  recommendedFlasks,
  recommendedFoods,
  recommendedWeaponEnhancements,
  recommendedLegEnhancements,
}: Props) => (
  <Section title="Preparation">
    <EnchantmentSubSection recommendedEnchantments={recommendedEnchantments} />
    <EnhancementSubSection
      recommendedLegEnhancements={recommendedLegEnhancements}
      recommendedWeaponEnhancements={recommendedWeaponEnhancements}
    />
    <ConsumablesSubSection
      recommendedFlasks={recommendedFlasks}
      recommendedFoods={recommendedFoods}
    />
  </Section>
);

export default PreparationSection;
