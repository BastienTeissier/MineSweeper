(function() {
  'use strict';

  angular.module('app')

/**
  This service give the size and number of bomb for each difficulty :
  - x : size on x side
  - y : size on y side
  - b : number f bomb in the grid
*/
    .service('difficultyConfigServices', difficultyConfigServices);

    function difficultyConfigServices(){
      this.easy = {
        x: 8,
        y: 8,
        b: 10
      };
      this.medium = {
        x: 16,
        y: 16,
        b: 40
      };
      this.hard = {
        x: 16,
        y: 30,
        b: 99
      };
    }
})();
