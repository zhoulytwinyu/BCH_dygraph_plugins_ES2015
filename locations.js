/**
 * @license
 * Copyright 2018 Lingyu Zhou (zhouly@bu.edu, zhoulytwin@gmail.com)
 * GNU Lesser General Public License v3.0
 */

/*global Dygraph:false */
Dygraph.Plugins.Locations = (function() {
  "use strict";

  /**
   * Adds a location bar to the top of the graph and show data point
   * location in a given div.
   * @constructor
   */
  var locations = function(options) {
    console.log({locations:options});
    // Variables from options
    this.data_ = options.data || [];
    this.color_mapping_ = options.color_mapping || {};
    this.color_default_ = options.color_default || this.boston_warm_gray;
    this.color_bg_ = options.color_bg || this.cityboston_gray4;
    // Other variables
    this.g=null;
    this.canvas_ = document.createElement("canvas");
    this.picking_canvas_ = document.createElement("canvas");
    this.floater_ = document.createElement("div");
    // Styling
    this.canvas_.style.position = "absolute";
    this.floater_.style.position = "absolute";
    this.floater_.style.visibility = "hidden";
    this.floater_.style.background = "rgba(0,0,0,0.2)";
    this.floater_.style.borderRadius= "0 5px 5px 5px";
    this.floater_.style.padding = "0 2px 0 2px";
    this.floater_.addEventListener("click", function(ev){
      this.style.visibility="hidden";
    });
  };
  locations.prototype.cityboston_gray4 = "#F2F2F2";
  locations.prototype.boston_warm_gray = "#C5B9AC";
  
  locations.prototype.destroy = function(){
    //TODO
  };
  
  /**
   * Methods
   */
  locations.prototype.toString = function() {
    return "Locations Plugin";
  };

  locations.prototype.layout = function(e) {
    this.canvas_position_ = e.reserveSpaceTop(22);
    this.floater_.style.top = this.canvas_position_.x+"px";
  };

  locations.prototype.select = function(e) {
    let g = this.g;
    let unix_sec = e.selectedX/1000;
    let scale_x = g.canvas_.width/g.width_;
    let scale_y = g.canvas_.height/g.height_;
    let domXCoord = e.selectedPoints[0].canvasx;
    this.floater_.style.left = domXCoord+"px";
    let canvasXCoord = domXCoord - this.canvas_position_.x;
    let ctxPicking = this.picking_canvas_.getContext("2d");
    let id = this.ColorToId( ctxPicking.getImageData(canvasXCoord*scale_x,11*scale_y,1,1).data );
    if (id===null){
      this.floater_.innerHTML = "Location unknown.";
    }
    else {
      this.floater_.innerHTML = this.data_[id]["label"];
    }
    this.floater_.style.visibility="visible";
  };
  
  locations.prototype.deselect = function(e) {
    this.floater_.style.visibility="hidden";
  };
  
  locations.prototype.clearChart = function(e) {
    let canvas = this.canvas_;
    let picking_canvas = this.picking_canvas_;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    picking_canvas.getContext("2d").clearRect(0, 0, picking_canvas.width, picking_canvas.height);
  };

  locations.prototype.didDrawChart = function(e){
    let g=this.g;
    let area = g.getArea();
    this.canvas_position_.x=area.x;
    this.canvas_position_.w=area.w;
    let scale_x = g.canvas_.width/g.width_;
    let scale_y = g.canvas_.height/g.height_;
    // Resize canvas
    this.canvas_.style.left = this.canvas_position_.x+"px";
    this.canvas_.style.top = this.canvas_position_.y+"px";
    this.canvas_.style.width = this.canvas_position_.w+"px";
    this.canvas_.style.height = this.canvas_position_.h+"px";
    this.canvas_.width = this.canvas_position_.w*scale_x;
    this.canvas_.height = this.canvas_position_.h*scale_y;
    var ctx = this.canvas_.getContext("2d");
    ctx.scale(scale_x,scale_y);
    ctx.fillStyle=this.color_bg_;
    ctx.fillRect(0, 0, this.canvas_.width, this.canvas_.height);
    this.picking_canvas_.style.left = this.canvas_position_.x+"px";
    this.picking_canvas_.style.top = this.canvas_position_.y+"px";
    this.picking_canvas_.style.width = this.canvas_position_.w+"px";
    this.picking_canvas_.style.height = this.canvas_position_.h+"px";
    this.picking_canvas_.width = this.canvas_position_.w*scale_x;
    this.picking_canvas_.height = this.canvas_position_.h*scale_y;
    this.picking_canvas_.getContext("2d").scale(scale_x,scale_y);
    this.drawAllIntervals();
    this.drawAllIntervalsPicking();
  };
  
  locations.prototype.activateCustomEventHandler = function(){
    let self=this;
    this.canvas_.addEventListener("dblclick",function(ev){
      let x = Math.round(ev.layerX,1);
      let y = Math.round(ev.layerY,1);
      let pick_color = self.picking_canvas_.getContext("2d").
                           getImageData(x,y,1,1).data;
      let id = self.ColorToId(pick_color);
      console.log([x,y,id]);
      if (id === null){
        return;
      }
      else {
        let row = self.data_[id];
        let start = new Date(row["start"]*1000);
        let end = row["end"]===null ? new Date() : new Date(1000*row["end"]);
        self.g.doZoomXDates_( start,
                              end
                              );
      }
    });
  }
  
  /**
   * @param {Dygraph} g Graph instance.
   * @return {object.<string, function(ev)>} Mapping of event names to callbacks.
   */
  locations.prototype.activate = function(g) {
    this.g=g;
    g.graphDiv.appendChild(this.canvas_);
    g.graphDiv.appendChild(this.floater_);
    this.activateCustomEventHandler();
    
    return {
      layout: this.layout,
      select: this.select,
      deselect: this.deselect,
      clearChart: this.clearChart,
      didDrawChart: this.didDrawChart
    };
  };

  /**
   * Helper functions
   */
  locations.prototype.toCanvasXCoord = function(date_obj){
    let offsetx = this.canvas_position_.x;
    let g = this.g;
    return g.toDomXCoord( date_obj ) - offsetx;
  };

  locations.prototype.IdToColor = function(id){
    let r = Math.floor(id/65536);
    let g = Math.floor(id%65536/256);
    let b = id%256;
    
    return `rgba(${r},${g},${b},1)`;
  };

  locations.prototype.ColorToId=function(rgba){
    let a = rgba[3];
    if (a !== 255){
      return null;
    }
    
    let r = rgba[0];
    let g = rgba[1];
    let b = rgba[2];
    let id = r*65536+g*256+b;
    return id;
  };

  locations.prototype.drawAllIntervals = function(){
    let ctx = this.canvas_.getContext("2d");
    for (let i=0; i<this.data_.length; i++) {
      let row=this.data_[i];
      let start = this.toCanvasXCoord( new Date(1000*row["start"]) );
      let end = this.toCanvasXCoord( row["end"] ? new Date(1000*row["end"]) : new Date());
      let label = row["label"];
      ctx.fillStyle = this.color_mapping_.hasOwnProperty(label) ?
                      this.color_mapping_[label] :
                      this.color_default_;
      ctx.fillRect(start,1,end-start,20);
    }
  };

  locations.prototype.drawAllIntervalsPicking = function(){
    let ctx = this.picking_canvas_.getContext("2d");
    for (let i=0; i<this.data_.length; i++) {
      let row=this.data_[i];
      let start = this.toCanvasXCoord( new Date(1000*row["start"]) );
      let end = this.toCanvasXCoord( row["end"] ? new Date(1000*row["end"]) : new Date());
      let label = new Date(1000*row["label"]);
      ctx.fillStyle = this.IdToColor(i);
      ctx.fillRect(start,1,end-start,20);
    }
  };
  
  return locations;
})();
