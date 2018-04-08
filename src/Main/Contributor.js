import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import Wrapper from 'common/Wrapper';

import ContributorDetails from './Contributors/ContributorDetails';
import makeContributorUrl from './Contributors/makeUrl';
import Portal from './Portal';

class Contributor extends React.PureComponent {
  static propTypes = {
    nickname: PropTypes.string.isRequired,
    avatar: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
    this.handleClick = this.handleClick.bind(this);
    this.handleOnClose = this.handleOnClose.bind(this);
  }

  handleClick(e) {
    e.preventDefault();
    this.setState({
      open: true,
    });
  }
  handleOnClose() {
    this.setState({
      open: false,
    });
  }

  render() {
    const { nickname, avatar } = this.props;

    if (this.state.open) {
      return (
        <Portal onClose={this.handleOnClose}>
          <ContributorDetails contributorId={nickname} />
        </Portal>
      );
    }

    return(
      <Link to={makeContributorUrl(nickname)} onClick={this.handleClick} className="contributor">
        {avatar && <Wrapper><img src={avatar} alt="Avatar" />{' '}</Wrapper>}
        {nickname}
      </Link>
    );
  }

}

export default Contributor;
