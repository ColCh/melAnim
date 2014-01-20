/** melAnim - v0.1.0 - 2014-01-20
* Copyright (c) 2014 ColCh; Licensed GPLv3 *//**@preserve melAnim by ColCh | Licensed GPLv3 
// @ sourceMappingURL=../melAnim.js.map
*/// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Bootstrap for the Google JS Library (Closure).
 *
 * In uncompiled mode base.js will write out Closure's deps file, unless the
 * global <code>CLOSURE_NO_DEPS</code> is set to true.  This allows projects to
 * include their own deps file(s) from different locations.
 *
 */


/**
 * @define {boolean} Overridden to true by the compiler when --closure_pass
 *     or --mark_as_compiled is specified.
 */
var COMPILED = false;


/**
 * Base namespace for the Closure library.  Checks to see goog is
 * already defined in the current scope before assigning to prevent
 * clobbering if base.js is loaded more than once.
 *
 * @const
 */
var goog = goog || {}; // Identifies this file as the Closure base.


/**
 * Reference to the global context.  In most cases this will be 'window'.
 * @type {Window}
 */
goog.global = Function('return this')();;

/**
 * @define {boolean} DEBUG is provided as a convenience so that debugging code
 * that should not be included in a production js_binary can be easily stripped
 * by specifying --define goog.DEBUG=false to the JSCompiler. For example, most
 * toString() methods should be declared inside an "if (goog.DEBUG)" conditional
 * because they are generally used for debugging purposes and it is difficult
 * for the JSCompiler to statically determine whether they are used.
 */
goog.DEBUG = true;


/**
 * @define {string} LOCALE defines the locale being used for compilation. It is
 * used to select locale specific data to be compiled in js binary. BUILD rule
 * can specify this value by "--define goog.LOCALE=<locale_name>" as JSCompiler
 * option.
 *
 * Take into account that the locale code format is important. You should use
 * the canonical Unicode format with hyphen as a delimiter. Language must be
 * lowercase, Language Script - Capitalized, Region - UPPERCASE.
 * There are few examples: pt-BR, en, en-US, sr-Latin-BO, zh-Hans-CN.
 *
 * See more info about locale codes here:
 * http://www.unicode.org/reports/tr35/#Unicode_Language_and_Locale_Identifiers
 *
 * For language codes you should use values defined by ISO 693-1. See it here
 * http://www.w3.org/WAI/ER/IG/ert/iso639.htm. There is only one exception from
 * this rule: the Hebrew language. For legacy reasons the old code (iw) should
 * be used instead of the new code (he), see http://wiki/Main/IIISynonyms.
 */
goog.LOCALE = 'en';  // default to en


/**
 * @define {boolean} Whether this code is running on trusted sites.
 *
 * On untrusted sites, several native functions can be defined or overridden by
 * external libraries like Prototype, Datejs, and JQuery and setting this flag
 * to false forces closure to use its own implementations when possible.
 *
 * If your javascript can be loaded by a third party site and you are wary about
 * relying on non-standard implementations, specify
 * "--define goog.TRUSTED_SITE=false" to the JSCompiler.
 */
goog.TRUSTED_SITE = true;


/**
 * Creates object stubs for a namespace.  The presence of one or more
 * goog.provide() calls indicate that the file defines the given
 * objects/namespaces.  Build tools also scan for provide/require statements
 * to discern dependencies, build dependency files (see deps.js), etc.
 * @see goog.require
 * @param {string} name Namespace provided by this file in the form
 *     "goog.package.part".
 */
goog.provide = function(name) {
  if (!COMPILED) {
    // Ensure that the same namespace isn't provided twice. This is intended
    // to teach new developers that 'goog.provide' is effectively a variable
    // declaration. And when JSCompiler transforms goog.provide into a real
    // variable declaration, the compiled JS should work the same as the raw
    // JS--even when the raw JS uses goog.provide incorrectly.
    if (goog.isProvided_(name)) {
      throw Error('Namespace "' + name + '" already declared.');
    }
    delete goog.implicitNamespaces_[name];

    var namespace = name;
    while ((namespace = namespace.substring(0, namespace.lastIndexOf('.')))) {
      if (goog.getObjectByName(namespace)) {
        break;
      }
      goog.implicitNamespaces_[namespace] = true;
    }
  }

  goog.exportPath_(name);
};


/**
 * Marks that the current file should only be used for testing, and never for
 * live code in production.
 * @param {string=} opt_message Optional message to add to the error that's
 *     raised when used in production code.
 */
goog.setTestOnly = function(opt_message) {
  if (COMPILED && !goog.DEBUG) {
    opt_message = opt_message || '';
    throw Error('Importing test-only code into non-debug environment' +
                opt_message ? ': ' + opt_message : '.');
  }
};


if (!COMPILED) {

  /**
   * Check if the given name has been goog.provided. This will return false for
   * names that are available only as implicit namespaces.
   * @param {string} name name of the object to look for.
   * @return {boolean} Whether the name has been provided.
   * @private
   */
  goog.isProvided_ = function(name) {
    return !goog.implicitNamespaces_[name] && !!goog.getObjectByName(name);
  };

  /**
   * Namespaces implicitly defined by goog.provide. For example,
   * goog.provide('goog.events.Event') implicitly declares
   * that 'goog' and 'goog.events' must be namespaces.
   *
   * @type {Object}
   * @private
   */
  goog.implicitNamespaces_ = {};
}


/**
 * Builds an object structure for the provided namespace path,
 * ensuring that names that already exist are not overwritten. For
 * example:
 * "a.b.c" -> a = {};a.b={};a.b.c={};
 * Used by goog.provide and goog.exportSymbol.
 * @param {string} name name of the object that this file defines.
 * @param {*=} opt_object the object to expose at the end of the path.
 * @param {Object=} opt_objectToExportTo The object to add the path to; default
 *     is |goog.global|.
 * @private
 */
goog.exportPath_ = function(name, opt_object, opt_objectToExportTo) {
  var parts = name.split('.');
  var cur = opt_objectToExportTo || goog.global;

  // Internet Explorer exhibits strange behavior when throwing errors from
  // methods externed in this manner.  See the testExportSymbolExceptions in
  // base_test.html for an example.
  if (!(parts[0] in cur) && cur.execScript) {
    cur.execScript('var ' + parts[0]);
  }

  // Certain browsers cannot parse code in the form for((a in b); c;);
  // This pattern is produced by the JSCompiler when it collapses the
  // statement above into the conditional loop below. To prevent this from
  // happening, use a for-loop and reserve the init logic as below.

  // Parentheses added to eliminate strict JS warning in Firefox.
  for (var part; parts.length && (part = parts.shift());) {
    if (!parts.length && goog.isDef(opt_object)) {
      // last part and we have an object; use it
      cur[part] = opt_object;
    } else if (cur[part]) {
      cur = cur[part];
    } else {
      cur = cur[part] = {};
    }
  }
};


/**
 * Returns an object based on its fully qualified external name.  If you are
 * using a compilation pass that renames property names beware that using this
 * function will not find renamed properties.
 *
 * @param {string} name The fully qualified name.
 * @param {Object=} opt_obj The object within which to look; default is
 *     |goog.global|.
 * @return {?} The value (object or primitive) or, if not found, null.
 */
goog.getObjectByName = function(name, opt_obj) {
  var parts = name.split('.');
  var cur = opt_obj || goog.global;
  for (var part; part = parts.shift(); ) {
    if (goog.isDefAndNotNull(cur[part])) {
      cur = cur[part];
    } else {
      return null;
    }
  }
  return cur;
};


/**
 * Globalizes a whole namespace, such as goog or goog.lang.
 *
 * @param {Object} obj The namespace to globalize.
 * @param {Object=} opt_global The object to add the properties to.
 * @deprecated Properties may be explicitly exported to the global scope, but
 *     this should no longer be done in bulk.
 */
goog.globalize = function(obj, opt_global) {
  var global = opt_global || goog.global;
  for (var x in obj) {
    global[x] = obj[x];
  }
};


/**
 * Adds a dependency from a file to the files it requires.
 * @param {string} relPath The path to the js file.
 * @param {Array} provides An array of strings with the names of the objects
 *                         this file provides.
 * @param {Array} requires An array of strings with the names of the objects
 *                         this file requires.
 */
goog.addDependency = function(relPath, provides, requires) {
  if (!COMPILED) {
    var provide, require;
    var path = relPath.replace(/\\/g, '/');
    var deps = goog.dependencies_;
    for (var i = 0; provide = provides[i]; i++) {
      deps.nameToPath[provide] = path;
      if (!(path in deps.pathToNames)) {
        deps.pathToNames[path] = {};
      }
      deps.pathToNames[path][provide] = true;
    }
    for (var j = 0; require = requires[j]; j++) {
      if (!(path in deps.requires)) {
        deps.requires[path] = {};
      }
      deps.requires[path][require] = true;
    }
  }
};




// NOTE(nnaze): The debug DOM loader was included in base.js as an orignal
// way to do "debug-mode" development.  The dependency system can sometimes
// be confusing, as can the debug DOM loader's asyncronous nature.
//
// With the DOM loader, a call to goog.require() is not blocking -- the
// script will not load until some point after the current script.  If a
// namespace is needed at runtime, it needs to be defined in a previous
// script, or loaded via require() with its registered dependencies.
// User-defined namespaces may need their own deps file.  See http://go/js_deps,
// http://go/genjsdeps, or, externally, DepsWriter.
// http://code.google.com/closure/library/docs/depswriter.html
//
// Because of legacy clients, the DOM loader can't be easily removed from
// base.js.  Work is being done to make it disableable or replaceable for
// different environments (DOM-less JavaScript interpreters like Rhino or V8,
// for example). See bootstrap/ for more information.


/**
 * @define {boolean} Whether to enable the debug loader.
 *
 * If enabled, a call to goog.require() will attempt to load the namespace by
 * appending a script tag to the DOM (if the namespace has been registered).
 *
 * If disabled, goog.require() will simply assert that the namespace has been
 * provided (and depend on the fact that some outside tool correctly ordered
 * the script).
 */
goog.ENABLE_DEBUG_LOADER = true;


/**
 * Implements a system for the dynamic resolution of dependencies
 * that works in parallel with the BUILD system. Note that all calls
 * to goog.require will be stripped by the JSCompiler when the
 * --closure_pass option is used.
 * @see goog.provide
 * @param {string} name Namespace to include (as was given in goog.provide())
 *     in the form "goog.package.part".
 */
goog.require = function(name) {

  // if the object already exists we do not need do do anything
  // TODO(arv): If we start to support require based on file name this has
  //            to change
  // TODO(arv): If we allow goog.foo.* this has to change
  // TODO(arv): If we implement dynamic load after page load we should probably
  //            not remove this code for the compiled output
  if (!COMPILED) {
    if (goog.isProvided_(name)) {
      return;
    }

    if (goog.ENABLE_DEBUG_LOADER) {
      var path = goog.getPathFromDeps_(name);
      if (path) {
        goog.included_[path] = true;
        goog.writeScripts_();
        return;
      }
    }

    var errorMessage = 'goog.require could not find: ' + name;
    if (goog.global.console) {
      goog.global.console['error'](errorMessage);
    }


      throw Error(errorMessage);

  }
};


/**
 * Path for included scripts
 * @type {string}
 */
goog.basePath = '';


/**
 * A hook for overriding the base path.
 * @type {string|undefined}
 */
goog.global.CLOSURE_BASE_PATH;


/**
 * Whether to write out Closure's deps file. By default,
 * the deps are written.
 * @type {boolean|undefined}
 */
goog.global.CLOSURE_NO_DEPS = true;


/**
 * A function to import a single script. This is meant to be overridden when
 * Closure is being run in non-HTML contexts, such as web workers. It's defined
 * in the global scope so that it can be set before base.js is loaded, which
 * allows deps.js to be imported properly.
 *
 * The function is passed the script source, which is a relative URI. It should
 * return true if the script was imported, false otherwise.
 */
goog.global.CLOSURE_IMPORT_SCRIPT;


/**
 * Null function used for default values of callbacks, etc.
 * @return {void} Nothing.
 */
goog.nullFunction = function() {};


/**
 * The identity function. Returns its first argument.
 *
 * @param {*=} opt_returnValue The single value that will be returned.
 * @param {...*} var_args Optional trailing arguments. These are ignored.
 * @return {?} The first argument. We can't know the type -- just pass it along
 *      without type.
 * @deprecated Use goog.functions.identity instead.
 */
goog.identityFunction = function(opt_returnValue, var_args) {
  return opt_returnValue;
};


/**
 * When defining a class Foo with an abstract method bar(), you can do:
 *
 * Foo.prototype.bar = goog.abstractMethod
 *
 * Now if a subclass of Foo fails to override bar(), an error
 * will be thrown when bar() is invoked.
 *
 * Note: This does not take the name of the function to override as
 * an argument because that would make it more difficult to obfuscate
 * our JavaScript code.
 *
 * @type {!Function}
 * @throws {Error} when invoked to indicate the method should be
 *   overridden.
 */
goog.abstractMethod = function() {
  throw Error('unimplemented abstract method');
};


/**
 * Adds a {@code getInstance} static method that always return the same instance
 * object.
 * @param {!Function} ctor The constructor for the class to add the static
 *     method to.
 */
goog.addSingletonGetter = function(ctor) {
  ctor.getInstance = function() {
    if (ctor.instance_) {
      return ctor.instance_;
    }
    if (goog.DEBUG) {
      // NOTE: JSCompiler can't optimize away Array#push.
      goog.instantiatedSingletons_[goog.instantiatedSingletons_.length] = ctor;
    }
    return ctor.instance_ = new ctor;
  };
};


/**
 * All singleton classes that have been instantiated, for testing. Don't read
 * it directly, use the {@code goog.testing.singleton} module. The compiler
 * removes this variable if unused.
 * @type {!Array.<!Function>}
 * @private
 */
goog.instantiatedSingletons_ = [];


if (!COMPILED && goog.ENABLE_DEBUG_LOADER) {
  /**
   * Object used to keep track of urls that have already been added. This
   * record allows the prevention of circular dependencies.
   * @type {Object}
   * @private
   */
  goog.included_ = {};


  /**
   * This object is used to keep track of dependencies and other data that is
   * used for loading scripts
   * @private
   * @type {Object}
   */
  goog.dependencies_ = {
    pathToNames: {}, // 1 to many
    nameToPath: {}, // 1 to 1
    requires: {}, // 1 to many
    // used when resolving dependencies to prevent us from
    // visiting the file twice
    visited: {},
    written: {} // used to keep track of script files we have written
  };


  /**
   * Tries to detect whether is in the context of an HTML document.
   * @return {boolean} True if it looks like HTML document.
   * @private
   */
  goog.inHtmlDocument_ = function() {
    var doc = goog.global.document;
    return typeof doc != 'undefined' &&
           'write' in doc;  // XULDocument misses write.
  };


  /**
   * Tries to detect the base path of the base.js script that bootstraps Closure
   * @private
   */
  goog.findBasePath_ = function() {
    if (goog.global.CLOSURE_BASE_PATH) {
      goog.basePath = goog.global.CLOSURE_BASE_PATH;
      return;
    } else if (!goog.inHtmlDocument_()) {
      return;
    }
    var doc = goog.global.document;
    var scripts = doc.getElementsByTagName('script');
    // Search backwards since the current script is in almost all cases the one
    // that has base.js.
    for (var i = scripts.length - 1; i >= 0; --i) {
      var src = scripts[i].src;
      var qmark = src.lastIndexOf('?');
      var l = qmark == -1 ? src.length : qmark;
      if (src.substr(l - 7, 7) == 'base.js') {
        goog.basePath = src.substr(0, l - 7);
        return;
      }
    }
  };


  /**
   * Imports a script if, and only if, that script hasn't already been imported.
   * (Must be called at execution time)
   * @param {string} src Script source.
   * @private
   */
  goog.importScript_ = function(src) {
    var importScript = goog.global.CLOSURE_IMPORT_SCRIPT ||
        goog.writeScriptTag_;
    if (!goog.dependencies_.written[src] && importScript(src)) {
      goog.dependencies_.written[src] = true;
    }
  };


  /**
   * The default implementation of the import function. Writes a script tag to
   * import the script.
   *
   * @param {string} src The script source.
   * @return {boolean} True if the script was imported, false otherwise.
   * @private
   */
  goog.writeScriptTag_ = function(src) {
    if (goog.inHtmlDocument_()) {
      var doc = goog.global.document;

      // If the user tries to require a new symbol after document load,
      // something has gone terribly wrong. Doing a document.write would
      // wipe out the page.
      if (doc.readyState == 'complete') {
        // Certain test frameworks load base.js multiple times, which tries
        // to write deps.js each time. If that happens, just fail silently.
        // These frameworks wipe the page between each load of base.js, so this
        // is OK.
        var isDeps = /\bdeps.js$/.test(src);
        if (isDeps) {
          return false;
        } else {
          throw Error('Cannot write "' + src + '" after document load');
        }
      }

      doc.write(
          '<script type="text/javascript" src="' + src + '"></' + 'script>');
      return true;
    } else {
      return false;
    }
  };


  /**
   * Resolves dependencies based on the dependencies added using addDependency
   * and calls importScript_ in the correct order.
   * @private
   */
  goog.writeScripts_ = function() {
    // the scripts we need to write this time
    var scripts = [];
    var seenScript = {};
    var deps = goog.dependencies_;

    function visitNode(path) {
      if (path in deps.written) {
        return;
      }

      // we have already visited this one. We can get here if we have cyclic
      // dependencies
      if (path in deps.visited) {
        if (!(path in seenScript)) {
          seenScript[path] = true;
          scripts.push(path);
        }
        return;
      }

      deps.visited[path] = true;

      if (path in deps.requires) {
        for (var requireName in deps.requires[path]) {
          // If the required name is defined, we assume that it was already
          // bootstrapped by other means.
          if (!goog.isProvided_(requireName)) {
            if (requireName in deps.nameToPath) {
              visitNode(deps.nameToPath[requireName]);
            } else {
              throw Error('Undefined nameToPath for ' + requireName);
            }
          }
        }
      }

      if (!(path in seenScript)) {
        seenScript[path] = true;
        scripts.push(path);
      }
    }

    for (var path in goog.included_) {
      if (!deps.written[path]) {
        visitNode(path);
      }
    }

    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i]) {
        goog.importScript_(goog.basePath + scripts[i]);
      } else {
        throw Error('Undefined script input');
      }
    }
  };


  /**
   * Looks at the dependency rules and tries to determine the script file that
   * fulfills a particular rule.
   * @param {string} rule In the form goog.namespace.Class or project.script.
   * @return {?string} Url corresponding to the rule, or null.
   * @private
   */
  goog.getPathFromDeps_ = function(rule) {
    if (rule in goog.dependencies_.nameToPath) {
      return goog.dependencies_.nameToPath[rule];
    } else {
      return null;
    }
  };

  // Allow projects to manage the deps files themselves.
  if (!goog.global.CLOSURE_NO_DEPS) {
    goog.importScript_(goog.basePath + 'deps.js');
  }
}



//==============================================================================
// Language Enhancements
//==============================================================================


