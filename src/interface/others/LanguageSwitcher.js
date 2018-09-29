import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import { withI18n } from '@lingui/react';

import { getLanguage } from 'interface/selectors/language';
import { setLanguage } from 'interface/actions/language';
import ReadableList from 'interface/common/ReadableList';
import languages from 'common/languages';

class LanguageSwitcher extends React.PureComponent {
  static propTypes = {
    language: PropTypes.string.isRequired,
    setLanguage: PropTypes.func.isRequired,
    i18n: PropTypes.object.isRequired,
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
        {Object.keys(languages).map(code => (
          <a key={code} onClick={() => this.selectLanguage(code)}>
            {languages[code].localName}
          </a>
        ))}
      </ReadableList>
    );
  }
  render() {
    const { language, i18n } = this.props;

    if (this.state.expanded) {
      return this.renderExpanded();
    }

    return (
      <a onClick={this.handleClickExpand}>
        <dfn data-tip={i18n.t`Click to switch languages. We've only just started localizing the app, it will take some time until everything is localized.`}>
          {languages[language].localName}
        </dfn>
      </a>
    );
  }
}

const mapStateToProps = state => ({
  language: getLanguage(state),
});
export default compose(
  withI18n(),
  connect(mapStateToProps, {
    setLanguage,
  })
)(LanguageSwitcher);
