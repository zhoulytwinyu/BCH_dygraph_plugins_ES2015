/**
 * @license
 * Copyright 2018 Lingyu Zhou (zhouly@bu.edu, zhoulytwin@gmail.com)
 * GNU Lesser General Public License v3.0
 */

/*global Dygraph:false */
Dygraph.Plugins.Ylimits = (function() {
  "use strict";

  /**
   * @constructor
   */
  var ylimits = function(options) {
    console.log({ylimits:options});
    // Get options
    this.color_ = "rgba(0,0,0,0.4)";
    this.data_ = options.data || [];
    // Other variables
    this.ctx_ = null;
    this.g = null;
  };

  ylimits.prototype.destroy = function (){
    // TODO
  };

  /**
   * Methods
   */
  ylimits.prototype.toString = function() {
    return "Ylimits Plugin";
  };

  ylimits.prototype.didDrawChart = function(e){
    this.drawAllLimits();
  };
  
  /**
   * @param {Dygraph} g Graph instance.
   * @return {object.<string, function(ev)>} Mapping of event names to callbacks.
   */
  ylimits.prototype.activate = function(g) {
    this.g = g;
    this.ctx_ = g.hidden_ctx_;
    return {
      didDrawChart: this.didDrawChart
    };
  };

  ylimits.prototype.drawAllLimits = function(){
    if (this.data_.length===0){
      return;
    }
    let area = this.g.getArea();
    let ctx = this.g.hidden_ctx_;
    ctx.save();
    // Set ctx
    ctx.strokeStyle=this.color_;
    ctx.fillStyle=this.color_;
    ctx.font="bold 10px Sans";
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.setLineDash([4, 4]);
    // Draw limit lines
    ctx.beginPath();
    for (let i=0; i<this.data_.length; i++){
      let row = this.data_[i];
      let y = this.g.toDomYCoord(row["y"]);
      ctx.moveTo(area.x, Math.floor(y)+0.5);
      ctx.lineTo(area.x+area.w, Math.floor(y)+0.5);
    }
    ctx.stroke();
    // Draw labels
    let prev_y = this.g.toDomYCoord(this.data_[0]["y"]);
    let prev_label = this.data_[0]["label"];
    for (let i=1; i<this.data_.length; i++){
      let row = this.data_[i];
      let y = this.g.toDomYCoord(row["y"]);
      let label = row["label"];
      // Draw previous label if fit
      if (prev_y-y >= 10){
        ctx.fillText(prev_label, area.x+area.w, prev_y);
      }
      prev_y=y;
      prev_label=label;
    }
    // Draw last label
    ctx.fillText(prev_label, area.x+area.w, prev_y);
    // Restore settings
    ctx.restore();
  };
  
  return ylimits;
})();
