import { SubSection, useAnalyzer, useInfo } from 'interface/guide/index';
import WeaponEnhancementBoxRow from 'interface/guide/components/Preparation/WeaponEnhancementSubSection/WeaponEnhancementBoxRow';
import WeaponEnhancementChecker from 'parser/shared/modules/items/WeaponEnhancementChecker';
import { Enchant } from 'common/SPELLS/Spell';

interface Props {
  recommendedWeaponEnhancements?: Record<number, Enchant[]>;
}
const EnchantmentSubSection = ({ recommendedWeaponEnhancements }: Props) => {
  const weaponEnhancementChecker = useAnalyzer(WeaponEnhancementChecker);
  const info = useInfo();
  if (!weaponEnhancementChecker || !info) {
    return null;
  }

  return (
    <SubSection title="Weapon Enhancements">
      <p>Weapon enhancements are easy ways to improve your throughput.</p>
      <WeaponEnhancementBoxRow
        values={weaponEnhancementChecker.getWeaponEnhancementBoxRowEntries(
          recommendedWeaponEnhancements,
        )}
      />
    </SubSection>
  );
};

export default EnchantmentSubSection;
