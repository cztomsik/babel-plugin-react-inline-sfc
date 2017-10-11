# react-inline-sfc

    npm i react-inline-sfc

Inline (sort-of) your stateless functional components.

I'm not sure how much is this going to speed up typical react application with lots of HOCs so if you can, please try & report your results


## .babelrc (or babel options)

    ...
    "plugins": [..., "react-inline-sfc"],
    ...


## create-react-app
- you have to `npm run eject` before
- then edit `package.json` and update `babel` field to look like:

    ...
    "babel": {
      "presets": [
        "react-app"
      ],
      "plugins": ["react-inline-sfc"]
    },
    ...


## How it works
- replace `<Comp ...` with `_Comp(...)` 
- define `_Comp` (during load) as reference to `Comp` if it
  - is SFC
  - does not rely on context


## Limitation
Babel plugins are not aware of modules (and transpilation does not happen in the right order either) so it's not possible to do real inlining. But it is possible to do this during page load.


## Debug (create-react-app)

    NODE_ENV=development node --inspect-brk ./node_modules/.bin/webpack --config config/webpack.config.dev.js

    // webpack.config.dev.js
    cacheDirectory: false
