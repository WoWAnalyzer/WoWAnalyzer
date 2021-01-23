import React from 'react';
import PropTypes from 'prop-types';

import ROLES from 'game/ROLES';

interface Props {
  id: number;
  className: string;
}

const RoleIcon = ({ id, className, ...others }: Props) => {
  let iconName: string;
  switch (id) {
    case ROLES.TANK: iconName = 'shield'; break;
    case ROLES.HEALER: iconName = 'healing'; break;
    default: iconName = 'sword'; break;
  }

  return (
    <img
      src={`/img/${iconName}.png`}
      alt=""
      className={`icon ${className || ''}`}
      {...others}
    />
  );
};
RoleIcon.propTypes = {
  id: PropTypes.number.isRequired,
  className: PropTypes.string,
};

export default RoleIcon;
