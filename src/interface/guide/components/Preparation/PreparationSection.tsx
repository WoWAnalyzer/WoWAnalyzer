import { Section } from 'interface/guide';
import Spell from 'common/SPELLS/Spell';
import { Enchant } from 'common/ITEMS/Item';
import EnchantmentSubSection from './EnchantmentSubSection';
import ConsumablesSubSection from './ConsumablesSubSection';
import EnhancementSubSection from 'interface/guide/components/Preparation/EnhancementSubSection';
import Expansion, { isRetailExpansion, RETAIL_EXPANSION } from 'game/Expansion';
import GemSubSection from './GemSubSection';

interface Props {
  recommendedEnchantments?: Record<number, Enchant[]>;
  recommendedFlasks?: Spell[];
  recommendedFoods?: Spell[];
  recommendedWeaponEnhancements?: Record<number, Enchant[]>;
  expansion?: Expansion;
  recommendedGems?: number[];
}
const PreparationSection = ({
  recommendedEnchantments,
  recommendedFlasks,
  recommendedFoods,
  recommendedWeaponEnhancements,
  expansion = RETAIL_EXPANSION,
  recommendedGems,
}: Props) => (
  <Section title="Preparation">
    <EnchantmentSubSection recommendedEnchantments={recommendedEnchantments} />
    {isRetailExpansion(expansion) && (
      <EnhancementSubSection recommendedWeaponEnhancements={recommendedWeaponEnhancements} />
    )}
    {isRetailExpansion(expansion) && <GemSubSection recommendedGems={recommendedGems} />}
    <ConsumablesSubSection
      recommendedFlasks={recommendedFlasks}
      recommendedFoods={recommendedFoods}
      expansion={expansion}
    />
  </Section>
);

export default PreparationSection;
