

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

  var arrayIndexRegExp    = /^\d+$/,
      chunker             = /(\.?[a-zA-Z_$][\w$]*)|(?:(?:\[(["']?))(?:([a-zA-Z_$][\w$]*)|(\d+)|([^"']+))(?:\2\]))/g,
      dials               = [],
      toString            = Object.prototype.toString;

  function makeSource (map /*, ns */) {

    var ns   = arguments[1] || 'o',
        type = (toString.call(map) === '[object Array]') ? '[]' : '{}',
        src,
        prop,
        val,
        props,
        parts,
        p;

    // Render namespace
    src = ns + '=' + type + ';';

    // Iterate mapped properties
    for (prop in map) {
      if (map.hasOwnProperty(prop)) {

        // Extract value from mapped property
        val = map[prop];

        // Render property as complete path for recursion and assignment
        // (w/ array index correction)
        prop = ns + (arrayIndexRegExp.test(prop) ? '[' + prop + ']' : '.' + prop);

        // Recurse nested objects
        if (typeof val === 'object') {
          
          src += makeSource(val, prop);

        // Render dot-delimited properties and modifiers
        } else {

          // Render left-hand assignment
          src += prop + '=';

          // Render modifier
          if (toString.call(val) === '[object Function]') {

            // Cache modifier, referenceable by property
            dials[prop] = val;
            
            // Render right-hand assignment by function
            src += 'this.dials["' + prop + '"](i)' + ';';

          // Render dot-delimited property as gated assignment
          } else {

            props = parts = '';
            
            /**
             * 0 = match
             * 1 = property (dot-notation)
             * 2 = quote
             * 3 = property (bracket-notation, clean)
             * 4 = index (bracket-notation)
             * 5 = property (bracket-notation, dirty)
             */
            while ((p = chunker.exec(val)) !== null) {

              // Optimize properties (remove brackets/quotes where unnecessary)
              props += p[1] || p[3] && '.' + p[3] || '[' + (p[4] || '"' + p[5] + '"') + ']';

              // Join gated assignment
              parts += '&&i.' + props;
            }

            // Render right-hand assignment by property
            src += parts.substr(2) + ';';
          }
        }
      }
    }

    // Wrap function
    return (ns === 'o') ? 'var ' + src + 'return o;' : src;
  }

  // Create new function from source and attach dials array
  this.zap   = new Function('i', makeSource(map));
  this.dials = dials;
}

Transmogrifier.prototype = {

  nuke: function (data) {
    var i, n, arr = [];
    for (i = 0, n = data.length; i < n; ++i) {
      arr.push(this.zap(data[i]));
    }
    return arr;
  }
};