/**
 * This is a "fixed" version of the typeof operator.  It differs from the typeof
 * operator in such a way that null returns 'null' and arrays return 'array'.
 * @param {*} value The value to get the type of.
 * @return {string} The name of the type.
 */
goog.typeOf = function(value) {
  var s = typeof value;
  if (s == 'object') {
    if (value) {
      // Check these first, so we can avoid calling Object.prototype.toString if
      // possible.
      //
      // IE improperly marshals tyepof across execution contexts, but a
      // cross-context object will still return false for "instanceof Object".
      if (value instanceof Array) {
        return 'array';
      } else if (value instanceof Object) {
        return s;
      }

      // HACK: In order to use an Object prototype method on the arbitrary
      //   value, the compiler requires the value be cast to type Object,
      //   even though the ECMA spec explicitly allows it.
      var className = Object.prototype.toString.call(
          /** @type {Object} */ (value));
      // In Firefox 3.6, attempting to access iframe window objects' length
      // property throws an NS_ERROR_FAILURE, so we need to special-case it
      // here.
      if (className == '[object Window]') {
        return 'object';
      }

      // We cannot always use constructor == Array or instanceof Array because
      // different frames have different Array objects. In IE6, if the iframe
      // where the array was created is destroyed, the array loses its
      // prototype. Then dereferencing val.splice here throws an exception, so
      // we can't use goog.isFunction. Calling typeof directly returns 'unknown'
      // so that will work. In this case, this function will return false and
      // most array functions will still work because the array is still
      // array-like (supports length and []) even though it has lost its
      // prototype.
      // Mark Miller noticed that Object.prototype.toString
      // allows access to the unforgeable [[Class]] property.
      //  15.2.4.2 Object.prototype.toString ( )
      //  When the toString method is called, the following steps are taken:
      //      1. Get the [[Class]] property of this object.
      //      2. Compute a string value by concatenating the three strings
      //         "[object ", Result(1), and "]".
      //      3. Return Result(2).
      // and this behavior survives the destruction of the execution context.
      if ((className == '[object Array]' ||
           // In IE all non value types are wrapped as objects across window
           // boundaries (not iframe though) so we have to do object detection
           // for this edge case
           typeof value.length == 'number' &&
           typeof value.splice != 'undefined' &&
           typeof value.propertyIsEnumerable != 'undefined' &&
           !value.propertyIsEnumerable('splice')

          )) {
        return 'array';
      }
      // HACK: There is still an array case that fails.
      //     function ArrayImpostor() {}
      //     ArrayImpostor.prototype = [];
      //     var impostor = new ArrayImpostor;
      // this can be fixed by getting rid of the fast path
      // (value instanceof Array) and solely relying on
      // (value && Object.prototype.toString.vall(value) === '[object Array]')
      // but that would require many more function calls and is not warranted
      // unless closure code is receiving objects from untrusted sources.

      // IE in cross-window calls does not correctly marshal the function type
      // (it appears just as an object) so we cannot use just typeof val ==
      // 'function'. However, if the object has a call property, it is a
      // function.
      if ((className == '[object Function]' ||
          typeof value.call != 'undefined' &&
          typeof value.propertyIsEnumerable != 'undefined' &&
          !value.propertyIsEnumerable('call'))) {
        return 'function';
      }


    } else {
      return 'null';
    }

  } else if (s == 'function' && typeof value.call == 'undefined') {
    // In Safari typeof nodeList returns 'function', and on Firefox
    // typeof behaves similarly for HTML{Applet,Embed,Object}Elements
    // and RegExps.  We would like to return object for those and we can
    // detect an invalid function by making sure that the function
    // object has a call method.
    return 'object';
  }
  return s;
};


/**
 * Returns true if the specified value is not |undefined|.
 * WARNING: Do not use this to test if an object has a property. Use the in
 * operator instead.  Additionally, this function assumes that the global
 * undefined variable has not been redefined.
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is defined.
 */
goog.isDef = function(val) {
  return val !== undefined;
};


/**
 * Returns true if the specified value is |null|
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is null.
 */
goog.isNull = function(val) {
  return val === null;
};


/**
 * Returns true if the specified value is defined and not null
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is defined and not null.
 */
goog.isDefAndNotNull = function(val) {
  // Note that undefined == null.
  return val != null;
};


/**
 * Returns true if the specified value is an array
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is an array.
 */
goog.isArray = function(val) {
  return goog.typeOf(val) == 'array';
};


/**
 * Returns true if the object looks like an array. To qualify as array like
 * the value needs to be either a NodeList or an object with a Number length
 * property.
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is an array.
 */
goog.isArrayLike = function(val) {
  var type = goog.typeOf(val);
  return type == 'array' || type == 'object' && typeof val.length == 'number';
};


/**
 * Returns true if the object looks like a Date. To qualify as Date-like
 * the value needs to be an object and have a getFullYear() function.
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is a like a Date.
 */
goog.isDateLike = function(val) {
  return goog.isObject(val) && typeof val.getFullYear == 'function';
};


/**
 * Returns true if the specified value is a string
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is a string.
 */
goog.isString = function(val) {
  return typeof val == 'string';
};


/**
 * Returns true if the specified value is a boolean
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is boolean.
 */
goog.isBoolean = function(val) {
  return typeof val == 'boolean';
};


/**
 * Returns true if the specified value is a number
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is a number.
 */
goog.isNumber = function(val) {
  return typeof val == 'number';
};


/**
 * Returns true if the specified value is a function
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is a function.
 */
goog.isFunction = function(val) {
  return goog.typeOf(val) == 'function';
};


/**
 * Returns true if the specified value is an object.  This includes arrays
 * and functions.
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is an object.
 */
goog.isObject = function(val) {
  var type = typeof val;
  return type == 'object' && val != null || type == 'function';
  // return Object(val) === val also works, but is slower, especially if val is
  // not an object.
};


/**
 * Gets a unique ID for an object. This mutates the object so that further
 * calls with the same object as a parameter returns the same value. The unique
 * ID is guaranteed to be unique across the current session amongst objects that
 * are passed into {@code getUid}. There is no guarantee that the ID is unique
 * or consistent across sessions. It is unsafe to generate unique ID for
 * function prototypes.
 *
 * @param {Object} obj The object to get the unique ID for.
 * @return {number} The unique ID for the object.
 */
goog.getUid = function(obj) {
  // TODO(arv): Make the type stricter, do not accept null.

  // In Opera window.hasOwnProperty exists but always returns false so we avoid
  // using it. As a consequence the unique ID generated for BaseClass.prototype
  // and SubClass.prototype will be the same.
  return obj[goog.UID_PROPERTY_] ||
      (obj[goog.UID_PROPERTY_] = ++goog.uidCounter_);
};


/**
 * Removes the unique ID from an object. This is useful if the object was
 * previously mutated using {@code goog.getUid} in which case the mutation is
 * undone.
 * @param {Object} obj The object to remove the unique ID field from.
 */
goog.removeUid = function(obj) {
  // TODO(arv): Make the type stricter, do not accept null.

  // DOM nodes in IE are not instance of Object and throws exception
  // for delete. Instead we try to use removeAttribute
  if ('removeAttribute' in obj) {
    obj.removeAttribute(goog.UID_PROPERTY_);
  }
  /** @preserveTry */
  try {
    delete obj[goog.UID_PROPERTY_];
  } catch (ex) {
  }
};


/**
 * Name for unique ID property. Initialized in a way to help avoid collisions
 * with other closure javascript on the same page.
 * @type {string}
 * @private
 */
goog.UID_PROPERTY_ = 'closure_uid_' + ((Math.random() * 1e9) >>> 0);


/**
 * Counter for UID.
 * @type {number}
 * @private
 */
goog.uidCounter_ = 0;


/**
 * Adds a hash code field to an object. The hash code is unique for the
 * given object.
 * @param {Object} obj The object to get the hash code for.
 * @return {number} The hash code for the object.
 * @deprecated Use goog.getUid instead.
 */
goog.getHashCode = goog.getUid;


/**
 * Removes the hash code field from an object.
 * @param {Object} obj The object to remove the field from.
 * @deprecated Use goog.removeUid instead.
 */
goog.removeHashCode = goog.removeUid;


/**
 * Clones a value. The input may be an Object, Array, or basic type. Objects and
 * arrays will be cloned recursively.
 *
 * WARNINGS:
 * <code>goog.cloneObject</code> does not detect reference loops. Objects that
 * refer to themselves will cause infinite recursion.
 *
 * <code>goog.cloneObject</code> is unaware of unique identifiers, and copies
 * UIDs created by <code>getUid</code> into cloned results.
 *
 * @param {*} obj The value to clone.
 * @return {*} A clone of the input value.
 * @deprecated goog.cloneObject is unsafe. Prefer the goog.object methods.
 */
goog.cloneObject = function(obj) {
  var type = goog.typeOf(obj);
  if (type == 'object' || type == 'array') {
    if (obj.clone) {
      return obj.clone();
    }
    var clone = type == 'array' ? [] : {};
    for (var key in obj) {
      clone[key] = goog.cloneObject(obj[key]);
    }
    return clone;
  }

  return obj;
};


/**
 * A native implementation of goog.bind.
 * @param {Function} fn A function to partially apply.
 * @param {Object|undefined} selfObj Specifies the object which |this| should
 *     point to when the function is run.
 * @param {...*} var_args Additional arguments that are partially
 *     applied to the function.
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 * @private
 * @suppress {deprecated} The compiler thinks that Function.prototype.bind
 *     is deprecated because some people have declared a pure-JS version.
 *     Only the pure-JS version is truly deprecated.
 */
goog.bindNative_ = function(fn, selfObj, var_args) {
  return /** @type {!Function} */ (fn.call.apply(fn.bind, arguments));
};


/**
 * A pure-JS implementation of goog.bind.
 * @param {Function} fn A function to partially apply.
 * @param {Object|undefined} selfObj Specifies the object which |this| should
 *     point to when the function is run.
 * @param {...*} var_args Additional arguments that are partially
 *     applied to the function.
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 * @private
 */
goog.bindJs_ = function(fn, selfObj, var_args) {
  if (!fn) {
    throw new Error();
  }

  if (arguments.length > 2) {
    var boundArgs = Array.prototype.slice.call(arguments, 2);
    return function() {
      // Prepend the bound arguments to the current arguments.
      var newArgs = Array.prototype.slice.call(arguments);
      Array.prototype.unshift.apply(newArgs, boundArgs);
      return fn.apply(selfObj, newArgs);
    };

  } else {
    return function() {
      return fn.apply(selfObj, arguments);
    };
  }
};


/**
 * Partially applies this function to a particular 'this object' and zero or
 * more arguments. The result is a new function with some arguments of the first
 * function pre-filled and the value of |this| 'pre-specified'.<br><br>
 *
 * Remaining arguments specified at call-time are appended to the pre-
 * specified ones.<br><br>
 *
 * Also see: {@link #partial}.<br><br>
 *
 * Usage:
 * <pre>var barMethBound = bind(myFunction, myObj, 'arg1', 'arg2');
 * barMethBound('arg3', 'arg4');</pre>
 *
 * @param {Function} fn A function to partially apply.
 * @param {Object|undefined} selfObj Specifies the object which |this| should
 *     point to when the function is run.
 * @param {...*} var_args Additional arguments that are partially
 *     applied to the function.
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 * @suppress {deprecated} See above.
 */
goog.bind = function(fn, selfObj, var_args) {
  // TODO(nicksantos): narrow the type signature.
  if (Function.prototype.bind &&
      // NOTE(nicksantos): Somebody pulled base.js into the default
      // Chrome extension environment. This means that for Chrome extensions,
      // they get the implementation of Function.prototype.bind that
      // calls goog.bind instead of the native one. Even worse, we don't want
      // to introduce a circular dependency between goog.bind and
      // Function.prototype.bind, so we have to hack this to make sure it
      // works correctly.
      Function.prototype.bind.toString().indexOf('native code') != -1) {
    goog.bind = goog.bindNative_;
  } else {
    goog.bind = goog.bindJs_;
  }
  return goog.bind.apply(null, arguments);
};


/**
 * Like bind(), except that a 'this object' is not required. Useful when the
 * animationTarget function is already bound.
 *
 * Usage:
 * var g = partial(f, arg1, arg2);
 * g(arg3, arg4);
 *
 * @param {Function} fn A function to partially apply.
 * @param {...*} var_args Additional arguments that are partially
 *     applied to fn.
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 */
goog.partial = function(fn, var_args) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    // Prepend the bound arguments to the current arguments.
    var newArgs = Array.prototype.slice.call(arguments);
    newArgs.unshift.apply(newArgs, args);
    return fn.apply(this, newArgs);
  };
};


/**
 * Copies all the members of a source object to a animationTarget object. This method
 * does not work on all browsers for all objects that contain keys such as
 * toString or hasOwnProperty. Use goog.object.extend for this purpose.
 * @param {Object} target Target.
 * @param {Object} source Source.
 */
goog.mixin = function(target, source) {
  for (var x in source) {
    target[x] = source[x];
  }

  // For IE7 or lower, the for-in-loop does not contain any properties that are
  // not enumerable on the prototype object (for example, isPrototypeOf from
  // Object.prototype) but also it will not include 'replace' on objects that
  // extend String and change 'replace' (not that it is common for anyone to
  // extend anything except Object).
};


/**
 * @return {number} An integer value representing the number of milliseconds
 *     between midnight, January 1, 1970 and the current time.
 */
goog.now = (goog.TRUSTED_SITE && Date.now) || (function() {
  // Unary plus operator converts its operand to a number which in the case of
  // a date is done by calling getTime().
  return +new Date();
});


/**
 * Evals javascript in the global scope.  In IE this uses execScript, other
 * browsers use goog.global.eval. If goog.global.eval does not evaluate in the
 * global scope (for example, in Safari), appends a script tag instead.
 * Throws an exception if neither execScript or eval is defined.
 * @param {string} script JavaScript string.
 */
goog.globalEval = function(script) {
  if (goog.global.execScript) {
    goog.global.execScript(script, 'JavaScript');
  } else if (goog.global.eval) {
    // Test to see if eval works
    if (goog.evalWorksForGlobals_ == null) {
      goog.global.eval('var _et_ = 1;');
      if (typeof goog.global['_et_'] != 'undefined') {
        delete goog.global['_et_'];
        goog.evalWorksForGlobals_ = true;
      } else {
        goog.evalWorksForGlobals_ = false;
      }
    }

    if (goog.evalWorksForGlobals_) {
      goog.global.eval(script);
    } else {
      var doc = goog.global.document;
      var scriptElt = doc.createElement('script');
      scriptElt.type = 'text/javascript';
      scriptElt.defer = false;
      // Note(user): can't use .innerHTML since "t('<test>')" will fail and
      // .text doesn't work in Safari 2.  Therefore we append a text node.
      scriptElt.appendChild(doc.createTextNode(script));
      doc.body.appendChild(scriptElt);
      doc.body.removeChild(scriptElt);
    }
  } else {
    throw Error('goog.globalEval not available');
  }
};


/**
 * Indicates whether or not we can call 'eval' directly to eval code in the
 * global scope. Set to a Boolean by the first call to goog.globalEval (which
 * empirically tests whether eval works for globals). @see goog.globalEval
 * @type {?boolean}
 * @private
 */
goog.evalWorksForGlobals_ = null;


/**
 * Optional map of CSS class names to obfuscated names used with
 * goog.getCssName().
 * @type {Object|undefined}
 * @private
 * @see goog.setCssNameMapping
 */
goog.cssNameMapping_;


/**
 * Optional obfuscation style for CSS class names. Should be set to either
 * 'BY_WHOLE' or 'BY_PART' if defined.
 * @type {string|undefined}
 * @private
 * @see goog.setCssNameMapping
 */
goog.cssNameMappingStyle_;


/**
 * Handles strings that are intended to be used as CSS class names.
 *
 * This function works in tandem with @see goog.setCssNameMapping.
 *
 * Without any mapping set, the arguments are simple joined with a
 * hyphen and passed through unaltered.
 *
 * When there is a mapping, there are two possible styles in which
 * these mappings are used. In the BY_PART style, each part (i.e. in
 * between hyphens) of the passed in css name is rewritten according
 * to the map. In the BY_WHOLE style, the full css name is looked up in
 * the map directly. If a rewrite is not specified by the map, the
 * compiler will output a warning.
 *
 * When the mapping is passed to the compiler, it will replace calls
 * to goog.getCssName with the strings from the mapping, e.g.
 *     var x = goog.getCssName('foo');
 *     var y = goog.getCssName(this.baseClass, 'active');
 *  becomes:
 *     var x= 'foo';
 *     var y = this.baseClass + '-active';
 *
 * If one argument is passed it will be processed, if two are passed
 * only the modifier will be processed, as it is assumed the first
 * argument was generated as a result of calling goog.getCssName.
 *
 * @param {string} className The class name.
 * @param {string=} opt_modifier A modifier to be appended to the class name.
 * @return {string} The class name or the concatenation of the class name and
 *     the modifier.
 */
goog.getCssName = function(className, opt_modifier) {
  var getMapping = function(cssName) {
    return goog.cssNameMapping_[cssName] || cssName;
  };

  var renameByParts = function(cssName) {
    // Remap all the parts individually.
    var parts = cssName.split('-');
    var mapped = [];
    for (var i = 0; i < parts.length; i++) {
      mapped.push(getMapping(parts[i]));
    }
    return mapped.join('-');
  };

  var rename;
  if (goog.cssNameMapping_) {
    rename = goog.cssNameMappingStyle_ == 'BY_WHOLE' ?
        getMapping : renameByParts;
  } else {
    rename = function(a) {
      return a;
    };
  }

  if (opt_modifier) {
    return className + '-' + rename(opt_modifier);
  } else {
    return rename(className);
  }
};


/**
 * Sets the map to check when returning a value from goog.getCssName(). Example:
 * <pre>
 * goog.setCssNameMapping({
 *   "goog": "a",
 *   "disabled": "b",
 * });
 *
 * var x = goog.getCssName('goog');
 * // The following evaluates to: "a a-b".
 * goog.getCssName('goog') + ' ' + goog.getCssName(x, 'disabled')
 * </pre>
 * When declared as a map of string literals to string literals, the JSCompiler
 * will replace all calls to goog.getCssName() using the supplied map if the
 * --closure_pass flag is set.
 *
 * @param {!Object} mapping A map of strings to strings where keys are possible
 *     arguments to goog.getCssName() and values are the corresponding values
 *     that should be returned.
 * @param {string=} opt_style The style of css name mapping. There are two valid
 *     options: 'BY_PART', and 'BY_WHOLE'.
 * @see goog.getCssName for a description.
 */
goog.setCssNameMapping = function(mapping, opt_style) {
  goog.cssNameMapping_ = mapping;
  goog.cssNameMappingStyle_ = opt_style;
};


/**
 * To use CSS renaming in compiled mode, one of the input files should have a
 * call to goog.setCssNameMapping() with an object literal that the JSCompiler
 * can extract and use to replace all calls to goog.getCssName(). In uncompiled
 * mode, JavaScript code should be loaded before this base.js file that declares
 * a global variable, CLOSURE_CSS_NAME_MAPPING, which is used below. This is
 * to ensure that the mapping is loaded before any calls to goog.getCssName()
 * are made in uncompiled mode.
 *
 * A hook for overriding the CSS name mapping.
 * @type {Object|undefined}
 */
