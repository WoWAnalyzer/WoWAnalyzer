import React from 'react';
import PropTypes from 'prop-types';

import Wrapper from 'common/Wrapper';

import ContributorDetails from './Contributors/ContributorDetails';
import Portal from './Portal';

//to={makeContributorUrl(nickname)}

class Contributor extends React.PureComponent {

  static propTypes = {
    nickname: PropTypes.string.isRequired,
    avatar: PropTypes.string,
    github: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState({
      open: true,
    });
  }

  render() {
    if (this.state.open) {
      return (
        <Portal onClose={() => this.setState({ open: false })}><ContributorDetails contributorId={this.props.nickname} /></Portal>
      );
    }

    return(
      <span key={this.props.nickname} onClick={() => this.handleClick()} className="contributor" data-tip={this.props.github ? this.props.github : undefined}>
        {this.props.avatar && <Wrapper><img src={this.props.avatar} alt="Avatar" />{' '}</Wrapper>}
        {this.props.nickname}
      </span>
    );
  }

}

export default Contributor;
