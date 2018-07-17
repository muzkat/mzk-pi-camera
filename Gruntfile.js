module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        comments: {
            js: {
                // Target-specific file lists and/or options go here.
                options: {
                    singleline: true,
                    multiline: true,
                    keepSpecialComments: false
                },
                src: ['src/*.js'] // files to remove comments from
            },
        },

        clean: {
            folder: ['dist/'],
        },

        concat: {
            options: {
                stripBanners: true,
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %> */',
            },
            dist: {
                src: ['src/**/*.js'],
                dest: 'dist/concat.js',
            },
        },

        watch: {
            scripts: {
                files: ['src/**/*.js'],
                tasks: ['dev'],
                options: {
                    spawn: false,
                    livereload: true
                }
            }
        },

        browserify: {
            dev: {
                src: ['dist/concat.js'],
                dest: './public/js/bundle.js',
                options: {
                    // watch : true, // use watchify for incremental builds!
                    //  keepAlive : true, // watchify will exit unless task is kept alive
                    browserifyOptions: {
                        debug: true // source mapping
                    }
                }
            },
            dist: {
                src: ["<%= paths.src %>"],
                dest: "<%= paths.dest %>"
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-stripcomments');


    grunt.registerTask("dev", ["browserify:dev"]);
    grunt.registerTask('default', ['dev', 'watch']);
    grunt.registerTask('build', ['concat', 'comments', 'dev', 'clean']);
};