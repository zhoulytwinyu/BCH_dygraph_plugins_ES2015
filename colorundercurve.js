/**
 * @license
 * Copyright 2018 Lingyu Zhou (zhouly@bu.edu, zhoulytwin@gmail.com)
 * GNU Lesser General Public License v3.0
 */

import Dygraph from "dygraphs";

Dygraph.Plugins.ColorUnderCurve = (function() {
  "use strict";

  /**
   * @constructor
   */
  var colorundercurve = function(options) {
    console.log({colorundercurve:options});
    this.data_ = options.data || [];
    this.color_canvas_ = document.createElement("canvas");
    this.color_canvas_.width=1;
    this.color_canvas_.height=1;
    this.color_canvas_ctx_ = this.color_canvas_.getContext("2d");
    this.g = null;
  };

  colorundercurve.prototype.destroy = function() {
    //TODO
  };
  
  /**
   * Methods
   */
  colorundercurve.prototype.toString = function() {
    return "ColorUnderCurve Plugin";
  };

  colorundercurve.prototype.click = function(e){
  };
  
  colorundercurve.prototype.dblclick = function(e){
  };
  
  colorundercurve.prototype.didDrawChart = function(e){
    let g=this.g;
    let area = this.g.getArea();
    let ctx = this.g.hidden_ctx_;
    this.drawAreaBorder();
    this.data_.forEach(row =>
      this.recolor(row["start"],row["end"],row["color"])
    );
  };
  
  /**
   * @param {Dygraph} g Graph instance.
   * @return {object.<string, function(ev)>} Mapping of event names to callbacks.
   */
  colorundercurve.prototype.activate = function(g) {
    this.g = g;
    return {
      click: this.click,
      dblclick: this.dblclick,
      // Since we draw on top of dygraph plotting canvas,
      // we rely on dygraph's default behavior to clear the chart.
      //clearChart: function(e){console.log("clearChart");},
      didDrawChart: this.didDrawChart
    };
  };

  /**
   * Helper
   */
  colorundercurve.prototype.drawAreaBorder = function() {
    let g = this.g;
    let ctx = g.hidden_ctx_;
    let area = g.getArea();
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1*window.devicePixelRatio;
    ctx.moveTo(area.x       , area.y       );
    ctx.lineTo(area.x       , area.y+area.h);
    ctx.lineTo(area.x+area.w, area.y+area.h);
    ctx.stroke();
  }
  
  colorundercurve.prototype.recolor = function(start_sec,end_sec, color){
    let g = this.g;
    let canvas = g.hidden_;
    let ctx = g.hidden_ctx_;
    let scale = window.devicePixelRatio;
    let start = g.toDomXCoord( new Date(start_sec*1000) );
    let end = g.toDomXCoord( end_sec ? new Date(end_sec*1000) : new Date() );
    let area = g.getArea();
    start = Math.max(start,area.x+1);
    end = Math.min(end,area.x+area.w-1);
    if (end <= area.x ||
        start >= area.x+area.w
        ) {
      return;
    }
    let img_data = ctx.getImageData(start*scale,
                                    area.y*scale,
                                    (end-start+1)*scale,
                                    (area.h-1)*scale
                                    );
    let rgba = this.colorToRGBA(color);
    for (let i=0, stop=img_data.data.length/4; i<stop; i++){
      if (img_data.data[i*4+3]===0){
        continue;
      }
      let alpha = img_data.data[i*4+3]/255;
      img_data.data[i*4] = rgba[0] * alpha;
      img_data.data[i*4+1] = rgba[1] * alpha;
      img_data.data[i*4+2] = rgba[2] * alpha;
    }
    ctx.putImageData(img_data, start*scale, area.y*scale,);
  };

  colorundercurve.prototype.colorToRGBA = function(color){
    let ctx = this.color_canvas_ctx_;
    ctx.fillStyle=color;
    ctx.fillRect(0,0,1,1);
    return ctx.getImageData(0,0,1,1).data;
  }
  
  return colorundercurve;
})();
