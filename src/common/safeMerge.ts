let merge: <TReturn>(...args: any[]) => TReturn;
if (process.env.NODE_ENV === 'development') {
  merge = <TReturn>(...args: []) => {
    const mergetrack: string[] = [];
    args.forEach(group => {
      if (group !== undefined) {
        Object.keys(group).forEach(v => {
          if (mergetrack.includes(v)) {
            throw new Error('This key already exists:' + v);
          }
          mergetrack.push(v);
        });
      }
    });
    return Object.assign({}, ...args) as TReturn;
  }
} else {
  merge = (...args) => Object.assign({}, ...args);
}

export default merge;
