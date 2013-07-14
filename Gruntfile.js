module.exports = function (grunt) {

    grunt.initConfig({

        meta: {
            version: '0.1.0'
        },

        concat: {
            options: {
                separator: '\n\n/*---------------------------------------*/\n\n',
                banner: '/** melAnim - v<%= meta.version %> - ' +
                    '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
                    '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
                    'ColCh; Licensed GPLv3 ' +
                    '*/\n'
            },
            dist: {

                dest:'dist/mel-anim.compiled.js',

                src:[
                    'goog-base.js',
                    'src/begin.js',
//                    'src/constants.js',
                    'src/utils.js',
                    'src/abstractions.js',
                    'src/hooks.js',
                    'src/aliases.js',
                    'src/defaults.js',
                    'src/animate_class.js',
                    'src/animate_wrap.js',
                    'src/animate_func.js',
                    'src/exports.js',
                ]
            }
        },

        closureCompiler: {
            options: {
                src: 'dist/mel-anim.compiled.js',
                //compilerFile: '../compiler-latest/compiler.jar',
                compilerFile: '/usr/share/java/closure-compiler/closure-compiler.jar',
                checkModified: false,
                compilerOpts: {
                    formatting: 'PRETTY_PRINT',
                    language_in: 'ECMASCRIPT5_STRICT',
                    externs: ['externs.js'],
                    compilation_level: 'ADVANCED_OPTIMIZATIONS',
                    use_types_for_optimization: null,
                    summary_detail_level: 3,
                    //define: ["'ENABLE_DEBUG=false'"],
                    //create_source_map: 'melAnim.js.map',
                    warning_level: 'VERBOSE'//,
                    //third_party: null
                    //property_map_output_file: 'property-map.txt',
                    //variable_map_output_file: 'variable-map.txt'
                    //output_wrapper: "'(function(){%output%})();'"
                }
            },
            advanced: {
                src: 'dist/mel-anim.compiled.js',
                dest: 'dist/mel-anim.adv.js'
            }
        }

    });

    grunt.loadNpmTasks('grunt-closure-tools');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('adv-min', ['closureCompiler:advanced']);
    grunt.registerTask('default', ['concat']);


};
