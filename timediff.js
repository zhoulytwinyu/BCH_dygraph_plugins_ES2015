/**
 * @license
 * Copyright 2018 Lingyu Zhou (zhouly@bu.edu, zhoulytwin@gmail.com)
 * GNU Lesser General Public License v3.0
 */

/*global Dygraph:false */
Dygraph.Plugins.Timediff = (function() {
  "use strict";

  /**
   * Creates interactive events in the graphs and shows time diff
   * between the hover point to the selected event.
   *
   * @constructor
   */
  var timediff = function(options) {
    console.log(options);
    // Copy over options
    this.data_ = options.data;
    this.color_selected_ = options.color_selected || this.boston_red;
    this.color_normal_ = options.color_normal || "black";
    // Create other variables
    this.g = null;
    this.canvas_=document.createElement("canvas");
    this.dynamic_canvas_ = document.createElement("canvas");
    this.picking_canvas_=document.createElement("canvas");
    this.selected_event_idx_ = null;
    this.selected_data_time_ = null;
  };
  timediff.prototype.boston_red = "#F6323E";

  /**
   * Methods
   */
  timediff.prototype.toString = function() {
    return "Timediff Plugin";
  };

  timediff.prototype.click = function(e) {
    let g=e.dygraph;
    let ctxDraw = this.canvas_.getContext("2d");
    let ctxPicking = this.picking_canvas_.getContext("2d");
    let ctxDynamic = this.dynamic_canvas_.getContext("2d");
    let x = e.canvasx;
    let y = e.canvasy;
    
    let pixel_color = ctxPicking.getImageData(x,y,1,1).data;
    let eventIdx = this.ColorToId(pixel_color);

    if (eventIdx===this.selected_event_idx_) {
      return;
    }
    this.selected_event_idx_=eventIdx;
    ctxDraw.clearRect(0, 0, this.canvas_.width, this.canvas_.height);
    this.drawAllLabels();
    ctxDynamic.clearRect(0, 0, this.dynamic_canvas_.width, this.dynamic_canvas_.height);
    this.drawTimeDiff();
  };

  timediff.prototype.select = function(e) {
    this.selected_data_time_ = Math.floor(e.selectedX/1000);
    if (this.selected_event_idx_===null){
      return;
    }
    let ctxDynamic = this.dynamic_canvas_.getContext("2d");
    ctxDynamic.clearRect(0, 0, this.dynamic_canvas_.width, this.dynamic_canvas_.height);
    this.drawTimeDiff();
  };

  timediff.prototype.deselect = function(e) {
    let dynamic_canvas=this.dynamic_canvas_;
    dynamic_canvas.getContext("2d").clearRect(0, 0, dynamic_canvas.width, dynamic_canvas.height);
  };

  timediff.prototype.clearChart = function(e) {
    let canvas = this.canvas_;
    let dynamic_canvas = this.dynamic_canvas_;
    let picking_canvas = this.picking_canvas_;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    dynamic_canvas.getContext("2d").clearRect(0, 0, dynamic_canvas.width, dynamic_canvas.height);
    picking_canvas.getContext("2d").clearRect(0, 0, picking_canvas.width, picking_canvas.height);
  };
  
  timediff.prototype.didDrawChart = function(e) {
    let g=this.g;
    let height = g.height_;
    let width = g.width_;
    // Resize canvases
    this.canvas_.width = width;
    this.canvas_.height = height;
    this.dynamic_canvas_.width = width;
    this.dynamic_canvas_.height = 10; // special height
    this.picking_canvas_.width = width;
    this.picking_canvas_.height = height;
    // Draw on canvases
    this.drawAllLabels();
    this.drawTimeDiff();
    this.drawAllLabelsPicking();
  };
  
  /**
   * @param {Dygraph} g Graph instance.
   * @return {object.<string, function(ev)>} Mapping of event names to callbacks.
   */
  timediff.prototype.activate = function(g) {
    this.canvas_.style.position="absolute";
    g.graphDiv.prepend(this.canvas_);
    this.dynamic_canvas_.style.position="absolute";
    g.graphDiv.prepend(this.dynamic_canvas_);
    this.g=g;
    
    return {
      click: this.click,
      select: this.select,
      deselect: this.deselect,
      clearChart: this.clearChart,
      didDrawChart: this.didDrawChart,
    };
  };

  timediff.prototype.destroy = function() {
  };

  /**
   * Helper functions
   */
  timediff.prototype.IdToColor = function(id){
    let r = Math.floor(id/65536);
    let g = Math.floor(id%65536/256);
    let b = id%256;
    
    return `rgba(${r},${g},${b},1)`;
  };

  timediff.prototype.ColorToId=function(rgba){
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

  timediff.prototype.drawLabel=function (ctx, x, ymin, ymax, label, color){
    let label_offsetX = 3;
    let label_offsetY = -3;
    // Line stroke
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle=color;
    ctx.setLineDash([4, 2]);
    ctx.moveTo(x, ymin);
    ctx.lineTo(x, ymax);
    ctx.stroke();
    // Fill text
    ctx.translate(x, 0);
    ctx.rotate(Math.PI/2);
    ctx.textAlign = "left";
    ctx.font= "8px sans-serif";
    ctx.fillStyle= color;
    ctx.fillText(label, label_offsetX, label_offsetY);
    ctx.restore();
  };

  timediff.prototype.drawLabelPicking=function (ctx, x, ymin, ymax, label, id){
    let label_offsetX = 3;
    let label_offsetY = -3;
    let color = this.IdToColor(id);
    // Fill text
    ctx.save();
    ctx.translate(x, 0);
    ctx.rotate(Math.PI/2);
    ctx.textAlign = "left";
    ctx.font= "8px sans-serif";
    ctx.fillStyle= color;
    let labelShape = ctx.measureText(label);
    ctx.fillRect(label_offsetX, label_offsetY, labelShape.width, -8); // 8 is because of the font size
    ctx.restore();
  };
  
  timediff.prototype.drawAllLabels = function (){
    let g = this.g;
    let area = g.getArea();
    let ctx = this.canvas_.getContext("2d");
    // Draw all labels
    for (let i=0; i<this.data_.length; i++) {
      let row = this.data_[i];
      let x = g.toDomXCoord( new Date(1000*row["time"]) );
      if (x<area.x){
        continue;
      }
      let label = row["label"];
      this.drawLabel(ctx, x, area.y, area.y+area.h, label, this.color_normal_ );
    }
    
    // Draw the selected label
    let selected_event_idx = this.selected_event_idx_;
    if (selected_event_idx!==null){
      let row = this.data_[selected_event_idx];
      let x = g.toDomXCoord( new Date(1000*row["time"]) );
      let label = row["label"];
      this.drawLabel(ctx, x, area.y, area.y+area.h, label, this.color_selected_ );
    }
  }
  
  timediff.prototype.drawAllLabelsPicking = function (){
    let g = this.g;
    let area = g.getArea();
    let ctx = this.picking_canvas_.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    // Draw all labels picking
    for (let i=0; i<this.data_.length; i++) {
      let row = this.data_[i];
      let x = g.toDomXCoord( new Date(1000*row["time"]) );
      if (x<area.x){
        continue;
      }
      let label = row["label"];
      this.drawLabelPicking(ctx, x, area.y, area.y+area.h, label, i);
    }
  }

  timediff.prototype.drawTimeDiff = function(){
    if (this.selected_event_idx_===null ||
        this.selected_data_time_===null) {
      return;
    }
    let g = this.g;
    let dynamic_canvas = this.dynamic_canvas_;
    let selected_event_idx = this.selected_event_idx_;
    let eventTime = this.data_[selected_event_idx]["time"];
    let selected_data_time = this.selected_data_time_;
    let timediffLabel = this.prettyInterval(selected_data_time - eventTime);
    // Draw
    let ctx = dynamic_canvas.getContext("2d");
    ctx.font="8px sans-serif";
    let timediffLabelWidth = ctx.measureText(timediffLabel).width;
    let eventX = g.toDomXCoord(new Date(1000*eventTime) );
    let dataX = g.toDomXCoord(new Date(1000*selected_data_time) );
    let color = this.color_selected_;
    ctx.strokeStyle=color;
    ctx.fillStyle=color;
    ctx.textBaseline = "middle";
    ctx.beginPath();
    ctx.moveTo(eventX, 10);
    ctx.lineTo(eventX, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(dataX, 10);
    ctx.lineTo(dataX, 0);
    ctx.stroke();
    if (eventX-dataX > 0) {
      if (eventX-dataX >= 20) {
        this.drawArrow(ctx,eventX,5,"right");
        this.drawArrow(ctx,dataX,5,"left");
      }
      if (eventX - dataX >=20+timediffLabelWidth){
        ctx.textAlign="left";
        ctx.fillText(timediffLabel, dataX+10, 5);
      }
      else {
        ctx.textAlign="right";
        ctx.fillText(timediffLabel, dataX-3, 5);
      }
    }
    if (dataX-eventX >= 0) {
      if (dataX-eventX >= 20) {
        this.drawArrow(ctx,eventX+12,5,"left");
        this.drawArrow(ctx,dataX,5,"right");
      }
      if (dataX-eventX >=30+timediffLabelWidth){
        ctx.textAlign="right";
        ctx.fillText(timediffLabel, dataX-10, 5);
      }
      else {
        ctx.textAlign="left";
        ctx.fillText(timediffLabel, dataX+10, 5);
      }
    }
  };

  timediff.prototype.drawArrow = function(ctx,x,y,direction){
    if (direction==="left"){
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x+3, y-4);
      ctx.moveTo(x, y);
      ctx.lineTo(x+3, y+4);
      ctx.moveTo(x, y);
      ctx.lineTo(x+7, y);
      ctx.stroke();
      return;
    }
    if (direction==="right"){
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x-3, y-4);
      ctx.moveTo(x, y);
      ctx.lineTo(x-3, y+4);
      ctx.moveTo(x, y);
      ctx.lineTo(x-7, y);
      ctx.stroke();
      return;
    }
  }

  timediff.prototype.interval_units = [ ["year",365*24*60*60],
                                        ["month",30*24*60*60],
                                        ["day",24*60*60],
                                        ["hour",60*60],
                                        ["min",60],
                                        ["sec",1]
                                        ];
  timediff.prototype.prettyInterval=function(unix_sec,precision=2){
    let output = "0 sec";
    let prepend = '';
    let tmpSec = unix_sec;
    if (tmpSec<0){
      tmpSec = -tmpSec;
      prepend = '-';
    }
    
    for (let i=0,p=precision; i<this.interval_units.length; i++){
      let unit = this.interval_units[i][0];
      let value = this.interval_units[i][1];
      let num = Math.floor(tmpSec/value);
      if (p==precision && num==0){
        continue;
      }
      else if (p == precision){
        output=num+" "+unit;
        tmpSec-=num*value;
        p-=1;
      }
      else {
        output+=","+num+" "+unit;
        tmpSec-=num*value;
        p-=1;
      }
      if (p==0){
        break;
      }
    }
    return prepend+output;
  };
  
  return timediff;
})();
