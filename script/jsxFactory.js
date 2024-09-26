// libs/jsxFacotry.js
import { h, Fragment } from "vue";

// export { h as "React.createElement", Fragment as "React.Fragment" };
global.React = {
  createElement: null,
  Fragment: null
};
global.React.createElement = h;
global.React.Fragment = Fragment;
