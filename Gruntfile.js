module.exports = function (grunt) {

    grunt.initConfig({

        meta: {
            version: '0.1.0'
        },

        concat: {
            options: {
                separator: '\n\n/*---------------------------------------*/\n\n',
                banner: '\n/*! melAnim - v<%= meta.version %> - ' +
                    '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
                    '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
                    'ColCh; Licensed MIT ' +
                    '*/\n'
            },
            dist: {

                dest:'dist/mel-anim.compiled.js',

                src:[
                    // Booleans for unreachable code & features
                    'src/flags.js',

                    // Starting the Main Closure
                    'src/start.js',

                    // Main useful variables & shortcuts
                    'src/begin.js',

                    // Mini-framework with funcs like addClass et cetera
                    'src/utils.js',
                    // Useful hooks for making support a wide range of props
                    'src/hooks.js',

                    // Constants are using funcs from utils. File with main definitions
                    'src/constants.js',
                    // Aliases for times, timing functions and so on
                    'src/aliases.js',

                    // Class, that uses one main interface for both CSS & JS anims
                    'src/animate_wrap.js',

                    // Class for CSS3 Animations
                    'src/animate_css.js',
                    // Class for JavaScript fallback
                    'src/animate_classic.js',

                    // End Main Closure
                    'src/end.js'
                ]
            }
        }/*,

        closureCompiler: {
            options: {
                src: 'dist/mel-anim.compiled.js',
                compilerFile: '../compiler-latest/compiler.jar',
                checkModified: false,
                compilerOpts: {
                    warning_level: 'VERBOSE',
                    language_in: 'ECMASCRIPT5_STRICT',
                    externs: ['externs.js'],
                    compilation_level: 'ADVANCED_OPTIMIZATIONS',
                    use_types_for_optimization: null,
                    summary_detail_level: 3,
                    output_wrapper: "'(function(){%output%})();'",
                    define: ["'ENABLE_DEBUG=false'"]
                }
            },
            advanced: {
                src: 'dist/mel-anim.compiled.js',
                dest: 'dist/mel-anim.adv.js'
            }
        }*/

    });

    //grunt.loadNpmTasks('grunt-closure-tools');
    grunt.loadNpmTasks('grunt-contrib-concat');

    //grunt.registerTask('adv-min', ['closureCompiler:advanced']);
    grunt.registerTask('default', ['concat']);


};
