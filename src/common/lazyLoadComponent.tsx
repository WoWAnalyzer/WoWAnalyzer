import DelayRender from 'interface/DelayRender';
import { useEffect, useState } from 'react';

export default function lazyLoadComponent(load: () => Promise<any>, delay = 1000) {
  let loadedComponent: any = null;
  let loadPromise: Promise<any> | null = null;

  return function ComponentLazyLoader(props: any) {
    const [loaded, setLoaded] = useState(Boolean(loadedComponent));

    useEffect(() => {
      if (!loadedComponent && !loadPromise) {
        loadPromise = load().then((component) => {
          loadedComponent = component;
          setLoaded(true);
        });
      } else if (loadedComponent && !loaded) {
        setLoaded(true);
      }
    }, []);

    if (loaded && loadedComponent) {
      const Component = loadedComponent;
      return <Component {...props} />;
    }

    return (
      <DelayRender delay={delay}>
        <div className="spinner" style={{ fontSize: 5 }} />
      </DelayRender>
    );
  };
}

// Kept this here in case you wanted to use this instead

// export default function lazyLoadComponent(load, delay = 1000) {
//   class ComponentLazyLoader extends PureComponent {
//     static loadedComponent = null;
//     state = {
//       loaded: Boolean(ComponentLazyLoader.loadedComponent),
//     };

//     constructor() {
//       super();
//       if (!this.constructor.loadedComponent) {
//         load().then((component) => {
//           this.constructor.loadedComponent = component;
//           this.setState({
//             loaded: true,
//           });
//         });
//       }
//     }

//     render() {
//       const { loaded } = this.state;
//       if (loaded) {
//         const Component = this.constructor.loadedComponent;
//         return <Component {...this.props} />;
//       }
//       return (
//         <DelayRender delay={delay}>
//           <div className="spinner" style={{ fontSize: 5 }} />
//         </DelayRender>
//       );
//     }
//   }

//   return ComponentLazyLoader;
// }
