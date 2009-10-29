

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

  var chunker  = /(\.?[a-zA-Z_$][\w$]*)|(?:(?:\[(["']?))(?:([a-zA-Z_$][\w$]*)|(\d+)|([^"']+))(?:\2\]))/g,
      toString = Object.prototype.toString;

  // Modifiers
  this._ = {};
  
  function makeSource (map /*, ns */) {
    var ns  = arguments[1] || 'o',
        src = ns + '=' + ((toString.call(map) === '[object Array]') ? '[]' : '{}') + ';',
        prop,
        val,
        props,
        parts,
        p;

    // Iterate mapped properties
    for (prop in map) {
      if (map.hasOwnProperty(prop)) {

        // Extract value from mapped property
        val = map[prop];

        // Render property as complete path for recursion and assignment
        // (w/ array index correction)
        prop = ns + (isNaN(prop) ? '.' + prop : '[' + prop + ']');

        // Recurse nested objects
        if (typeof val === 'object') {
          
          // Maintain context of instance
          src += makeSource.call(this, val, prop);

        // Render dot-delimited properties and modifiers
        } else {

          // Render left-hand assignment
          src += prop + '=';

          // Render modifier
          if (toString.call(val) === '[object Function]') {

            // Cache modifier, referenceable by property
            this._[prop] = val;
            
            // Render right-hand assignment by function
            src += 'this._["' + prop + '"](i);';

          // Render dot-delimited property as gated assignment
          } else {

            // Allow use of numeric index for array transmogrification
            if (!isNaN(val)) {
              val = '[' + val + ']';
            }
            
            /**
             * Optimize properties (remove brackets/quotes where unnecessary)
             *
             * 0 = match
             * 1 = property (dot-notation)
             * 2 = quote
             * 3 = property (bracket-notation, clean)
             * 4 = index (bracket-notation)
             * 5 = property (bracket-notation, dirty)
             */
            props = parts = '';

            while ((p = chunker.exec(val)) !== null) {
              props += p[1] || p[3] && '.' + p[3] || '[' + (p[4] || '"' + p[5] + '"') + ']';

              // Join gated assignment
              parts += '&&i' + ((props.charAt(0) !== '[') ? '.' : '') + props;
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

  // Create new function from source
  // Call in context of instance to maintain reference to modifiers array
  this.zap = new Function('i', makeSource.call(this, map));
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


