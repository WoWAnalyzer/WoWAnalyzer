import PropTypes from 'prop-types';

import CoreAbility from 'Parser/Core/Modules/Ability';

class Ability extends CoreAbility {
  static propTypes = {
    ...CoreAbility.propTypes,
    antiFillerSpam: PropTypes.shape({
      isFiller: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.number,
      ]),
      condition: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.number,
      ]),
    }),
  };

  antiFillerSpam = null;
}

export default Ability;
