import { SubSection, useAnalyzer, useInfo } from 'interface/guide/index';
import EnhancementBoxRow from 'interface/guide/components/Preparation/EnhancementSubSection/EnhancementBoxRow';
import WeaponEnhancementChecker from 'parser/shared/modules/items/WeaponEnhancementChecker';
import { Enchant } from 'common/ITEMS/Item';

interface Props {
  recommendedLegEnhancements?: Enchant[];
  recommendedWeaponEnhancements?: Record<number, Enchant[]>;
}
const EnchantmentSubSection = ({ recommendedWeaponEnhancements }: Props) => {
  const weaponEnhancementChecker = useAnalyzer(WeaponEnhancementChecker);
  const info = useInfo();
  if (!info) {
    return null;
  }

  const weaponBoxRowEntries =
    weaponEnhancementChecker?.getWeaponEnhancementBoxRowEntries(recommendedWeaponEnhancements) ??
    [];
  const enhancementBoxRowEntires = [...weaponBoxRowEntries];

  return (
    <SubSection title="Enhancements">
      <p>Enhancements are easy ways to improve your throughput.</p>
      <EnhancementBoxRow values={enhancementBoxRowEntires} />
    </SubSection>
  );
};

export default EnchantmentSubSection;
