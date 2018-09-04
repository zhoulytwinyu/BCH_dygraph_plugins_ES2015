/**
 * @license
 * Copyright 2018 Lingyu Zhou (zhouly@bu.edu, zhoulytwin@gmail.com)
 * GNU Lesser General Public License v3.0
 */

/*global Dygraph:false */
Dygraph.Plugins.Intervals = (function() {
  "use strict";

  /**
   * Creates interactive events in the graphs and shows time diff
   * between the hover point to the selected event.
   *
   * @constructor
   */
  var intervals = function(options) {
    console.log(options);
    this.data_ = options.data;
  };

  /**
   * Methods
   */
  intervals.prototype.toString = function() {
    return "Intervals Plugin";
  };
  
  /**
   * @param {Dygraph} g Graph instance.
   * @return {object.<string, function(ev)>} Mapping of event names to callbacks.
   */
  intervals.prototype.activate = function(g) {
    return {
      layout: function(e){
        console.log("intervals");
        console.log(e.reserveSpaceTop(30));
      }
      //click: function(e){console.log("click");},
      //dblclick: function(e){console.log("dblclick");},
      //select: function(e){console.log("select");},
      //deselect: function(e){console.log("deselect");},
      //clearChart: function(e){console.log("clearChart");},
      //predraw: function(e){console.log("predraw");},
      //didDrawChart: function(e){console.log("didDrawChart");}
    };
  };
  
  return intervals;
})();
