define([
  'angular',
  'jquery',
  'lodash',
  'moment'
], function (angular, $, _, moment) {
  'use strict';

  var module = angular.module('kibana.filters');

  var stackRegex = /^(\s*)(at)\s+([\w\.$_]+(\.([\w$_]+))*)\((.*)?:(\d+)\).*\[(.*)\]$/;

  module.filter('stringSort', function() {
    return function(input) {
      return input.sort();
    };
  });

  module.filter('pinnedQuery', function(querySrv) {
    return function( items, pinned) {
      var ret = _.filter(querySrv.ids(),function(id){
        var v = querySrv.list()[id];
        if(!_.isUndefined(v.pin) && v.pin === true && pinned === true) {
          return true;
        }
        if((_.isUndefined(v.pin) || v.pin === false) && pinned === false) {
          return true;
        }
      });
      return ret;
    };
  });

  module.filter('slice', function() {
    return function(arr, start, end) {
      if(!_.isUndefined(arr)) {
        return arr.slice(start, end);
      }
    };
  });

  module.filter('stringify', function() {
    return function(arr) {
      if(_.isObject(arr) && !_.isArray(arr)) {
        return angular.toJson(arr);
      } else {
        return _.isNull(arr) ? null : arr.toString();
      }
    };
  });

  module.filter('moment', function() {
    return function(date,mode) {
      switch(mode) {
      case 'ago':
        return moment(date).fromNow();
      }
      return moment(date).fromNow();
    };
  });

  module.filter('noXml', function() {
    var noXml = function(text) {
      return _.isString(text)
        ? text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/'/g, '&#39;')
            .replace(/"/g, '&quot;')
        : text;
    };
    return function(text) {
      return _.isArray(text)
        ? _.map(text, noXml)
        : noXml(text);
    };
  });

  module.filter('urlLink', function() {
    var  //URLs starting with http://, https://, or ftp://
      r1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim,
      //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
      r2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim,
      //Change email addresses to mailto:: links.
      r3 = /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim;

    var urlLink = function(text) {
      var t1,t2,t3;
      if(!_.isString(text)) {
        return text;
      } else {
        _.each(text.match(r1), function() {
          t1 = text.replace(r1, "<a href=\"$1\" target=\"_blank\">$1</a>");
        });
        text = t1 || text;
        _.each(text.match(r2), function() {
          t2 = text.replace(r2, "$1<a href=\"http://$2\" target=\"_blank\">$2</a>");
        });
        text = t2 || text;
        _.each(text.match(r3), function() {
          t3 = text.replace(r3, "<a href=\"mailto:$1\">$1</a>");
        });
        text = t3 || text;
        return text;
      }
    };
    return function(text) {
      return _.isArray(text)
        ? _.map(text, urlLink)
        : urlLink(text);
    };
  });

  module.filter('stackTracify', function() {
    var stackTracify = function(text) {
      var formattedText = text;

      var match = stackRegex.exec(formattedText);

      if (match && match.length > 8) {
        var prefixSpaces = match[1];
        var at = match[2];
        var classAndMethod = match[3];
        var fileName = match[6];
        var line = match[7];
        var mvnCoords = match[8];
        // we can ignore line if its not present...
        if (classAndMethod && fileName && mvnCoords) {
          var className = classAndMethod;
          var idx = classAndMethod.lastIndexOf('.');
          if (idx > 0) {
            className = classAndMethod.substring(0, idx);
          }
          var link = "#/source/view/" + mvnCoords + "/class/" + className + "/" + fileName;
          if (angular.isDefined(line)) {
            link += "?line=" + line;
          }
          formattedText = prefixSpaces + at + " <a href='" + link + "'>" + classAndMethod + "</a>(" + fileName + ":" + line + ")[" + mvnCoords + "]";
        }
      }

      return '<li>' + formattedText + '</li>';
    };
    return function(text) {
      return '<ul class="stack-trace">' +
        (_.isArray(text)
          ? _.map(text, stackTracify).join('')
          : stackTracify(text))
        + '</ul>';
    };
  });

  module.filter('editable', function () {
    return function (data) {
      return _.filter(data, function (item) {
        return item.editable !== false;
      });
    };
  });

  module.filter('gistid', function() {
    var gist_pattern = /(\d{5,})|([a-z0-9]{10,})|(gist.github.com(\/*.*)\/[a-z0-9]{5,}\/*$)/;
    return function(input) {
      if(!(_.isUndefined(input))) {
        var output = input.match(gist_pattern);
        if(!_.isNull(output) && !_.isUndefined(output)) {
          return output[0].replace(/.*\//, '');
        }
      }
    };
  });

});
