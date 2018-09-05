/**
 * @license
 * Copyright 2018 Lingyu Zhou (zhouly@bu.edu, zhoulytwin@gmail.com)
 * GNU Lesser General Public License v3.0
 */

/*global Dygraph:false */
Dygraph.Plugins.ColorUnderCurve = (function() {
  "use strict";

  /**
   * @constructor
   */
  var colorundercurve = function(options) {
    console.log({colorundercurve:options});
    this.canvas_ctx_ = null;
    this.g = null;
  };

  /**
   * Methods
   */
  colorundercurve.prototype.toString = function() {
    return "ColorUnderCurve Plugin";
  };

  colorundercurve.prototype.click = function(e){
    console.log({click:[e.canvasx,e.canvasy]});
  };
  
  colorundercurve.prototype.dblclick = function(e){
    console.log({dblclick:[e.canvasx,e.canvasy]});
  };
  
  colorundercurve.prototype.didDrawChart = function(e){
    let ctx = this.canvas_ctx_;
    let area = this.g.getArea();
    console.log(area);
    let baseliney = area.y+area.h-1;
    let data=ctx.getImageData(area.x+1,baseliney,area.w,1);

  };
  
  /**
   * @param {Dygraph} g Graph instance.
   * @return {object.<string, function(ev)>} Mapping of event names to callbacks.
   */
  colorundercurve.prototype.activate = function(g) {
    this.g = g;
    console.log(g);
    this.canvas_ctx_ = g.hidden_ctx_;
    return {
      click: this.click,
      dblclick: this.dblclick,
      // Since we draw on top of dygraph plottting canvas,
      // we rely on dygraph's default behavior to clear the chart.
      //clearChart: function(e){console.log("clearChart");},
      didDrawChart: this.didDrawChart
    };
  };

  /**
   * Helper
   */
  colorundercurve.prototype.floodLineFill = function(x){
  }
  
  return colorundercurve;
})();
