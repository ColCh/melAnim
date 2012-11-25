/*global module:false*/
module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        meta:{
            version:'0.1.0',
            banner:'/*! melAnim - v<%= meta.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
                '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
                'ColCh; Licensed MIT */'
        },
        lint:{
            files:['grunt.js', 'src/**/*.js', 'test/**/*.js']
        },
        qunit:{
            files:['test/**/*.html']
        },
        concat:{
            dist:{
                src:['<banner:meta.banner>', '<file_strip_banner:src/start.js>', '<file_strip_banner:src/utils.js>', '<file_strip_banner:src/constants.js>', '<file_strip_banner:src/begin.js>', '<file_strip_banner:src/animate_wrap.js>', '<file_strip_banner:src/animate_animations.js>', '<file_strip_banner:src/animate_classic.js>', '<file_strip_banner:src/hooks.js>', '<file_strip_banner:src/end.js>'],
                dest:'dist/mel-anim.compiled.js',
                separator: '\n/*---------------------------------------*/\n'
            }
        },
        min:{
            dist:{
                src:['<banner:meta.banner>', '<config:concat.dist.dest>'],
                dest:'dist/mel-anim.min.js'
            }
        },
        watch:{
            files:'<config:lint.files>',
            tasks:'lint qunit'
        },
        server:{
            port:9595
        }
    });

    // Default task.
    grunt.registerTask('default', 'concat');

    grunt.registerTask("server", "Start a web server", function () {
        var connect = require("connect");
        var port = grunt.config("server.port") || 8000;
        var base = require("path").resolve(".");
        var cb = this.async();

        grunt.log.writeln("Starting web server at port " + port);

        connect().
        	use(connect.static(base)).
				use(function (req, res) {
					res.removeHeader("Content-Encoding");
                    grunt.task.run("concat");
					res.end(grunt.file.read(grunt.config("concat.dist.dest")));
				}).
					listen(port);

    });

};
