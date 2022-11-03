import { Section } from 'interface/guide';
import { Enchant } from 'common/SPELLS/Spell';

import EnchantmentSubSection from './EnchantmentSubSection';
import FoodSubSection from './FoodSubSection';
import PotionSubSection from './PotionSubSection';
import FlaskSubSection from './FlaskSubSection';

interface Props {
  recommendedEnchantments?: Record<number, Enchant[]>;
}
const PreparationSection = ({ recommendedEnchantments }: Props) => (
  <Section title="Preparation">
    <EnchantmentSubSection recommendedEnchantments={recommendedEnchantments} />
    <FoodSubSection />
    <PotionSubSection />
    <FlaskSubSection />
  </Section>
);

export default PreparationSection;