goog.global.CLOSURE_CSS_NAME_MAPPING;


if (!COMPILED && goog.global.CLOSURE_CSS_NAME_MAPPING) {
  // This does not call goog.setCssNameMapping() because the JSCompiler
  // requires that goog.setCssNameMapping() be called with an object literal.
  goog.cssNameMapping_ = goog.global.CLOSURE_CSS_NAME_MAPPING;
}


/**
 * Gets a localized message.
 *
 * This function is a compiler primitive. If you give the compiler a localized
 * message bundle, it will replace the string at compile-time with a localized
 * version, and expand goog.getMsg call to a concatenated string.
 *
 * Messages must be initialized in the form:
 * <code>
 * var MSG_NAME = goog.getMsg('Hello {$placeholder}', {'placeholder': 'world'});
 * </code>
 *
 * @param {string} str Translatable string, places holders in the form {$foo}.
 * @param {Object=} opt_values Map of place holder name to value.
 * @return {string} message with placeholders filled.
 */
goog.getMsg = function(str, opt_values) {
  var values = opt_values || {};
  for (var key in values) {
    var value = ('' + values[key]).replace(/\$/g, '$$$$');
    str = str.replace(new RegExp('\\{\\$' + key + '\\}', 'gi'), value);
  }
  return str;
};


/**
 * Gets a localized message. If the message does not have a translation, gives a
 * fallback message.
 *
 * This is useful when introducing a new message that has not yet been
 * translated into all languages.
 *
 * This function is a compiler primtive. Must be used in the form:
 * <code>var x = goog.getMsgWithFallback(MSG_A, MSG_B);</code>
 * where MSG_A and MSG_B were initialized with goog.getMsg.
 *
 * @param {string} a The preferred message.
 * @param {string} b The fallback message.
 * @return {string} The best translated message.
 */
goog.getMsgWithFallback = function(a, b) {
  return a;
};


/**
 * Exposes an unobfuscated global namespace path for the given object.
 * Note that fields of the exported object *will* be obfuscated,
 * unless they are exported in turn via this function or
 * goog.exportProperty
 *
 * <p>Also handy for making public items that are defined in anonymous
 * closures.
 *
 * ex. goog.exportSymbol('public.path.Foo', Foo);
 *
 * ex. goog.exportSymbol('public.path.Foo.staticFunction',
 *                       Foo.staticFunction);
 *     public.path.Foo.staticFunction();
 *
 * ex. goog.exportSymbol('public.path.Foo.prototype.myMethod',
 *                       Foo.prototype.myMethod);
 *     new public.path.Foo().myMethod();
 *
 * @param {string} publicPath Unobfuscated name to export.
 * @param {*} object Object the name should point to.
 * @param {Object=} opt_objectToExportTo The object to add the path to; default
 *     is |goog.global|.
 */
goog.exportSymbol = function(publicPath, object, opt_objectToExportTo) {
  goog.exportPath_(publicPath, object, opt_objectToExportTo);
};


/**
 * Exports a property unobfuscated into the object's namespace.
 * ex. goog.exportProperty(Foo, 'staticFunction', Foo.staticFunction);
 * ex. goog.exportProperty(Foo.prototype, 'myMethod', Foo.prototype.myMethod);
 * @param {Object} object Object whose static property is being exported.
 * @param {string} publicName Unobfuscated name to export.
 * @param {*} symbol Object the name should point to.
 */
