import { SubSection } from 'interface/guide/index';
import Spell from 'common/SPELLS/Spell';
import { SideBySidePanels } from 'interface/guide/components/GuideDivs';

import FoodPanel from './FoodPanel';
import PotionPanel from './PotionPanel';
import FlaskPanel from './FlaskPanel';
import Expansion, { isClassicExpansion } from 'game/Expansion';
import AlertWarning from 'interface/AlertWarning';

interface Props {
  recommendedFlasks?: Spell[];
  recommendedFoods?: Spell[];
  expansion?: Expansion;
}
const ConsumablesSubSection = ({ recommendedFlasks, recommendedFoods, expansion }: Props) => {
  return (
    <SubSection title="Consumables">
      <p>Using consumables appropriately is an easy way to improve your throughput.</p>
      <SideBySidePanels>
        <FoodPanel recommendedFoods={recommendedFoods} expansion={expansion} />
        <PotionPanel expansion={expansion} />
        <FlaskPanel recommendedFlasks={recommendedFlasks} expansion={expansion} />
      </SideBySidePanels>

      {expansion && isClassicExpansion(expansion) && (
        <AlertWarning style={{ marginTop: '1em' }}>
          Food and Flasks do not always appear in logs in Cataclysm Classic, even if they are used!
        </AlertWarning>
      )}
    </SubSection>
  );
};

export default ConsumablesSubSection;
