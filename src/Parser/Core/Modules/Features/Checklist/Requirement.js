class Requirement {
  name = null;
  check = null;
  when = null;
  constructor(options) {
    Object.keys(options).forEach(key => {
      this[key] = options[key];
    });
  }
}

export default Requirement;
