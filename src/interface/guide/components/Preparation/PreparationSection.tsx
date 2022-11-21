import { Section } from 'interface/guide';
import Spell, { Enchant } from 'common/SPELLS/Spell';

import EnchantmentSubSection from './EnchantmentSubSection';
import FoodSubSection from './FoodSubSection';
import PotionSubSection from './PotionSubSection';
import FlaskSubSection from './FlaskSubSection';
import WeaponEnhancementSubSection from 'interface/guide/components/Preparation/WeaponEnhancementSubSection';

interface Props {
  recommendedEnchantments?: Record<number, Enchant[]>;
  recommendedWeaponEnhancements?: Record<number, Enchant[]>;
  recommendedFoods?: Spell[];
}
const PreparationSection = ({
  recommendedEnchantments,
  recommendedFoods,
  recommendedWeaponEnhancements,
}: Props) => (
  <Section title="Preparation">
    <EnchantmentSubSection recommendedEnchantments={recommendedEnchantments} />
    <WeaponEnhancementSubSection recommendedWeaponEnhancements={recommendedWeaponEnhancements} />
    <FoodSubSection recommendedFoods={recommendedFoods} />
    <PotionSubSection />
    <FlaskSubSection />
  </Section>
);

export default PreparationSection;
