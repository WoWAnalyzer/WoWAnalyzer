import React from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import Wrapper from 'common/Wrapper';
import makeContributorUrl from './Contributors/makeUrl';

const Contributor = ({ nickname, avatar, github }) => (
  <Link to={makeContributorUrl(nickname)} key={nickname} className="contributor" data-tip={github ? github : undefined}>
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