goog.exportProperty = function(object, publicName, symbol) {
  object[publicName] = symbol;
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * Usage:
 * <pre>
 * function ParentClass(a, b) { }
 * ParentClass.prototype.foo = function(a) { }
 *
 * function ChildClass(a, b, c) {
 *   goog.base(this, a, b);
 * }
 * goog.inherits(ChildClass, ParentClass);
 *
 * var child = new ChildClass('a', 'b', 'see');
 * child.foo(); // works
 * </pre>
 *
 * In addition, a superclass' implementation of a method can be invoked
 * as follows:
 *
 * <pre>
 * ChildClass.prototype.foo = function(a) {
 *   ChildClass.superClass_.foo.call(this, a);
 *   // other code
 * };
 * </pre>
 *
 * @param {Function} childCtor Child class.
 * @param {Function} parentCtor Parent class.
 */
goog.inherits = function(childCtor, parentCtor) {
  /** @constructor */
  var tempCtor = Function();
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor();
  /** @override */
  childCtor.prototype.constructor = childCtor;
};


/**
 * Call up to the superclass.
 *
 * If this is called from a constructor, then this calls the superclass
 * contructor with arguments 1-N.
 *
 * If this is called from a prototype method, then you must pass
 * the name of the method as the second argument to this function. If
 * you do not, you will get a runtime error. This calls the superclass'
 * method with arguments 2-N.
 *
 * This function only works if you use goog.inherits to express
 * inheritance relationships between your classes.
 *
 * This function is a compiler primitive. At compile-time, the
 * compiler will do macro expansion to remove a lot of
 * the extra overhead that this function introduces. The compiler
 * will also enforce a lot of the assumptions that this function
 * makes, and treat it as a compiler error if you break them.
 *
 * @param {!Object} me Should always be "this".
 * @param {*=} opt_methodName The method name if calling a super method.
 * @param {...*} var_args The rest of the arguments.
 * @return {*} The return value of the superclass method.
 */
goog.base = function(me, opt_methodName, var_args) {
  var caller = arguments.callee.caller;
  if (caller.superClass_) {
    // This is a constructor. Call the superclass constructor.
    return caller.superClass_.constructor.apply(
        me, Array.prototype.slice.call(arguments, 1));
  }

  var args = Array.prototype.slice.call(arguments, 2);
  var foundCaller = false;
  for (var ctor = me.constructor;
       ctor; ctor = ctor.superClass_ && ctor.superClass_.constructor) {
    if (ctor.prototype[opt_methodName] === caller) {
      foundCaller = true;
    } else if (foundCaller) {
      return ctor.prototype[opt_methodName].apply(me, args);
    }
  }

  // If we did not find the caller in the prototype chain,
  // then one of two things happened:
  // 1) The caller is an instance method.
  // 2) This method was not called by the right caller.
  if (me[opt_methodName] === caller) {
    return me.constructor.prototype[opt_methodName].apply(me, args);
  } else {
    throw Error(
        'goog.base called from a method of one name ' +
        'to a method of a different name');
  }
};


/**
 * Allow for aliasing within scope functions.  This function exists for
 * uncompiled code - in compiled code the calls will be inlined and the
 * aliases applied.  In uncompiled code the function is simply run since the
 * aliases as written are valid JavaScript.
 * @param {function()} fn Function to call.  This function can contain aliases
 *     to namespaces (e.g. "var dom = goog.dom") or classes
 *    (e.g. "var Timer = goog.Timer").
 */
goog.scope = function(fn) {
  fn.call(goog.global);
};




/*---------------------------------------*/


    /**********************************
     *      ОБЩИЕ ВВОДНЫЕ ПЕРЕМЕННЫЕ
     * ********************************/

    /** @const */
    var mel = "melAnimation";

    /** @type {number} */
    var counter = 0;

    /** @const */
    var rootElement = 'document' in goog.global ? document.documentElement:null;


    /**
     * Абстрактная рега для парсинга CSS функций (в том числе transform-функций)
     * @type {RegExp}
     * @const
     * @example
     *  skewX(3deg, 5deg) ---> [ "skewX(3deg, 5deg)", "skewX", "3deg, 5deg" ]
     *  steps(4, start) ---> [ "steps(4, start)", "steps", "3, start" ]
     *  rgb(1, 2, 3) ---> [ "rgb(1, 2, 3)", "rgb", "1, 2, 3" ]
     */
    var cssFunctionReg = new RegExp([
        "([\\w-]+?)",  // Сама функция
        "\\(",
            "([^)]*?)", // Аргументы к функции
        "\\)"
    ].join(""));

    /**
     * @const
     * @type {number}
     */
    var FUNCREG_SOURCE = 0;
    /**
     * @const
     * @type {number}
     */
    var FUNCREG_FUNC = 1;
    /**
     * @const
     * @type {number}
     */
    var FUNCREG_ARGS = 2;

    /**
     * Разделитель аргументов в функциях CSS
     * ( аргумент в String.split )
     * @const
     * @type {string}
     */
    var cssFuncArgsSeparator = ",";

    /**
     * Регвыр для выделения численного значения и размерности у значений CSS свойств
     * Вывод:
     *      [  0: SOURCE, 1: NUMERIC_VALUE, 2: PROPERTY_DIMENSION  ]
     * @type {RegExp}
     * @const
     * @example
     *      "2" ---> ["2", "2", ""]
     *      "2px" ---> ["2px", "2", "px"]
     */
    var cssNumericValueReg = new RegExp([
        "^",
            "(",
                "-?\\d*\\.?\\d+",   // Численное значение как пригодный аргумент в parseFloat
            ")",
            "(",
                ".*",               // Размерность свойства
            ")",
        "$"
    ].join(""));

    /**
     * @const
     * @type {number}
     */
    var VALREG_SOURCE = 0;
    /**
     * @const
     * @type {number}
     */
    var VALREG_VALUE = 1;
    /**
     * @const
     * @type {number}
     */
    var VALREG_DIMENSION = 2;

    /**
     * Разделитель для списка применённых анимаций
     * (аргумент к String.split)
     * @type {RegExp}
     * @const
     */
    var ANIMATIONS_SEPARATOR =  new RegExp([
        ',\\s*',          // запятая с пробелами (обычный разделитель),
        '(?!',            // корректно пропускающая
            // аргументы в функциях смягчения
            '[\\w\\.\\d,\\s]*', // (не)дробное число или слово, за которым идёт запятая с пробелом
            '?\\)',        // за которым нет закрывающей скобки
        ')'
    ].join(''), 'g');

    /**
     * @const
     * @type {string}
     */
    var ANIMATIONS_JOINER = ', ';


    /**
     * Разделитель для списка применённых параметров анимации
     * (аргумент к String.split)
     * @type {RegExp}
     * @const
     */
    var ANIMATION_PARAMETER_SEPARATOR =  new RegExp([
        '\\s+',           // разделяются пробелами
        '(?!',            // корректно пропускающая
            // аргументы в функциях смягчения
            '[\\w\\.\\d,\\s]*', // (не)дробное число или слово, за которым идёт запятая с пробелом
            '?\\)',        // за которым нет закрывающей скобки
        ')'
    ].join(''), 'g');

    /**
     * Соединитель параметров анимации
     * Обычно соединяются пробелом
     * @type {string}
     * @const
     */
    var ANIMATION_PARAMETER_JOINER = ' ';

/*---------------------------------------*/

    /**
     * @const
     * @type {number}
     */
    var BLEND_DIGITS = 0;


    /**
     * @const
     * @type {number}
     */
    var TICKER_BASE_FPS = 60;


    /**
     * @const
     * @type {number}
     */
    var MINIMAL_PROGRESS = 0;

    /**
     * @const
     * @type {number}
     */
    var MAXIMAL_PROGRESS = 1.0;

    /**
     * @const
     * @type {number}
     */
    var NOT_FOUND = -1;


    /** @const */
    var SORT_BIGGER = -1;

    /** @const */
    var SORT_EQUALS = 0;

    /** @const */
    var SORT_SMALLER = 1;

    /**
     * @const
     * @type {number}
     */
    var TICKER_BASE_INTERVAL = 1e3 / TICKER_BASE_FPS;

    /**
     * @const
     * @type {string}
     */
    var ANIMATION_NAME_NONE = 'none';

    /**
     * @const
     * @type {string}
     */
    var HYPHEN = '-';

    /**
     * Имя CSS-свойства для назначения \ получения анимации (shorthand).
     * @type {string}
     * @const
     */
    var ANIMATION = "animation";

    /**
     * Имя CSS-свойства для назначения \ получения имени анимации.
     * @type {string}
     * @const
     */
    var ANIMATION_NAME = [ANIMATION, "name"].join(HYPHEN);

    /**
     * Имя CSS-свойства для назначения \ получения статуса проигрывания анимации.
     * @type {string}
     * @const
     */
    var ANIMATION_PLAY_STATE = [ANIMATION, "play", "state"].join(HYPHEN);

    /**
     * Имя CSS-свойства для назначения \ получения продолжительности анимации.
     * @type {string}
     * @const
     */
    var ANIMATION_DURATION = [ANIMATION, "duration"].join(HYPHEN);

    /**
     * Имя CSS-свойства для назначения \ получения временной функции смягчения анимации \ ключевого кадра.
     * @type {string}
     * @const
     */
    var ANIMATION_TIMING_FUNCTION = [ANIMATION, "timing", "function"].join(HYPHEN);

    /**
     * Имя CSS-свойства для назначения \ получения задержки старта анимации.
     * @type {string}
     * @const
     */
    var ANIMATION_DELAY = [ANIMATION, "delay"].join(HYPHEN);

    /**
     * Имя CSS-свойства для назначения \ получения количества проходов анимации.
     * @type {string}
     * @const
     */
    var ANIMATION_ITERATION_COUNT = [ANIMATION, "iteration", "count"].join(HYPHEN);

    /**
     * Спец. значение для бесконечного числа повторов
     * @type {string}
     * @const
     */
    var ITERATIONCOUNT_INFINITE = 'infinite';

    /**
     * Имя CSS-свойства для назначения \ получения направления прогрессирования анимации.
     * @type {string}
     * @const
     */
    var ANIMATION_DIRECTION = [ANIMATION, "direction"].join(HYPHEN);

    /**
     * Имя CSS-свойства для назначения \ получения режима заполнения анимации.
     * @type {string}
     * @const
     */
    var ANIMATION_FILL_MODE = [ANIMATION, "fill", "mode"].join(HYPHEN);

    /**
     * @type {boolean}
     * @const
     */
    var ANIMATION_HANDLER_USES_CAPTURE = true;

    /**
     * @const
     * @type {number}
     */
    var POSITIVE_INFINITY = 1/0;

    /**
     * Все известные имена событий конца анимаций
     * @type {Array}
     * @const
     */
    var ANIMATION_END_EVENTNAMES = ["animationend", "webkitAnimationEnd", "OAnimationEnd", "MSAnimationEnd"];

    /**
     * Специальное значение для идентификации события конца анимации
     * Используется в обработчике, который ловит все поступающие события анимаций
     * @type {string}
     * @const
     */
    var ANIMATION_END_EVENTTYPE = "animationend";

    /**
     * Все известные имена событий конца итераций анимаций
     * @type {Array}
     * @const
     */
    var ANIMATION_ITERATION_EVENTNAMES = ["animationiteration", "webkitAnimationIteration", "OAnimationIteration", "MSAnimationIteration"];

    /**
     * Специальное значение для идентификации события конца прохода
     * Используется в обработчике, который ловит все поступающие события анимаций
     * @type {string}
     * @const
     */
    var ANIMATION_ITERATION_EVENTTYPE = "animationiteration";

    /**
     * Все известные имена событий старта  анимаций
     * @type {Array}
     * @const
     */
    var ANIMATION_START_EVENTNAMES = ["animationiteration", "webkitAnimationStart", "OAnimationStart", "MSAnimationStart"];

    /**
     * Специальное значение для идентификации события старта анимации
     * Используется в обработчике, который ловит все поступающие события анимаций
     * @type {string}
     * @const
     */
    var ANIMATION_START_EVENTTYPE = "animationstart";

    /**
     * @type {string}
     * @const
     */
    var ANIMATION_PLAY_STATE_PAUSED = "paused";
    /**
     * @type {string}
     * @const
     */
    var ANIMATION_PLAY_STATE_RUNNING = "running";

    /**
     * Сколько чисел после запятой у точек в кубических кривых Безье.
     * @type {number}
     * @const
     */
    var CUBIC_BEZIER_POINTS_DIGITS = 3;

    // Эту константу оставим на всякий случай.
    //noinspection JSUnusedGlobalSymbols
    /**
     * Массив, по которому строго следует определение одной CSS3 анимации
     * @const
     * @type {Array}
     */
    var SINGLE_ANIMATION_PROPERTIES = [
        ANIMATION_NAME,
        ANIMATION_PLAY_STATE,
        ANIMATION_DURATION,
        ANIMATION_TIMING_FUNCTION,
        ANIMATION_DELAY,
        ANIMATION_ITERATION_COUNT,
        ANIMATION_DIRECTION,
        ANIMATION_FILL_MODE
    ];

    /**
     * @const
     * @type {string}
     */
    var REQUEST_ANIMATION_FRAME = 'requestAnimationFrame';

    /**
     * @const
     * @type {string}
     */
    var CANCEL_REQUEST_ANIMATION_FRAME = 'cancelRequestAnimationFrame';


/*---------------------------------------*/

    /**
     * @return {number}
     */
    function uuid () {
        return counter++;
    }

    /**
     * @return {string}
     */
    function generateId () {
        return /** @type {string} */ (mel + uuid());
    }


    /**
     * Линейный поиск по массиву с функцией обратного вызова
     * @param {!Array} array
     * @param {function (*, number, Array): boolean} callback
     */
    function linearSearch (array, callback) {
        for (var i = 0; i < array.length; i++) {
            if (callback(array[i], i, array) === true) {
                return i;
            }
        }
        return NOT_FOUND;
    }

    /**
     * @const
     * @type {CSSStyleDeclaration}
     */
    var dummy = rootElement.style;

    /**
     * @type {Array.<string>}
     * @const
     */
    var vendorPrefixes = "Ms O Moz WebKit".split(" ");

    /** @type {string} */
    var prefix;
    /** @type {string} */
    var lowPrefix;

    /**
     * @param {string} propertyName
     * @param {boolean=} global
     * @return {string}
     */
    function getVendorPropName (propertyName, global) {
        var obj = global ? goog.global : dummy;
        if (propertyName in obj) {
            // 'width', 'left' ...
            return propertyName;
        }
        var camelCased = camelCase(propertyName);
        if (camelCased in obj) {
            // 'font-size', 'border-color' ...
            return camelCased;
        }
        // 'Transform', 'Animation' ...
        var capPropName = camelCased.charAt(0).toUpperCase() + camelCased.substr(1);
        if (!goog.isDef(prefix)) {
            for (var i = 0, m = vendorPrefixes.length; i < m; i++) {
                if (vendorPrefixes[i] + capPropName in obj || vendorPrefixes[i].toLowerCase() + capPropName in obj) {
                    prefix = vendorPrefixes[i];
                    lowPrefix = vendorPrefixes[i].toLowerCase();
                }
            }
        }
        if (goog.isDef(prefix)) {
            if (prefix + capPropName in obj) {
                // 'WebKitCSSMatrix' ...
                return prefix + capPropName;
            }
            if (lowPrefix + capPropName in obj) {
                // 'webkitAudioContext' ...
                return lowPrefix + capPropName;
            }
        }
        return '';
    }

    /**
     * @type {function (): number}
     * @const
     *  */
    var now = 'performance' in goog.global && 'now' in goog.global.performance ? function () { return goog.global.performance.timing.navigationStart + goog.global.performance.now(); } : 'now' in Date ? Date.now : function () { return +new Date(); };

    var rAF = goog.global[ getVendorPropName(REQUEST_ANIMATION_FRAME, true) ];
    var cancelRAF = goog.global[ getVendorPropName(CANCEL_REQUEST_ANIMATION_FRAME, true) ];

    var RAF_SUPPORTED = goog.isFunction(rAF);

    /**
     * @param {!Array} array
     * @param {!function (?, ?): number|undefined} compare_callback
     */
    function sortArray (array, compare_callback) {
        // Кажется, внутри браузера сортировка идёт с помощью Quick Sort.
        // http://jsperf.com/quicksort-vs-heapsort
        array.sort(compare_callback);
    }

    /**
     * @param {number} number
     * @param {number} digits
     */
    function round (number, digits) {
        if (digits === 0) {
            return Math.round(number);
        } else {
            return parseFloat( number.toFixed(digits) );
        }
    }

    /**
     * Функция для вычисления промежуточного значения
     * между двумя ключевыми кадрами и известном прогрессе между ними
     * Возвращаемая величина показывает, изменилось ли значение или нет
     * @param {!Array.<number>} from
     * @param {!Array.<number>} to
     * @param {number} progress
     * @param {!Array.<number>} currentValue
     * @param {number} roundDigits
     * @return {boolean}
     */
    function blend (from, to, progress, currentValue, roundDigits) {

        var valueIsChanged = false;
        var previousValue, newValue;
        var delta;
        for (var i = 0, m = from.length; i < m; i++) {
            previousValue = currentValue[i];
            delta = to[i] - from[i];

            newValue = round( delta * progress + from[i] , roundDigits);

            if (previousValue !== newValue) {
                currentValue[i] = newValue;
                valueIsChanged = true;
            }
        }
        return valueIsChanged;
    }


    /**
     * @param {string} string
     * @return {string}
     */
    function trim (string) {
        return string.replace(/^\s+|\s+$/g, "");
    }

    /**
     * @type {RegExp}
     * @const
     */
    var camelCaseReg = new RegExp([
        "-",
        "[",
            "a-z",  // строчные латинские буквы, следующие за знаком минуса
        "]"
    ].join(""), "g");

    /**
     * @param {string} string
     * @return {string}
     */
    function camelCase (string) {
        return string.replace(camelCaseReg, function (match) {
            return match.charAt(1).toUpperCase();
        });
    }

    /**
     * @param {string} string
     * @return {string}
     */
    function removeSpaces (string) {
        return string.replace(/\s+/g, "");
    }

    /** @constructor */
    var F = Function();

    /** @type {function (!Object): !Object} */
    var objectCreate = 'create' in Object ? Object.create : function (proto) { F.prototype = proto; return new F; };

    /**
     * @const
     * @type {boolean}
     */
    var USEDSTYLE_SUPPORTED = 'getComputedStyle' in goog.global;

    /**
     * @const
     * @type {boolean}
     */
    var CURRENTSTYLE_SUPPORTED = 'currentStyle' in rootElement;

    /**
     * @const
     * @type {boolean}
     */
    var CSSANIMATIONS_SUPPORTED = getVendorPropName('animation').length > 0;

    /**
     * @param {!HTMLElement} elem
     * @param {string} propName
     * @param {boolean} usedValue вернуть ли значение из вычисленного стиля
     * @return {string}
     */
    function getStyle (elem, propName, usedValue) {
        var propertyName = getVendorPropName(propName, false);
        if (!usedValue) {
            return elem.style[propertyName];
        }
        var style;
        if (USEDSTYLE_SUPPORTED) {
            style = goog.global.getComputedStyle(elem, null);
        } else if (CURRENTSTYLE_SUPPORTED) {
            style = elem.currentStyle;
        }
        return style[propertyName];
    }

    /**
     * @param {!HTMLElement} elem
     * @param {string} propName
     * @param {string} propValue
     * @param {string=} vendorizedPropName
     */
    function setStyle (elem, propName, propValue, vendorizedPropName) {
        vendorizedPropName = vendorizedPropName || getVendorPropName(propName);
        elem.style[vendorizedPropName] = propValue;
    }

    var tempElement = document.createElement('div');

    /**
     * @const
     * @type {RegExp}
     */
    var horizAxisReg = new RegExp([
        "(?:",
            ["left", "right", "width"].join("|"),
        ")"
    ].join(''), "i");

    /**
     * @const
     * @type {RegExp}
     */
    var COLOR_REG = new RegExp("color", "i");

    /**
     * @param {!HTMLElement} elem
     * @param {string} propertyName
     * @param {string} propertyValue
     * @param {string} vendorizedPropName
     * @return {!Array.<number>}
     */
    function toNumericValue (elem, propertyName, propertyValue, vendorizedPropName) {

        if (!propertyValue) {
            return [ ];
        }

        if (propertyName in toNumericValueHooks) {
            return /** @type !Array.<number> */ (toNumericValueHooks[propertyName](elem, propertyName,  propertyValue, vendorizedPropName));
        }

        if ( COLOR_REG.test(vendorizedPropName) ) {
            return /** @type !Array.<number> */ (toNumericValueHooks['color'](elem, propertyName,  propertyValue, vendorizedPropName));
        }

        var isHoriz = horizAxisReg.test(vendorizedPropName);

        if (!cssNumericValueReg.test(propertyValue)) {
            // NON-numeric, like "auto"
            propertyValue = elem[ isHoriz ? "offsetWidth" : "offsetHeight" ];
        }

        if (goog.isNumber(propertyValue)) {
            return [ propertyValue ];
        }

        var valueDescriptor = propertyValue.match(cssNumericValueReg);

        var value = valueDescriptor[ VALREG_VALUE ];
        var numericValue = parseFloat(value);
        var unit = valueDescriptor[ VALREG_DIMENSION ];

        if (unit === '' || unit === 'px') {
            return [ numericValue ];
        }

        if (unit === '%' && vendorizedPropName.indexOf('border') !== -1) {
            numericValue /= 100;
            numericValue *= isHoriz ? elem.clientWidth : elem.clientHeight;
            return [ numericValue ];
        }

        tempElement.style.cssText = "border-style:solid; border-width:0; line-height:0;";

        var ctx = elem;

        var isValueNegative = numericValue < 0;

        if (isValueNegative) {
            propertyValue = -numericValue + unit;
        }

        if (unit === '%' || !ctx.appendChild || /font-?size/i.test(vendorizedPropName)) {
            ctx = elem.parentNode || document.body;
            tempElement.style[ isHoriz ? "width" : "height" ] = propertyValue;
        } else {
            tempElement.style.position = 'absolute';
            tempElement.style[ isHoriz ? "borderLeftWidth" : "borderTopWidth" ] = propertyValue;
        }

        ctx.appendChild(tempElement);
        var normalized = tempElement[ isHoriz ? "offsetWidth" : "offsetHeight" ];
        ctx.removeChild(tempElement);

        if (isValueNegative) {
            normalized *= -1;
        }

        return [ normalized ];
    }

    /** @type {Object.<string, function (Object, string, string, string): !Array.<number>>} */
    var toNumericValueHooks = {};

    /** @type {Object.<string, function(Object, !Array.<number>): string>} */
    var toStringValueHooks = {};

    //TODO сжать список свойств, для которых не нужны пиксели. Google Closure Compiler этого не делает

    /** @type {Object.<CSSStyleDeclaration, boolean>} */
    var toStringValueNoPX = {
        "fill-opacity": true,
        "font-weight": true,
        "line-height": true,
        "opacity": true,
        "orphans": true,
        "widows": true,
        "z-index": true,
        "zoom": true
    };

    var blendHooks = {};

    /**
     * @const
     * @type {number}
     */
    var DEGS_IN_TURN = 360;

    /**
     * @const
     * @type {number}
     */
    var DEGS_IN_RAD = DEGS_IN_TURN / ( 2 * Math.PI );

    /**
     * @const
     * @type {number}
     */
    var DEGS_IN_GRAD = 1 / (400 / DEGS_IN_TURN);

    /**
     * @param {string} cssAngle
     * @return {number}
     */
    function toDeg (cssAngle) {
        var cssValue = cssAngle.match(cssNumericValueReg);
        var numeric = parseFloat(cssValue[VALREG_VALUE]);
        var unit = cssValue[VALREG_DIMENSION];
        if (unit in toDegModificators) {
            return toDegModificators[unit](numeric);
        }
        return numeric;
    }

    /**
     * @enum {function (number): number}
     * */
    var toDegModificators = {
        /* deg is undef */
        "grad": function (grads) {
            return grads * DEGS_IN_GRAD;
        },
        "rad": function (rads) {
            return rads * DEGS_IN_RAD;
        },
        "turn": function (turns) {
            return turns * DEGS_IN_TURN;
        }
    };

    /**
     * Каскадная таблица стилей
     * с ленивой инициализацией
     * @type {CSSStyleSheet|undefined}
     */
     var STYLESHEET;

    /**
     * @param {string} selector
     * @return {CSSRule} Добавленное правило
     */
    function addRule(selector) {

        if (!STYLESHEET) {
            var style = document.getElementsByTagName("head")[0].parentNode.appendChild(document.createElement("style"));
            STYLESHEET = style.sheet || style.styleSheet;
        }

        var stylesheet = /** @type {CSSStyleSheet} */ (STYLESHEET);

        var rules = stylesheet.cssRules || stylesheet.rules;
        var index = rules.length;

        if (stylesheet.insertRule) {
            stylesheet.insertRule(selector + " " + "{" + " " + "}", index);
        } else {
            stylesheet.addRule(selector, " ", rules.length);
        }

        return rules[index];
    }

    /**
     * Первичная функция-обработчик событий
     * т.к. обработчики установлены на все события, которые могут никогда и не исполниться
     * (например, у webkit никогда не будет события с вендорным префиксом "ms")
     * то лучше убрать остальные мусорные обработчики и оставить один,
     * что и делает данная функция
     * @param {(AnimationEvent|Event)} event
     */
    function exclusiveHandler (event) {
        var eventName = /** @type {string} */(event.type);
        var lowerCased = eventName.toLowerCase();
        var eventNames = [];

        // Определение типа поступившего события
        if (lowerCased.indexOf("start") !== NOT_FOUND) {
            eventNames = ANIMATION_START_EVENTNAMES;
        } else if (lowerCased.indexOf("iteration") !== NOT_FOUND) {
            eventNames = ANIMATION_ITERATION_EVENTNAMES;
        } else if (lowerCased.indexOf("end") !== NOT_FOUND) {
            eventNames = ANIMATION_END_EVENTNAMES;
        } // else unreachable code

        // снимаем все навешанные обработчики событий
        for (var i = 0; i < eventNames.length; i++) {
            rootElement.removeEventListener(eventNames[i], exclusiveHandler, ANIMATION_HANDLER_USES_CAPTURE);
        }

        // вешаем обратно обычный обработчик на точно определённое имя события
        setTimeout(function () {
            rootElement.addEventListener(eventName, animationHandlerDelegator, ANIMATION_HANDLER_USES_CAPTURE);
        }, 1);

        // вызываем тут же оригинальный обработчик
        animationHandlerDelegator(event);
    }

    if (CSSANIMATIONS_SUPPORTED) {
        // навешиваем обработчики на все имена событий анимаций
        // * бывают курьёзы, вроде FireFox - когда свойство "animation" с префиксом ("-moz-animation")
        // * а имя события - без префикса, ещё и в нижнем регистре ("animationend")
        var ANIMATION_ALL_EVENTNAMES = ANIMATION_END_EVENTNAMES.concat(ANIMATION_ITERATION_EVENTNAMES).concat(ANIMATION_START_EVENTNAMES);
        for (var i = 0; i < ANIMATION_ALL_EVENTNAMES.length; i++) {
            rootElement.addEventListener(ANIMATION_ALL_EVENTNAMES[i], exclusiveHandler, ANIMATION_HANDLER_USES_CAPTURE);
        }
    }

    /**
     * Объект с функциями-обработчиками всех событий анимаций
     * Ключ - имя события, значение - объект с именем анимации и функцей-обработчиком
     * @type {Object.<string, Object.<string, Function>>}
     */
    var delegatorCallbacks = {};

    //TODO сжать delegatorCallbacks. МБ вообще разбить на файлы - Google Closure Compiler инлайнит туда константы

    /**
     * Объект с обработчиками событий окончания анимаций
     * @type {Object.<string, Function>}
     */
    delegatorCallbacks[ ANIMATION_END_EVENTTYPE ] = {};

    /**
     * Объект с обработчиками событий конца итераций анимаций
     * @type {Object.<string, Function>}
     */
    delegatorCallbacks[ ANIMATION_ITERATION_EVENTTYPE ] = {};

    /**
     * Объект с обработчиками событий старта анимаций
     * @type {Object.<string, Function>}
     */
    delegatorCallbacks[ ANIMATION_START_EVENTTYPE ] = {};

    /**
     * Функция будет ловить все поступающих события конца анимации
     * @param {(AnimationEvent|Event)} event
     */
    var animationHandlerDelegator = function (event) {
        var animationName = event.animationName, eventType = '', handlersList;
        var eventName = event.type;
        var lowerCased = eventName.toLowerCase();

        if (lowerCased.indexOf("start") !== NOT_FOUND) {
            eventType = ANIMATION_START_EVENTTYPE;
        } else if (lowerCased.indexOf("iteration") !== NOT_FOUND) {
            eventType = ANIMATION_ITERATION_EVENTTYPE
        } else if (lowerCased.indexOf("end") !== NOT_FOUND) {
            eventType = ANIMATION_END_EVENTTYPE;
        } // else unreachable code

        if (eventType in delegatorCallbacks) {
            handlersList = delegatorCallbacks[eventType];
            if (animationName in handlersList) {
                handlersList[animationName](event);
            } // else незарегистрированная анимация. ничего не можем сделать.
        }
    };

/*---------------------------------------*/

    /** @const */
    var Ticker = {
        /**
         * @type {!Array.<!Function>}
         */
        listeners: [],
        /**
         * @type {!Array.<!Function>}
         */
        listenersBuffer: [],
        /**
         * @param {!Function} callback
         * */
        on: function (callback) {

            Ticker.listeners.push(callback);

            if (!Ticker.isAwaken) {
                Ticker.awake();
            }

        },
        /**
         * @param {!Function} callback
         */
        off: function (callback) {
            var infoIndex = linearSearch(Ticker.listeners, function (clb) {
                "use strict";
                return clb === callback;
            });
            if (infoIndex !== NOT_FOUND) {
                Ticker.listeners.splice(infoIndex, 1);
            }
        },

        useRAF: RAF_SUPPORTED,
        isAwaken: false,
        frequency: TICKER_BASE_INTERVAL,

        awake: function () {
            Ticker.lastReflow = Ticker.currentTimeStamp = now();
            Ticker.isAwaken = true;
            Ticker.intervalId = Ticker.useRAF ? rAF(Ticker.tick, rootElement) : setTimeout(Ticker.tick, Ticker.frequency);
        },
        sleep: function () {
            Ticker.isAwaken = false;
            Ticker.lastReflow = Ticker.currentTimeStamp = Ticker.delta = 0;
            (Ticker.useRAF ? cancelRAF : clearTimeout)(Ticker.intervalId);
        },

        /** @type {number} */
        currentTimeStamp: 0,
        /** @type {number} */
        lastReflow: 0,
        /** @type {number} */
        delta: 0,

        /** @this {Window} */
        tick: function () {

            Ticker.currentTimeStamp = now();

            Ticker.delta = Ticker.currentTimeStamp - Ticker.lastReflow;

            Ticker.awake();

            if (Ticker.delta) {

                var swap;

                swap = Ticker.listenersBuffer;
                Ticker.listenersBuffer = Ticker.listeners;
                Ticker.listeners = swap;

                var callback;

                while ( (callback = Ticker.listenersBuffer.pop()) ) {
                    Ticker.listeners.push(callback);
                    callback(Ticker.delta);
                }

                Ticker.lastReflow = Ticker.currentTimeStamp;
            }

            if (!Ticker.listeners.length) {
                Ticker.sleep();
            }
        },

        /** @type {number} */
        fps: TICKER_BASE_FPS,

        /**
         * @param {number} fps
         */
        setFPS: function (fps) {
            Ticker.fps = fps;
            Ticker.frequency = 1e3 / fps;
        },

        /**
         * @param {boolean} ignoreRAF
         */
        ignoreReflow: function (ignoreRAF) {
            Ticker.sleep();
            Ticker.useRAF = RAF_SUPPORTED && !Boolean(ignoreRAF);
            Ticker.awake();
        }
    };

    /**
     * Конструктор ключевого кадра
     * @param {number|null} progress
     * @constructor
     */
    function Keyframe (progress) {
        this.numericKey = progress;
        this.propVal = [];
    }

    /**
     * @type {number|null}
     */
    Keyframe.prototype.numericKey = null;

    /**
     * Численное значение свойства. Всегда абсолютно.
     * @type {!Array.<number>}
     */
    Keyframe.prototype.propVal;

    /**
     * Изменение значения ключевого кадра путём копирования.
     * @param {!Array.<number>} newValue
     */
    Keyframe.prototype.setValue = function (newValue) {
        this.propVal.length = newValue.length;
        for (var i = 0, m = newValue.length; i < m; i++) {
            this.propVal[i] = newValue[i];
        }
    };

    /**
     * Вернёт текущее значение
     * @return {!Array.<number>}
     */
    Keyframe.prototype.getValue = function () {
        return this.propVal;
    };

    /**
     *  Класс коллекции ключевых кадров
     *  @constructor
     *  @extends {Array}
     */
    function KeyframesCollection () {
    }

    goog.inherits(KeyframesCollection, Array);

    /**
     * @param {number} progress
     * @return {number}
     * @override
     */
    KeyframesCollection.prototype.indexOf = function (progress) {
        return linearSearch(this, function (keyframe) {
            return keyframe.numericKey === progress;
        });
    };

    /**
     * @const
     * @param {!Keyframe} first
     * @param {!Keyframe} second
     * @return {number}
     */
    var compare_keyframes = function (first, second) {
        if (first.numericKey === second.numericKey) {
            return SORT_EQUALS;
        }
        if (first.numericKey < second.numericKey) {
            return SORT_BIGGER;
        }
        return SORT_SMALLER;
    };

    /**
     * @param {number} progress
     * @return {!Keyframe}
     */
    KeyframesCollection.prototype.add = function (progress) {
        var keyframe = new Keyframe(progress);
        this.push(keyframe);
        sortArray(this, compare_keyframes);
        return keyframe;
    };

    /**
     * Кэшированный индекс найденного ЛЕВОГО ключевого кадра.
     * @type {number}
     */
    KeyframesCollection.prototype.cachedIndex = MINIMAL_PROGRESS;

    /**
     * Вернёт ЛЕВЫЙ ключевой кадр по текущему индексу
     * @return {Keyframe}
     */
    KeyframesCollection.prototype.getLeft = function () {
        return this[ this.cachedIndex ];
    };

    /**
     * Вернёт ПРАВЫЙ ключевой кадр по текущему индексу
     * @return {Keyframe}
     */
    KeyframesCollection.prototype.getRight = function () {
        return this[ this.cachedIndex + 1 ];
    };

    /**
     * Обновит индекс ЛЕВОГО ключевого кадра для определённого прогресса.
     * @param {number} progress
     */
    KeyframesCollection.prototype.moveIndexTo = function (progress) {
        var leftKeyframe, rightKeyframe;

        leftKeyframe = this[ this.cachedIndex ];
        rightKeyframe = this[ this.cachedIndex + 1 ];

        if (leftKeyframe.numericKey > progress || progress >= rightKeyframe.numericKey) {
            do {

                if (!rightKeyframe || leftKeyframe.numericKey > progress) {
                    this.cachedIndex--;
                }
                if (rightKeyframe.numericKey < progress) {
                    this.cachedIndex++;
                }
                leftKeyframe = this[ this.cachedIndex ];
                rightKeyframe = this[ this.cachedIndex + 1 ];
            } while (leftKeyframe.numericKey > progress || rightKeyframe.numericKey < progress);
        }

    };

    /**
     * Вернёт ключевой кадр по индексу
     * @param {number} index
     */
    KeyframesCollection.prototype.item = function (index) {
        return this[index];
    };

    /**
     * Объект с описанием анимируемого свойства
     * @param {string} propertyName
     * @constructor
     */
    function PropertyDescriptor (propertyName) {
        this.propName = propertyName;
        this.vendorizedPropName = getVendorPropName(propertyName);
        this.currentValue = [];
        this.keyframes = new KeyframesCollection();
        this.startingValue = new Keyframe(null);

        if ( COLOR_REG.test(propertyName) ) {
            this.blender = blendHooks['color'];
            this.toStringValue = toStringValueHooks['color'];
        } else {
            if (propertyName in blendHooks) {
                this.blender = blendHooks[propertyName];
            }
            if (propertyName in toStringValueHooks) {
                this.toStringValue = toStringValueHooks[propertyName];
            }
        }

    }

    /**
     * Идентификатор свойства.
     * ("top", "transform")
     * @type {string}
     */
    PropertyDescriptor.prototype.propName = '';

    /**
     * Имя свойства для стиля
     * ("top", "webkitTransform")
     * @type {string}
     */
    PropertyDescriptor.prototype.vendorizedPropName = '';

    /**
     * Функция-интерполятор для данного свойства
     * @type {function(!Array.<number>, !Array.<number>, number, !Array.<number>, number): boolean}
     */
    PropertyDescriptor.prototype.blender = blend;

    /**
     * Функция для данного свойства, предназначенная для
     * перевода значения такое, которое можно отрисовать
     * (строка для CSS)
     * @param {!HTMLElement} elem
     * @param {!Array.<number>} numericValue
     * @return {string}
     */
    PropertyDescriptor.prototype.toStringValue = function (elem, numericValue) {

        if (numericValue.length === 0) {
            return '';
        } else {
            return numericValue + ( this.propName in toStringValueNoPX ? '' : 'px' );
        }

    };

    /**
     * Текущее значение свойства на моменте анимации.
     * @type {!Array.<number>}
     */
    PropertyDescriptor.prototype.currentValue;

    /**
     * Значение свойства на момент старта анимации.
     * @type {!Keyframe}
     */
    PropertyDescriptor.prototype.startingValue;

    /**
     * Коллекция значений ключевых кадров для свойства
     * @type {!KeyframesCollection}
     */
    PropertyDescriptor.prototype.keyframes;

    /**
     * @return {!KeyframesCollection}
     */
    PropertyDescriptor.prototype.getKeyframes = function () {
        return this.keyframes;
    };

    /**
     * Коллекция анимируемых свойств
     * @constructor
     * @extends {Array}
     */
    function PropertyDescriptorCollection () {
    }

    goog.inherits(PropertyDescriptorCollection, Array);

    /**
     * Поиск дескриптора для опредлённого свойства
     * @param {string} propertyName
     * @return {number}
     * @override
     */
    PropertyDescriptorCollection.prototype.indexOf = function (propertyName) {
        return linearSearch(this, function (propertyDescriptor) {
            return propertyDescriptor.propName === propertyName;
        });
    };

    /**
     * Добавление нового свойства в коллекцию
     * @param {string} propertyName
     * @return {!PropertyDescriptor}
     */
    PropertyDescriptorCollection.prototype.add = function (propertyName) {
        var propertyDescriptor = new PropertyDescriptor(propertyName);
        this.push(propertyDescriptor);
        return propertyDescriptor;
    };

    /**
     * Вернёт дескриптор свойства по определённому индексу
     * @param {number} index
     * @return {!PropertyDescriptor}
     */
    PropertyDescriptorCollection.prototype.item = function (index) {
        return this[ index ];
    };

    /** @const */
    var EasingRegistry = {
        /**
         * @type {!Array.<Easing>}
         */
        easings: [],
        /**
         * @param {*} req
         * @return {?Easing}
         */
        request: function (req) {
            var timingFunction;

            // Help for Google Closure Compiler
            //noinspection UnnecessaryLocalVariableJS
            var self = EasingRegistry;

            if (req instanceof Easing) {
                // Передан уже созданный экземпляр обёртки
                timingFunction = /** @type {Easing} */ (req);
            } else if (goog.isFunction(req)) {
                // Передана кастомная JS-функция
                timingFunction = new Easing();
                /** @override */
                timingFunction.compute = /** @type {function (number): number} */ (req);
            } else {
                // Переданы аргументы к функции CSS в виде массива\строки или алиас к функции JS\CSS
                timingFunction = self.build( /** @type {(string|!Array)} */ (req) );
            }

            if (goog.isNull(timingFunction)) {
                return null;
            }

            var index = linearSearch(self.easings, function (easing) {
                return easing.equals(timingFunction);
            });

            if (index === NOT_FOUND) {
                self.easings.push(timingFunction);
            } else {
                timingFunction = /** @type {!Easing} */ (self.easings[ index ]);
            }

            return /** @type {!Easing} */ (timingFunction);
        },
        /**
         * @param {!(string|Array)} contain
         * @return {?Easing}
         */
        build: function (contain) {
            var timingFunction = null;
            var stepsAmount, countFromStart;
            var camelCased, trimmed;
            var matched, args = [];
            if (goog.isString(contain)) {
                trimmed = trim(contain);
                camelCased = camelCase(trimmed);
                if (camelCased in cssEasingAliases) {
                    // Передан алиас к аргументам смягчения CSS
                    args = cssEasingAliases[ camelCased ];
                } else if (cssFunctionReg.test(trimmed)) {
                    // Передана строка временной функции CSS
                    // строка аргументов к временной функции. разделены запятой
                    matched = trimmed.match(cssFunctionReg);
                    args = removeSpaces(matched[FUNCREG_ARGS]).split(cssFuncArgsSeparator);
                }
            } else if (goog.isArray(contain)) {
                args = /** @type {!Array} */ (contain);
            }

            if (args.length == 4) {
                // заинлайненный цикл
                args[0] = +args[0]; args[1] = +args[1]; args[2] = +args[2]; args[3] = +args[3];
                // ограничение абсцисс точек по промежутку [0;1]
                if (args[0] >= MINIMAL_PROGRESS && args[0] <= MAXIMAL_PROGRESS && args[2] >= MINIMAL_PROGRESS && args[2] <= MAXIMAL_PROGRESS) {
                    timingFunction = new CubicBezier(args[0], args[1], args[2], args[3]);
                    if (camelCased in cubicBezierApproximations) {
                        // JS-функция приближения к кубической кривой
                        timingFunction.compute = cubicBezierApproximations[ camelCased ];
                    }
                }
            } else if (args.length == 1 || args.length == 2) {

                stepsAmount = parseInt(args[0], 10);
                countFromStart = args[1] === 'start';

                if (goog.isNumber(stepsAmount)) {
                    timingFunction = new Steps(stepsAmount, countFromStart);
                }
            }

            return timingFunction;
        }
    };

    /**
     * Общий конструктор для смягчений
     * @constructor
     */
    function Easing () {
        this.easingId = uuid();
    }

    /** @type {number} */
    Easing.prototype.easingId = uuid();


    /** @type {function (number): number} */
    Easing.prototype.compute = function (x) {
        return x;
    };

    /**
     * @param {!Easing} easing
     * @return {boolean}
     */
    Easing.prototype.equals = function (easing) {
        return this.compute === easing.compute;
    };

    /**
     * @override
     * @return {string}
     */
    Easing.prototype.toString = function () {
        return '' + this.easingId;
    };

    /**
     * Представление кубической кривой Безье для смягчения анимации
     * Считается, что P0 = (0;0) и P3 = (1;1)
     * @param {number} p1x
     * @param {number} p1y
     * @param {number} p2x
     * @param {number} p2y
     * @constructor
     * @extends Easing
     */
    function CubicBezier (p1x, p1y, p2x, p2y) {
        this.p1x = round(p1x, CUBIC_BEZIER_POINTS_DIGITS);
        this.p1y = round(p1y, CUBIC_BEZIER_POINTS_DIGITS);
        this.p2x = round(p2x, CUBIC_BEZIER_POINTS_DIGITS);
        this.p2y = round(p2y, CUBIC_BEZIER_POINTS_DIGITS);
    }

    goog.inherits(CubicBezier, Easing);

    /**
     * @param {number} t
     * @param {number} p1
     * @param {number} p2
     * @return {number}
     */
    CubicBezier.prototype.B = function (p1, p2, t) {
        // (3*t * (1 - t)^2) * P1  + (3*t^2 *  (1 - t) )* P2 + (t^3);
        // --------->
        // 3 * t * (-1 + t)^2 * P1 + t^2 (-3 * (-1 + t) * P2 + t)

        var revt = -1 + t;
        return 3*t*revt*revt * p1 + t*t * (-3*revt * p2 + t);
    };

    /**
     * @param {number} t
     * @return {number}
     */
    CubicBezier.prototype.B_absciss = function (t) {
        return this.B(this.p1x, this.p2x, t);
    };

    /**
     * @param {number} t
     * @return {number}
     */
    CubicBezier.prototype.B_derivative_I_absciss = function (t) {
        // ( 9 * t^2 - 12*t+ 3 ) * P1 + ( 6*t  -  9 * t^2 ) * P2  +  3 * t^2
        // ----->
        // 3 * (  (t*(3*t - 4) + 1) * P1  +  t * (  ( 2 - 3*t ) * P2 + t  )  )
        // 3*(t*(P2*(2 - 3*t) + t) + P1*(1-4*t+3*t^2))
        return 3*(t*(this.p2x*(2 - 3*t) + t) + this.p1x*(1-4*t+3*t*t));
    };

    /**
     * @param {number} t
     * @return {number}
     */
    CubicBezier.prototype.B_ordinate = function (t) {
        return this.B(this.p1y, this.p2y, t);
    };

    /**
     * @const
     * @type {number}
     */
    var BEZIER_EPSILON = 0.0055;

    /**
     * @override
     * @param {number} y
     * @return {number}
     */
    CubicBezier.prototype.compute = function (y) {

        var t;

        var X0 = y, X1;
        var F;
        var i = 3;
        var derivative;
        var range = BEZIER_EPSILON + y;

        // усовершенствованный метод Ньютона
        // обычно проходит в 1-2 итерации при точности 0.001
        do {
            derivative = this.B_derivative_I_absciss(X0);
            F =  this.B_absciss(X0) - y;
            X1 = X0 - F / this.B_derivative_I_absciss( X0 - F / ( 2 * derivative ) );
            if (derivative === 0) {
                // Обычно производная равна нулю на границах ( 0 и 1 )
                break;
            }
            X0 = X1;
        } while ( i-- !== 0 && this.B_absciss(X1) > range);

        t = X0;

        return this.B_ordinate(t);
    };

    /**
     * @param {CubicBezier|Easing} easing
     * @return {boolean}
     * @override
     */
    CubicBezier.prototype.equals = function (easing) {
        var isFirstAbscissEquals = this.p1x === easing.p1x;
        var isFirstOrdinateEquals = this.p1y === easing.p1y;
        var isSecondAbscissEquals = this.p2x === easing.p2x;
        var isSecondOrdinateEquals = this.p2y === easing.p2y;
        return isFirstAbscissEquals && isFirstOrdinateEquals && isSecondAbscissEquals && isSecondOrdinateEquals;
    };

    CubicBezier.prototype.toString = function () {
        return "cubic-bezier" + "(" + this.p1x + ', ' + this.p1y + ', ' + this.p2x + ', ' + this.p2y + ")";
    };

    /**
     * Ступенчатая функция, ограничивающая область выходных значений до определенного числа.
     * Целочисленное количество ступеней отсчитывается с конца, или с начала.
     * @param {number} stepsAmount
     * @param {boolean} countFromStart
     * @constructor
     * @extends Easing
     */
    function Steps(stepsAmount, countFromStart) {
        this.stepsAmount = stepsAmount;
        this.countFromStart = countFromStart;
    }

    goog.inherits(Steps, Easing);

    /** @type {number} */
    Steps.prototype.stepsAmount = 0;

    /** @type {boolean} */
    Steps.prototype.countFromStart = true;

    /**
     * @override
     * @param {number} x
     * @return {number}
     */
    Steps.prototype.compute = function (x) {
        if (this.countFromStart) {
            return Math.ceil(this.stepsAmount * x) / this.stepsAmount;
        } else {
            return Math.floor(this.stepsAmount * x) / this.stepsAmount;
        }
    };

    /**
     * @param {Steps|Easing} easing
     * @return {boolean}
     * @override
     */
    Steps.prototype.equals = function (easing) {
        var isAmountEquals = this.stepsAmount === easing.stepsAmount;
        var isCountSourceEquals = this.countFromStart === easing.countFromStart;
        return isAmountEquals && isCountSourceEquals;
    };

    Steps.prototype.toString = function () {
        return 'steps' + "(" + this.stepsAmount + ", " + (this.countFromStart ? "start" : "end") + ")";
    };

    /**
     * То, что идёт после собаки ("@") в CSS-правилах
     * Как правило, в нему дописыватеся вендорный префикс, если у
     * свойства анимации тоже есть префикс.
     * @type {string}
     * @const
     */
    var KEYFRAME_PREFIX = (getVendorPropName("animation") === "animation" ? "" : "-" + lowPrefix + "-") + "keyframes";


    /**
     * @const
     */
    var KeyframesRulesRegistry = {
        /** @type {!Array.<!CSSKeyframesRule>} */
        rules: [],
        /** @param {!CSSKeyframesRule} keyframesRule */
        slay: function (keyframesRule) {
            keyframesRule.name = ANIMATION_NAME_NONE;
            var keyframes = keyframesRule.cssRules;
            var key;
            while ( keyframes.length ) {
                key = keyframes[0].keyText;
                key = key_toDOMString(parseInt(key, 10));
                keyframesRule.deleteRule(key);
            }
            KeyframesRulesRegistry.rules.push(keyframesRule);
        },
        request: function () {
            if (KeyframesRulesRegistry.rules.length === 0) {
                return addRule("@" + KEYFRAME_PREFIX + " " + ANIMATION_NAME_NONE);
            } else {
                return KeyframesRulesRegistry.rules.pop();
            }
        }
    };

    if (CSSANIMATIONS_SUPPORTED) {
        /**
         * Workaround для Chrome
         * Неверное имя метода
         * @param {!CSSKeyframesRule} keyframesRule
         * @param {number} key
         */
        var keyframesRule_appendRule = function (keyframesRule, key) {
            var keyframesAppendRule = keyframesRule.appendRule || keyframesRule.insertRule;
            keyframesAppendRule.call(keyframesRule, key + '%' + ' ' + '{' + ' ' + '}');
        };


        var keyframesRule = KeyframesRulesRegistry.request();
        keyframesRule_appendRule(keyframesRule, 100);

        /**
         * @type {boolean}
         * @const
         */
        var KEY_EXPECTS_FRACTION = goog.isDefAndNotNull(keyframesRule.findRule("1"));

        /**
         * Workaround для следования спецификации
         * http://www.w3.org/TR/css3-animations/#CSSKeyframesRule-findRule
         * IE : принимает строковое число в долях ("0")
         * Остальные: процентное число в строке + постфикс  '%' ("0%")
         * @param {number} key
         * @return {string}
         */
        var key_toDOMString = function (key) {
            if (KEY_EXPECTS_FRACTION) {
                // melAnim использует проценты
                return key * 1e-2 + "";
            } else {
                return key + "%";
            }
        };

        KeyframesRulesRegistry.slay(keyframesRule);
        keyframesRule = null;

        /**
         * Workaround для IE
         * Кидает ошибку при поиске в пустом правиле ключевых кадров
         * Обёртка для того, чтобы не использовать try catch.
         * @param {CSSKeyframesRule} keyframesRule
         * @param {string} key
         * @return {CSSKeyframeRule}
         */
        var keyframesRule_findRule = function (keyframesRule, key) {
            if (keyframesRule.cssRules.length === 0) {
                return null;
            } else {
                return keyframesRule.findRule(key);
            }
        }

    }

/*---------------------------------------*/

    /* ------------------   РАБОТА С ЦВЕТАМИ   --------------------- */
    // first and last args are unused ... but we want keep 'em for documentation
    //noinspection JSUnusedLocalSymbols
    toNumericValueHooks["color"] = function (elem, propertyName,  propertyValue, vendorizedPropName) {
        var red, green, blue;

        if (propertyValue in colorsAliases) {
            // Алиас
            return colorsAliases[ propertyValue ];
        } else if (propertyValue.indexOf("#") !== -1) {
            // HEX
            var hex = parseInt(propertyValue.slice(1), 16);
            red = hex >> 16 & 0xFF;
            green = hex >> 8 & 0xFF;
            blue = hex & 0xFF;
            return [ red, green, blue ];
        } else {
            // Цветовая CSS-функция
            // RGB, RGBa, HSL, HSLa ...
            var matched = propertyValue.match(cssFunctionReg);
            var func = matched[1];
            var colorFunctionArgs = removeSpaces(matched[2]).split(cssFuncArgsSeparator);
            var args = [];

            for (var i = 0; i < colorFunctionArgs.length; i++) {
                matched = colorFunctionArgs[i].match(cssNumericValueReg);
                args[i] = [ parseFloat(matched[1]), matched[2] ];
            }

            if (func in colorFunctions) {
                return colorFunctions[func](args);
            }

            return [ 0, 0, 0 ];

        }
    };


    /**
     * @param {number} m1
     * @param {number} m2
     * @param {number} hue
     * @return {number}
     */
    function hueToRGB (m1, m2, hue) {
        if (hue < 0) {
            hue = hue + 1;
        }
        if (hue > 1) {
            hue = hue - 1;
        }
        if (hue * 6 < 1) {
            return m1 + (m2 - m1) * hue * 6;
        }
        if (hue * 2 < 1) {
            return m2;
        }
        if (hue * 3 < 2) {
            return m1 + (m2 - m1) * (2/3 - hue) * 6;
        }
        return m1;
    }

    /** @enum {function (!Array.<number>): !Array.<number>} */
    var colorFunctions = {

        // http://www.w3.org/TR/2011/REC-css3-color-20110607/#hsl-color
        "hsl": function (args) {
            var hue = args[0][0];
            var saturation = args[1][0] / 100;
            var lightness = args[2][0] / 100;
            var m2 = (lightness <= 0.5) ? lightness * (saturation + 1) : (lightness + saturation - lightness * saturation);
            var m1 = lightness * 2 - m2;
            var red = round(hueToRGB(m1, m2, hue + 1/3) * 255, 0);
            var green = round(hueToRGB(m1, m2, hue) * 255, 0);
            var blue = round(hueToRGB(m1, m2, hue - 1/3) * 255, 0);
            return [ red, green, blue ];
        },

        "rgb": function (args) {

            var red, green, blue;

            for (var i = 0; i < args.length; i++) {
                // Цветовой канал передан в процентах
                if (args[i][1] === "%") {
                    //  переводим из проценты в доли
                    args[i][0] /= 100;
                    // умножаем на максимум
                    args[i][0] *= 255;
                }
                // проверяем интервал
                if (args[i][0] < 0) {
                    args[i][0] = 0;
                } else if (args[i][0] > 255) {
                    args[i][0] = 255;
                }
            }

            red = round(args[0][0], 0);
            green = round(args[1][0], 0);
            blue = round(args[2][0], 0);

            return [ red, green, blue ];
        },

        "hsla": function (args) {
            var rgb = colorFunctions["hsl"](args);
            var opacity = round(args[3][0], 1);
            return rgb.concat(opacity);
        },

        "rgba": function (args) {
            var rgb = colorFunctions["rgb"](args);
            var opacity = round(args[3][0], 1);
            return rgb.concat(opacity);
        }

    };


    toStringValueHooks["color"] = function (elem, numericValue) {
        var colorFunction = 'rgb';
        if (numericValue.length === 4) {
            // Последний элемент в массиве - альфа канал
            colorFunction += 'a';
        }
        return colorFunction + "(" + numericValue.join(', ') + ")";
    };

    blendHooks["color"] = function (from, to, easing, current, round) {

        // Цветовой канал лежит в интервале [ 0, 255 ]
        if (easing < MINIMAL_PROGRESS) {
            easing = MINIMAL_PROGRESS;
        } else if (easing > MAXIMAL_PROGRESS) {
            easing = MAXIMAL_PROGRESS;
        }

        round = 1;

        return blend(from, to, easing, current, round);

    };


    /* ------------------   РАБОТА С TRANSFORM   --------------------- */

    var cssTransformFuncReg = new RegExp([
        "\\s",    // пробел
        "(?!",   // за которым нет
            "[-\\.\\d]",  // CSS-значения
        ")"
    ].join(""));

    /** @const */
    var TRANSFORMDATA_ROTATE = 0;
    /** @const */
    var TRANSFORMDATA_SCALE_X = 1;
    /** @const */
    var TRANSFORMDATA_SCALE_Y = 2;
    /** @const */
    var TRANSFORMDATA_SKEW_X = 3;
    /** @const */
    var TRANSFORMDATA_SKEW_Y = 4;
    /** @const */
    var TRANSFORMDATA_TRANSLATE_X = 5;
    /** @const */
    var TRANSFORMDATA_TRANSLATE_Y = 6;

    /**
     * @enum {function (!Array, !Array.<Array>)}
     */
    var TransformSetters = {

        "scaleX": function (args, data) {
            data[TRANSFORMDATA_SCALE_X] = parseFloat(args[0]) * 100;
        },
        "scaleY": function (args, data) {
            data[TRANSFORMDATA_SCALE_Y] = parseFloat(args[0]) * 100;
        },
        "scale": function (args, data) {
            data[TRANSFORMDATA_SCALE_X] = parseFloat(args[0]) * 100;
            data[TRANSFORMDATA_SCALE_Y] = parseFloat(args[1]) * 100;
        },

        "rotate": function (args, data) {
            data[TRANSFORMDATA_ROTATE] = toDeg(args[0]);
        },

        "skewX": function (args, data) {
            data[TRANSFORMDATA_SKEW_X] = parseInt(args[0], 10);
        },
        "skewY": function (args, data) {
            data[TRANSFORMDATA_SKEW_Y] = parseInt(args[0], 10);
        },
        "skew": function (args, data) {
            data[TRANSFORMDATA_SKEW_X] = parseInt(args[0], 10);
            data[TRANSFORMDATA_SKEW_Y] = parseInt(args[1], 10);
        },

        "translateX": function (args, data) {
            data[TRANSFORMDATA_TRANSLATE_X] = parseFloat(args[0]);
        },
        "translateY": function (args, data) {
            data[TRANSFORMDATA_TRANSLATE_Y] = parseFloat(args[0]);
        },
        "translate": function (args, data) {
            data[TRANSFORMDATA_TRANSLATE_X] = parseFloat(args[0]);
            data[TRANSFORMDATA_TRANSLATE_Y] = parseFloat(args[1]);
        },


        "matrix": function (args, data) {

            //       0  1  2  3  4  5
            //matrix(a, b, c, d, e, f)   <--- 2D

            for (var i = 0; i < args.length; i++) {
                args[i] = parseFloat(args[i]);
            }

            // Проводим декомпозицию матрицы

            data[ TRANSFORMDATA_TRANSLATE_X ] = args[4];
            data[ TRANSFORMDATA_TRANSLATE_Y ] = args[5];

            var row_1_length = Math.sqrt(args[0] * args[0] + args[1] * args[1]);

            data[ TRANSFORMDATA_SCALE_X ] = row_1_length * 100;

            // Нормализируем первый столбец
            args[0] /= row_1_length;
            args[1] /= row_1_length;

            var dot_product_1 = args[0] * args[2] + args[1] * args[3];

            data[ TRANSFORMDATA_SKEW_X ] = toDegModificators["rad"]( dot_product_1 );

            // Combine
            args[2] -= dot_product_1 * args[0];
            args[3] -= dot_product_1 * args[1];

            var row_2_length = Math.sqrt(args[2] * args[2] + args[3] * args[3]);

            data[ TRANSFORMDATA_SCALE_Y ] = row_2_length * 100;

            // Нормализируем второй столбец
            args[2] /= row_2_length;
            args[3] /= row_2_length;


            var dot_product_2 = args[0] * args[4] + args[1] * args[5];

            data[ TRANSFORMDATA_SKEW_Y ] = toDegModificators["rad"]( dot_product_2 );

            // Combine
            args[4] -= dot_product_2 * args[0];
            args[5] -= dot_product_2 * args[1];

            var row_3_length = Math.sqrt(args[4] * args[4] + args[5] * args[5]);

            // Нормализируем третий столбец
            args[4] /= row_3_length;
            args[5] /= row_3_length;

            data[ TRANSFORMDATA_ROTATE ] = toDegModificators["rad"]( Math.atan2(args[1], args[0]) );

         }

    };

    toNumericValueHooks["transform"] = function (elem, propertyName,  propertyValue) {

        // Декомпозированные данные трансформации
        var transformData = [ 0, 100, 100, 0, 0, 0, 0 ];

        if (propertyValue === "none" || propertyValue === "") {
            return transformData;
        }

        var matched;

        var transforms = propertyValue.split(cssTransformFuncReg);

        for (var i = 0; i < transforms.length; i++) {

            matched = transforms[i].match(cssFunctionReg);

            var func = matched[FUNCREG_FUNC];
            var args = removeSpaces(matched[FUNCREG_ARGS]).split(cssFuncArgsSeparator);

            TransformSetters[func](args, transformData);
        }

        return transformData;
    };

    toStringValueHooks["transform"] = function (elem, numericValue) {
        var currentTransforms = "";

        if ( numericValue[TRANSFORMDATA_ROTATE] % 360 !== 0 ) {
            currentTransforms += " " + "rotate(" + numericValue[TRANSFORMDATA_ROTATE] + "deg" + ")";
        }

        if (numericValue[TRANSFORMDATA_SKEW_X] !== 0 || numericValue[TRANSFORMDATA_SKEW_Y] !== 0 ) {
            currentTransforms += " " + "skew(" + numericValue[TRANSFORMDATA_SKEW_X] + "deg" + "," + numericValue[TRANSFORMDATA_SKEW_Y] + "deg" + ")";
        }

        if (numericValue[TRANSFORMDATA_TRANSLATE_X] !== 0 || numericValue[TRANSFORMDATA_TRANSLATE_Y] !== 0) {
            currentTransforms += " " + "translate(" + numericValue[TRANSFORMDATA_TRANSLATE_X] + "px" + "," + numericValue[TRANSFORMDATA_TRANSLATE_Y] + "px" + ")";
        }

        // Scale должна идти в конце трансформаций, иначе будет влиять на них. "scaleX(32) translateX(1px)" даст смещение в "32px"
        if (numericValue[TRANSFORMDATA_SCALE_X] !== 100 || numericValue[TRANSFORMDATA_SCALE_Y] !== 100) {
            currentTransforms += " " +  "scale(" + numericValue[TRANSFORMDATA_SCALE_X] / 100 + "," + numericValue[TRANSFORMDATA_SCALE_Y] / 100 + ")";
        }

        return currentTransforms;
    };


    /* ------------------   РАБОТА С SHADOW   --------------------- */
    //noinspection JSUnusedGlobalSymbols
    /**
     * @const
     * @type {number}
     */
    var SHADOW_X = 0;
    //noinspection JSUnusedGlobalSymbols
    /**
     * @const
     * @type {number}
     */
    var SHADOW_Y = 1;
    //noinspection JSUnusedGlobalSymbols
    /**
     * @const
     * @type {number}
     */
    var SHADOW_BLUR = 2;
    //noinspection JSUnusedGlobalSymbols
    /**
     * @const
     * @type {number}
     */
    var SHADOW_SPREAD = 3;
    /**
     * @const
     * @type {number}
     */
    var SHADOW_COLOR = 4;

    /**
     * @constructor
     */
    function Shadow () {
        // Initial данные тени - нет смещений, размытия, длины и чёрный цвет
        this.data = [ 0, 0, 0, 0, [0, 0, 0]];
    }

    Shadow.prototype.inset = false;
    Shadow.prototype.isNone = false;

    Shadow.prototype.parse = function (shadow) {

        if (shadow === "none") {
            this.isNone = true;
            return;
        }

        // все параметры тени, кроме цвета
        var props = shadow.match(/(?:inset\s)?(?:\s*-?\d*\.?\d+\w*\s*){2,4}/)[0];
        // Цвет в любом формате
        var color = shadow.replace(props, "");

        this.data[SHADOW_COLOR] = toNumericValueHooks["color"](null, "color", color, '');

        // Х, У, размытие и длина тени, разделённые пробелом
        props = props.split(" ");

        var settedData = 0;

        for (var i = 0; i < props.length; i++) {
            if (props[i] == "inset") {
                this.inset = true;
            } else if (cssNumericValueReg.test(props[i])) {
                // TODO EM, % и другие Length в Shadow.
                this.data[settedData++] = parseFloat(props[i]) * 10;
            }
        }

    };

    Shadow.prototype.toString = function () {
        var shadow = "";
        if (this.inset) {
            shadow += "inset" + " ";
        }
        for (var i = 0; i < 4; i++) {
            if (i > 1 || this.data[i] !== 0) {
                shadow += (this.data[i] / 10) + "px" + " ";
            }
        }
        shadow += toNumericValueHooks["color"](null, "color", this.data[SHADOW_COLOR], '');
        return shadow;
    };

    toNumericValueHooks["text-shadow"] = toNumericValueHooks["box-shadow"] = function ( propertyValue) {
        var shadow, shadowList;
        shadowList = propertyValue.split(/,\s*(?![^\)]+\))/);
        for (var i = 0; i < shadowList.length; i++) {
            shadow = new Shadow();
            shadow.parse(shadowList[i]);
            shadowList[i] = shadow;
        }
        return shadowList;
    };
    blendHooks["text-shadow"] = blendHooks["box-shadow"] = function (from, to, easing, current, id) {
        var changed = false;

        var shadowList = id in current ? current[id] : ( current[id] = [] );

        // Список теней в разный ключевых кадрах может быть
        // разным, поэтому берём максимум из обоих
        var m = from.length > to.length ? from.length : to.length;

        var shadow, fromShadow, toShadow;

        for (var k = 0; k < m; k++) {

            if (k in from) {
                fromShadow = from[k];
            } else {
                fromShadow = from[k] = new Shadow();
                fromShadow.isNone = true;
            }

            if (k in to) {
                toShadow = to[k];
            } else {
                toShadow = to[k] = new Shadow();
                toShadow.isNone = true;
            }

            // по спецификации можно интерполировать значения только
            // совпадающих по параметру inset теней
            if ( fromShadow.inset  !== toShadow.inset && !fromShadow.isNone && !toShadow.isNone) {
                continue;
            }

            if (k in shadowList) {
                shadow = shadowList[k];
            } else {
                shadow = shadowList[k] = new Shadow();
                shadow.inset = fromShadow.isNone ? toShadow.inset : toShadow.isNone ? fromShadow.inset : fromShadow.inset && toShadow.inset;
                changed = true;
            }

            // Интерполяция всех параметров. кроме цвета
            for (var i = 0; i < 4; i++) {
                if (blend(fromShadow.data[i], toShadow.data[i], easing, shadow.data, i) && changed === false) {
                    changed = true;
                }
            }

            // Интерполяция цвета
            if (blendHooks["color"](fromShadow.data[SHADOW_COLOR], toShadow.data[SHADOW_COLOR], easing, shadow.data, '' + SHADOW_COLOR) && !changed) {
                changed = true;
            }

        }

        return changed;
    };

    /* ------------------   РАБОТА С OPACITY   --------------------- */

    /**
     * @const
     * @type {number}
     */
    var BLEND_OPACITY_ROUND = 2;

    blendHooks["opacity"] = function (from, to, easing, current, round) {
        round = BLEND_OPACITY_ROUND;
        return blend(from, to, easing, current, round);
    };

