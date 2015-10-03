'use strict';

var IMAGES_SIZE = 1200;
var puzzleControllers = angular.module('puzzleControllers', []);

puzzleControllers.controller('IndexCtrl', ['$scope', function ($scope) {

    // TODO Reimplement with a working facebook plugin.
    /*
    document.getElementById('link_connectfb').addEventListener('click', function() {
        facebookConnectPlugin.login(['public_profile', 'email'], function(userData) {
            document.getElementById('facebookApiResult', JSON.stringify(userData));
        }, function(message) {
            alert('Failed: ' + message);
        });
    });
    */
}]);

puzzleControllers.controller('GalleryCtrl', ['$scope', 'AdService', 'PuzzleManager', function($scope, AdService, PuzzleManager) {
    var availableLevels = [], lastArray = null;

    angular.forEach(PuzzleManager.getAll(), function (puzzle, index) {
        if (index % 2 == 0) {
            lastArray = [];
            availableLevels.push(lastArray);
        }
        lastArray.push({
            puzzle: puzzle,
            canPlay: PuzzleManager.isUnlocked(puzzle)
        });
    });

    $scope.availableLevels = availableLevels;

    //AdService.showAdmob();
}]);

puzzleControllers.controller('SelectCtrl', ['$scope', '$stateParams', 'PuzzleManager', function($scope, $stateParams, PuzzleManager) {
    var puzzle = PuzzleManager.findBySrc($stateParams.src);

    $scope.fullSrc = 'img/' + $stateParams.src;
    $scope.puzzle = puzzle;
    $scope.playableLevels = PuzzleManager.getPlayableLevels(puzzle);
}]);

puzzleControllers.controller('PlayCtrl', ['$stateParams', '$scope', 'PuzzleMatrix', 'PuzzleManager', 'ImageCropper', 'PuzzleRenderer', '$ionicLoading', '$ionicPopup',
    function ($stateParams, $scope, PuzzleMatrix, PuzzleManager, ImageCropper, PuzzleRenderer, $ionicLoading, $ionicPopup) {

    $ionicLoading.show({
        template: "Loading..."
    });

    var onChange, partitions;

    partitions = parseInt($stateParams.size);

    $scope.imgSource =  'img/' + $stateParams.src;
    $scope.containerShown = true;
    $scope.originalShown = false;
    $scope.puzzleMatrix = PuzzleMatrix;
    $scope.partitions = partitions;

    $scope.showOriginal = function() {
        $scope.originalShown = true;
        $scope.containerShown = false;
    };

    $scope.hideOriginal = function() {
        $scope.containerShown = true;
        $scope.originalShown = false;
    };

    $scope.cellClick = function (i, j) {
        var tile, possibleTiles;

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

    onChange = function () {
        //console.log("on change triggered");
        $scope.sources = PuzzleRenderer.render(PuzzleMatrix);
        if (PuzzleMatrix.isCompleted()) {
            PuzzleManager.onAchievedPuzzle(PuzzleManager.findBySrc($stateParams.src), partitions);
            // Complete image.
            $scope.sources[partitions - 1][partitions - 1] = ImageCropper.crop(partitions - 1, partitions - 1);

            setTimeout(function () {
                $ionicPopup.alert({
                    templateUrl: 'partials/victory.html',
                    title: "Victory!"
                });

            }, 500);
        }
    };


    var img = new Image();
    img.onload = function () {
        ImageCropper.initialize(IMAGES_SIZE / partitions, IMAGES_SIZE / partitions, img);
        PuzzleMatrix.initialize(partitions, partitions);
        PuzzleRenderer.initialize(partitions);
        $scope.sources = PuzzleRenderer.render(PuzzleMatrix);
        $scope.originalSources = new Array(partitions);
        for (var row = partitions - 1; row >= 0; row--) {
            $scope.originalSources[row] = new Array(partitions);
            for (var col = partitions - 1; col >= 0; col--) {
                $scope.originalSources[row][col] = ImageCropper.crop(row, col);
            }
        }
        $ionicLoading.hide();
    };
    img.src = $scope.imgSource;
    if (img.complete) {
        img.onload();
        console.log("image complete at first: " + img.src);
    } else {
        console.log("image not complete at first: " + img.src);
    }

}]);
