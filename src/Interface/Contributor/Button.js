import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import lazyLoadComponent from 'common/lazyLoadComponent';
import Portal from 'Interface/Others/Portal';

import makeContributorUrl from './makeUrl';

const ContributorDetails = lazyLoadComponent(() => import(/* webpackChunkName: 'ContributorPage' */ './Details').then(exports => exports.default));

class Button extends React.PureComponent {
  static propTypes = {
    nickname: PropTypes.string.isRequired,
    avatar: PropTypes.string,
    link: PropTypes.bool,
  };
  static defaultProps = {
    link: true,
  };
  state = {
    open: false,
  };

  constructor(props) {
    super(props);
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
    const { nickname, avatar, link } = this.props;

    if (this.state.open) {
      return (
        <Portal onClose={this.handleOnClose}>
          <div className="container">
            <ContributorDetails contributorId={nickname} />
          </div>
        </Portal>
      );
    }

    const content = (
      <React.Fragment>
        {avatar && <React.Fragment><img src={avatar} alt="Avatar" />{' '}</React.Fragment>}
        {nickname}
      </React.Fragment>
    );

    if (!link) {
      return (
        <span className="contributor">
          {content}
        </span>
      );
    }

    return (
      <Link to={makeContributorUrl(nickname)} onClick={this.handleClick} className="contributor">
        {content}
      </Link>
    );
  }
}

export default Button;