/*---------------------------------------*/

    /**
     * Ключ - CamelCased строка, значение - аргументы к CSS функции
     * @enum {Array.<number>}
     * */
    var cssEasingAliases = {
        "easeInCubic":[ 0.55, 0.055, 0.675, 0.19 ]
    };

    /**
     * Ключ - CamelCased строка, значение - мат. приближение для кубической кривой
     * @enum {function (number): number}
     *  */
    var cubicBezierApproximations = {
        "easeInCubic": function (x) {
            return x * x * x;
        }
    };

    /** @enum {!Array.<number>} */
    var colorsAliases = {
        black: [0, 0, 0],
        blue: [0, 0, 255],
        white: [255, 255, 255],
        yellow: [255,255 ,0],
        orange: [255,165, 0],
        gray: [128,128, 128],
        green: [0, 128, 0],
        red: [255, 0, 0],
        transparent: [255, 255, 255]
    };

/*---------------------------------------*/

    /**
     * @const
     * @type {number}
     */
    var DEFAULT_DURATION = 400;

     /**
     * @const
     * @type {number}
     */
    var DEFAULT_DELAY = 0;

    /**
     * @const
     * @type {number}
     */
    var DEFAULT_ITERATIONS = 1;

    /**
     * @const
     * @type {number}
     */
    var DEFAULT_INTEGRAL_ITERATIONS = 1;

    /**
     * @const
     * @type {boolean}
     */
    var DEFAULT_IS_ALTERNATED = false;

    /**
     * @const
     * @type {boolean}
     */
    var DEFAULT_IS_REVERSED = false;

    /**
     * @const
     * @type {boolean}
     */
    var DEFAULT_FILLS_FORWARDS = true;

    /**
     * @const
     * @type {boolean}
     */
    var DEFAULT_FILLS_BACKWARDS = false;

    /**
     * @const
     * @type {!Easing}
     */
    var DEFAULT_EASING = new Easing();

    /**
     * @const
     * @type {number}
     */
    var DIRECTION_ALTERNATE = 2; // bin: 10

    /**
     * @const
     * @type {number}
     */
    var DIRECTION_REVERSE = 1; // bin: 01

    /**
     * @const
     * @type {number}
     */
    var FILLS_FORWARDS = 2; // bin: 10

    /**
     * @const
     * @type {number}
     */
    var FILLS_BACKWARDS = 1; // bin: 01


