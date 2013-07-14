/** melAnim - v0.1.0 - 2013-07-07
* Copyright (c) 2013 ColCh; Licensed GPLv3 */
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
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

  goog.findBasePath_();

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
    ].join(""));;

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
     * @const
     * @type {number}
     */
    var NOT_FOUND = -1;

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
     * @type {function (): number}
     * @const
     *  */
    var now = 'performance' in goog.global && 'now' in goog.global.performance ? function () { return goog.global.performance.timing.navigationStart + goog.global.performance.now(); } : 'now' in Date ? Date.now : function () { return +new Date(); };

    /** @const */
    var Ticker = {
        /** @type {Array.<{
        *   clb: !Function,
        *   timeoutId: number
        * }>}
         */
        listeners: [],
        /**
         * @param {!Function} callback
         * @return {number}
         * */
        on: function (callback) {
            var id = uuid();
            var descriptor = {
                clb: callback,
                timeoutId: id
            };
            this.listeners.push(descriptor);
            if (!this.isAwaken) {
                this.awake();
            }
            return id;
        },
        /**
         * @param {number} id
         */
        off: function (id) {
            var index = linearSearch(this.listeners, function (descriptor, i, listeners) {
                return descriptor.timeoutId === id;
            });
            this.listeners.splice(index, 1);
            if (this.listeners.length === 0 && this.isAwaken) {
                this.sleep();
            }
        },

        useRAF: false,
        isAwaken: false,
        frequency: 1e3 / 60,

        awake: function () {
            if (!this.isAwaken) {
                this.lastReflow = this.currentTimeStamp = now();
                this.isAwaken = true;
            }
            this.intervalId = this.useRAF ? requestAnimationFrame(this.tick, rootElement) : setTimeout(this.tick, this.frequency);
        },
        sleep: function () {
            if (this.isAwaken) {
                this.isAwaken = false;
                this.lastReflow = this.currentTimeStamp = this.delta = 0;
            }
            (this.useRAF ? cancelRequestAnimationFrame : clearTimeout)(this.intervalId);
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

            for (var i = 0, m = Ticker.listeners.length; i < m; i++) {
                Ticker.listeners[i].clb(Ticker.delta);
            }

            Ticker.lastReflow = Ticker.currentTimeStamp;

            if (Ticker.listeners.length) {
                Ticker.awake();
            }
        },

        /** @type {number} */
        fps: 60,

        /**
         * @param {number} fps
         */
        setFPS: function (fps) {
            this.frequency = 1e3 / fps;
        }
    };

    goog.exportProperty(Ticker, "attach", Ticker.on);
    goog.exportProperty(Ticker, "detach", Ticker.off);
    goog.exportProperty(Ticker, "setFPS", Ticker.setFPS);

    /** @const */
    var SORT_BIGGER = -1;
    /** @const */
    var SORT_EQUALS = 0;
    /** @const */
    var SORT_SMALLER = 1;

    /**
     * @param {!Array} array
     * @param {!function (*, *, number, Array): number} compare
     */
    function bubbleSort(array, compare) {

        var cache;

        for (var j = 0; j < array.length - 1; j += 1) {
            for (var i = 0; i < array.length - 1 - j; i += 1) {
                if (compare(array[i], array[i + 1], i, array) === SORT_SMALLER) {
                    cache = array[i];
                    array[i] = array[i + 1];
                    array[i + 1] = cache;
                }
            }
        }
    }

    /**
     * @param {!Array.<number>} from
     * @param {!Array.<number>} to
     * @param {number} progress
     * @param {!Array.<number>} currentValue
     * @return {boolean}
     */
    function blend (from, to, progress, currentValue) {

        var valueIsChanged = false;
        for (var i = 0, m = from.length; i < m; i++) {
            valueIsChanged = (currentValue[i] !== (currentValue[i] = ( (to[i] - from[i]) * progress + from[i] ) | 0 )) || valueIsChanged;
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
     * @type {!CSSStyleDeclaration}
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
     * @const
     * @type {boolean}
     */
    var USEDSTYLE_SUPPORTED = 'getComputedStyle' in goog.global;

    /**
     * @param {!Element} elem
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
        }
    }

    /**
     * @param {!Element} elem
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
     * @param {!Element} element
     * @param {string} propertyName
     * @param {string} propertyValue
     * @param {string} vendorizedPropName
     * @return {!Array.<number>}
     */
    function toNumericValue (elem, propertyName, propertyValue, vendorizedPropName) {

        if (goog.isNumber(propertyValue)) {
            return [ propertyValue ];
        }

        if (vendorizedPropName.indexOf('color') !== NOT_FOUND) {
            return toNumericValueHooks['color'](elem, propertyName,  propertyValue, vendorizedPropName);
        }

        var valueDescriptor = propertyValue.match(cssNumericValueReg);

        var value = valueDescriptor[ VALREG_VALUE ];
        var numericValue = parseFloat(value);
        var unit = valueDescriptor[ VALREG_DIMENSION ];
        var isHoriz;

        if (unit === '' || unit === 'px') {
            return [ numericValue ];
        }

        isHoriz = horizAxisReg.test(vendorizedPropName);

        if (unit === '%' && vendorizedPropName.indexOf('border') !== -1) {
            numericValue /= 100;
            numericValue *= isHoriz ? elem.clientWidth : elem.clientHeight;
            return [ numericValue ];
        }

        tempElement.style.cssText = "border-style:solid; border-width:0; position:absolute; line-height:0;";

        var ctx = elem;

        if (unit === '%' || !ctx.appendChild) {
            ctx = elem.parentNode || document.body;
            tempElement.style[ isHoriz ? "width" : "height" ] = propertyValue;
        } else {
            tempElement.style[ isHoriz ? "borderLeftWidth" : "borderTopWidth" ] = propertyValue;
        }

        ctx.appendChild(tempElement);
        var normalized = tempElement[ isHoriz ? "offsetWidth" : "offsetHeight" ];
        ctx.removeChild(tempElement);

        return [ normalized ];
    }

    /** @type {Object.<CSSStyleDeclaration, function (!Element, string, string, string): !Array.<number>>} */
    var toNumericValueHooks = {};

    /**
     * @param {!Element} element
     * @param {string} propertyName
     * @param {!Array.<number>} numericValue
     * @param {string} vendorizedPropName
     * @return {string}
     */
    function toStringValue (elem, propertyName, numericValue, vendorizedPropName) {
        if (propertyName in toStringValueHooks) {
            return toStringValueHooks[propertyName](elem, propertyName, numericValue, vendorizedPropName);
        }
        return numericValue + ( propertyName in toStringValueNoPX ? '' : 'px' );
    }

    /** @type {Object.<CSSStyleDeclaration, function (!Element, string, !Array.<number>, string): string>} */
    var toStringValueHooks = {};

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

/*---------------------------------------*/

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

            var index = linearSearch(self.easings, function (easing, i, easingsArray) {
                return easing.equals(timingFunction);
            });

            if (index === NOT_FOUND) {
                self.easings.push(timingFunction);
            }

            return /** @type {!Easing} */ (timingFunction);
        },
        /**
         * @param {!(string|Array)} contain
         * @return {?Easing}
         */
        build: function (contain) {
            var numericArgs, timingFunction;
            var stepsAmount, countFromStart;
            var camelCased, trimmed;
            var matched, cssFunction, args;
            var argsLength;

            if (goog.isString(contain)) {
                trimmed = trim(contain);
                camelCased = camelCase(trimmed);
                if (camelCased in cssEasingAliases) {
                    // Передан алиас к аргументам смягчения CSS
                    args = cssEasingAliases[ camelCased ];
                } else {
                    // Передана строка временной функции CSS
                    // строка аргументов к временной функции. разделены запятой
                    matched = trimmed.match(cssFunctionReg);
                    cssFunction = matched[FUNCREG_FUNC];
                    args = removeSpaces(matched[FUNCREG_ARGS]).split(cssFuncArgsSeparator);
                }
            } else if (goog.isArray(contain)) {
                args = /** @type {!Array} */ (contain);
            }

            argsLength = args.length;

            if (argsLength == 4) {
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
            } else if (argsLength == 1 || argsLength == 2) {
                stepsAmount = parseInt(args[0], 10);
                countFromStart = args[1] === 'start';
                if (goog.isNumber(stepsAmount)) {
                    timingFunction = new Steps(stepsAmount, countFromStart);
                }
            }

            return goog.isDef(timingFunction) ? timingFunction : null;
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
        this.p1x = p1x;
        this.p1y = p1y;
        this.p2x = p2x;
        this.p2y = p2y;
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
        // 3*t * (1 - t) * (  (1 - t) * P1  +  3*t * P2 ) + t^3

        var t3 = 3 * t;
        var revt = 1 - t;
        return t3 * revt * (revt * p1 + t3 * p2) + t * t * t;
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
         var B1d = t * (3 * t - 4)  + 1;
         var B2d = 2 - 3 * t;
         return 3 * ( B1d * this.p1x + t * ( B2d * this.p2x + t ) );
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
            X0 = X1;
        } while ( i-- !== 0 && derivative !== 0 && this.B_absciss(X1) > range);

        t = X1;

        return this.B_ordinate(t);
    };

    /**
     * @param {!(CubicBezier|Easing)} easing
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
            return Math.min(Math.ceil(this.stepsAmount * x) / this.stepsAmount, MAXIMAL_PROGRESS);
        } else {
            return (Math.floor(this.stepsAmount * x) ) / this.stepsAmount;
        }
    };

    /**
     * @param {!(Steps|Easing)} easing
     * @return {boolean}
     * @override
     */
    Steps.prototype.equals = function (easing) {
        /** @type {!Steps} */(easing);
        var isAmountEquals = this.stepsAmount === easing.stepsAmount;
        var isCountSourceEquals = this.countFromStart === easing.countFromStart;
        return isAmountEquals && isCountSourceEquals;
    };

    Steps.prototype.toString = function () {
        return 'steps' + "(" + this.stepsAmount + ", " + (this.countFromStart ? "start" : "end") + ")";
    };

