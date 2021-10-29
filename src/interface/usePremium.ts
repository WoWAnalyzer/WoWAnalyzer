import { hasPremium } from 'interface/selectors/user';
import { useWaSelector } from 'interface/utils/useWaSelector';

const usePremium = () => {
  const premium = useWaSelector((state) => hasPremium(state));

  return premium;
};

export default usePremium;
