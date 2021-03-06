// Generated by CoffeeScript 1.4.0
(function() {
  var addItem;

  angular.module('kas.barcode', []).factory('Barcode', function() {
    var Barcode, encode, encodings, groups, withChecksum;
    groups = ['OOOOOO', 'OOEOEE', 'OOEEOE', 'OOEEEO', 'OEOOEE', 'OEEOOE', 'OEEEOO', 'OEOEOE', 'OEOEEO', 'OEEOEO'];
    encodings = {
      'O': ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011'],
      'E': ['0100111', '0110011', '0011011', '0100001', '0011101', '0111001', '0000101', '0010001', '0001001', '0010111'],
      'R': ['1110010', '1100110', '1101100', '1000010', '1011100', '1001110', '1010000', '1000100', '1001000', '1110100']
    };
    withChecksum = function(num) {
      var array, checksum, i, mul, _i, _j, _ref;
      array = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      for (i = _i = 0, _ref = Math.min(num.length, array.length) - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        array[i] = parseInt(num.charAt(i));
      }
      checksum = 0;
      for (i = _j = 0; _j <= 11; i = ++_j) {
        mul = i % 2 === 0 ? 1 : 3;
        checksum += array[i] * mul;
      }
      array[12] = (Math.ceil(checksum / 10) * 10) - checksum;
      return array;
    };
    encode = function(array) {
      var barcode, group, i, _i, _j;
      group = groups[array[0]];
      barcode = 'L0L';
      for (i = _i = 1; _i <= 6; i = ++_i) {
        barcode += encodings[group.charAt(i - 1)][array[i]];
      }
      barcode += '0L0L0';
      for (i = _j = 7; _j <= 12; i = ++_j) {
        barcode += encodings['R'][array[i]];
      }
      barcode += 'L0L';
      return barcode;
    };
    Barcode = function(num, description) {
      this.num = num;
      this.description = description;
      this.withChecksum = withChecksum(num);
      console.log(this.withChecksum);
      return this.encoded = encode(this.withChecksum);
    };
    Barcode.create = function(num, text) {
      return new Barcode(num, text);
    };
    Barcode.prototype.draw = function(canvas) {
      var barcodeHeight, basetext, bit, bitHeight, bitWidth, canvas_height, canvas_width, desc, i, margin_bottom, margin_left, margin_top, num1, num2, num3, rectangle, _i, _ref;
      canvas.reset();
      margin_left = 25;
      margin_top = 22;
      margin_bottom = 40;
      canvas_width = canvas.width;
      canvas_height = canvas.height;
      if (window.devicePixelRatio) {
        canvas_width = canvas.width / window.devicePixelRatio;
        canvas_height = canvas.height / window.devicePixelRatio;
      }
      canvas_width -= margin_left;
      bitWidth = Math.floor(canvas_width / this.encoded.length);
      console.log(this.encoded.length);
      barcodeHeight = canvas_height - margin_top;
      for (i = _i = 0, _ref = this.encoded.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        bit = this.encoded.charAt(i);
        bitHeight = barcodeHeight - margin_bottom;
        if (bit === "L") {
          bitHeight = barcodeHeight;
        }
        if (bit !== "0") {
          rectangle = canvas.display.rectangle({
            x: i * bitWidth + margin_left,
            y: margin_top,
            width: bitWidth,
            height: bitHeight,
            fill: "#000"
          });
          canvas.addChild(rectangle);
        }
      }
      basetext = {
        x: 0,
        y: canvas_height - margin_bottom,
        font: "33px monospace",
        fill: "#000"
      };
      desc = angular.extend({}, basetext, {
        text: this.description,
        y: 0,
        font: "20px bold Arial"
      });
      canvas.addChild(canvas.display.text(desc));
      num1 = angular.extend({}, basetext, {
        text: this.withChecksum.join('').substring(0, 1)
      });
      canvas.addChild(canvas.display.text(num1));
      num2 = angular.extend({}, basetext, {
        text: this.withChecksum.join('').substring(1, 7),
        x: 5 * bitWidth + margin_left
      });
      canvas.addChild(canvas.display.text(num2));
      num3 = angular.extend({}, basetext, {
        text: this.withChecksum.join('').substring(7, 13),
        x: 50 * bitWidth + margin_left
      });
      return canvas.addChild(canvas.display.text(num3));
    };
    return Barcode;
  });

  window.App = angular.module('kas', ['kas.controllers', 'typeahead']).config([
    '$routeProvider', function($routeProvider) {
      $routeProvider.when('/transactions', {
        templateUrl: window.prefix + 'partials/kas/transactions.html',
        controller: 'TransactionController'
      });
      $routeProvider.when('/closures', {
        templateUrl: window.prefix + 'partials/kas/closures.html',
        controller: 'ClosureController'
      });
      $routeProvider.when('/closures/:closureID', {
        templateUrl: window.prefix + 'partials/kas/closure.html',
        controller: 'ClosureDetailController'
      });
      $routeProvider.when('/barcode', {
        templateUrl: window.prefix + 'partials/kas/barcode.html',
        controller: 'BarcodeController'
      });
      $routeProvider.otherwise({
        redirectTo: '/transactions'
      });
    }
  ]);

  addItem = {};

  angular.module('kas.controllers', ['kas.apiv2', 'kas.barcode']).controller('TransactionController', [
    '$scope', 'Transaction', function($scope, Transaction) {
      $scope.transactions = [];
      Transaction.all(function(transactions, meta) {
        return $scope.transactions = transactions;
      });
      addItem = function(transaction) {
        return $scope.transactions.push(transaction);
      };
      $scope.next = function() {
        return $scope.transactions.next(function(transactions) {
          return $scope.transactions = transactions;
        });
      };
      return $scope.previous = function() {
        return $scope.transactions.previous(function(transactions) {
          return $scope.transactions = transactions;
        });
      };
    }
  ]).controller('TransactionFormController', [
    '$scope', 'Transaction', function($scope, Transaction) {
      angular.element("input[ng-model='amount']").focus();
      $scope.inout = "OUT";
      $scope.toggleInout = function() {
        $scope.inout = $scope.inout === "OUT" ? "IN" : "OUT";
        if ($scope.inout === "OUT") {
          return $scope.method = "CASH";
        }
      };
      $scope.method = "CASH";
      $scope.toggleMethod = function() {
        $scope.method = $scope.method === "CASH" ? "PIN" : "CASH";
        if ($scope.method === "PIN") {
          return $scope.inout = "IN";
        }
      };
      return $scope.submit = function() {
        var transaction;
        if ($scope.amount && $scope.description) {
          transaction = new Transaction();
          transaction.amount = Math.abs(parseFloat($scope.amount.replace(',', '.')));
          if ($scope.inout === "OUT") {
            transaction.amount *= -1;
          }
          transaction.method = $scope.method === "CASH" ? "C" : "P";
          transaction.description = $scope.description;
          transaction.valid = true;
          return transaction.create(function(obj) {
            $scope.inout = "OUT";
            $scope.method = "CASH";
            $scope.amount = "";
            $scope.description = "";
            addItem(obj);
            return angular.element("input[ng-model='amount']").focus();
          });
        }
      };
    }
  ]).controller('ClosureController', [
    '$scope', 'Transaction', 'Closure', function($scope, Transaction, Closure) {
      $scope.unfinished = false;
      Closure.unfinished(function(closure) {
        if (closure.total_count === 1) {
          return $scope.unfinished = closure[0];
        }
      });
      $scope.closures = [];
      Closure.all(function(closures) {
        return $scope.closures = closures;
      });
      return $('.extrainfo').popover({
        trigger: "focus",
        placement: "bottom",
        title: "Informatie"
      });
    }
  ]).controller('ClosureFormController', [
    '$scope', '$location', 'Transaction', 'Closure', function($scope, $location, Transaction, Closure) {
      return $scope.newclosure = function() {
        var closure, transaction_cash, transaction_pin;
        if ($scope.in_cash) {
          transaction_cash = new Transaction();
          transaction_cash.amount = parseFloat($scope.in_cash.replace(',', '.'));
          transaction_cash.method = "C";
          transaction_cash.description = "Kasinkomsten";
          transaction_cash.valid = true;
          transaction_cash.create(function(obj) {});
        }
        if ($scope.in_pin) {
          transaction_pin = new Transaction();
          transaction_pin.amount = parseFloat($scope.in_pin.replace(',', '.'));
          transaction_pin.method = "P";
          transaction_pin.description = "Pininkomsten";
          transaction_pin.valid = true;
          transaction_pin.create(function(obj) {});
        }
        closure = new Closure();
        return closure.create(function(obj) {
          return $location.path('/closures/' + obj.id);
        });
      };
    }
  ]).controller('ClosureDetailController', [
    '$routeParams', '$scope', 'Transaction', 'Closure', function($routeParams, $scope, Transaction, Closure) {
      $scope.closure = false;
      $scope.transactions = [];
      Closure.get($routeParams.closureID, function(closure) {
        $scope.closure = closure;
        if (!$scope.closure.finished) {
          $scope.closure.update(function(closure) {
            return $scope.closure = closure;
          });
        }
        return $scope.loadTransactions();
      });
      $scope.loadTransactions = function() {
        return Transaction.inClosure($scope.closure, function(transactions) {
          return $scope.transactions = transactions;
        });
      };
      $scope.save = function() {
        return $scope.closure.update(function(closure) {
          $scope.loadTransactions();
          $scope.closure = closure;
          if (($scope.closure.cashdifference === 0 && $scope.closure.pindifference === 0) || $scope.confirmed) {
            $scope.closure.finished = true;
            return $scope.closure.update(function(closure) {
              $scope.confirmed = $scope.problem = false;
              return alert("Dagafsluiting voltooid.");
            });
          } else {
            return $scope.problem = true;
          }
        });
      };
      $scope.confirm = function() {
        $scope.confirmed = true;
        return $scope.save();
      };
      $scope.$watch("closure.num_e500 + closure.num_e200 + closure.num_e100 + closure.num_e50 + closure.num_e20 + closure.num_e10 + closure.num_e5 + closure.num_e2 + closure.num_e1 + closure.num_e050 + closure.num_e020 + closure.num_e010 + closure.num_e005", function() {
        return $scope.closure.total = 500 * $scope.closure.num_e500 + 200 * $scope.closure.num_e200 + 100 * $scope.closure.num_e100 + 50 * $scope.closure.num_e50 + 20 * $scope.closure.num_e20 + 10 * $scope.closure.num_e10 + 5 * $scope.closure.num_e5 + 2 * $scope.closure.num_e2 + 1 * $scope.closure.num_e1 + 0.5 * $scope.closure.num_e050 + 0.2 * $scope.closure.num_e020 + 0.1 * $scope.closure.num_e010 + 0.05 * $scope.closure.num_e005;
      });
      $scope.$watch('closure.total - closure.previoustotal - closure.transactions_cash', function() {
        var cashdifference;
        cashdifference = $scope.closure.total - $scope.closure.previoustotal - $scope.closure.transactions_cash;
        return $scope.closure.cashdifference = Math.round(cashdifference * 100) / 100;
      });
      return $(document).delegate('input.input-mini', 'keyup', function() {
        return $scope.$digest();
      });
    }
  ]).controller('BarcodeController', [
    '$scope', 'Barcode', function($scope, Barcode) {
      var canvas, context, height, ocanvas, width;
      $scope.images = [];
      canvas = $('#canvas')[0];
      context = canvas.getContext('2d');
      width = $(canvas).attr('width');
      height = $(canvas).attr('height');
      if (window.devicePixelRatio) {
        $(canvas).attr('width', width * window.devicePixelRatio);
        $(canvas).attr('height', height * window.devicePixelRatio);
        $(canvas).css('width', width);
        $(canvas).css('height', height);
        context.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
      ocanvas = oCanvas.create({
        canvas: "#canvas"
      });
      $scope.$watch('barcode + description', function() {
        if ($scope.barcode && $scope.barcode % 1 === 0) {
          return Barcode.create($scope.barcode, $scope.description).draw(ocanvas);
        }
      });
      return $scope.getImage = function() {
        return $scope.images.push(ocanvas.canvasElement.toDataURL("image/png"));
      };
    }
  ]);

  angular.module('kas.apiv2', ['dienst2']).factory('Transaction', [
    'Tastypie', function(Tastypie) {
      var Transaction;
      Transaction = Tastypie('api/v2/transaction/');
      Transaction.prototype.toString = function() {
        return this.description;
      };
      Transaction.prototype.toggleValid = function() {
        if (this.editable) {
          this.valid = this.valid ? false : true;
          return this.update();
        }
      };
      Transaction.inClosure = function(closure, success) {
        var params;
        params = {
          'limit': 0,
          'date__lte': closure.date
        };
        if (closure.previousdate) {
          params.date__gt = closure.previousdate;
        }
        return Transaction._more({
          method: 'GET',
          url: Transaction.api_root,
          params: params
        }, success);
      };
      return Transaction;
    }
  ]).factory('Closure', [
    'Tastypie', function(Tastypie) {
      var Closure;
      Closure = Tastypie('api/v2/closure/');
      Closure.prototype.toString = function() {
        return this.date;
      };
      Closure.unfinished = function(success) {
        return Closure._more({
          method: 'GET',
          url: Closure.api_root,
          params: {
            'finished': false
          }
        }, success);
      };
      return Closure;
    }
  ]);

}).call(this);
