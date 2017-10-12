module.exports = function reactInlineSfc({types: t, template}) {
  // TODO: reuse between modules
  const HELPER_TPL = template(`var _COMP = (COMP.prototype.render || (COMP.length > 1)) ?React.createElement.bind(null, COMP) :COMP`)

  let comps;

  return {
    // find <Comp>s and modify them when JSX is done
    visitor: {
      JSXElement(path) {
        const name = path.node.openingElement.name.name

        if (name[0] === name[0].toUpperCase()) {
          comps.push(path)
        }
      },

      Program: {
        enter() {
          comps = []
        },

        exit(path) {
          for (let c of comps) {
            t.assertCallExpression(c)
            transform(c)
          }
        }
      }
    }
  }


  // h(Comp, props = null, ...children) -> _Comp({children, ...props})
  function transform(call) {
    const h = call.get('callee')
    const Comp = call.get('arguments.0')
    const CompBinding = Comp.scope.getBinding(Comp.node.name)
    const _Comp = getHelper(Comp, CompBinding)

    if (CompBinding.constant) {
      Comp.remove()
      h.replaceWith(_Comp)
      fixChildren(call)      
    }
  }

  function getHelper(Comp, CompBinding) {
    const CompVar = CompBinding.path

    if ( ! CompVar._Comp) {
      const helperName = CompVar.scope.generateUidIdentifierBasedOnNode(CompVar.node)

      CompVar.parentPath.insertAfter(HELPER_TPL({ _COMP: helperName, COMP: Comp }))
      CompVar._Comp = helperName
    }

    return CompVar._Comp
  }

  function fixChildren(call) {
    const props = call.get('arguments.0')

    // no props -> no children
    if ( ! props) {
      return
    }

    const children = props.container.slice(props.key + 1)
    debugger

    if ( ! children.length) {
      return
    }

    // TODO: opt
    props.replaceWith(template('Object.assign({}, PROPS, {children: CHILDREN})')({
      PROPS: props.node,
      CHILDREN: t.arrayExpression(children)
    }).expression)
  }
}
