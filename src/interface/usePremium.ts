import { useSelector } from 'react-redux';

import { hasPremium } from 'interface/selectors/user';

const usePremium = () => {
  const premium = useSelector((state) => hasPremium(state));

  return premium;
};

export default usePremium;
