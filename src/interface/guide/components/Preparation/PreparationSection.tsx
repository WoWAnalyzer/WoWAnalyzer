import { Section } from 'interface/guide';
import Spell, { Enchant } from 'common/SPELLS/Spell';

import EnchantmentSubSection from './EnchantmentSubSection';
import ConsumablesSubSection from './ConsumablesSubSection';
import EnhancementSubSection from 'interface/guide/components/Preparation/EnhancementSubSection';
import Expansion from 'game/Expansion';

interface Props {
  recommendedEnchantments?: Record<number, Enchant[]>;
  recommendedFlasks?: Spell[];
  recommendedFoods?: Spell[];
  recommendedWeaponEnhancements?: Record<number, Enchant[]>;
  recommendedLegEnhancements?: Enchant[];
  expansion?: Expansion;
}
const PreparationSection = ({
  recommendedEnchantments,
  recommendedFlasks,
  recommendedFoods,
  recommendedWeaponEnhancements,
  recommendedLegEnhancements,
  expansion,
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
      expansion={expansion}
    />
  </Section>
);

export default PreparationSection;