/*---------------------------------------*/

    /* ------------------   РАБОТА С ЦВЕТАМИ   --------------------- */
    toNumericValueHooks["color"] = function (elem, propertyName,  propertyValue, vendorizedPropName) {
        var red, green, blue;

        if (propertyValue in colorsAliases) {
            // Алиас
            return colorsAliases[ propertyValue ];
        } else if (propertyValue.indexOf("#") !== -1) {
            // HEX
            var hex = parseInt(propertyValue, 16);
            red = hex >> 16 & 0xFF;
            green = hex >> 8 & 0xFF;
            blue = hex & 0xFF;
            return [ red, green, blue ];
        } else {
            // Цветовая CSS-функция
            // RGB, RGBa, HSL, HSLa ...
            var matched = propertyValue.match(cssFunctionReg);
            var func = matched[1];
            var args = removeSpaces(matched[2]).split(cssFuncArgsSeparator);

            for (var i = 0; i < args.length; i++) {
                matched = args[i].match(cssNumericValueReg);
                args[i] = [ parseInt(matched[1]), matched[2] ];
            }

            if (func in colorFunctions) {
                return colorFunctions[func](args);
            }

            return [ 0, 0, 0 ];

        }
    };


    /** @type {function(number, number, number): number} */
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
            var red = hueToRGB(m1, m2, hue + 1/3) * 255;
            var green = hueToRGB(m1, m2, hue) * 255;
            var blue = hueToRGB(m1, m2, hue - 1/3) * 255;
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

            red = args[0][0];
            green = args[1][0];
            blue = args[2][0];

            return [ red, green, blue ];
        }

    };


    toStringValueHooks["color"] = function (elem, propertyName, numericValue, vendorizedPropName) {
        return "rgb" + "(" + numericValue + ")";
    };

    blendHooks["color"] = function (from, to, easing, current, id) {
        var changed = false;

        current[id] = id in current ? current[id] : ( current[id] = [ 0, 0, 0 ] );

        // Цветовой канал лежит в интервале [ 0, 255 ]
        if (easing < MINIMAL_PROGRESS) {
            easing = MINIMAL_PROGRESS;
        } else if (easing > MAXIMAL_PROGRESS) {
            easing = MAXIMAL_PROGRESS;
        }


        for (var i = 0; i < 3; i++) {
            changed = blend(from[i], to[i], easing, current[id], '' + i) || changed;
        }

        return changed;
    };


    /* ------------------   РАБОТА С TRANSFORM   --------------------- */

    var TRANSFORMDATA_ROTATE = 0;

    var TRANSFORMDATA_SCALE_X = 1;
    var TRANSFORMDATA_SCALE_Y = 2;

    var TRANSFORMDATA_SKEW_X = 3;
    var TRANSFORMDATA_SKEW_Y = 4;

    var TRANSFORMDATA_TRANSLATE_X = 5;
    var TRANSFORMDATA_TRANSLATE_Y = 6;

    function TransformData () {
        // Матрица преобразований
        this.matrix = [ 0, 0, 0, 0, 0, 0 ];
        // Декомпозированные из матрицы данные
        this.data = [ 0, 100, 100, 0, 0, 0, 0 ];
    }

    TransformData.prototype.setData = function (value) {

        if (value === "none" || value === "") {
            return;
        }

        var matched;

        var transforms = value.split(cssTransformFuncReg);

        for (var i = 0; i < transforms.length; i++) {

            matched = transforms[i].match(cssFunctionReg);

            var func = matched[1]+"";
            var args = removeSpaces(matched[2]+"").split(cssFuncArgsSeparator);

            this.setters[func](args, this.data);
        }

    };

    /**
     * @enum {function (!Array, !Array.<Array>)}
     */
    TransformData.prototype.setters = {

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
            data[TRANSFORMDATA_SKEW_X] = parseInt(args[0]);
        },
        "skewY": function (args, data) {
            data[TRANSFORMDATA_SKEW_Y] = parseInt(args[0]);
        },
        "skew": function (args, data) {
            data[TRANSFORMDATA_SKEW_X] = parseInt(args[0]);
            data[TRANSFORMDATA_SKEW_Y] = parseInt(args[1]);
        },

        "translateX": function (args, data) {
            data[TRANSFORMDATA_TRANSLATE_X] = parseFloat(args[0]);
        },
        "translateY": function (args, data) {
            data[TRANSFORMDATA_TRANSLATE_Y] = parseFloat(args[0]);
        },
        "translate": function (args, data) {
            data[TRANSFORMDATA_TRANSLATE_Y] = parseFloat(args[0]);
            data[TRANSFORMDATA_TRANSLATE_X] = parseFloat(args[1]);
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

    TransformData.toArray = function () {
        //TODO экспорт TransformData как матрицу
        return this.matrix;
    };

    TransformData.prototype.toString = function () {
        var data = this.data;

        var currentTransforms = "";

        if (data[TRANSFORMDATA_SCALE_X] !== 100 || data[TRANSFORMDATA_SCALE_Y] !== 100) {
            currentTransforms += " " +  "scale(" + data[TRANSFORMDATA_SCALE_X] / 100 + "," + data[TRANSFORMDATA_SCALE_Y] / 100 + ")";
        }

        if ( data[TRANSFORMDATA_ROTATE] % 360 !== 0 ) {
            currentTransforms += " " + "rotate(" + data[TRANSFORMDATA_ROTATE] + "deg" + ")";
        }

        if (data[TRANSFORMDATA_SKEW_X] !== 0 || data[TRANSFORMDATA_SKEW_Y] !== 0 ) {
            currentTransforms += " " + "skew(" + data[TRANSFORMDATA_SKEW_X] + "deg" + "," + data[TRANSFORMDATA_SKEW_Y] + "deg" + ")";
        }

        if (data[TRANSFORMDATA_TRANSLATE_X] !== 0 || data[TRANSFORMDATA_TRANSLATE_Y] !== 0) {
            currentTransforms += " " + "translate(" + data[TRANSFORMDATA_TRANSLATE_X] + "px" + "," + data[TRANSFORMDATA_TRANSLATE_Y] + "px" + ")";
            console.log("translate(" + data[TRANSFORMDATA_TRANSLATE_X] + "px" + "," + data[TRANSFORMDATA_TRANSLATE_Y] + "px" + ")");
        }

        return currentTransforms;
    };

    toNumericValueHooks["transform"] = function (propertyValue) {
        var transformData = new TransformData();
        transformData.setData(propertyValue);
        return transformData;
    };
    blendHooks["transform"] = function (from, to, easing, current, id) {

        var changed = false;

        current[id] = id in current ? current[id] : ( current[id] = new TransformData() );

        var data = current[id].data;

        for (var i = 0, m = data.length; i < m; i++) {
            if (blend(from.data[i], to.data[i], easing, data, '' + i) && !changed) {
                changed = true;
            }
        }

        return changed;
    };

    /* ------------------   РАБОТА С SHADOW   --------------------- */
    var SHADOW_X = 0;
    var SHADOW_Y = 1;
    var SHADOW_BLUR = 2;
    var SHADOW_SPREAD = 3;
    var SHADOW_COLOR = 4;

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

        this.data[SHADOW_COLOR] = normalizeHooks["color"](null, "color", color, false);

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
        shadow += normalizeHooks["color"](null, "color", this.data[SHADOW_COLOR], true);
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
                if (blend(fromShadow.data[i], toShadow.data[i], easing, shadow.data, '' + i) && changed === false) {
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
    toNumericValueHooks["opacity"] = function (propertyValue) {
        return parseFloat(propertyValue) * 100;
    };
    toStringValueHooks["opacity"] = function (propertyValue) {
        return propertyValue / 100 + '';
    }

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
    }

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

/*---------------------------------------*/

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
    /**
     * @const
     * @type {string}
     */
    var TIMING_FUNCTION = 'timing-function';


    /**
     * Низкоуровневый конструктор анимаций
     * @constructor
     * @export
     */
    function Animation () {
        this.animId = generateId();
        this.keyframes = [];
    }

    /** @type {string} */
    Animation.prototype.animId = 'none';

    /** @type {(Element|Object)} */
    Animation.prototype.animationTarget = null;

    /**
     * @export
     * @param {(Element|Object)} target
     */
    Animation.prototype.setTarget = function (target) {
        this.animationTarget = target;
    };

    /**
     * @export
     * @return {(Element|Object)}
     */
    Animation.prototype.getTarget = function () {
        return this.animationTarget;
    };

    /**
     * @type {Array.<{
         *   propName: string,
         *   currentValue: !Array.<number>,
         *   startingValue: string,
         *   cachedIndex: number,
         *   keyframes: !Array.<{
         *       numericKey: number,
         *       propVal: !Array.<number>,
         *       isComputed: boolean
         *       }>
         *   }>}
     */
    Animation.prototype.keyframes = null;

    /**
     * @export
     * @param {string} propertyName
     * @param {!Array.<number>} propertyValue
     * @param {number} progress
     * @param {string=}
     */
    Animation.prototype.setPropAt = function (propertyName, propertyValue, progress, alternativeValue) {

        var index;

        index = linearSearch(/** @type {!Array} */(this.keyframes), function (propertyDescriptor, i, data) {
            return propertyDescriptor.propName === propertyName;
        });

        var propertyKeyframes;

        if (index === NOT_FOUND) {
            propertyKeyframes = {
                propName: propertyName,
                vendorizedPropName: getVendorPropName(propertyName),
                currentValue: [],
                startingValue: '',
                cachedIndex: 0,
                keyframes: []
            };
            this.keyframes.push(propertyKeyframes);
        } else {
            propertyKeyframes = this.keyframes[index];
        }

        index = linearSearch(propertyKeyframes.keyframes, function (keyframe, i, keyframes) {
            return keyframe.numericKey === progress;
        });

        var keyframe;

        var isComputed = goog.isDef(alternativeValue);

        if (index === NOT_FOUND) {
            keyframe = {
                numericKey: progress,
                propVal: propertyValue,
                isComputed: isComputed,
                alternativeValue: alternativeValue
            };
            propertyKeyframes.keyframes.push(keyframe);
            bubbleSort(propertyKeyframes.keyframes, function (first, second, index, keyframes) {
                if (first.numericKey === second.numericKey) {
                    return SORT_EQUALS;
                }
                if (first.numericKey < second.numericKey) {
                    return SORT_BIGGER;
                }
                return SORT_SMALLER;
            });
        } else {
            keyframe = propertyKeyframes.keyframes[index];
            keyframe.propVal = propertyValue.slice(0);
            keyframe.isComputed = isComputed;
            keyframe.alternativeValue = alternativeValue;
        }

    };

    /**
     * @export
     * @param {string} propertyName
     * @param {number} progress
     * @return {null|number|!Array.<number>}
     */
    Animation.prototype.getPropAt = function (propertyName, progress) {
        var index;

        index = linearSearch(/** @type {!Array} */(this.keyframes), function (propertyDescriptor, i, data) {
            return propertyDescriptor.propName === propertyName;
        });
        if (index !== NOT_FOUND) {
            var propertyDescriptor = this.keyframes[index];
            index = linearSearch(propertyDescriptor.keyframes, function (keyframe, i, keyframes) {
                return keyframe.numericKey === progress;
            });
            if (index !== NOT_FOUND) {
                var keyframe = propertyDescriptor.keyframes[index];
                return keyframe.propVal;
            }
        }

        return null;
    };

    /**
     * @param {string} propName
     * @param {!Array.<number>|string|number} currentValue
     * @param {string=} vendorizedPropName
     */
    Animation.prototype.render = function (propName, currentValue, vendorizedPropName) {
        var stringValue = goog.isString(currentValue) ?  currentValue : toStringValue(this.animationTarget, propName, currentValue, vendorizedPropName);
        setStyle(this.animationTarget, propName, stringValue, vendorizedPropName);
    };

    /**
     * @param {function (string, !Array.<number>)} newRenderer
     * @export
     */
    Animation.prototype.replaceRenderer = function (newRenderer) {
        this.render = newRenderer;
    };

    /** @type {number} */
    Animation.prototype.delayTime = DEFAULT_DELAY;

    /***
     * @export
     * @param {number} delay
     */
    Animation.prototype.setDelay = function (delay) {
        this.delayTime = delay;
    };

    /** @type {number} */
    Animation.prototype.cycleDuration = DEFAULT_DURATION;

    /**
     * @param {number} duration
     * @export
     */
    Animation.prototype.setDuration = function (duration) {
        this.cycleDuration = duration;
    };

    /** @type {number} */
    Animation.prototype.iterations = DEFAULT_ITERATIONS;

    /** @type {number} */
    Animation.prototype.integralIterations = DEFAULT_INTEGRAL_ITERATIONS;

    /**
     * @export
     * @param {number} iterations
     */
    Animation.prototype.setIterations = function (iterations) {
        if (iterations === Number.POSITIVE_INFINITY) {
            this.iterations = this.integralIterations = Number.POSITIVE_INFINITY;
        } else {
            if (isFinite(iterations) && iterations >= 0) {
                this.iterations = iterations;
                this.integralIterations = Math.floor(iterations);
            }
        }
    };

    /** @type {boolean} */
    Animation.prototype.isAlternated = DEFAULT_IS_ALTERNATED;

    /** @type {boolean} */
    Animation.prototype.isReversed = DEFAULT_IS_REVERSED;

    /**
     * @export
     * @param {number} binaryDirection
     */
    Animation.prototype.setDirection = function (binaryDirection) {
        this.isAlternated = (binaryDirection & DIRECTION_ALTERNATE) !== 0;
        this.isReversed = (binaryDirection & DIRECTION_REVERSE) !== 0;
    };

    /**
     * @export
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
     * @export
     * @param {number} binaryFillMode
     */
    Animation.prototype.setFillMode = function (binaryFillMode) {
        this.fillsForwards = (binaryFillMode & FILLS_FORWARDS) !== 0;
        this.fillsBackwards = (binaryFillMode & FILLS_BACKWARDS) !== 0;
    };

    /**
     * @export
     * @return {number}
     */
    Animation.prototype.getFillMode = function () {
        var binFillMode = 0;
        if (this.fillsForwards) {
            binFillMode &= FILLS_FORWARDS;
        }
        if (this.fillsBackwards) {
            binFillMode &= FILLS_BACKWARDS;
        }
        return binFillMode;
    };

    /** @type {number} */
    Animation.prototype.elapsedTime = 0;

    /** @type {!(Easing|CubicBezier|Steps)} */
    Animation.prototype.smoothing = DEFAULT_EASING;

    /**
     * @param {!(Easing|CubicBezier|Steps)} easing
     * @export
     */
    Animation.prototype.setEasing = function (easing) {
        this.smoothing = easing;
    };

    /**
     * @return {!(CubicBezier|Steps|Easing)}
     * @export
     */
    Animation.prototype.getEasing = function () {
        return this.smoothing;
    };

    /** @type {number} */
    Animation.prototype.animationProgress = 0;

    /** @type {boolean} */
    Animation.prototype.isOnStartFired = false;

    /** @type {number} */
    Animation.prototype.fractionalTime = 0;

    /** @type {number} */
    Animation.prototype.previousIteration = 0;

    /** @type {number} */
    Animation.prototype.currentIteration = 0;

    /**
     * @export
     * @return {number}
     */
    Animation.prototype.getFractionalTime = function () {
        return this.fractionalTime;
    };

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
                if (this.onstart !== goog.nullFunction) {
                    this.onstart();
                }
            } else if (this.onstep !== goog.nullFunction && this.fractionalTime !== 0) {
                this.onstep();
            }
        } else {
            this.stop();
            if (this.oncomplete !== goog.nullFunction) {
                this.oncomplete();
            }
        }
    };

    Animation.prototype.update = function () {

        var propertyKeyframes, propertyDescriptor;
        var properties = this.keyframes;
        var globalEasing = null;
        var localEasing, relativeFractionalTime;
        var leftKeyframe, rightKeyframe;

        for (var i = 0; i < properties.length; i++) {
            propertyDescriptor = properties[i];
            propertyKeyframes = propertyDescriptor.keyframes;

            leftKeyframe = propertyKeyframes[propertyDescriptor.cachedIndex];
            rightKeyframe = propertyKeyframes[propertyDescriptor.cachedIndex + 1];

            // Поиск двух ключевых кадров для текущего прогресса
            if (leftKeyframe.numericKey > this.fractionalTime || this.fractionalTime >= rightKeyframe.numericKey) {
                do {
                    if (!rightKeyframe || leftKeyframe.numericKey > this.fractionalTime) {
                        propertyDescriptor.cachedIndex--;
                    }
                    if (rightKeyframe.numericKey < this.fractionalTime) {
                        propertyDescriptor.cachedIndex++;
                    }
                    leftKeyframe = propertyKeyframes[propertyDescriptor.cachedIndex];
                    rightKeyframe = propertyKeyframes[propertyDescriptor.cachedIndex + 1];
                } while (leftKeyframe.numericKey > this.fractionalTime || rightKeyframe.numericKey < this.fractionalTime);
            }

            // Прогресс относительно двух ключевых кадров
            if (leftKeyframe.numericKey === MINIMAL_PROGRESS && rightKeyframe.numericKey === MAXIMAL_PROGRESS) {
                relativeFractionalTime = this.fractionalTime;
            } else {
                relativeFractionalTime = (this.fractionalTime - leftKeyframe.numericKey) / (rightKeyframe.numericKey - leftKeyframe.numericKey);
            }

            if (relativeFractionalTime === MINIMAL_PROGRESS || relativeFractionalTime === MAXIMAL_PROGRESS) {
                // В начале и в конце (прогресс 0.0 и 1.0) значение смягчения всегда равно прогрессу
                // Вычислять промежуточное значение не требуется.
                //localEasing = relativeFractionalTime;
                //leftKeyframe = rightKeyframe = relativeFractionalTime === MINIMAL_PROGRESS ? leftKeyframe : rightKeyframe;
                var alternativeKeyframe = relativeFractionalTime === MINIMAL_PROGRESS ? leftKeyframe : rightKeyframe;
                if (alternativeKeyframe.isComputed) {
                    this.render(propertyDescriptor.propName, leftKeyframe.alternativeValue, propertyDescriptor.vendorizedPropName);
                }
            } else if (relativeFractionalTime === this.fractionalTime) {
                if (goog.isNull(globalEasing)) {
                    globalEasing = this.smoothing.compute(relativeFractionalTime)
                }
                localEasing = globalEasing;
            } else {
                localEasing = this.smoothing.compute(relativeFractionalTime);
            }

            if ((!alternativeKeyframe || !alternativeKeyframe.isComputed) && blend(leftKeyframe.propVal, rightKeyframe.propVal, localEasing, propertyDescriptor.currentValue)) {
                // Отрисовываем в том случае, если значение свойства изменено
                this.render(propertyDescriptor.propName, propertyDescriptor.currentValue, propertyDescriptor.vendorizedPropName);
            }

        }
    };

    Animation.prototype.toString = function () {
        return this.animId;
    };

    /** @type {number} */
    Animation.prototype.tickerId;

    /** @export */
    Animation.prototype.start = function () {
        this.elapsedTime = 0;

        if (this.fillsBackwards) {
            this.update();
        }

        if (this.delayTime <= 0) {
            if (this.onstart !== goog.nullFunction) {
                this.onstart();
            }
        }

        this.resume();
    };

    /** @export */
    Animation.prototype.stop = function () {
        if (this.fillsForwards) {
            this.fractionalTime = 1;
            this.update();
        }
        this.pause();
    };

    /** @export */
    Animation.prototype.resume = function () {
        var self = this;
        this.tickerId = Ticker.on(function (delta) {
            self.tick(delta);
        });
    };

    /** @export */
    Animation.prototype.pause = function () {
        Ticker.off(this.tickerId);
    };

    /** @type {boolean} */
    Animation.prototype.usesCSS3;

    /**
     * @param {boolean} value
     * @export
     */
    Animation.prototype.setClassicMode = function (value) {
        this.usesCSS3 = !value;
    };

    /** @type {!Function} */
    Animation.prototype.oncomplete = goog.nullFunction;

    /**
     * @param {!Function} callback
     * @export
     */
    Animation.prototype.onComplete = function (callback) {
        this.oncomplete = callback;
    };

    /** @type {!Function} */
    Animation.prototype.onstart = goog.nullFunction;

    /**
     * @param {!Function} callback
     * @export
     */
    Animation.prototype.onStart = function (callback) {
        this.onstart = callback;
    };

    /** @type {!Function} */
    Animation.prototype.onstep = goog.nullFunction;

    /**
     * @param {!Function} callback
     * @export
     */
    Animation.prototype.onStep = function (callback) {
        this.onstep = callback;
    };

    /** @type {!Function} */
    Animation.prototype.oniteration = goog.nullFunction;

    /**
     * @param {!Function} callback
     * @export
     */
    Animation.prototype.onIteration = function (callback) {
        this.oniteration = callback;
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
     * @param {Object=} target
     * @return {Object|!AnimationWrap}
     * @export
     */
    AnimationWrap.prototype.target = function (target) {
        if (goog.isObject(target)) {
            this.setTarget(target);
            return this;
        } else {
            return this.getTarget();
        }
    };

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
     * @export
     * @param {string} propName
     * @param {(string|number|!Array.<number>)=} propValue Значение свойства. Для получения значения можно пропустить.
     * @param {(string|number)=} position Прогресс в строке или числе процентов. По умолчанию равен 100 (или "100%").
     * @return {null|number|!Array.<number>|!AnimationWrap}
     */
    AnimationWrap.prototype.propAt = function (propName, propValue, position) {
        var numericPosition = MAXIMAL_PROGRESS;
        if (goog.isDef(position)) {
            if (goog.isNumber(position)) {
                numericPosition = position;
            } else if (goog.isString(position)) {
                if (position in keyAliases) {
                    numericPosition = keyAliases[position];
                } else {
                    var matched = /** @type {string} */(position).match(cssNumericValueReg);
                    if (goog.isArray(matched) && (!matched[VALREG_DIMENSION] || matched[VALREG_DIMENSION] === PERCENT)) {
                        numericPosition = matched[VALREG_VALUE] * 1;
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
            var numericValue = toNumericValue(this.animationTarget, propName, propValue, getVendorPropName(propName));
            this.setPropAt(propName, numericValue, numericPosition, propValue);
            return this;
        } else {
            return this.getPropAt(propName, numericPosition);
        }
    };

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
     * @export
     * @param {(string|number)=} duration Алиас, время в формате CSS или миллисекунды
     * @return {number|!AnimationWrap} время в миллисекундах или текущий экземпляр
     */
    AnimationWrap.prototype.duration = function (duration) {
        var numericDuration;
        if (goog.isDef(duration)) {
            if (goog.isString(duration)) {
                if (duration in durationAliases) {
                    numericDuration = durationAliases[duration];
                } else {
                    var matched = /** @type {string} */(duration).match(cssNumericValueReg);
                    numericDuration = matched[VALREG_VALUE] * (matched[VALREG_DIMENSION] === 's' ? 1e3:1);
                }
                if (numericDuration >= 0) {
                    this.setDuration(numericDuration);
                }
            }
            return this;
        } else {
            return this.cycleDuration;
        }
    };

    /**
     * Установка задержки старта.
     * Если значение положительное, старт анимации будет отложен на численное представление.
     * Если отрицательное, то при старте будет считаться, что прошло уже указанное по модулю время со старта.
     * @export
     * @param {(number|string)=} delay Строка времени в формате CSS или число миллисекунд.
     * @return {number|!AnimationWrap}
     */
    AnimationWrap.prototype.delay = function (delay) {
        var numericDelay;
        if (goog.isDef(delay)) {
            if (goog.isNumber(delay)) {
                numericDelay = delay | 0;
            } else if (goog.isString(delay)) {
                var matched = /** @type {string} */(delay).match(cssNumericValueReg);
                numericDelay = matched[VALREG_VALUE] * (matched[VALREG_DIMENSION] === 's' ? 1e3:1);
            }
            if (isFinite(numericDelay)) {
                this.setDelay(numericDelay);
            }
            return this;
        } else {
            return this.delayTime;
        }
    };

    var ITERATIONCOUNT_INFINITE = 'infinite';

    /**
     * Установка числа проходов цикла анимации.
     * Значение "infinite" соответствует бесконечному числу повторений анимации.
     * Дробные значения соответствуют конечному значению прогресса по проходу.
     * Отрицательные значения игнорируются.
     * @export
     * @param {(number|string)=} iterations
     * @return {number|!AnimationWrap}
     */
    AnimationWrap.prototype.iterationCount = function (iterations) {

        /** @type {number} */
        var numericIterations;

        if (goog.isDef(iterations)) {
            if (iterations === ITERATIONCOUNT_INFINITE) {
                numericIterations = Number.POSITIVE_INFINITY;
            } else {
                numericIterations = iterations * 1;
            }
            this.setIterations(numericIterations);
            return this;
        } else {
            return this.iterations;
        }
    };

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
     * @export
     * @param {(string|number)=} direction
     * @return {number|!AnimationWrap}
     */
    AnimationWrap.prototype.direction = function (direction) {
        var binaryDirection = NOT_FOUND;
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
            return this.getDirection();
        }
    };

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
     * @export
     * @param {(string|number)=} fillMode
     * @return {number|!AnimationWrap}
     */
    AnimationWrap.prototype.fillMode = function (fillMode) {
        var binFillMode = NOT_FOUND;
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
            return this.getFillMode();
        }
    };

    /**
     * Установка или получение смягчения анимации.
     * (!) Абсциссы первой и второй точек для кубической кривой Безье должны принадлежать промежутку [0, 1].
     * (!) Число ступеней в Steps всегда целочисленное.
     * @export
     * @param {(string|!Array.<number>|!Easing|!CubicBezier|!Steps)=} easing временная функция CSS, алиас смягчения или массив точек (2 - Steps, 4 - CubicBezier)
     * @return {!(CubicBezier|Steps|Easing|AnimationWrap)}
     */
    AnimationWrap.prototype.easing = function (easing) {
        var timingFunction;
        if (goog.isDef(easing)) {
            timingFunction = EasingRegistry.request(easing);
            if (!goog.isNull(timingFunction)) {
                this.setEasing(timingFunction);
            }
            return this;
        } else {
            return this.getEasing();
        }
    };

/*---------------------------------------*/

    /**
     * "Одноразовая" функция, позволяющая анимировать без муторного создания объектов в один вызов
     * Формат записи свойств и вообще аргументов - как в jQuery (для удобства)
     * Типы свойств и параметров - как в AnimateWrap.
     * @param {!Element} element Элемент для анимирования
     * @param {!Object} properties Свойства для анимирования. Ключ - имя свойства, значение - конечная величина свойства.
     * @param {(number|string)=} duration Продолжительность в миллисекундах (число) или в формате CSS Timestring (строка)
     * @param {(string|!Array.<number>|!Easing|!CubicBezier|!Steps)=} easing Смягчение всей анимации (алиас, CSS Timefunction, аргументы к временной функции или сама функция)
     * @param {(function (this: AnimationWrap))=} complete Обработчик события завершения анимации
     * @return {!AnimationWrap}
     */
    function animate (element, properties, duration, easing, complete) {
        var self = new AnimationWrap();

        var progress;

        if (arguments.length === 3) {
            duration = properties['duration'];
            easing = properties['easing'];
            progress = properties['progress'];
            complete = properties['complete'];
            self.delay(properties['delay']);
            self.fillMode(properties['fillMode']);
            self.direction(properties['direction']);
            self.iterationCount(properties['iterationCount']);
        }

        self.duration(duration);
        self.easing(easing);
        if (goog.isFunction(progress)) {
            self.onStep(progress);
        }
        if (goog.isFunction(complete)) {
            self.onComplete(complete);
        }

        for (var propName in properties) {
            self.propAt(propName, properties[propName]);
        }

        self.start();

        return self;
    }

/*---------------------------------------*/

    var melAnim = animate;
    goog.global['melAnim'] = melAnim;
    melAnim['Animation'] = AnimationWrap;
    melAnim['Ticker'] = Ticker;