/*---------------------------------------*/

    /**
     * Низкоуровневый конструктор анимаций
     * @constructor
     */
    function Animation () {
        this.animatedProperties = new PropertyDescriptorCollection();
        var self = this;
        this.selfTick = function (delta) {
            self.tick(delta);
        };

        if (CSSANIMATIONS_SUPPORTED) {
            // Закрепление контекста у функций, порождающих события
            this.fireOnStart = function () {
                self._not_self_fireOnStart();
            };
            this.fireOnStep = function () {
                self._not_self_fireOnStep();
            };
            this.fireOnIteration = function () {
                self._not_self_fireOnIteration();
            };
            this.fireOnComplete = function () {
                self._not_self_fireOnComplete();
            };
            this.fireOnCompleteWithStop = function () {
                self._not_self_fireOnCompleteWithStop();
            };
        }

    }

    /** @type {string} */
    Animation.prototype.animId = 'none';

    /** @type {!HTMLElement} */
    Animation.prototype.animationTarget;

    /**
     * Установка цели анимации.
     * Объект, на который направлены
     * - перевод строковых значений свойств в числовые
     * - перевод относительных значений свойств в абсолютные
     * - отрисовка значений свойств на каждом шаге
     * @param {!HTMLElement} target
     */
    Animation.prototype.setTarget = function (target) {
        this.animationTarget = target;
    };

    goog.exportProperty(Animation.prototype, 'setTarget', Animation.prototype.setTarget);

    /**
     * Вернёт текущую цель анимации
     * @return {!HTMLElement}
     */
    Animation.prototype.getTarget = function () {
        return this.animationTarget;
    };

    goog.exportProperty(Animation.prototype, 'getTarget', Animation.prototype.getTarget);

    /**
     * @type {!PropertyDescriptorCollection}
     */
    Animation.prototype.animatedProperties;

    /**
     * Установка значения свойства при прогрессе.
     * @param {string} propertyName имя свойства
     * @param {!Array.<number>} propertyValue числовое абсолютное значение свойства (массив с числами)
     * @param {number} progress прогресс прохода в долях
     */
    Animation.prototype.setPropAt = function (propertyName, propertyValue, progress) {

        /** @type {!PropertyDescriptor} */
        var propertyDescriptor;

        var propertyDescriptorIndex = this.animatedProperties.indexOf(propertyName);

        if (propertyDescriptorIndex === NOT_FOUND) {
            propertyDescriptor = this.animatedProperties.add(propertyName);
        } else {
            propertyDescriptor = this.animatedProperties.item(propertyDescriptorIndex);
        }

        /** @type {!KeyframesCollection} */
        var propertyKeyframes = propertyDescriptor.getKeyframes();

        var keyframeIndex = propertyKeyframes.indexOf(progress);

        /**
         * @type {!Keyframe}
         */
        var keyframe;

        if (keyframeIndex !== NOT_FOUND) {
            keyframe = propertyKeyframes.item(keyframeIndex);
        } else {
            keyframe = propertyKeyframes.add(progress);
        }

        keyframe.setValue(propertyValue);

    };

    goog.exportProperty(Animation.prototype, 'setPropAt', Animation.prototype.setPropAt);

    /**
     * Получение значения свойства при прогрессе
     * @param {string} propertyName имя свойства
     * @param {number} progress прогресс прохода в долях
     * @return {Array.<number>?}
     */
    Animation.prototype.getPropAt = function (propertyName, progress) {

        /** @type {!PropertyDescriptor} */
        var propertyDescriptor;

        var propertyDescriptorIndex = this.animatedProperties.indexOf(propertyName);

        if (propertyDescriptorIndex !== NOT_FOUND) {
            propertyDescriptor = this.animatedProperties.item(propertyDescriptorIndex);

            /** @type {!KeyframesCollection} */
            var propertyKeyframes = propertyDescriptor.getKeyframes();

            var keyframeIndex = propertyKeyframes.indexOf(progress);

            var keyframe;

            if (keyframeIndex !== NOT_FOUND) {
                keyframe = propertyKeyframes.item(keyframeIndex);

                return keyframe.getValue();
            }
        }

        return null;
    };

    goog.exportProperty(Animation.prototype, 'getPropAt', Animation.prototype.getPropAt);

    /**
     * Установка стартового значения свойства
     * Имеет смысл при 'fillMode' без 'forwards'
     * Аргументы такие же, как и у Animation.setPropAt, без учета прогресса
     * Разница в том, что стартовое значение свойства не всегда
     * равно значению свойства на минимальном прогрессае
     * @param {string} propertyName
     * @param {!Array.<number>} propertyValue
     */
    Animation.prototype.setStartingValue = function (propertyName, propertyValue) {
        /** @type {!PropertyDescriptor} */
        var propertyDescriptor;

        var propertyDescriptorIndex = this.animatedProperties.indexOf(propertyName);

        if (propertyDescriptorIndex === NOT_FOUND) {
            propertyDescriptor = this.animatedProperties.add(propertyName);
        } else {
            propertyDescriptor = this.animatedProperties.item(propertyDescriptorIndex);
        }

        /** @type {!Keyframe} */
        var startingValue = propertyDescriptor.startingValue;

        startingValue.setValue(propertyValue);

    };

    goog.exportProperty(Animation.prototype, 'setStartingValue', Animation.prototype.setStartingValue);

    /**
     * Получение стартового значения свойства
     * @param {string} propertyName
     * @return {Array.<number>}
     */
    Animation.prototype.getStartingValue = function (propertyName) {

        /** @type {!PropertyDescriptor} */
        var propertyDescriptor;

        var propertyDescriptorIndex = this.animatedProperties.indexOf(propertyName);

        if (propertyDescriptorIndex !== NOT_FOUND) {
            propertyDescriptor = this.animatedProperties.item(propertyDescriptorIndex);

            /** @type {!Keyframe} */
            var startingValue = propertyDescriptor.startingValue;

            return startingValue.getValue();
        }

        return null;
    };

    goog.exportProperty(Animation.prototype, 'getStartingValue', Animation.prototype.getStartingValue);

    /**
     * Функция отрисовки на цели
     * Для отрисовки используется CSS
     * @param {!PropertyDescriptor} propertyDescriptor дескриптор свойства
     * @param {!Array.<number>} currentValue текущее значение свойства
     */
    Animation.prototype.render = function (propertyDescriptor, currentValue) {
        var stringValue = propertyDescriptor.toStringValue(this.animationTarget, currentValue);
        setStyle(this.animationTarget,propertyDescriptor.propName, stringValue, propertyDescriptor.vendorizedPropName);
    };

    /** @type {number} */
    Animation.prototype.delayTime = DEFAULT_DELAY;

    /***
     * Установка задержки между стартом и началом проигрывания.
     * @param {number} delay время в миллисекундах
     */
    Animation.prototype.setDelay = function (delay) {
        this.delayTime = delay;
    };

    goog.exportProperty(Animation.prototype, 'setDelay', Animation.prototype.setDelay);

    /** @type {number} */
    Animation.prototype.cycleDuration = DEFAULT_DURATION;

    /**
     * Установка продолжительности одного прохода
     * @param {number} duration время в миллисекундах
     * @see {Animation.cycleDuration}
     */
    Animation.prototype.setDuration = function (duration) {
        this.cycleDuration = duration;
    };

    goog.exportProperty(Animation.prototype, 'setDuration', Animation.prototype.setDuration);

    /** @type {number} */
    Animation.prototype.iterations = DEFAULT_ITERATIONS;

    /** @type {number} */
    Animation.prototype.integralIterations = DEFAULT_INTEGRAL_ITERATIONS;

    /**
     * Установка числа проходов
     * @param {number} iterations
     */
    Animation.prototype.setIterations = function (iterations) {
        if (iterations === POSITIVE_INFINITY) {
            this.iterations = this.integralIterations = POSITIVE_INFINITY;
        } else {
            if (isFinite(iterations) && iterations >= 0) {
                this.iterations = iterations;
                this.integralIterations = Math.floor(iterations);
            }
        }
    };

    goog.exportProperty(Animation.prototype, 'setIterations', Animation.prototype.setIterations);

    /** @type {boolean} */
    Animation.prototype.isAlternated = DEFAULT_IS_ALTERNATED;

    /** @type {boolean} */
    Animation.prototype.isReversed = DEFAULT_IS_REVERSED;

    /**
     * Установка режима направления
     * @param {number} binaryDirection бинарные режим направления
     */
    Animation.prototype.setDirection = function (binaryDirection) {
        this.isAlternated = (binaryDirection & DIRECTION_ALTERNATE) !== 0;
        this.isReversed = (binaryDirection & DIRECTION_REVERSE) !== 0;
    };

    goog.exportProperty(Animation.prototype, 'setDirection', Animation.prototype.setDirection);

    /**
     * @return {number}
     */
    Animation.prototype.getDirection = function () {
        var binaryDirection = 0;
        if (this.isAlternated) {
            binaryDirection &= DIRECTION_ALTERNATE;
        }
        if (this.isReversed) {
            binaryDirection &= DIRECTION_REVERSE;
        }
        return binaryDirection;
    };

    goog.exportProperty(Animation.prototype, 'getDirection', Animation.prototype.getDirection);

    /**
     * @return {boolean}
     */
    Animation.prototype.needsReverse = function () {

        // Оптимизация битовой логикой не сработала
        // http://jsperf.com/bitwise-vs-boolean

        if (this.isAlternated) {
            if (this.isReversed) {
                return (this.currentIteration % 2) === 0;
            } else {
                return (this.currentIteration % 2) === 1;
            }
        } else if (this.isReversed) {
            return true;
        }

        return false;
    };


    /** @type {boolean} */
    Animation.prototype.fillsForwards = DEFAULT_FILLS_FORWARDS;

    /** @type {boolean} */
    Animation.prototype.fillsBackwards = DEFAULT_FILLS_BACKWARDS;

    /**
     * @param {number} binaryFillMode
     */
    Animation.prototype.setFillMode = function (binaryFillMode) {
        this.fillsForwards = (binaryFillMode & FILLS_FORWARDS) !== 0;
        this.fillsBackwards = (binaryFillMode & FILLS_BACKWARDS) !== 0;
    };

    goog.exportProperty(Animation.prototype, 'setFillMode', Animation.prototype.setFillMode);

    /**
     * @return {number}
     */
    Animation.prototype.getFillMode = function () {
        var binFillMode = 0;
        if (this.fillsForwards) {
            binFillMode |= FILLS_FORWARDS;
        }
        if (this.fillsBackwards) {
            binFillMode |= FILLS_BACKWARDS;
        }
        return binFillMode;
    };

    goog.exportProperty(Animation.prototype, 'getFillMode', Animation.prototype.getFillMode);

    /** @type {number} */
    Animation.prototype.elapsedTime = 0;

    /** @type {!(Easing|CubicBezier|Steps)} */
    Animation.prototype.smoothing = DEFAULT_EASING;

    /**
     * @param {!(Easing|CubicBezier|Steps)} easing
     */
    Animation.prototype.setEasing = function (easing) {
        this.smoothing = easing;
    };

    goog.exportProperty(Animation.prototype, 'setEasing', Animation.prototype.setEasing);

    /**
     * @return {!(CubicBezier|Steps|Easing)}
     */
    Animation.prototype.getEasing = function () {
        return this.smoothing;
    };

    goog.exportProperty(Animation.prototype, 'getEasing', Animation.prototype.getEasing);

    /** @type {number} */
    Animation.prototype.animationProgress = 0;

    /** @type {number} */
    Animation.prototype.fractionalTime = 0;

    /** @type {number} */
    Animation.prototype.previousIteration = 0;

    /** @type {number} */
    Animation.prototype.currentIteration = 0;

    /**
     * @return {number}
     */
    Animation.prototype.getFractionalTime = function () {
        return this.fractionalTime;
    };

    goog.exportProperty(Animation.prototype, 'getFractionalTime', Animation.prototype.getFractionalTime);

    /**
     * @param {number} deltaTime
     */
    Animation.prototype.tick = function (deltaTime) {

        var elapsedTime, currentIteration, iterationProgress;
        this.elapsedTime += deltaTime;
        elapsedTime = Math.max(this.elapsedTime - this.delayTime, MINIMAL_PROGRESS);
        this.animationProgress = elapsedTime / this.cycleDuration;
        currentIteration = Math.floor(this.animationProgress);

        if (currentIteration > 0) {
            this.previousIteration = this.currentIteration;
            this.currentIteration = currentIteration > this.integralIterations ? this.integralIterations : currentIteration;
            iterationProgress = this.animationProgress - currentIteration;
        } else {
            iterationProgress = this.animationProgress;
        }

        if (iterationProgress > MAXIMAL_PROGRESS) {
            iterationProgress = MAXIMAL_PROGRESS;
        }

        if (this.needsReverse()) {
            iterationProgress = MAXIMAL_PROGRESS - iterationProgress;
        }

        this.fractionalTime = iterationProgress;

        if (this.animationProgress < this.iterations) {

            this.update();

            if (this.delayTime > 0 && elapsedTime <= deltaTime && this.elapsedTime >= this.delayTime) {
                this.fireOnStart();
            } else if (this.previousIteration !== this.currentIteration) {
                this.fireOnIteration();
            } if (this.fractionalTime !== 0) {
                this.fireOnStep();
            }
        } else {
            this.stop();
            this.fireOnComplete();
        }
    };

    /**
     * Вычислит и отрисует текущие значения свойств
     */
    Animation.prototype.update = function () {

        var propertyKeyframes, propertyDescriptor;
        var localEasing, relativeFractionalTime;
        var leftKeyframe, rightKeyframe;

        var isPropertyValueChanged;

        for (var i = 0; i < this.animatedProperties.length; i++) {

            propertyDescriptor = this.animatedProperties.item(i);
            propertyKeyframes = propertyDescriptor.getKeyframes();

            propertyKeyframes.moveIndexTo(this.fractionalTime);

            leftKeyframe = propertyKeyframes.getLeft();
            rightKeyframe = propertyKeyframes.getRight();

            relativeFractionalTime = (this.fractionalTime - leftKeyframe.numericKey) / (rightKeyframe.numericKey - leftKeyframe.numericKey);

            localEasing = this.smoothing.compute(relativeFractionalTime);

            isPropertyValueChanged = propertyDescriptor.blender(leftKeyframe.propVal, rightKeyframe.propVal, localEasing, propertyDescriptor.currentValue, BLEND_DIGITS);

            if (isPropertyValueChanged) {
                this.render(propertyDescriptor, propertyDescriptor.currentValue);
            } // else Отрисованное значение эквивалентно текущему промежуточному. Пропуск отрисовки

        }
    };

    Animation.prototype.toString = function () {
        return this.animId;
    };

    /** @type {CSSKeyframesRule} */
    Animation.prototype.keyframesRule;

    /**
     * Запускает проигрывание анимации
     */
    Animation.prototype.start = function () {

        if (this.usesCSS3) {

            this.animId = generateId();

            // Обёртки над обработчиками событий CSS анимации
            if (CSSANIMATIONS_SUPPORTED) {
                delegatorCallbacks[ ANIMATION_START_EVENTTYPE ][ this.animId ] = this.fireOnStart;
                delegatorCallbacks[ ANIMATION_ITERATION_EVENTTYPE ][ this.animId ] = this.fireOnIteration;
                delegatorCallbacks[ ANIMATION_END_EVENTTYPE ][ this.animId ] = this.fireOnCompleteWithStop;
            }

            this.keyframesRule = KeyframesRulesRegistry.request();
            this.keyframesRule.name = this.animId;

            // Формирование тела правила "@keyframes"
            for (var i = 0; i < this.animatedProperties.length; i++) {

                var propertyDescriptor = this.animatedProperties.item(i);
                var propertyKeyframes = propertyDescriptor.getKeyframes();

                for (var j = 0; j < propertyKeyframes.length; j++) {

                    var propertyKeyframe = propertyKeyframes.item(j);

                    var key = propertyKeyframe.numericKey * 1e2;
                    var domStringKey = key_toDOMString(key);

                    var cssKeyframe = keyframesRule_findRule(this.keyframesRule, domStringKey);

                    if (!cssKeyframe) {
                        // у Chrome было неверное следование спецификации - неверное имя метода для добавления ключевых кадров.
                        keyframesRule_appendRule(this.keyframesRule, key);
                        cssKeyframe = keyframesRule_findRule(this.keyframesRule, domStringKey);
                    }

                    var stringValue;

                    stringValue = propertyDescriptor.toStringValue(this.animationTarget, propertyKeyframe.getValue());

                    cssKeyframe.style[ propertyDescriptor.vendorizedPropName ] = stringValue;
                }
            }

            // Формирование параметров текущей анимации
            var currentAnimationName = this.animId;
            var appliedAnimations = getStyle(this.animationTarget, ANIMATION, true) || getStyle(this.animationTarget, ANIMATION, false);
            var currentAnimationIndex = appliedAnimations.indexOf(currentAnimationName);
            var isAlreadyApplied = currentAnimationIndex !== NOT_FOUND;
            var newAppliedAnimations;

            /**
             * @const
             * @type {string}
             */
            var singleAnimation = [
                currentAnimationName,
                this.duration() + 'ms',
                this.getEasing().toString(),
                this.delay() + 'ms',
                this.iterationCount().toString(),
                this.direction(),
                this.fillMode()
            ].join(ANIMATION_PARAMETER_JOINER);

            if (isAlreadyApplied) {

                var animationsBefore = currentAnimationIndex === 0 ? '' : appliedAnimations.slice(0, currentAnimationIndex - ANIMATIONS_JOINER.length);
                var animationsAfter = animationsBefore.split(ANIMATIONS_SEPARATOR)[1] || ''; // 0 this animation

                newAppliedAnimations = animationsBefore;

                if (animationsAfter.length > 0) {
                    newAppliedAnimations += ANIMATIONS_JOINER + animationsAfter;
                }

                newAppliedAnimations += ANIMATIONS_JOINER + singleAnimation;

            } else {

                newAppliedAnimations = appliedAnimations.length === 0 ? appliedAnimations : (appliedAnimations + ANIMATIONS_JOINER);
                newAppliedAnimations += singleAnimation

            }

            setStyle(this.animationTarget, ANIMATION, newAppliedAnimations);

        } else {
            this.elapsedTime = 0;

            if (this.fillsBackwards) {
                this.update();
            }

            if (this.delayTime <= 0) {
                this.fireOnStart();
            }

            this.resume();

        }

    };

    goog.exportProperty(Animation.prototype, 'start', Animation.prototype.start);

    /**
     * Останавливает анимацию
     * */
    Animation.prototype.stop = function () {
        if (this.usesCSS3) {

            // Обёртки над обработчиками событий CSS анимации
            if (CSSANIMATIONS_SUPPORTED) {
                delete delegatorCallbacks[ ANIMATION_START_EVENTTYPE ][ this.animId ];
                delete delegatorCallbacks[ ANIMATION_ITERATION_EVENTTYPE ][ this.animId ];
                delete delegatorCallbacks[ ANIMATION_END_EVENTTYPE ][ this.animId ];
            }

            KeyframesRulesRegistry.slay(/** @type {!CSSKeyframesRule} */ (this.keyframesRule));
            this.keyframesRule = null;

            var currentAnimationName = this.animId;
            var appliedAnimations = getStyle(this.animationTarget, ANIMATION, true) || getStyle(this.animationTarget, ANIMATION, false);
            var currentAnimationIndex = appliedAnimations.indexOf(currentAnimationName);

            var animationsBefore = currentAnimationIndex === 0 ? '' : appliedAnimations.slice(0, currentAnimationIndex - ANIMATIONS_JOINER.length);
            var animationsAfter = animationsBefore.split(ANIMATIONS_SEPARATOR)[1] || ''; // 0 - this animation

            var newAppliedAnimations = animationsBefore;

            if (animationsAfter.length > 0) {
                newAppliedAnimations += ANIMATIONS_JOINER + animationsAfter;
            }

            setStyle(this.animationTarget, ANIMATION, newAppliedAnimations);

        }
        if (this.fillsForwards) {
            // Установка конечных значений для свойств.
            this.fractionalTime = 1;
            this.update();
        } else {
            // Возвращение анимированных свойств в доанимированное состояние
            for (var i = 0; i < this.animatedProperties.length; i++) {
                var propertyDescriptor = this.animatedProperties.item(i);
                var startingValue = propertyDescriptor.startingValue;
                this.render(propertyDescriptor, startingValue.getValue());
            }
        }

        this.pause();

    };

    goog.exportProperty(Animation.prototype, 'stop', Animation.prototype.stop);

    /**
     * @type {function (number)}
     */
    Animation.prototype.selfTick;

    /**
     * Снимает анимацию с паузы
     * */
    Animation.prototype.resume = function () {
        if (this.usesCSS3) {
            this.rewriteParameter(ANIMATION_PLAY_STATE, ANIMATION_PLAY_STATE_RUNNING);
        } else {
            Ticker.on(this.selfTick);
        }
    };

    goog.exportProperty(Animation.prototype, 'resume', Animation.prototype.resume);

    /**
     * Приостанавливает анимацию
     * */
    Animation.prototype.pause = function () {
        if (this.usesCSS3) {
            this.rewriteParameter(ANIMATION_PLAY_STATE, ANIMATION_PLAY_STATE_PAUSED);
        } else {
            Ticker.off(this.selfTick);
        }
    };

    goog.exportProperty(Animation.prototype, 'pause', Animation.prototype.pause);

    /** @type {boolean} */
    Animation.prototype.usesCSS3;

    /**
     * Форсирует анимации классический режим (JS-анимации)
     * @param {boolean} value
     */
    Animation.prototype.setClassicMode = function (value) {
        this.usesCSS3 = CSSANIMATIONS_SUPPORTED && !value;
    };

    goog.exportProperty(Animation.prototype, 'setClassicMode', Animation.prototype.setClassicMode);

    /** @type {!Function} */
    Animation.prototype.oncomplete = goog.nullFunction;

    /**
     * Установка обработчика завершения анимации
     * Функция исполнится, когда анимация завершится естественным ходом.
     * (без ручного вызова Animation.stop)
     * @param {!Function} callback
     */
    Animation.prototype.onComplete = function (callback) {
        this.oncomplete = callback;
    };

    goog.exportProperty(Animation.prototype, 'onComplete', Animation.prototype.onComplete);

    /** @type {!Function} */
    Animation.prototype.onstart = goog.nullFunction;

    /**
     * Установка обработчика старта анимации.
     * Исполнится, когда анимация начнёт проигрываться.
     * Может быть таймаут между стартом и началом проигрывания.
     * Этот таймаут устанавливается методом 'setDelay'
     * @param {!Function} callback
     */
    Animation.prototype.onStart = function (callback) {
        this.onstart = callback;
    };

    goog.exportProperty(Animation.prototype, 'onStart', Animation.prototype.onStart);

    /** @type {!Function} */
    Animation.prototype.onstep = goog.nullFunction;

    /**
     * Установка функции, исполняющейся при каждом шаге анимации.
     * Исполняется после обновления состояния анимации (метод 'update')
     * @param {!Function} callback
     */
    Animation.prototype.onStep = function (callback) {
        this.onstep = callback;
    };

    goog.exportProperty(Animation.prototype, 'onStep', Animation.prototype.onStep);

    /** @type {!Function} */
    Animation.prototype.oniteration = goog.nullFunction;

    /**
     * Установка обработчика завершения прохода.
     * Имеет смысл, если число проходов больше одного.
     * Число проходов устанавливается методом 'setIterations'
     * @param {!Function} callback
     */
    Animation.prototype.onIteration = function (callback) {
        this.oniteration = callback;
    };

    goog.exportProperty(Animation.prototype, 'onIteration', Animation.prototype.onIteration);

    /**
     * @param {string} parameterName
     * @param {string} parameterValue
     */
    Animation.prototype.rewriteParameter = function (parameterName, parameterValue) {
        var paramsList = getStyle(this.animationTarget, parameterName, true).split(ANIMATIONS_SEPARATOR);
        var appliedAnimationNames = getStyle(this.animationTarget, ANIMATION_NAME, true).split(ANIMATIONS_SEPARATOR);
        var thisAnimationName = this.animId;
        var animationIndex = linearSearch(appliedAnimationNames, function (name) {
            return name === thisAnimationName;
        });
        paramsList[ animationIndex ] = parameterValue;
        setStyle(this.animationTarget, parameterName, paramsList.join(ANIMATIONS_JOINER));
    };

    /**
     * Обёртка над порождением события старта анимации
     * с закреплённым контекстом
     * @type {function ()}
     */
    Animation.prototype.fireOnStart;

    /**
     * Обёртка над порождением события старта анимации
     * без закреплённого контекста
     */
    Animation.prototype._not_self_fireOnStart = function () {
        if (this.onstart !== goog.nullFunction) {
            this.onstart.call(this);
        }
    };

    /**
     * Обёртка над порождением события завершения прохода анимации
     * с закреплённым контекстом
     * @type {function ()}
     */
    Animation.prototype.fireOnIteration;

    /**
     * Обёртка над порождением события завершения прохода анимации
     * без закреплённого контекста
     */
    Animation.prototype._not_self_fireOnIteration = function () {
        if (this.oniteration !== goog.nullFunction) {
            this.oniteration.call(this);
        }
    };

    /**
     * Обёртка над порождением события отрисовки кадра
     * с закреплённым контекстом
     * @type {function ()}
     */
    Animation.prototype.fireOnStep;

    /**
     * Обёртка над порождением события отрисовки кадра
     * без закреплённого контекста
     */
    Animation.prototype._not_self_fireOnStep = function () {
        if (this.onstep !== goog.nullFunction) {
            this.onstep.call(this);
        }
    };

    /**
     * Обёртка над порождением события завершения анимации
     * с закреплённым контекстом
     * @type {function ()}
     */
    Animation.prototype.fireOnComplete;

    /**
     * Обёртка над порождением события завершения анимации
     * без закреплённого контекста
     */
    Animation.prototype._not_self_fireOnComplete = function () {
        if (this.oncomplete !== goog.nullFunction) {
            this.oncomplete.call(this);
        }
    };

    /**
     * Обёртка над порождением события завершения анимации
     * с закреплённым контекстом
     * @type {function ()}
     */
    Animation.prototype.fireOnCompleteWithStop;

    /**
     * Обёртка над порождением события завершения анимации
     * без закреплённого контекста
     */
    Animation.prototype._not_self_fireOnCompleteWithStop = function () {
        this.stop();
        if (this.oncomplete !== goog.nullFunction) {
            this.oncomplete.call(this);
        }
    };

