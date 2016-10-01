'use strict';

const DDSL = require('xjst-ddsl/lib/ddsl');
const h = require('snabbdom-flat-h');

const capitalizableDict = {
  acceptcharset: 'acceptCharset',
  accesskey: 'accessKey',
  allowfullscreen: 'allowFullScreen',
  allowtransparency: 'allowTransparency',
  autocomplete: 'autoComplete',
  autofocus: 'autoFocus',
  autoplay: 'autoPlay',
  cellpadding: 'cellPadding',
  cellspacing: 'cellSpacing',
  charset: 'charSet',
  classid: 'classID',
  class: 'className',
  classname: 'className',
  colspan: 'colSpan',
  contenteditable: 'contentEditable',
  contextmenu: 'contextMenu',
  crossorigin: 'crossOrigin',
  datetime: 'dateTime',
  enctype: 'encType',
  formaction: 'formAction',
  formenctype: 'formEncType',
  formmethod: 'formMethod',
  formnovalidate: 'formNoValidate',
  formtarget: 'formTarget',
  frameborder: 'frameBorder',
  htmlfor: 'htmlFor',
  for: 'htmlFor',
  httpequiv: 'httpEquiv',
  marginheight: 'marginHeight',
  marginwidth: 'marginWidth',
  maxlength: 'maxLength',
  mediagroup: 'mediaGroup',
  novalidate: 'noValidate',
  radiogroup: 'radioGroup',
  readonly: 'readOnly',
  rowspan: 'rowSpan',
  spellcheck: 'spellCheck',
  srcdoc: 'srcDoc',
  srcset: 'srcSet',
  tabindex: 'tabIndex',
  usemap: 'useMap',
  // value: 'defaultValue',
  // checked: 'defaultChecked'
};

module.exports = function (templates, components, lib) {
    var ddslRuntime = {};
    ddslRuntime._tmpls = [];

  // TRANSFORMATIONS IN RUNTIME
  const runtime = new DDSL({
    // generateKeys: true,
    components,
    constructor: function (ddsl, context, js) {
      var props = null;
      if (ddsl[1]) {
        props = {};
        // capitalize props
        Object.keys(ddsl[1]).forEach(function(key) {
          if (capitalizableDict[key]) {
            props[capitalizableDict[key]] = ddsl[1][key];
          } else {
            props[key] = ddsl[1][key];
          }
        });
        // objectify inline styles
        if (props.style && typeof props.style === 'string') {
          props.style = props.style.split(';').reduce((ruleMap, ruleString) => {
            if (ruleString) {
              const rulePair = ruleString.split(/:(.+)/);
              if(rulePair[0] && rulePair[1]) {
                  ruleMap[rulePair[0].trim()] = rulePair[1].trim();
              }
            }
            return ruleMap;
          }, {});
        }
      }

      if(props && props.__replace && this.options.components && this.options.components[context.block]) {
        ddsl[0] = this.options.components[context.block];
        delete props.__replace;
      }

      if(context.block && js) {
        Object.keys(js).forEach(key => {
          if(typeof js[key] === 'function') {
            js[key] = js[key].bind(ddslRuntime.context);
          }
        });
        props = Object.assign(props || {}, js);
      }

      props.children = ddsl[2];
      
      const createElement = typeof ddsl[0] === 'function' ? ddsl[0] : h[ddsl[0]]; 
      return createElement(props);
    }
  });

  runtime.compile(templates || '');
  runtime.exportApply(ddslRuntime);
  ddslRuntime.templates = function(templates) {
    ddslRuntime._tmpls.push(templates);
  };

  ddslRuntime.match = function(json, context) {
    ddslRuntime.context = context;
    ddslRuntime._tmpls.forEach(ddslRuntime.compile);
    ddslRuntime.BEMContext.prototype.lib = lib || {};
    ddslRuntime.BEMContext.prototype.lib.cloneElement = el => el;
    return ddslRuntime.apply(json);
  };

  return ddslRuntime;
}
