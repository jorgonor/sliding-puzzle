'use strict';

var puzzleControllers = angular.module('puzzleControllers', []);

puzzleControllers.controller('IndexCtrl', function($scope) {
	console.log("So I am a controller...");
    document.getElementById('link_connectfb').addEventListener('click', function() {
        facebookConnectPlugin.login(['public_profile', 'email'], function(userData) {
            document.getElementById('facebookApiResult', JSON.stringify(userData));
        }, function(message) {
            alert('Failed: ' + message);
        });
    });
});

puzzleControllers.controller('GalleryCtrl', ['$scope', 'AdService', 'PuzzleManager', function($scope, AdService, PuzzleManager) {
    var availableLevels = [];

    angular.forEach(PuzzleManager.getAll(), function(puzzle, index) {
        availableLevels.push({
            puzzle: puzzle,
            canPlay: PuzzleManager.isUnlocked(puzzle)
        });
    });

    $scope.availableLevels = availableLevels;

    AdService.showAdmob();
}]);

puzzleControllers.controller('SelectCtrl', ['$scope', '$stateParams', 'PuzzleManager', function($scope, $stateParams, PuzzleManager) {
    var puzzle = PuzzleManager.findBySrc($stateParams.src);

    $scope.fullSrc = 'img/' + $stateParams.src;
    $scope.puzzle = puzzle;
    $scope.playableLevels = PuzzleManager.getPlayableLevels(puzzle);
}]);

puzzleControllers.controller('PlayCtrl', ['$stateParams', '$scope', 'PuzzleMatrix', 'AdService', 'PuzzleManager', 'ImageCropper', 'PuzzleRenderer',
    function ($stateParams, $scope, PuzzleMatrix, AdService, PuzzleManager, ImageCropper, PuzzleRenderer) {

    var onChange, container, partitions;

    $scope.imgSource =  '/img/' + $stateParams.src;
    $scope.containerShown = true;
    $scope.originalShown = false;
    $scope.puzzleMatrix = PuzzleMatrix;

    $scope.showOriginal = function() {
        $scope.originalShown = true;
        $scope.containerShown = false;
    };

    $scope.hideOriginal = function() {
        $scope.containerShown = true;
        $scope.originalShown = false;
    };

    $scope.cellClick = function (i, j) {
        var target = evt.target, tile, possibleTiles;

 
        i = parseInt(target.getAttribute('data-i'));
        j = parseInt(target.getAttribute('data-j'));

        tile = PuzzleMatrix.tiles[i][j];

        if (tile.i !== null) {
            possibleTiles = [{ i: i - 1, j: j }, { i: i + 1, j: j }, { i: i, j: j - 1 }, { i: i, j: j + 1 }];

            for (var k = 0; k < possibleTiles.length; k++) {
                var possibleTile = possibleTiles[k];
                var i1 = possibleTile.i, j1 = possibleTile.j;
                if (i1 < 0 || i1 >= partitions ||
                    j1 < 0 || j1 >= partitions) {
                    continue;
                }

                if (PuzzleMatrix.tiles[i1][j1].i === null && PuzzleMatrix.tiles[i1][j1].j === null) {
                    PuzzleMatrix.tiles[i][j] = PuzzleMatrix.tiles[i1][j1];
                    PuzzleMatrix.tiles[i1][j1] = tile;

                    onChange();
                    break;
                }
            }
        }
    };

    container = document.getElementById('container');
    partitions = parseInt($stateParams.size);

    // TODO Calculate the proper size.
    ImageCropper.initialize(133, 133, $scope.imgSource);
    PuzzleMatrix.initialize(partitions, partitions);
    PuzzleRenderer.initialize(container, partitions);
    $scope.sources = PuzzleRenderer.render(PuzzleMatrix);

    console.log("$scope.sources", $scope.sources);

    onChange = function () {
        $scope.sources = PuzzleRenderer.render(PuzzleMatrix);
        console.log("$scope.sources", $scope.sources);
        if (PuzzleMatrix.isCompleted()) {
            PuzzleManager.onAchievedPuzzle(PuzzleManager.findBySrc($stateParams.src), partitions);
            alert('You did it!!!');
        }
    };
}]);
