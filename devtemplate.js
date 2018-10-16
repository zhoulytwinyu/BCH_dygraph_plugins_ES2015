/**
 * @license
 * Copyright 2018 Lingyu Zhou (zhouly@bu.edu, zhoulytwin@gmail.com)
 * GNU Lesser General Public License v3.0
 */

import Dygraph from "dygraphs";

Dygraph.Plugins.Devtemplate = (function() {
  "use strict";

  /**
   * @constructor
   */
  var devtemplate = function(options) {
  };

  /**
   * Methods
   */
  devtemplate.prototype.toString = function() {
    return "DevTemplate Plugin";
  };
  
  /**
   * @param {Dygraph} g Graph instance.
   * @return {object.<string, function(ev)>} Mapping of event names to callbacks.
   */
  devtemplate.prototype.activate = function(g) {
    //g.canvas_.addEventListener("mousemove",function(ev){
      //console.log([ev.layerX, ev.layerY]);
    //})
    return {
      //layout: function(e){console.log({layout:e});},
      //click: function(e){console.log([e.canvasx,e.canvasy]);},
      //dblclick: function(e){console.log("dblclick");},
      //select: function(e){console.log("select");},
      //deselect: function(e){console.log("deselect");},
      //clearChart: function(e){console.log("clearChart");},
      //predraw: function(e){console.log("predraw");},
      //didDrawChart: function(e){console.log({didDrawChart:e});}
    };
  };
  
  return devtemplate;
})();