/*---------------------------------------*/

    /**
     * Высокоуровневая обёртка над низкоуровневым классом
     * @constructor
     * @extends {Animation}
     */
    function AnimationWrap () {
        Animation.call(this);
    }

    AnimationWrap.prototype = objectCreate(Animation.prototype);

    /**
     * Установит или получит текущий элемент для анимирования
     * @param {!HTMLElement=} target
     * @return {!HTMLElement|!AnimationWrap}
     */
    AnimationWrap.prototype.target = function (target) {
        if (goog.isObject(target)) {
            this.setTarget( /** @type {!HTMLElement} */ (target) );
            return this;
        } else {
            return this.getTarget();
        }
    };

    goog.exportProperty(AnimationWrap.prototype, 'target', AnimationWrap.prototype.target);

    /**
     * @const
     * @type {string}
     */
    var PERCENT = '%';

    /**
     * Ключ - алиас к позиции, значение - прогресс в долях
     * @enum {number}
     */
    var keyAliases = {
        'from': 0,
        'half': 0.5,
        'to': 1
    };

    /**
     * Установка или получение значения свойства при переданном прогрессе
     * @param {string} propName
     * @param {(string|number|!Array.<number>)=} propValue Значение свойства. Для получения значения можно пропустить.
     * @param {(string|number)=} position Прогресс в строке или числе процентов. По умолчанию равен 100 (или "100%").
     * @return {null|number|!Array.<number>|!AnimationWrap}
     */
    AnimationWrap.prototype.propAt = function (propName, propValue, position) {
        var numericValue;
        var usedValue;
        var numericPosition = MAXIMAL_PROGRESS;
        var stringPosition = '';
        if (goog.isDef(position)) {
            if (goog.isNumber(position)) {
                numericPosition = /** @type {number} */(position)
            } else if (goog.isString(position)) {
                stringPosition = /** @type {string} */(position);
                if (stringPosition in keyAliases) {
                    numericPosition = keyAliases[stringPosition];
                } else {
                    var matched = stringPosition.match(cssNumericValueReg);
                    if (goog.isArray(matched) && (!matched[VALREG_DIMENSION] || matched[VALREG_DIMENSION] === PERCENT)) {
                        numericPosition = +matched[VALREG_VALUE];
                    }
                }
            }
            if (numericPosition > 1) {
                numericPosition /= 100;
            }
            if (numericPosition < MINIMAL_PROGRESS || numericPosition > MAXIMAL_PROGRESS) {
                numericPosition = MAXIMAL_PROGRESS;
            }
        }
        if (goog.isDef(propValue)) {

            if (goog.isArray(propValue)) {
                numericValue = propValue;
            } else if (goog.isNumber(propValue)) {
                numericValue = [ propValue ];
            } else {
                numericValue = toNumericValue(this.animationTarget, propName, propValue, getVendorPropName(propName));
            }

            this.setPropAt(propName, numericValue, numericPosition);

            // Для анимации необходимо минимум 2 значения
            if (  goog.isNull(this.getPropAt(propName, MINIMAL_PROGRESS)) ) {
                usedValue = getStyle(this.animationTarget, propName, true);
                numericValue = toNumericValue(this.animationTarget, propName, usedValue, getVendorPropName(propName));
                this.setPropAt(propName, numericValue, MINIMAL_PROGRESS);
            }
            if ( goog.isNull(this.getPropAt(propName, MAXIMAL_PROGRESS)) ) {
                usedValue = getStyle(this.animationTarget, propName, true);
                numericValue = toNumericValue(this.animationTarget, propName, usedValue, getVendorPropName(propName));
                this.setPropAt(propName, numericValue, MAXIMAL_PROGRESS);
            }
            if ( goog.isNull(this.getStartingValue(propName)) ) {
                usedValue = getStyle(this.animationTarget, propName, false);
                numericValue = toNumericValue(this.animationTarget, propName, usedValue, getVendorPropName(propName));
                this.setStartingValue(propName, numericValue);
            }
            return this;
        } else {
            return this.getPropAt(propName, numericPosition);
        }
    };

    goog.exportProperty(AnimationWrap.prototype, 'propAt', AnimationWrap.prototype.propAt);

    /**
     * Алиасы к времени продолжительности.
     * Ключ - алиас, значение - время в миллисекундах
     * @enum {number}
     */
    var durationAliases = {
        'slow': 600,
        'fast': 200
    };

    /**
     * Установка или получение времени проигрывания анимации.
     * Отрицательные значения игнорируются.
     * Нулевое значение соответствует мгновенному проходу анимации, при этом
     * все механизмы работают так же, как и при положительной продолжительности.
     * @param {(string|number)=} duration Алиас, время в формате CSS или миллисекунды
     * @return {number|!AnimationWrap} время в миллисекундах или текущий экземпляр
     */
    AnimationWrap.prototype.duration = function (duration) {
        var numericDuration = 0, stringDuration = '';
        if (goog.isDef(duration)) {
            if (goog.isNumber(duration)) {
                numericDuration = /** @type {number} */(duration);
            } else if (goog.isString(duration)) {
                stringDuration = /** @type {string} */(duration);
                if (stringDuration in durationAliases) {
                    numericDuration = durationAliases[stringDuration];
                } else {
                    var matched = stringDuration.match(cssNumericValueReg);
                    numericDuration = matched[VALREG_VALUE] * (matched[VALREG_DIMENSION] === 's' ? 1e3:1);
                }
            }
            if (numericDuration >= 0) {
                this.setDuration(numericDuration);
            }
            return this;
        } else {
            return this.cycleDuration;
        }
    };

    goog.exportProperty(AnimationWrap.prototype, 'duration', AnimationWrap.prototype.duration);

    /**
     * Установка задержки старта.
     * Если значение положительное, старт анимации будет отложен на численное представление.
     * Если отрицательное, то при старте будет считаться, что прошло уже указанное по модулю время со старта.
     * @param {(number|string)=} delay Строка времени в формате CSS или число миллисекунд.
     * @return {number|!AnimationWrap}
     */
    AnimationWrap.prototype.delay = function (delay) {
        var numericDelay = 0, stringDelay = '';
        if (goog.isDef(delay)) {
            if (goog.isNumber(delay)) {
                numericDelay = /** @type {number} */(delay);
            } else if (goog.isString(delay)) {
                stringDelay = /** @type {string} */(delay);
                var matched = stringDelay.match(cssNumericValueReg);
                numericDelay = matched[VALREG_VALUE] * (matched[VALREG_DIMENSION] === 's' ? 1e3:1);
            }
            if (isFinite(numericDelay)) {
                this.setDelay(/** @type {number} */(numericDelay));
            }
            return this;
        } else {
            return this.delayTime;
        }
    };

    goog.exportProperty(AnimationWrap.prototype, 'delay', AnimationWrap.prototype.delay);

    /**
     * Установка числа проходов цикла анимации.
     * Значение "infinite" соответствует бесконечному числу повторений анимации.
     * Дробные значения соответствуют конечному значению прогресса по проходу.
     * Отрицательные значения игнорируются.
     * @param {(number|string)=} iterations
     * @return {number|!AnimationWrap}
     */
    AnimationWrap.prototype.iterationCount = function (iterations) {

        /** @type {number} */
        var numericIterations;

        if (goog.isDef(iterations)) {
            if (iterations === ITERATIONCOUNT_INFINITE) {
                numericIterations = POSITIVE_INFINITY;
            } else {
                numericIterations = parseFloat(iterations);
            }
            this.setIterations(numericIterations);
            return this;
        } else {
            return this.iterations;
        }
    };

    goog.exportProperty(AnimationWrap.prototype, 'iterationCount', AnimationWrap.prototype.iterationCount);

    /** @enum {number} */
    var directions = {
        'normal': 0,
        'reverse': DIRECTION_REVERSE,
        'alternate':  DIRECTION_ALTERNATE,
        'alternate-reverse':  DIRECTION_ALTERNATE & DIRECTION_REVERSE
    };

    /**
     * Установка или получение направления проигрывания анимации.
     * Значение "normal" соответствует возрастанию прогресса от 0 до 1 при каждом проходе. ( binary: 00 )
     * Значение "reverse" соответствует убыванию прогресса от 1 до 0 при каждом проходе.( binary: 01 )
     * Значение "alternate" соответствует направлению "normal" для нечётных проходов и "reverse" для чётных.( binary: 10 )
     * Значение "alternate-reverse" соответствует направлению "reverse" для нечётных проходов и "normal" для чётных.( binary: 11 )
     * Числовому значению соответствует побитовая маска.
     * @param {(string|number)=} direction
     * @return {string|!AnimationWrap}
     */
    AnimationWrap.prototype.direction = function (direction) {
        var binaryDirection = NOT_FOUND;
        var strDirection = '';
        if (goog.isDef(direction)) {
            if (goog.isNumber(direction)) {
                binaryDirection = direction;
            } else if (direction in directions) {
                binaryDirection = directions[direction];
            }
            if (binaryDirection !== NOT_FOUND) {
                this.setDirection(binaryDirection);
            }
            return this;
        } else {
            binaryDirection = this.getDirection();
            for (var directionEnum in directions) {
                // Only old browsers will iterate props like 'toString' and other. New browsers will not..
                // Equation is safe so why we should slow up new browsers?
                //noinspection JSUnfilteredForInLoop
                if (directions[directionEnum] === binaryDirection) {
                    strDirection = directionEnum;
                    break;
                }
            }
            return strDirection;
        }
    };

    goog.exportProperty(AnimationWrap.prototype, 'direction', AnimationWrap.prototype.direction);

    /** @enum {number} */
    var fillModes = {
        'none': 0,
        'forwards': FILLS_FORWARDS,
        'backwards':  FILLS_BACKWARDS,
        'both':  FILLS_FORWARDS & FILLS_BACKWARDS
    };

    /**
     * Установка или получение режима крайней отрисовки.
     * Значение "backwards" соответствует отрисовке значений
     * начального ключевого кадра сразу после старта (и перед самим анимированием). ( binary:  01 )
     * Значение "forwards" соответствует отрисовке значений
     * конечного ключевого кадра после окончания анимации. ( binary:  10 )
     * Значение "none" не соответствует ни одному из значений; ( binary:  00 )
     * Значение "both" соответствует и первому, и второму одновременно. ( binary:  11 )
     * @param {(string|number)=} fillMode
     * @return {string|!AnimationWrap}
     */
    AnimationWrap.prototype.fillMode = function (fillMode) {
        var binFillMode = NOT_FOUND;
        var strFillMode = '';
        if (goog.isDef(fillMode)) {
            if (goog.isNumber(fillMode)) {
                binFillMode = fillMode;
            } else if (fillMode in fillModes) {
                binFillMode = fillModes[fillMode];
            }
            if (binFillMode !== NOT_FOUND) {
                this.setFillMode(binFillMode);
            }
            return this;
        } else {
            binFillMode = this.getFillMode();
            for (var fillModeEnum in fillModes) {
                // Only old browsers will iterate props like 'toString' and other. New browsers will not..
                // Equation is safe so why we should slow up new browsers?
                //noinspection JSUnfilteredForInLoop
                if (fillModes[fillModeEnum] === binFillMode) {
                    strFillMode = fillModeEnum;
                    break;
                }
            }
            return strFillMode;
        }
    };

    goog.exportProperty(AnimationWrap.prototype, 'fillMode', AnimationWrap.prototype.fillMode);

    /**
     * Установка или получение смягчения анимации.
     * (!) Абсциссы первой и второй точек для кубической кривой Безье должны принадлежать промежутку [0, 1].
     * (!) Число ступеней в Steps всегда целочисленное.
     * @param {(string|!Array.<number>|!Easing|!CubicBezier|!Steps)=} easing временная функция CSS, алиас смягчения или массив точек (2 - Steps, 4 - CubicBezier)
     * @return {!(CubicBezier|Steps|Easing|AnimationWrap)}
     */
    AnimationWrap.prototype.easing = function (easing) {
        var timingFunction;
        if (goog.isDef(easing)) {
            timingFunction = EasingRegistry.request(easing);
            if (!goog.isNull(timingFunction)) {
                this.setEasing( /** @type {!(CubicBezier|Steps|Easing)} */(timingFunction) );
            }
            return this;
        } else {
            return this.getEasing();
        }
    };

    goog.exportProperty(AnimationWrap.prototype, 'easing', AnimationWrap.prototype.easing);

