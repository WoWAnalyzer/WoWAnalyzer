import React from 'react';
import PropTypes from 'prop-types';

import Wrapper from 'common/Wrapper';

const Contributor = ({ nickname, avatar, github, ...others }) => (
  <span key={nickname} className="contributor" data-tip={github ? github : undefined} {...others}>
    {avatar && <Wrapper><img src={avatar} alt="Avatar" />{' '}</Wrapper>}
    {nickname}
  </span>
);
Contributor.propTypes = {
  nickname: PropTypes.string.isRequired,
  avatar: PropTypes.string,
  github: PropTypes.string,
};

export default Contributor;
