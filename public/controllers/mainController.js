(function() {
  'use strict';

  angular.module('app')
    .controller('MainController', ['$scope', '$interval', 'difficultyConfigServices', function($scope, $interval, difficultyConfigServices) {

    $scope.grid = []; // Matrix containing the minesweeper grid
    $scope.time=0; // Time set to 0
    $scope.timer = undefined; // Timer that will count time

    $scope.minesCount = 0; // Number of mine in the game
    $scope.caseFlagged = 0; // Number of flagged case
    $scope.play = true; // Boolean to know if the game as started/ended
    $scope.success = false; // Boolean set to true in case of success

    $scope.onClick = onClick; // Function called when a case is clicked
    $scope.onRightClick = onRightClick; // Function called when a case is right-clicked

    $scope.initEasy = initEasy; // Initialize the grid to the easy level
    $scope.initMedium = initMedium; // Initialize the grid to the medium level
    $scope.initHard = initHard; // Initialize the grid to the hard level

    /**
      Create a first grid (medium level) when the page is loaded
    */
    init(difficultyConfigServices.medium.x,
          difficultyConfigServices.medium.y,
          difficultyConfigServices.medium.b);

    /**
      Initialize the grid to the easy level
    */
    function initEasy() {
      init(difficultyConfigServices.easy.x,
      difficultyConfigServices.easy.y,
      difficultyConfigServices.easy.b)
    };


    /**
      Initialize the grid to the medium level
    */
    function initMedium(){
      init(difficultyConfigServices.medium.x,
      difficultyConfigServices.medium.y,
      difficultyConfigServices.medium.b)
    };


    /**
      Initialize the grid to the hard level
    */
    function initHard() {
      init(difficultyConfigServices.hard.x,
      difficultyConfigServices.hard.y,
      difficultyConfigServices.hard.b)
    };

    /**
      Global initialize function
      x : size on x side
      y : size on y side
      n : number of mine
    */
    function init(x,y,n){
      // Instantiate the variables in the scope
      $scope.grid=[];
      $scope.play = true;
      $scope.success = false;
      $scope.timer=undefined;
      $scope.time = 0;
      $scope.minesCount = n;
      $scope.caseFlagged = 0;

      // Generate the matrix with empty cell
      for(var i=0; i<=x+1; i++){
        var temp = [];
        for(var j=0; j<=y+1; j++){
          temp.push( // Push the case object
            {
              state: 0, // State of the case (-1 if mined, otherwise the number of mine in its neighborhood)
              revealed: false, // If the case is revealed
              flagged: false, // If the case is flagged
              x: i, // Coordinate x
              y: j // Coordinate y
            }
          );
        }
        $scope.grid.push(temp);
      }

      // Generate the mine
      $scope.mines = [];
      var k=0;
      while(k<n){
        var a = Math.floor((Math.random() * x) + 1);// Random coordinate
        var b = Math.floor((Math.random() * y) + 1);// Random coordinate
        if($scope.grid[a][b].state!=-1){ // If the case is not a mine yet
          $scope.mines.push(
            {
              x: a,
              y: b
            }
          );
          $scope.grid[a][b].state=-1;// it becomes a mine
          for(var e=-1; e<=1; e++){ // Then for all its neighbourght
            for(var f = -1; f<=1; f++){
              if($scope.grid[a+e][b+f].state != -1){ // If they are not mines
                $scope.grid[a+e][b+f].state = $scope.grid[a+e][b+f].state + 1; // We add one to their number of mine around
              }
            }
          }
          k++;
        }
      }
      // To avoid border effect I used one more row/column on each side
      // Thy are put in a state that will not appear on the web page
      for(var i = 0;i<=x+1;i++){
        $scope.grid[i][0].state = -2;
        $scope.grid[i][y+1].state = -2;
      }

      for(var i = 1; i<=y; i++){
        $scope.grid[0][i].state = -2;
        $scope.grid[x+1][i].state = -2;
      }
    }

    /**
      Function called when a cell is clicked
    */
    function onClick(x,y){
      if($scope.timer==undefined){ // Start the timer if has not been started yet
        $scope.timer = $interval(timer, 100);
      }
      if($scope.grid[x][y].state == -1){ // If the case is a mine
        $scope.play = false; // The game stops
        $interval.cancel($scope.timer); // The timer stops
      }
      else if ($scope.grid[x][y].state >= 0) { // Otherwise
        revealCase(x,y); // Potential empty neighbors are also revealed
        $scope.success = isSuccess(); // Test if the game is completed
      }
    }

    /**
      Function that increase the time variable
    */
    function timer(){
      $scope.time = $scope.time + 1;
    }

    /**
      Function which reveals a case and its potential empty neighbors
    */
    function revealCase(x, y){
      var item = $scope.grid[x][y]; // Get the case object
      if(!item.revealed){
        $scope.grid[x][y].revealed = true; // Item revealed if he hasn't been reavealed yet
        if(item.state == 0){ // If the case is empty we try to reveal its neighbors
          for(var e=-1; e<=1; e++){
            for(var f = -1; f<=1; f++){
                revealCase(x+e,y+f);
            }
          }
        }
      }
    }


    /**
      Function called when a cell is right-clicked
      This function manages the flags
    */
    function onRightClick(x,y){
      var temp = $scope.grid[x][y].flagged;
      if(temp){
        $scope.caseFlagged--; // If the cell is flagged we decrease the number of cell flagged
      }
      else{
        $scope.caseFlagged++; // Otherwise we do the opposite
      }
      $scope.grid[x][y].flagged = !temp // We set the new flagged properties
      $scope.success = isSuccess(); // We look if it is a success
    }

    /**
      Function to know if the game is a success
      In case of success stop the timer and return true
      Otherwise do nothing and return false
    */
    function isSuccess(){
      if(isSuccessGrid()){
        $interval.cancel($scope.timer);
        return true;
      }
      else{
        return false;
      }
    }

    /**
      Return true if you hev pu the right number of flags on all the mines
      Talking with my friends it seems this is not a condition of success
    */
    function isSuccessFlag(){
      var success = ($scope.caseFlagged==$scope.minesCount); // The number of flag is the same than the number of mine
      var len = $scope.mines.length;
      var i= 0;
      while(success && (i<len)){
        var item = $scope.mines[i];
        success = success && $scope.grid[item.x][item.y].flagged; // Each mined case is also flagged
        i++;
      }
      return success;
    }

    /**
      Evaluate the success on all the grid
      return true if all the non-mined case are reavealed
      otherwise return false
    */
    function isSuccessGrid(){
      var success = true;
      var len = $scope.grid.length - 1;
      var i = 1;
      while(success && (i<len)){ // Go through the whole grid
        var j = 1;
        var leng = $scope.grid[i].length - 1;
        while(success && (j<leng)){
          var item = $scope.grid[i][j]
          success = success && ((item.state==-1 && !item.revealed) || (item.revealed)) // Check if the only non-revealed case are mines
          j++;
        }
        i++;
      }
      return success;
    }
  }])

})();
