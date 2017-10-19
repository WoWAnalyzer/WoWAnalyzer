let merge;
if (process.env.NODE_ENV === 'development') {
  merge = (...args) => {
    const obj = {};
    args.forEach(arg => {
      Object.keys(arg).forEach(key => {
        if (obj[key]) {
          throw new Error('This key already exists:' + key);
        }
        obj[key] = arg[key];
      });
    });
    return obj;
  };
} else {
  merge = (...args) => Object.assign({}, ...args);
}

export default merge;
