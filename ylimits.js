/**
 * @license
 * Copyright 2018 Lingyu Zhou (zhouly@bu.edu, zhoulytwin@gmail.com)
 * GNU Lesser General Public License v3.0
 */

import Dygraph from "dygraphs";

Dygraph.Plugins.Ylimits = (function() {

  /**
   * Plot horizontal limits with labels sitting vertically centered between
   * LB, UB lines using dygraph's hidden_ctx_.
   * Options: color, data.
   * - data format: [{'LB','UB','label'} ...]
   * @constructor
   */
  var ylimits = function(options) {
    console.log({ylimits:options});
    // Get options
    this.data_ = options.data || [];
    this.color_ = options.color || "rgba(0,0,0,0.25)";
    // Other variables
    this.g = null;
    this.sideCanvas_ = document.createElement("canvas");
    this.sideCanvas_ctx_ = this.sideCanvas_.getContext("2d");
    this.sideCanvas_position = null;
    // Styling
    this.sideCanvas_.style.position = "absolute";
  };
  
  ylimits.prototype.WIDTH=100;
  
  /**
   * Reset all variables
   */
  ylimits.prototype.destroy = function (){
    this.data_ = null;
    this.color_ = null;
    this.sideCanvas_.remove();
    this.sideCanvas_ = null;
    this.sideCanvas_ctx_ = null;
    this.sideCanvas_position = null;
    this.g = null;
  };

  /**
   * For debug
   */
  ylimits.prototype.toString = function() {
    return "Ylimits Plugin";
  };

  /**
   * Redraw limits on graph redraw.
   */
  ylimits.prototype.layout = function(e){
    this.sideCanvas_position_ = e.reserveSpaceRight(this.WIDTH);
  };
  
  /**
   * Redraw limits on graph redraw.
   */
  ylimits.prototype.didDrawChart = function(e){
    let g = this.g;
    let area = g.getArea();
    let scale = window.devicePixelRatio;
    this.sideCanvas_.style.width=this.WIDTH;
    this.sideCanvas_.style.height=area.h;
    this.sideCanvas_.style.top=area.y+"px";
    this.sideCanvas_.style.left=this.sideCanvas_position_.x+"px";
    this.sideCanvas_.width=this.WIDTH * scale;
    this.sideCanvas_.height=area.h * scale;
    this.sideCanvas_ctx_.scale(scale,scale);
    this.drawAllLimits();
  };
  
  /**
   * @param {Dygraph} g Graph instance.
   * @return {object.<string, function(ev)>} Mapping of event names to callbacks.
   */
  ylimits.prototype.activate = function(g) {
    this.g = g;
    g.graphDiv.appendChild(this.sideCanvas_);
    return {
      layout: this.layout,
      didDrawChart: this.didDrawChart
    };
  };

  /**
   * Draw all horizontal limits and then add the label to upper right,
   * if the space allows.
   */
  ylimits.prototype.drawAllLimits = function(){
    if (this.data_.length===0){
      return;
    }
    let area = this.g.getArea();
    let ctx = this.g.hidden_ctx_;
    ctx.save();
    // Set ctx
    ctx.strokeStyle=this.color_;
    ctx.setLineDash([4, 4]);
    this.sideCanvas_ctx_.textAlign = "left";
    this.sideCanvas_ctx_.textBaseline = "middle";
    this.sideCanvas_ctx_.font="bold 10px Sans";
    this.sideCanvas_ctx_.fillStyle="black";
    // Draw limit lines
    ctx.beginPath();
    for (let i=0; i<this.data_.length; i++){
      let row = this.data_[i];
      let y = this.g.toDomYCoord(row["LB"]);
      ctx.moveTo(area.x, Math.floor(y)+0.5);
      ctx.lineTo(area.x+area.w, Math.floor(y)+0.5);
      y = this.g.toDomYCoord(row["UB"]);
      ctx.moveTo(area.x, Math.floor(y)+0.5);
      ctx.lineTo(area.x+area.w, Math.floor(y)+0.5);
    }
    ctx.stroke();
    // Draw labels
    for (let i=0; i<this.data_.length; i++){
      let row = this.data_[i];
      let y = this.g.toDomYCoord( (row["LB"]+row["UB"])/2 ) - area.y;
      let label = row["label"];
      // Draw previous label if fit
      this.sideCanvas_ctx_.fillText(label, 0, y);
    }
    // Restore settings
    ctx.restore();
  };
  
  return ylimits;
})();
