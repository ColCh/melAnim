module.exports = function (grunt) {

    grunt.initConfig({

        options: {
            compilerPath: '../compiler-latest/compiler.jar',
            enable_debug: false
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

                    '<file_strip_banner:src/flags.js>',

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
                    compilation_level: 'SIMPLE_OPTIMIZATIONS',
                    define: ["ENABLE_DEBUG"]
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
                        output_wrapper: '"(function(){%output%})();"',
                        define: ["ENABLE_DEBUG"]
                    }
            }
        }

    });

    grunt.loadNpmTasks('grunt-closure-tools');

    grunt.registerTask('default', 'concat');

    grunt.registerTask('debug', 'Make verbose script for debugging', function () {
        grunt.config("options.enable_debug", true);
        grunt.log.writeln("Build marked as debuggable");
    });

    grunt.registerTask('min', 'Minify script using Google Closure Compiler simple optimizations.', function () {
        grunt.config("closureCompiler.simple.options.define").forEach(function (defining, index, array) {
            if (defining.indexOf("ENABLE_DEBUG") !== -1) {
                array[index] = '"ENABLE_DEBUG=' + grunt.config("options.enable_debug") + '"';
            }
        });
        grunt.task.run('closureCompiler:simple');
    });

    grunt.registerTask('adv-min', 'Minify script using Google Closure Compiler ADVANCED OPTIMIZATIONS.', function () {
        grunt.config("closureCompiler.advanced.options.define").forEach(function (defining, index, array) {
            if (defining.indexOf("ENABLE_DEBUG") !== -1) {
                array[index] = '"ENABLE_DEBUG=' + grunt.config("options.enable_debug") + '"';
            }
        });
        grunt.task.run('closureCompiler:advanced');
    });
};
