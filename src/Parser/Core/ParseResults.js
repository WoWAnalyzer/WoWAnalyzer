class ParseResults {
  tabs = [];
  statistics = [];
  items = [];
  issues = [];

  addIssue(issue) {
    this.issues.push(issue);
  }
  clearIssues() {
    this.issues = [];
  }
}

export default ParseResults;
