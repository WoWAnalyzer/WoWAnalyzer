class Rule {
  name = null;
  requirements = null;
  when = null;
  constructor(options) {
    Object.keys(options).forEach(key => {
      this[key] = options[key];
    });
  }
}

export default Rule;
