import React from 'react';
import PropTypes from 'prop-types';

import Wrapper from 'common/Wrapper';

const Maintainer = ({ nickname, avatar, github, ...others }) => (
  <span key={nickname} className="maintainer-name" data-tip={github ? github : undefined} {...others}>
    {avatar && <Wrapper><img src={avatar} alt="Avatar" />{' '}</Wrapper>}
    {nickname}
  </span>
);
Maintainer.propTypes = {
  nickname: PropTypes.string.isRequired,
  avatar: PropTypes.string,
  github: PropTypes.string,
};

export default Maintainer;
