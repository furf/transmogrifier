

              /*=          :=?ZNNN=   ?NZ      ?$I?=~:        
              INNNNNNNNNNNNNNNNNN    ZNN=     ZNNNNNNNNNZ=   
              =NNZZZZZZZZZZZZZNZ    ?NNNN:    ZNZZNNNZZZNNN? 
              ~NNNNNNNNNNZZZNNI     NNZZNZ    INZZN+:ZNNZNNN~
                     ZNNZZZNN+     ?NNZZNNI   INZZN?  ZNZZNN=
                     NNZZZZNZ      $NNZZZNN:  ?NNZNI  NNZZZN?
                     NZZZZN+      =NNZZZZNNZ  $NNZNNZNNZZZNZ 
                    NZZZZNN     ~:NNZZZNZZNN  INNZZZZZZZNNZ  
                   $NZZNNNZNNNNNZZNNZZZZZZZN: INNZNNNNNN+    
                  $NNZNNHTTP://BIT.LY/Z1n2dZN ?NNZNZ         
                  NNZZZZZZZZZZNN~NNZNNNNZZZZN?=NNZN$         
                ~NNZZZZZZZZZZZNNZNZNNI ZNZZZNNINNZNZ
               ~NNNNNNNNNNNZZZZNNZZNNI INNZZZNNNNZNN=
               ZNZI+~          NNZZNNI ~NNZZNNNNNZNN$
                              NNNZZNNI ~NNNNNNINNZNNN:
                             ZNNNNNNN?         ZNNNNZ 
                             :II+:             $NZI*/


/**
 * Transmogrifier
 * Transmogrifier instances can be used to transmogrify, or transform, data
 * from one object structure to another. Useful for simplifying or sanitizing
 * large data feeds.
 * 
 * trans·mog·ri·fy
 * trăns-mŏg'rə-fī', trănz-
 * tr.v, -fied, -fy·ing, -fies.
 * To change into a different shape or form, especially one that is fantastic
 * or bizarre.
 *
 * @class
 * @param {Object} map
 * @constructs
 * @author Dave Furfero <a href="mailto:furf@furf.com">furf@furf.com</a>
 */
function Transmogrifier (map) {

  var INPUT               = 'i',
      OUTPUT              = 'o',
      EMPTY               = '',
      DOT                 = '.',
      EQUALS              = '=',
      OBJECT              = '{}',
      ARRAY               = '[]',
      BREAK               = ';',
      ARRAY_INDEX_SEARCH  = /\.(\d+)/g,
      ARRAY_INDEX_REPLACE = '[$1]',
      dials               = [],
      toString            = Object.prototype.toString;

  function makeSource (map /*, ns */) {

    var ns   = arguments[1] || OUTPUT,
        type = (toString.call(map) === '[object Array]') ? ARRAY : OBJECT,
        src  = [],
        prop, val, i;

    // Open function
    if (ns === OUTPUT) {
      src.push('var ');
    }

    src.push(ns, EQUALS, type, BREAK);

    // Iterate map properties
    for (prop in map) {
      if (map.hasOwnProperty(prop)) {

        // Extract value from mapped property
        val = map[prop];

        // Render property as complete path for recursion and assignment
        // (w/ array index correction)
        prop = (ns + DOT + prop).replace(ARRAY_INDEX_SEARCH, ARRAY_INDEX_REPLACE);

        // Recurse nested objects
        if (typeof val === 'object') {

          // Special treatment for arrays
          src.push(makeSource(val, prop));

        // Render dot-delimited properties and modifiers
        } else {

          // Render left-hand assignment
          src.push(prop, EQUALS);

          // Render modifier
          if (toString.call(val) === '[object Function]') {

            // Cache modifier, referenceable by property
            dials[prop] = val;
            src.push('this.dials["', prop, '"](', INPUT, ')', BREAK);

          // Render dot-delimited property as gated assignment
          } else {

            val = (EMPTY + val).split(DOT);

            for (i = val.length - 1; i >= 0; --i) {
              val[i] = INPUT + DOT + val.slice(0, i + 1).join(DOT);
            }

            // Join partial checks (w/ array index correction)
            src.push(val.join('&&').replace(ARRAY_INDEX_SEARCH, ARRAY_INDEX_REPLACE), BREAK);
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

  // Create new function from source and attach dials array
  this.zap   = new Function(INPUT, makeSource(map));
  this.dials = dials;
}

Transmogrifier.prototype = {

  nuke: function Transmogrifier_nuke (data) {
    var i, n, arr = [];
    if (Object.prototype.toString.call(data) !== '[object Array]') {
      data = [data];
    }
    for (i = 0, n = data.length; i < n; ++i) {
      arr.push(this.zap(data[i]));
    }
    return arr;
  }

};
