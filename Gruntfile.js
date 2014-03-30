module.exports = function(grunt) {

	//Initializing the configuration object
	grunt.initConfig({

		// Task configuration
		copy: {
			dist: {
				files: [
					{
						expand: true,
						cwd: './.bower_components/bootstrap/dist/css',
						src: 'bootstrap*.min.css',
						dest: './public/css'
					},
					{
						expand: true,
						cwd: './.bower_components/pnotify',
						src: 'jquery.pnotify.default.css',
						dest: './public/css'
					},
					{
						expand: true,
						cwd: './.bower_components/font-awesome/css',
						src: 'font-awesome.min.css',
						dest: './public/css'
					},
					{
						expand: true,
						cwd: './.bower_components/font-awesome/fonts',
						src: '*',
						dest: './public/fonts'
					}
				]
			}
		},
		concat: {
			options: {
				separator: '\r;',
			},
			libs: {
				src: [
					'./.bower_components/json2/json2.js',
					'./.bower_components/jquery/dist/jquery.js',
					'./.bower_components/jquery-cookie/jquery.cookie.js',
					'./.bower_components/pnotify/jquery.pnotify.js',
					'./.bower_components/lodash/dist/lodash.js',
					'./.bower_components/backbone/backbone.js',
					'./.bower_components/marionette/lib/backbone.marionette.js',
					'./.bower_components/bootstrap/dist/js/bootstrap.js',
					'./.bower_components/bootstrap3-typeahead/bootstrap3-typeahead.js'
				],
				dest: './public/js/libs.js'
			}
		},
		uglify: {
			options: {
				mangle: true
			},
			libs: {
				files: {
					'./public/js/libs.js': './public/js/libs.js'
				}
			}
		}
	});

	// Plugin loading
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('default', ['copy', 'concat', 'uglify']);
};
