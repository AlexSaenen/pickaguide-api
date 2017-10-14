'use strict';

module.exports = function(grunt) {

  grunt.initConfig({
    // apidoc configuration
    apidoc: {
      pickaguide: {
        src: "api/routes/",
        dest: "docs/",
        options: {
          debug: false,
          includeFilters: [ ".*\\.js$" ],
          excludeFilters: [ "node_modules/" ]
        }
      }
    }
  });

  // Tasks
  grunt.loadNpmTasks('grunt-apidoc');

  // Tasks: Test
  grunt.registerTask('default', ['apidoc']);

};
