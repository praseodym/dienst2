// Generated by CoffeeScript 1.4.0
(function() {
  var $, report;

  $ = window.jQuery;

  report = function(data, status, headers, config) {
    throw {
      message: 'Server communication failed.',
      status: status,
      config: config
    };
  };

  angular.module('dienst2', []).factory('Tastypie', [
    '$http', function($http) {
      var Tastypie;
      Tastypie = function(api_root) {
        var Model, process, processAll;
        process = function(data) {
          return new Model(data);
        };
        processAll = function(data) {
          var models, next, previous;
          models = [];
          angular.forEach(data.objects, function(data) {
            return models.push(new Model(data));
          });
          if (data.meta) {
            next = function(success) {
              return $http({
                method: 'GET',
                url: data.meta.next
              }).error(report).success(function(data, status, headers, config) {
                return success(processAll(data));
              });
            };
            models.next = data.meta.next ? next : false;
            previous = function(success) {
              return $http({
                method: 'GET',
                url: data.meta.previous
              }).error(report).success(function(data, status, headers, config) {
                return success(processAll(data));
              });
            };
            models.previous = data.meta.previous ? previous : false;
            models.total_count = data.meta.total_count;
          }
          return models;
        };
        Model = function(data) {
          return angular.extend(this, data);
        };
        Model.api_root = api_root;
        Model._more = function(data, success) {
          return $http(data).error(report).success(function(data, status, headers, config) {
            return success(processAll(data));
          });
        };
        Model._one = function(data, success) {
          return $http(data).error(report).success(function(data, status, headers, config) {
            return success(process(data));
          });
        };
        Model.get = function(id, success) {
          return Model._one({
            method: 'GET',
            url: Model.api_root + id + '/'
          }, success);
        };
        Model.all = function(success) {
          return Model._more({
            method: 'GET',
            url: Model.api_root,
            params: {
              'limit': 10
            }
          }, success);
        };
        Model.search = function(query, success) {
          return Model._more({
            method: 'GET',
            url: Model.api_root + 'search/',
            params: {
              'q': query
            }
          }, success);
        };
        Model.prototype.create = function(success) {
          return $http({
            method: 'POST',
            url: Model.api_root,
            data: this
          }).error(report).success(function(data, status, headers, config) {
            return success(process(data));
          });
        };
        Model.prototype.update = function(success) {
          return $http({
            method: 'PUT',
            url: Model.api_root + this.id + '/',
            data: this
          }).error(report).success(function(data, status, headers, config) {
            angular.extend(this, process(data));
            if (success) {
              return success(this);
            }
          });
        };
        return Model;
      };
      return Tastypie;
    }
  ]);

  angular.module('typeahead', []).directive('chSelector', [
    '$parse', function($parse) {
      return {
        restrict: 'A',
        require: '?ngModel',
        link: function(scope, element, attrs, controller) {
          var ModelGetter, ModelListgetter, ModelSetter, setModel, typeahead, values;
          ModelGetter = $parse(attrs.ngModel + "_model");
          ModelSetter = ModelGetter.assign;
          ModelListgetter = $parse(attrs.chSelector);
          values = ModelListgetter(scope);
          scope.$watch(attrs.chSelector, function(newValue, oldValue) {
            if (newValue !== oldValue) {
              return values = newValue;
            }
          });
          element.attr('data-provide', 'typeahead');
          setModel = function(item) {
            ModelSetter(scope, item);
            return scope.$digest();
          };
          element.typeahead({
            source: function(query) {
              if (angular.isFunction(values)) {
                return values.apply(null, arguments);
              } else {
                return values;
              }
            },
            items: attrs.items || 10,
            minLength: attrs.minLength || 1,
            matcher: function(item) {
              return true;
            },
            sorter: function(items) {
              return items;
            },
            updater: function(item) {
              setModel(item);
              element.one('focus', function(event) {
                setModel(void 0);
                return element.val('');
              });
              return item.toString();
            },
            highlighter: function(item) {
              var query;
              query = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
              return item.toString().replace(new RegExp('(' + query + ')', 'ig'), function($1, match) {
                return '<strong>' + match + '</strong>';
              });
            }
          });
          typeahead = element.data('typeahead');
          typeahead.select = function() {
            var model;
            model = this.$menu.find('.active').data('typeahead-model');
            this.$element.val(this.updater(model)).change();
            return this.hide();
          };
          return typeahead.render = function(items) {
            var that;
            that = this;
            items = $(items).map(function(i, item) {
              i = $(that.options.item).data('typeahead-model', item);
              i.find('a').html(that.highlighter(item));
              return i[0];
            });
            items.first().addClass('active');
            this.$menu.html(items);
            return this;
          };
        }
      };
    }
  ]);

  $.fn.spin = function(opts) {
    this.each(function() {
      var $this, data;
      $this = $(this);
      data = $this.data();
      if (data.spinner) {
        data.spinner.stop();
        delete data.spinner;
      }
      if (opts !== false) {
        return data.spinner = new Spinner($.extend({
          color: $this.css('color')
        }, opts)).spin(this);
      }
    });
    return this;
  };

}).call(this);
