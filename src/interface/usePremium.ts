import { hasPremium } from 'interface/selectors/user';
import { useSelector } from 'react-redux';

const usePremium = () => {
  const premium = useSelector((state) => hasPremium(state));

  return premium;
};

export default usePremium;
