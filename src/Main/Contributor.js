import React from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import Wrapper from 'common/Wrapper';
import makeContributorUrl from './Contributors/makeUrl';

const Contributor = ({ nickname, avatar, github, ...others }) => (
  <Link to={makeContributorUrl(nickname)} key={nickname} className="contributor" data-tip={github ? github : undefined} {...others}>
    {avatar && <Wrapper><img src={avatar} alt="Avatar" />{' '}</Wrapper>}
    {nickname}
  </Link>
);
Contributor.propTypes = {
  nickname: PropTypes.string.isRequired,
  avatar: PropTypes.string,
  github: PropTypes.string,
};

export default Contributor;