/*---------------------------------------*/

    /**
     * "Одноразовая" функция, позволяющая анимировать без муторного создания объектов в один вызов
     * Формат записи свойств и вообще аргументов - как в jQuery (для удобства)
     * Типы свойств и параметров - как в AnimateWrap.
     * @param {!HTMLElement} element Элемент для анимирования
     * @param {!Object} properties Свойства для анимирования. Ключ - имя свойства, значение - конечная величина свойства.
     * @param {(number|string)=} duration Продолжительность в миллисекундах (число) или в формате CSS Timestring (строка)
     * @param {(string|!Array.<number>|!Easing|!CubicBezier|!Steps)=} easing Смягчение всей анимации (алиас, CSS Timefunction, аргументы к временной функции или сама функция)
     * @param {(function (this: AnimationWrap))=} complete Обработчик события завершения анимации
     * @return {!AnimationWrap}
     */
    function animate (element, properties, duration, easing, complete) {
        var self = new AnimationWrap();

        var progress;

        self.target(element);

        var options;

        if ( arguments.length === 3 && goog.isObject(duration) ) {
            options = duration;
            duration = options['duration'];
            easing = options['easing'];
            progress = options['progress'];
            complete = options['complete'];
            self.delay(options['delay']);
            self.fillMode(options['fillMode']);
            self.direction(options['direction']);
            self.iterationCount(options['iterationCount']);
        }

        self.duration(duration);
        self.easing(easing);

        if (goog.isFunction(progress)) {
            self.onStep(progress);
        }

        if (goog.isFunction(complete)) {
            self.onComplete(complete);
        }

        for (var propName in properties) if (properties.hasOwnProperty(propName)) {
            self.propAt(propName, properties[propName]);
        }

        self.start();

        return self;
    }

/*---------------------------------------*/

    var melAnim = animate;

    goog.exportProperty(goog.global, 'melAnim', melAnim);

    goog.exportProperty(melAnim, 'Animation', AnimationWrap);

    goog.exportProperty(melAnim, 'css', /**@type {function (!HTMLElement, string, string?): (string|undefined)} */(function (element, propertyName, propertyValue) {
        if (goog.isString(propertyValue)) {
            return setStyle(element, propertyName, /** @type {string} */(propertyValue));
        } else {
            return getStyle(element, propertyName, true);
        }
    }));

    goog.exportProperty(melAnim, 'now', now);
    goog.exportProperty(melAnim, 'vendorize', getVendorPropName);

    goog.exportProperty(melAnim, 'Ticker', Ticker);

    goog.exportProperty(Ticker, "attach", Ticker.on);
    goog.exportProperty(Ticker, "detach", Ticker.off);
    goog.exportProperty(Ticker, "setFPS", Ticker.setFPS);
    goog.exportProperty(Ticker, "ignoreReflow", Ticker.ignoreReflow);