module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-shell');
	grunt.initConfig({
		shell: {
			bowerInstall: {
				command: 'bower install'
			},
			runServer: {
				command: 'nodemon server'
			}	
		}
	});
	grunt.registerTask('default', ['shell']);
}