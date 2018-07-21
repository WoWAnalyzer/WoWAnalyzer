import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';

import { getLanguage } from 'Interface/selectors/language';
import { setLanguage } from 'Interface/actions/language';
import ReadableList from 'Interface/common/ReadableList';

const LANGUAGES = {
  en: 'English',
  de: 'Deutsch',
};

class LanguageSwitcher extends React.PureComponent {
  static propTypes = {
    language: PropTypes.string.isRequired,
    setLanguage: PropTypes.func.isRequired,
  };
  state = {
    expanded: false,
  };

  constructor() {
    super();
    this.handleClickExpand = this.handleClickExpand.bind(this);
  }

  componentDidUpdate() {
    ReactTooltip.hide();
    ReactTooltip.rebuild();
  }

  handleClickExpand() {
    this.setState({
      expanded: true,
    });
  }

  selectLanguage(code) {
    this.setState({
      expanded: false,
    });
    this.props.setLanguage(code);
  }
  renderExpanded() {
    return (
      <ReadableList groupType="or">
        {Object.keys(LANGUAGES).map(code => (
          <a key={code} onClick={() => this.selectLanguage(code)}>
            {LANGUAGES[code]}
          </a>
        ))}
      </ReadableList>
    );
  }
  render() {
    const { language } = this.props;

    if (this.state.expanded) {
      return this.renderExpanded();
    }

    return (
      <a onClick={this.handleClickExpand}>
        <dfn data-tip="Click to switch languages. We've only just started localizing the app, it will take some time until everything is localized.">
          {LANGUAGES[language]}
        </dfn>
      </a>
    );
  }
}

const mapStateToProps = state => ({
  language: getLanguage(state),
});
export default connect(mapStateToProps, {
  setLanguage,
})(LanguageSwitcher);
