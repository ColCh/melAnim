module.exports = function (grunt) {

    grunt.initConfig({


        options: {
            compilerPath: '../compiler-latest/compiler.jar'
        },

        meta: {
            version: '0.1.0',
            banner: '/*! melAnim - v<%= meta.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
                '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
                'ColCh; Licensed MIT */'
        },

        concat: {
            dist: {
                dest:'dist/mel-anim.compiled.js',
                separator: '\n\n\t/*---------------------------------------*/\n\n',
                src:[
                    '<banner:meta.banner>',

                    '<file_strip_banner:src/start.js>',

                    '<file_strip_banner:src/begin.js>',

                    '<file_strip_banner:src/utils.js>',
                    '<file_strip_banner:src/hooks.js>',

                    '<file_strip_banner:src/constants.js>',
                    '<file_strip_banner:src/aliases.js>',

                    '<file_strip_banner:src/animate_wrap.js>',

                    '<file_strip_banner:src/animate_css.js>',
                    '<file_strip_banner:src/animate_classic.js>',

                    '<file_strip_banner:src/end.js>'
                ]
            }
        },

        closureCompiler: {
            simple: {
                closureCompiler: '<config:options.compilerPath>',
                js: '<config:concat.dist.dest>',
                output_file: 'dist/mel-anim.min.js',
                options: {
                    warning_level: 'VERBOSE',
                    language_in: 'ECMASCRIPT5_STRICT',
                    compilation_level: 'SIMPLE_OPTIMIZATIONS'
                }
            },
            advanced: {
                    closureCompiler: '<config:options.compilerPath>',
                    js: '<config:concat.dist.dest>',
                    output_file: 'dist/mel-anim.adv.js',
                    options: {
                        warning_level: 'VERBOSE',
                        language_in: 'ECMASCRIPT5_STRICT',
                        externs: ['externs.js'],
                        compilation_level: 'ADVANCED_OPTIMIZATIONS',
                        use_types_for_optimization: "",
                        output_wrapper: "'!(function(){%output%});'"
                    }
            }
        }

    });

    grunt.registerTask('default', 'concat');
    grunt.registerTask('min', 'closureCompiler:simple');
    grunt.registerTask('adv-min', 'closureCompiler:advanced');
    grunt.loadNpmTasks('grunt-closure-tools');
};
