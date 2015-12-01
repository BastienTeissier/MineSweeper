(function() {
  'use strict';

  angular.module('app', [])
    .controller('MainController', function($scope, $interval) {

    $scope.grid = [];
    $scope.time=0;
    $scope.timer = undefined;

    $scope.minesCount = 0;
    $scope.caseFlagged = 0;
    $scope.play = true;
    $scope.success = false;


    init(16,16,40);

    $scope.init = init;

    function init(x,y,n){
      $scope.grid=[];
      $scope.play = true;
      $scope.timer=undefined;
      $scope.time = 0;
      $scope.minesCount = n;
      $scope.caseFlagged = 0;
      for(var i=0; i<=x+1; i++){
        var temp = [];
        for(var j=0; j<=y+1; j++){
          temp.push(
            {
              state: 0,
              revealed: false,
              flaged: false,
              x: i,
              y: j
            }
          );
        }
        $scope.grid.push(temp);
      }
      console.log($scope.grid);

      $scope.mines = [];
      var k=0;
      while(k<n){
        var a = Math.floor((Math.random() * x) + 1);
        var b = Math.floor((Math.random() * y) + 1);
        if($scope.grid[a][b].state!=-1){
          $scope.mines.push(
            {
              x: a,
              y: b
            }
          );
          $scope.grid[a][b].state=-1;
          for(var e=-1; e<=1; e++){
            for(var f = -1; f<=1; f++){
              if($scope.grid[a+e][b+f].state != -1){
                $scope.grid[a+e][b+f].state = $scope.grid[a+e][b+f].state + 1;
              }
            }
          }
          k++;
        }
      }
      console.log($scope.mines);

      for(var i = 0;i<=x+1;i++){
        $scope.grid[i][0].state = -2;
        $scope.grid[i][y+1].state = -2;
      }

      for(var i = 1; i<=y; i++){
        $scope.grid[0][i].state = -2;
        $scope.grid[x+1][i].state = -2;
      }
    }

    $scope.onClick = onClick;

    function onClick(x,y){
      console.log('x : ' + x);
      console.log('y : ' + y);
      console.log($scope.grid[x][y].state);
      if($scope.timer==undefined){
        $scope.timer = $interval(timer, 10);
      }
      if($scope.grid[x][y].state == -1){
        $scope.play = false;
        $interval.cancel($scope.timer);
        console.log('Game over');
      }
      else if ($scope.grid[x][y].state >= 0) {
        revealCase(x,y);
        $scope.success = isSuccess;
      }
    }

    function timer(){
      $scope.time = $scope.time + 0.01;
    }

/**
  Améliorer cet algo tout pourri
*/

    function revealCase(x, y){
      var item = $scope.grid[x][y];
      if(!item.revealed){
        $scope.grid[x][y].revealed = true;
        if(item.state == 0){
          for(var e=-1; e<=1; e++){
            for(var f = -1; f<=1; f++){
                console.log(x+e);
                console.log(y+f);
                revealCase(x+e,y+f);
            }
          }
        }
      }
    }

    $scope.onRightClick = onRightClick;

    function onRightClick(x,y){
      var temp = $scope.grid[x][y].flaged;
      if(temp){
        $scope.caseFlagged--;
      }
      else{
        $scope.caseFlagged++;
      }
      $scope.grid[x][y].flaged = !temp
      $scope.success = isSuccess();
    }

    function isSuccess(){
      if(isSuccessFlag() || isSuccessGrid()){
        $interval.cancel($scope.timer);
        return true;
      }
      else{
        return false;
      }
    }

    function isSuccessFlag(){
      var success = ($scope.caseFlagged==10);
      var len = $scope.mines.length;
      var i= 0;
      while(success && (i<len)){
        var item = $scope.mines[i];
        success = success && $scope.grid[item.x][item.y].flaged;
        i++;
      }
      return success;
    }

    function isSuccessGrid(){
      var success = true;
      var len = $scope.grid.length - 1;
      var i = 1;
      while(success && (i<len)){
        var j = 1;
        var leng = $scope.grid[i].length - 1;
        while(success && (j<leng)){
          var item = $scope.grid[i][j]
          success = success && ((item.state==-1 && !item.revealed) || (item.revealed))
          j++;
        }
        i++;
      }
      return success;
    }
  })

  .directive('ngRightClick', function($parse) {
    return function(scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();
                fn(scope, {$event:event});
            });
        });
    };
});

})();
