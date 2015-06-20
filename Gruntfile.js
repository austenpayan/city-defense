module.exports = function(grunt) {

    // 1. All configuration goes here 
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            dist : {
                src : [
                    'js/plugins.js',
                    'js/main.js'
                ],
                dest: 'production/app.js'
            }
        },

        babel : {
            options: {
                sourceMap: true
            },
            dist: {
                files: {
                    "dist/app.js": "js/main.js"
                }
            }
        },
        sass: {
            dist: {
                options: {
                    style:'compressed'
                },
                files: {
                    'css/style.css' : 'css/style.scss'
                }
            }
        },
        cssmin : {
            combine : {
                files : {
                    'production/app.css' : ['css/style.css', 'css/reset.css']
                }
            }
        },
        watch: {
            
            scripts: {
                files: ['js/*.js'],
                tasks: ['babel'],
                options: {
                    spawn: false
                }
            },
            css : {
                files : ['css/*.scss'],
                tasks : ['sass', 'cssmin'],
                options : {
                    spawn : false
                }
            }
        }


    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    // grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-babel');

    grunt.registerTask('default', ['sass', 'cssmin','babel', 'watch']);

};