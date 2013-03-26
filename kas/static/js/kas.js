// Generated by CoffeeScript 1.4.0
(function() {
  var addItem;

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
      $routeProvider.otherwise({
        redirectTo: '/transactions'
      });
    }
  ]);

  addItem = {};

  angular.module('kas.controllers', ['kas.apiv2']).controller('TransactionController', [
    '$scope', 'Transaction', function($scope, Transaction) {
      $scope.transactions = [];
      Transaction.all(function(transactions, meta) {
        return $scope.transactions = transactions;
      });
      addItem = function(transaction) {
        return $scope.transactions.push(transaction);
      };
      $scope.next = function() {
        return $scope.transactions.next(function(items) {
          return $scope.items = items;
        });
      };
      return $scope.previous = function() {
        return $scope.transactions.previous(function(items) {
          return $scope.items = items;
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
          console.log(transaction);
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
      $scope.closures = [];
      return Closure.all(function(closures, meta) {
        return $scope.closures = closures;
      });
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
        this.valid = this.valid ? false : true;
        return this.update();
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
      return Closure;
    }
  ]);

}).call(this);
