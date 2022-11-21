import Spell from 'common/SPELLS/Spell';
import SpellLink from 'interface/SpellLink';

import { PanelHeader, StartAlignedRoundedPanel } from '../../GuideDivs';
import styles from './RecommendedFoodBuffs.module.scss';

interface Props {
  recommendedFoods: Spell[];
}
const RecommendedFoodBuffs = ({ recommendedFoods }: Props) => (
  <StartAlignedRoundedPanel className={styles['recommended-food-buffs']}>
    <PanelHeader>
      <strong>Recommended Food Buff(s)</strong>
    </PanelHeader>
    <ul>
      {recommendedFoods.map((food) => (
        <li key={food.id}>
          <SpellLink id={food} />
        </li>
      ))}
    </ul>
  </StartAlignedRoundedPanel>
);

export default RecommendedFoodBuffs;
