/**
 * Transmogrifier
 */
function Transmogrifier (map) {

  var EMPTY  = '',
      SOURCE = 's',
      TARGET = 't',
      DOT    = '.',
      EQUALS = '=',
      OBJECT = '{}',
      BREAK  = ';\n',
      NUMERIC_INDEX_REGEXP = /\.(\d+)/g,
      modifiers = [];

  function makeSource (map /*, root */) {

    var root    = arguments[1] || EMPTY,
        rootDot = (root !== EMPTY) ? root + DOT : EMPTY,
        src     = [],
        prop,
        val,
        i;

    // Open function
    if (root === EMPTY) {
      src.push('var ', TARGET, EQUALS, OBJECT, BREAK);

    // Render nested object
    } else {
      src.push(TARGET, DOT, root, EQUALS, OBJECT, BREAK);
    }

    // Iterate map properties
    for (prop in map) {
      if (map.hasOwnProperty(prop)) {
        val = map[prop];

        // Traverse nested objects
        if (typeof val === 'object') {
          src.push(makeSource(val, prop));

        // Render dot-delimited properties and modifiers
        } else {

          // Render left-hand assignment
          src.push(TARGET, DOT, rootDot, prop, EQUALS);

          // Render modifier
          if (typeof val === 'function') { 
            modifiers[prop] = val;
            src.push('this.modifiers.', prop, '(', SOURCE, ')', BREAK);

          // Render dot-delimited property as gated assignment
          } else {

            val = val.split(DOT);

            for (i = val.length - 1; i >= 0; --i) {
              val[i] = SOURCE + DOT + val.slice(0, i + 1).join(DOT);
            }

            src.push(val.join('&&').replace(NUMERIC_INDEX_REGEXP, '[$1]'), BREAK);
          }
        }
      }
    }

    // Close function
    if (root === EMPTY) {
      src.push('return ', TARGET, BREAK);
    }

    return src.join(EMPTY);
  }

  this.transmogrify = new Function(SOURCE, makeSource(map));
  this.modifiers = modifiers;
}

Transmogrifier.prototype.transmogrifyMany = function(data) {
  var i, n, arr = [];
  for (i = 0, n = data.length; i < n; ++i) {
    arr.push(this.transmogrify(data[i]));
  }
  return arr;
};
