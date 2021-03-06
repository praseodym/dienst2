// Generated by CoffeeScript 1.4.0
(function() {
  var $;

  $ = window.jQuery;

  angular.module('dienst2', []).factory('Tastypie', [
    '$http', '$rootScope', function($http, $rootScope) {
      var Tastypie, report, throwError;
      throwError = function(data, status, headers, config) {
        alert("Server communication failed.");
        throw {
          message: 'Server communication failed.',
          status: status,
          config: config
        };
      };
      report = function(callback) {
        if (callback) {
          return callback;
        } else {
          return throwError;
        }
      };
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
              }).error(report()).success(function(data, status, headers, config) {
                return success(processAll(data));
              });
            };
            models.next = data.meta.next ? next : false;
            previous = function(success) {
              return $http({
                method: 'GET',
                url: data.meta.previous
              }).error(report()).success(function(data, status, headers, config) {
                return success(processAll(data));
              });
            };
            models.previous = data.meta.previous ? previous : false;
            models.total_count = data.meta.total_count;
          }
          return models;
        };
        Model = function(data) {
          if (!data) {
            data = {};
            Model._loadFromSchema(this);
          }
          return angular.extend(this, {
            _saved: data
          }, data);
        };
        Model._loadFromSchema = function(model) {
          return $http({
            method: 'GET',
            url: Model.api_root + 'schema/',
            cache: true
          }).error(report).success(function(data, status, headers, config) {
            model._saved = {};
            model._required = [];
            return angular.forEach(data.fields, function(info, field) {
              var _ref;
              model._saved[field] = void 0;
              if (!info.readonly) {
                if (info["default"] !== "No default provided." && info["default"] !== "") {
                  model[field] = model._saved[field] = info["default"];
                }
                if ((info.nullable === (_ref = info.blank) && _ref === false)) {
                  return model._required.push(field);
                }
              }
            });
          });
        };
        Model.api_root = api_root;
        Model._more = function(data, success) {
          return $http(data).error(report).success(function(data, status, headers, config) {
            return success(processAll(data), status, headers, config);
          });
        };
        Model._one = function(data, success) {
          return $http(data).error(report).success(function(data, status, headers, config) {
            return success(process(data), status, headers, config);
          });
        };
        Model.get = function(id, success) {
          return Model._one({
            method: 'GET',
            url: Model.api_root + id + '/'
          }, success);
        };
        Model.all = function(success, data) {
          data = angular.extend({
            method: 'GET',
            url: Model.api_root,
            params: {
              'limit': 10
            }
          }, data);
          return Model._more(data, success);
        };
        Model.search = function(query, success, mod, id) {
          if (!mod) {
            mod = 'default';
          }
          return Model._more({
            method: 'GET',
            url: Model.api_root + 'search/',
            params: {
              'q': query,
              'mod': mod,
              'searchID': id
            }
          }, success);
        };
        Model.getSubresource = function(url, success) {
          if (url) {
            return Model._one({
              method: 'GET',
              url: url
            }, success);
          } else {
            return success(null);
          }
        };
        Model.prototype.create = function(success, error) {
          var model;
          model = this;
          return $http({
            method: 'POST',
            url: Model.api_root,
            data: this
          }).error(report(error)).success(function(data, status, headers, config) {
            data = process(data);
            angular.extend(model, data);
            model._saved = data;
            if (success) {
              return success(model);
            }
          });
        };
        Model.prototype.update = function(success, error) {
          var model;
          model = this;
          return $http({
            method: 'PUT',
            url: model.resource_uri,
            data: this
          }).error(report(error)).success(function(data, status, headers, config) {
            data = process(data);
            angular.extend(model, data);
            model._saved = data;
            if (success) {
              return success(model);
            }
          });
        };
        Model.prototype.remove = function(success, error) {
          var model;
          model = this;
          return $http({
            method: 'DELETE',
            url: model.resource_uri
          }).error(report(error)).success(function(data, status, headers, config) {
            if (success) {
              return success();
            }
          });
        };
        Model.prototype.changed = function() {
          var changed, obj;
          obj = this;
          changed = false;
          angular.forEach(Object.keys(obj._saved), function(key) {
            if (obj[key] !== obj._saved[key]) {
              return changed = true;
            }
          });
          return changed;
        };
        Model.prototype.verify = function() {
          var errors, obj;
          obj = this;
          errors = [];
          angular.forEach(this._required, function(field) {
            if (!obj[field]) {
              return errors.push(field);
            }
          });
          return errors;
        };
        Model.prototype.save = function(success, error) {
          var errors;
          if (this._delete) {
            if (this.resource_uri) {
              return this.remove(success, error);
            }
          } else if (this.changed()) {
            errors = this.verify();
            if (errors.length > 0) {
              if (error) {
                return error("REQUIRED_FIELDS_EMPTY: " + errors.join(", "), error);
              }
            } else {
              if (this.resource_uri) {
                return this.update(success, error);
              } else {
                return this.create(success, error);
              }
            }
          }
        };
        return Model;
      };
      return Tastypie;
    }
  ]).value('$strap.config', {
    datepicker: {
      format: 'yyyy-mm-dd'
    }
  }).filter('tastypiedate', function() {
    return function(input) {
      var parts;
      if (input) {
        parts = input.match(/\d+/g);
        return new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]);
      } else {
        return input;
      }
    };
  });

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
              element.one('focus', function(event) {});
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
          typeahead.render = function(items) {
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
          return controller.$formatters.push(function(obj) {
            if (obj) {
              return obj.toString();
            } else {
              return '';
            }
          });
        }
      };
    }
  ]);

  angular.module("ngLocale", [], [
    "$provide", function($provide) {
      var PLURAL_CATEGORY;
      PLURAL_CATEGORY = {
        ZERO: "zero",
        ONE: "one",
        TWO: "two",
        FEW: "few",
        MANY: "many",
        OTHER: "other"
      };
      return $provide.value("$locale", {
        "DATETIME_FORMATS": {
          "MONTH": ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"],
          "SHORTMONTH": ["jan.", "feb.", "mrt.", "apr.", "mei", "jun.", "jul.", "aug.", "sep.", "okt.", "nov.", "dec."],
          "DAY": ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"],
          "SHORTDAY": ["zo", "ma", "di", "wo", "do", "vr", "za"],
          "AMPMS": ["AM", "PM"],
          "medium": "d MMM y HH:mm:ss",
          "short": "dd-MM-yy HH:mm",
          "fullDate": "EEEE d MMMM y",
          "longDate": "d MMMM y",
          "mediumDate": "d MMM y",
          "shortDate": "dd-MM-yy",
          "mediumTime": "HH:mm:ss",
          "shortTime": "HH:mm"
        },
        "NUMBER_FORMATS": {
          "DECIMAL_SEP": ",",
          "GROUP_SEP": ".",
          "PATTERNS": [
            {
              "minInt": 1,
              "minFrac": 0,
              "macFrac": 0,
              "posPre": "",
              "posSuf": "",
              "negPre": "-",
              "negSuf": "",
              "gSize": 3,
              "lgSize": 3,
              "maxFrac": 3
            }, {
              "minInt": 1,
              "minFrac": 2,
              "macFrac": 0,
              "posPre": "\u00A4 ",
              "posSuf": "",
              "negPre": "\u00A4 -",
              "negSuf": "",
              "gSize": 3,
              "lgSize": 3,
              "maxFrac": 2
            }
          ],
          "CURRENCY_SYM": "€"
        },
        "pluralCat": function(n) {
          if (n === 1) {
            return PLURAL_CATEGORY.ONE;
          }
          return PLURAL_CATEGORY.OTHER;
        },
        "id": "nl"
      });
    }
  ]);

  $.fn.spin = function(opts) {
    this.each(function() {
      var $this, data;
      $this = $(this);
      data = $this.data();
      if (data.spinner) {
        data.spinner.stop();
        return delete data.spinner;
      } else if (opts !== false) {
        return data.spinner = new Spinner($.extend({
          color: $this.css('color')
        }, opts)).spin(this);
      }
    });
    return this;
  };

  angular.module('dienst2.forms', []).directive('chEditable', [
    '$http', '$templateCache', '$anchorScroll', '$compile', function($http, $templateCache, $anchorScroll, $compile) {
      return {
        restrict: 'A',
        terminal: true,
        scope: {
          model: '=chModel',
          placeholder: '@chPlaceholder',
          classList: '@chClass',
          serializer: '&chSerializer',
          unserializer: '&chUnserializer'
        },
        compile: function(element, attr) {
          var placeholder, type;
          type = attr.chTemplate;
          placeholder = attr.chPlaceholder || '';
          return function(scope, element) {
            scope.classes = {};
            scope.$watch('classList', function(classList) {
              if (classList) {
                return angular.forEach(classList.split(' '), function(className) {
                  return scope.classes[className] = true;
                });
              }
            });
            scope.$parent.$watch('editmode', function(editmode) {
              return scope.editmode = editmode;
            });
            return $http.get(window.prefix + 'partials/form/' + type + '.html', {
              cache: $templateCache
            }).success(function(response) {
              element.html(response);
              return $compile(element.contents())(scope);
            });
          };
        }
      };
    }
  ]).directive('chDate', [
    '$filter', function($filter) {
      return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attr, ngModel) {
          var datefilter, fromUser, toUser;
          datefilter = $filter('date');
          fromUser = function(text) {
            var match, out, regex;
            out = null;
            regex = /^(0?[1-9]|[12][0-9]|3[01])[\-](0?[1-9]|1[012])[\-](\d{4})$/;
            if (text && (match = text.match(regex))) {
              out = match[3] + "-" + match[2] + "-" + match[1];
            }
            console.log(out);
            return out;
          };
          toUser = function(text) {
            return datefilter(text, 'dd-MM-yyyy');
          };
          ngModel.$parsers.push(fromUser);
          return ngModel.$formatters.push(toUser);
        }
      };
    }
  ]).value('country_list', {
    AF: "Afghanistan",
    AX: "Åland Islands",
    AL: "Albania",
    DZ: "Algeria",
    AS: "American Samoa",
    AD: "Andorra",
    AO: "Angola",
    AI: "Anguilla",
    AQ: "Antarctica",
    AG: "Antigua and Barbuda",
    AR: "Argentina",
    AM: "Armenia",
    AW: "Aruba",
    AU: "Australia",
    AT: "Austria",
    AZ: "Azerbaijan",
    BS: "Bahamas",
    BH: "Bahrain",
    BD: "Bangladesh",
    BB: "Barbados",
    BY: "Belarus",
    BE: "Belgium",
    BZ: "Belize",
    BJ: "Benin",
    BM: "Bermuda",
    BT: "Bhutan",
    BO: "Bolivia",
    BA: "Bosnia and Herzegovina",
    BW: "Botswana",
    BV: "Bouvet Island",
    BR: "Brazil",
    IO: "British Indian Ocean Territory",
    BN: "Brunei Darussalam",
    BG: "Bulgaria",
    BF: "Burkina Faso",
    BI: "Burundi",
    KH: "Cambodia",
    CM: "Cameroon",
    CA: "Canada",
    CV: "Cape Verde",
    KY: "Cayman Islands",
    CF: "Central African Republic",
    TD: "Chad",
    CL: "Chile",
    CN: "China",
    CX: "Christmas Island",
    CC: "Cocos (Keeling) Islands",
    CO: "Colombia",
    KM: "Comoros",
    CG: "Congo",
    CD: "Congo, The Democratic Republic of The",
    CK: "Cook Islands",
    CR: "Costa Rica",
    CI: "Cote D'ivoire",
    HR: "Croatia",
    CU: "Cuba",
    CY: "Cyprus",
    CZ: "Czech Republic",
    DK: "Denmark",
    DJ: "Djibouti",
    DM: "Dominica",
    DO: "Dominican Republic",
    EC: "Ecuador",
    EG: "Egypt",
    SV: "El Salvador",
    GQ: "Equatorial Guinea",
    ER: "Eritrea",
    EE: "Estonia",
    ET: "Ethiopia",
    FK: "Falkland Islands (Malvinas)",
    FO: "Faroe Islands",
    FJ: "Fiji",
    FI: "Finland",
    FR: "France",
    GF: "French Guiana",
    PF: "French Polynesia",
    TF: "French Southern Territories",
    GA: "Gabon",
    GM: "Gambia",
    GE: "Georgia",
    DE: "Germany",
    GH: "Ghana",
    GI: "Gibraltar",
    GR: "Greece",
    GL: "Greenland",
    GD: "Grenada",
    GP: "Guadeloupe",
    GU: "Guam",
    GT: "Guatemala",
    GG: "Guernsey",
    GN: "Guinea",
    GW: "Guinea-bissau",
    GY: "Guyana",
    HT: "Haiti",
    HM: "Heard Island and Mcdonald Islands",
    VA: "Holy See (Vatican City State)",
    HN: "Honduras",
    HK: "Hong Kong",
    HU: "Hungary",
    IS: "Iceland",
    IN: "India",
    ID: "Indonesia",
    IR: "Iran, Islamic Republic of",
    IQ: "Iraq",
    IE: "Ireland",
    IM: "Isle of Man",
    IL: "Israel",
    IT: "Italy",
    JM: "Jamaica",
    JP: "Japan",
    JE: "Jersey",
    JO: "Jordan",
    KZ: "Kazakhstan",
    KE: "Kenya",
    KI: "Kiribati",
    KP: "Korea, Democratic People's Republic of",
    KR: "Korea, Republic of",
    KW: "Kuwait",
    KG: "Kyrgyzstan",
    LA: "Lao People's Democratic Republic",
    LV: "Latvia",
    LB: "Lebanon",
    LS: "Lesotho",
    LR: "Liberia",
    LY: "Libyan Arab Jamahiriya",
    LI: "Liechtenstein",
    LT: "Lithuania",
    LU: "Luxembourg",
    MO: "Macao",
    MK: "Macedonia, The Former Yugoslav Republic of",
    MG: "Madagascar",
    MW: "Malawi",
    MY: "Malaysia",
    MV: "Maldives",
    ML: "Mali",
    MT: "Malta",
    MH: "Marshall Islands",
    MQ: "Martinique",
    MR: "Mauritania",
    MU: "Mauritius",
    YT: "Mayotte",
    MX: "Mexico",
    FM: "Micronesia, Federated States of",
    MD: "Moldova, Republic of",
    MC: "Monaco",
    MN: "Mongolia",
    ME: "Montenegro",
    MS: "Montserrat",
    MA: "Morocco",
    MZ: "Mozambique",
    MM: "Myanmar",
    NA: "Namibia",
    NR: "Nauru",
    NP: "Nepal",
    NL: "Netherlands",
    AN: "Netherlands Antilles",
    NC: "New Caledonia",
    NZ: "New Zealand",
    NI: "Nicaragua",
    NE: "Niger",
    NG: "Nigeria",
    NU: "Niue",
    NF: "Norfolk Island",
    MP: "Northern Mariana Islands",
    NO: "Norway",
    OM: "Oman",
    PK: "Pakistan",
    PW: "Palau",
    PS: "Palestinian Territory, Occupied",
    PA: "Panama",
    PG: "Papua New Guinea",
    PY: "Paraguay",
    PE: "Peru",
    PH: "Philippines",
    PN: "Pitcairn",
    PL: "Poland",
    PT: "Portugal",
    PR: "Puerto Rico",
    QA: "Qatar",
    RE: "Reunion",
    RO: "Romania",
    RU: "Russian Federation",
    RW: "Rwanda",
    SH: "Saint Helena",
    KN: "Saint Kitts and Nevis",
    LC: "Saint Lucia",
    PM: "Saint Pierre and Miquelon",
    VC: "Saint Vincent and The Grenadines",
    WS: "Samoa",
    SM: "San Marino",
    ST: "Sao Tome and Principe",
    SA: "Saudi Arabia",
    SN: "Senegal",
    RS: "Serbia",
    SC: "Seychelles",
    SL: "Sierra Leone",
    SG: "Singapore",
    SK: "Slovakia",
    SI: "Slovenia",
    SB: "Solomon Islands",
    SO: "Somalia",
    ZA: "South Africa",
    GS: "South Georgia and The South Sandwich Islands",
    ES: "Spain",
    LK: "Sri Lanka",
    SD: "Sudan",
    SR: "Suriname",
    SJ: "Svalbard and Jan Mayen",
    SZ: "Swaziland",
    SE: "Sweden",
    CH: "Switzerland",
    SY: "Syrian Arab Republic",
    TW: "Taiwan, Province of China",
    TJ: "Tajikistan",
    TZ: "Tanzania, United Republic of",
    TH: "Thailand",
    TL: "Timor-leste",
    TG: "Togo",
    TK: "Tokelau",
    TO: "Tonga",
    TT: "Trinidad and Tobago",
    TN: "Tunisia",
    TR: "Turkey",
    TM: "Turkmenistan",
    TC: "Turks and Caicos Islands",
    TV: "Tuvalu",
    UG: "Uganda",
    UA: "Ukraine",
    AE: "United Arab Emirates",
    GB: "United Kingdom",
    US: "United States",
    UM: "United States Minor Outlying Islands",
    UY: "Uruguay",
    UZ: "Uzbekistan",
    VU: "Vanuatu",
    VE: "Venezuela",
    VN: "Viet Nam",
    VG: "Virgin Islands, British",
    VI: "Virgin Islands, U.S.",
    WF: "Wallis and Futuna",
    EH: "Western Sahara",
    YE: "Yemen",
    ZM: "Zambia",
    ZW: "Zimbabwe"
  });

}).call(this);
