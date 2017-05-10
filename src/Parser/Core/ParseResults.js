class ParseResults {
  tabs = [];
  statistics = [];
  items = [];
  issues = [];

  addIssue(issue) {
    this.issues.push(issue);
  }
}

export default ParseResults;
