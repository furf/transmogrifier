/**
 * Transmogrifier
 * @author Dave Furfero
 */
function Transmogrifier (map) {

  var EMPTY  = '',
      INPUT  = 'i',
      OUTPUT = 'o',
      DOT    = '.',
      EQUALS = '=',
      OBJECT = '{}',
      BREAK  = ';\n',
      numericIndexRegExp = /\.(\d+)/g,
      modifiers = [];

  function makeSource (map /*, ns */) {

    var ns  = arguments[1] || OUTPUT,
        src = [],
        prop,
        val,
        i;

    // Open function
    if (ns === OUTPUT) {
      src.push('var ');
    }

    src.push(ns, EQUALS, OBJECT, BREAK);

    // Iterate map properties
    for (prop in map) {
      if (map.hasOwnProperty(prop)) {

        // Extract value from mapped property
        val = map[prop];

        // Render property as complete path for recursion and assignment
        prop = ns + DOT + prop;

        // Recurse nested objects
        if (typeof val === 'object') {
          src.push(makeSource(val, prop));

        // Render dot-delimited properties and modifiers
        } else {

          // Render left-hand assignment
          src.push(prop, EQUALS);

          // Render modifier
          if (typeof val === 'function') { 

            // Cache modifier, referenceable by property 
            modifiers[prop] = val;
            src.push('this.modifiers["', prop, '"](', INPUT, ')', BREAK);

          // Render dot-delimited property as gated assignment
          } else {

            val = val.split(DOT);

            for (i = val.length - 1; i >= 0; --i) {
              val[i] = INPUT + DOT + val.slice(0, i + 1).join(DOT);
            }

            src.push(val.join('&&').replace(numericIndexRegExp, '[$1]'), BREAK);
          }
        }
      }
    }

    // Close function
    if (ns === OUTPUT) {
      src.push('return ', OUTPUT, BREAK);
    }

    return src.join(EMPTY);
  }

  // Create new function from source and attach modifiers array
  this.one = new Function(INPUT, makeSource(map));
  this.modifiers = modifiers;
}

Transmogrifier.prototype.many = function(data) {
  var i, n, arr = [];
  if (!(data instanceof Array)) {
    data = [data];
  }
  for (i = 0, n = data.length; i < n; ++i) {
    arr.push(this.one(data[i]));
  }
  return arr;
};
