import { SubSection, useAnalyzer, useInfo } from 'interface/guide/index';
import EnhancementBoxRow from 'interface/guide/components/Preparation/EnhancementSubSection/EnhancementBoxRow';
import WeaponEnhancementChecker from 'parser/shared/modules/items/WeaponEnhancementChecker';
import { Enchant } from 'common/SPELLS/Spell';
import LegEnhancementChecker from 'parser/shared/modules/items/LegEnhancementChecker';

interface Props {
  recommendedLegEnhancements?: Enchant[];
  recommendedWeaponEnhancements?: Record<number, Enchant[]>;
}
const EnchantmentSubSection = ({
  recommendedLegEnhancements,
  recommendedWeaponEnhancements,
}: Props) => {
  const legEnhancementChecker = useAnalyzer(LegEnhancementChecker);
  const weaponEnhancementChecker = useAnalyzer(WeaponEnhancementChecker);
  const info = useInfo();
  if (!info) {
    return null;
  }

  const weaponBoxRowEntries =
    weaponEnhancementChecker?.getWeaponEnhancementBoxRowEntries(recommendedWeaponEnhancements) ??
    [];
  const legBoxRowEntries =
    legEnhancementChecker?.getLegEnhancementBoxRowEntries(recommendedLegEnhancements) ?? [];
  const enhancementBoxRowEntires = [...weaponBoxRowEntries, ...legBoxRowEntries];

  return (
    <SubSection title="Enhancements">
      <p>Enhancements are easy ways to improve your throughput.</p>
      <EnhancementBoxRow values={enhancementBoxRowEntires} />
    </SubSection>
  );
};

export default EnchantmentSubSection;
