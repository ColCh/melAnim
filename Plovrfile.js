 {
	 
	 "pretty-print": true,
	 
	 "define": {

     },
	 
	 "id": "adv",

	 "inputs": "./dist/mel-anim.compiled.js",
	 "output-file": "./dist/mel-anim.adv.js",
     "output-wrapper": "(function(){%output%})();",
     "closure-library": "./goog-base.js",
	 
	 "mode": "ADVANCED",
	 "level": "VERBOSE",
	 
	 "checks": {
	 	 //"checkTypes": "ERROR",
         "globalThis": "OFF"
	 },

	 "externs": [ "externs.js" ],
	 "experimental-exclude-closure-library": true,
	 "output-charset": "UTF-8",

	 
	 "experimental-compiler-options": {

         "externExportsPath": "./melAnim-experns.js",
         "externExports": true,

         "closurePass": true,
		 "languageIn": "ECMASCRIPT5_STRICT",
		 "assumeStrictThis": true,
		 "aggressiveVarCheck": "WARNING",
		 "checkSuspiciousCode": true,
		 "checkControlStructures": true,
		 "checkTypes": true,
//		 "tightenTypes": true,
		 "checkRequires": "OFF",
		 "checkProvides": "OFF",
		 "foldConstants": true,
		 "coalesceVariableNames": true,
		 "deadAssignmentElimination": true,
		 "inlineConstantVars": true,
		 "inlineConstantVars": true,
		 "inlineFunctions": true,
		 "inlineLocalFunctions": true,
		 "inlineProperties": true,
		 "inlineGetters": true,
		 "inlineVariables": true,
		 "inlineLocalVariables": true,
		 "assumeStrictThis": true,
		 "assumeClosuresOnlyCaptureReferences": true,
		 "smartNameRemoval": true,
		 "removeDeadCode": true,
		 "extractPrototypeMemberDeclarations": true,
		 "removeUnusedPrototypeProperties": true,
		 "removeUnusedClassProperties": true,
		 "removeUnusedVars": true,
		 "removeUnusedLocalVars": true,
		 "aliasExternals": true,
		 "collapseVariableDeclarations": true,
		 "groupVariableDeclarations": true,
		 "collapseAnonymousFunctions": true,
		 "convertToDottedProperties": true,
		 "rewriteFunctionExpressions": true,

		 "optimizeParameters": true,
		 "optimizeReturns": true,
         "optimizeCalls": true,
         "chainCalls": true,

//         "runtimeTypeCheck": true,
         "moveFunctionDeclarations": true,
//         "generateExports": true,
         "markAsCompiled": true

	 }
	 
 }