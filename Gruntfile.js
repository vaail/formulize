module.exports = function (grunt) {
    'use strict';
    // Project configuration
    grunt.initConfig({
        // Metadata
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
            ' Licensed <%= props.license %> */\n',
        // Task configuration
        concat: {
            dist: {
                src: ['src/js/pignose.formula.js', 'src/js/FormulaParser/src/formula.parser.js'],
                dest: 'src/js/pignose.formula.build.js'
            }
        },
        uglify: {
            options: {
                banner: '//================================================================================\n' + 
                        '// [<%= pkg.name %>]\n' +
                        '// version: <%= pkg.version %>\n' +
                        '// update: <%= grunt.template.today("yyyy.mm.dd") %>\n' + 
                        '//================================================================================\n\n'
            },
            dist: {
                files: {
                    'dist/pignose.formula.min.js': ['src/js/pignose.formula.build.js']
                }
            },
        },
        cssmin: {
          options: {
            banner: '//================================================================================\n' + 
                    '// [<%= pkg.name %>]\n' +
                    '// version: <%= pkg.version %>\n' +
                    '// update: <%= grunt.template.today("yyyy.mm.dd") %>\n' + 
                    '//================================================================================\n\n'
          },
          dist: {
            files: {
              'dist/pignose.formula.min.css': ['src/css/**.css']
            }
          }
        },
        jshint: {
          files: ['Gruntfile.js', 'src/js/pignose.formula.js'],
          options: {
            // options here to override JSHint defaults
            globals: {
              jQuery: true,
              console: true,
              module: true,
              document: true
            }
          }
        },
        csslint: {
          dist: ['src/css/**.css']
        },
        qunit: {
            files: ['test/**/*.html']
        },
        watch: {
            scripts: {
                files: 'src/js/pignose.formula.js',
                tasks: ['default'],
                options: {
                    interrupt: true
                }
            }
        }
    });

    // These plugins provide necessary tasks
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-csslint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task
    grunt.registerTask('default', ['concat', 'jshint', 'csslint', 'cssmin', 'uglify']);
    grunt.registerTask('build', ['default', 'watch']);
    grunt.registerTask('test', ['concat', 'jshint', 'csslint']);
};

