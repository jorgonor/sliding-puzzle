'use strict';

var puzzleServices = angular.module('puzzleServices', []);

puzzleServices.factory('PuzzleMatrix', function() {
    return {
        initialize: function(width, height) {
            this.width = width || 3;
            this.height = height || 3;
            this.buildTiles();
        },
        buildTiles: function() {
            this.tiles = new Array(this.width);

            for(var i = 0; i < this.width; i++) {
                this.tiles[i] = new Array(this.height);
                for(var j = 0; j < this.height; j++) {
                    this.tiles[i][j] = { i: i, j: j};
                }
            }
            this.tiles[this.width - 1][this.height - 1] = {i: null, j: null};

            this.shuffle();
        },
        shuffle: function() {
            var t, newI, newJ;
            for(var i = 0; i < this.width; i++) {
                for(var j = 0; j < this.height; j++) {
                    newI = Math.floor(Math.random() * this.width);
                    newJ = Math.floor(Math.random() * this.height);
                    t = this.tiles[newI][newJ];
                    this.tiles[newI][newJ] = this.tiles[i][j];
                    this.tiles[i][j] = t;
                }
            }
        },
        isCompleted: function() {
            var tile;
            for(var i = 0; i < (this.width - 1); i++) {
                for(var j = 0; j < this.height; j++) {
                    tile = this.tiles[i][j];
                    if (i !== tile.i || j !== tile.j) {
                        return false;
                    }
                }
            }
            var i = this.width - 1;
            for(var j = 0; j < this.height - 1; j++) {
                tile = this.tiles[i][j];
                if (i !== tile.i || j !== tile.j) {
                    return false;
                }
            }
            return true;
        }
    };
});

puzzleServices.factory('AdService', function() {
    var admobId = 'ca-app-pub-4620086008956912/4688100782',
        analyticsId = 'UA-36061398-3';

    if (document.URL.indexOf('http') === 0 || !window.AdMob) {
        return {
            showAdmob: function() {}, initAnalytics: function() {}
        };
    }

    AdMob.setOptions({
        isTesting: true
    });

    return {
        showAdmob: function() {
            AdMob.createBanner({
                adId: admobId,
                position: AdMob.AD_POSITION.BOTTOM_CENTER,
                autoShow: true
            });
        },
        initAnalytics: function() {
            // It is not working yet.
            if (window.analytics && analytics) {
                analytics.startTrackerWithId(analyticsId);
                analytics.trackView('Home');
            }
        }
    };
});

puzzleServices.factory('PuzzleManager', function() {
    var puzzles = [
        {id: "Rally", src: "1.jpg", order: 0},
        {id: "Soldier in the mud", src: "2.jpg", order: 1 },
        {id: "Girl", src: "3.jpg", order: 2},
        {id: "Athletism Training", src: "4.jpg", order: 3, },
        {id: "Medieval Cannon", src: "5.jpg", order: 4}
    ];

    return {
        SESSION_KEY: 'puzzle.session',
        getAll: function() {
            return puzzles;
        },
        getSession: function() {
            var session = localStorage.getItem(this.SESSION_KEY);
            return JSON.parse(session || '{}');
        },
        setSession: function(session) {
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
        },
        getSessionUnlocked: function() {
            var session = this.getSession();
            return session.unlocked || [];
        },
        isUnlocked: function(puzzle) {
            if (puzzle.order < 2) {
                return true;
            }

            var unlocked = this.getSessionUnlocked(),
                maxOrder = -1;

            angular.forEach(unlocked, function(value, key) {
                maxOrder = Math.max(value.order, maxOrder);
            });

            return maxOrder >= puzzle.order - 1;
        },
        findBySrc: function(src) {
            for(var i = puzzles.length - 1; i >= 0; i--) {
                if (puzzles[i].src === src) {
                    return puzzles[i];
                }
            }
            return null;
        },
        getPlayableLevels: function(puzzle) {
            var levels = [3],
                unlocked,
                found;

            unlocked = this.getSessionUnlocked();

            for(var i = unlocked.length - 1; i >= 0; i--) {
                if (puzzle.id == unlocked[i].id) {
                    levels.push(4);
                    break;
                }
            }

            return levels;
        },
        onAchievedPuzzle: function(puzzle, size) {
            var session = this.getSession(),
                unlocked = session.unlocked || [],
                puzzleCopy;

            for(var i = unlocked.length - 1; i >= 0; i--) {
                if (puzzle.id == unlocked[i].id) {
                    if (unlocked[i].sizes.indexOf(size) < 0) {
                        unlocked[i].sizes.push(size);
                        this.setSession(session);
                    }
                    return;
                }
            }

            puzzleCopy = angular.copy(puzzle);
            puzzleCopy.sizes = [size];
            session.unlocked = unlocked;
            session.unlocked.push(puzzleCopy);
            this.setSession(session);
            return;
        }
    };
});

puzzleServices.factory('ImageCropper', function () {
    return {
        initialize: function (width, height, image) {
            this.width = width;
            this.height = height;
            this.image = image;
            this._initializeCanvas();
        },
        _initializeCanvas: function () {
            this.canvas = document.createElement('canvas');
            this.canvas.setAttribute('width', this.width);
            this.canvas.setAttribute('height', this.height);

            this.context = this.canvas.getContext('2d');
        },
        crop: function (row, col) {

            console.log("image complete" + this.image.complete);
            if (!this.image.complete) {
                return null;
            }

            var r;

            this.context.drawImage(this.image, row * this.width, col * this.height, this.width, this.height, 0, 0, this.width, this.height);

            r = this.canvas.toDataURL();

            console.log("in (row, col) (" + row + ", " + col + ") the data is ", r); 

            return r;
        }
    }
});

puzzleServices.factory('PuzzleRenderer', ['PuzzleMatrix', 'ImageCropper', function (PuzzleMatrix, ImageCropper) {
    return {
        initialize: function (container, partitions) {
            this.container = container;
            this.partitions = partitions;
        },
        render: function (puzzle) {
            var i, j, obj, x, src, sources = [];

            for (i = 0; i < this.partitions; i++) {
                x = [];
                for (j = 0; j < this.partitions; j++) {
                    obj = PuzzleMatrix.tiles[i][j];

                    if (obj.i === null) {
                        src = "http://placehold.it/133x133";
                    } else {
                        src = ImageCropper.crop(obj.i, obj.j);
                    }
                    x.push(src);
                }

                sources.push(x);
            }

            return sources;
        },
    };
}]);