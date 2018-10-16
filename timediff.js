/**
 * @license
 * Copyright 2018 Lingyu Zhou (zhouly@bu.edu, zhoulytwin@gmail.com)
 * GNU Lesser General Public License v3.0
 */

import Dygraph from "dygraphs";

Dygraph.Plugins.Timediff = (function() {

  /**
   * Creates interactive events in the graphs and shows time diff
   * between the hover point to the selected event.
   *
   * @constructor
   */
  var timediff = function(options) {
    console.log({timediff:options});
    // Copy over options
    this.data_ = options.data || [];
    // Create other variables
    this.g = null;
    this.canvas_=document.createElement("canvas");
    this.canvas_position_ = null;
    this.picking_canvas_ = document.createElement("canvas");
    this.dynamic_canvas_ = document.createElement("canvas");
    this.dynamic_canvas_position_=null;
    this.selected_event_idx_ = null;
    this.default_selected_ = true;
    this.selected_data_time_ = null;
  };
  timediff.prototype.BOSTON_RED = "#F6323E";
  timediff.prototype.BOSTON_MEADOW = "#A4D65E";

  timediff.prototype.destroy = function() {
    this.data_ = null;
    this.g = null;
    this.canvas_= null;
    this.dynamic_canvas_ = null;
    this.picking_canvas_= null;
    this.canvas_position_=null;
    this.dynamic_canvas_position_=null;
    this.selected_event_idx_ = null;
    this.default_selected_ = true;
    this.selected_data_time_ = null;
  };

  /**
   * Methods
   */
  timediff.prototype.toString = function() {
    return "Timediff Plugin";
  };

  timediff.prototype.layout = function(e){
    this.dynamic_canvas_position_ = e.reserveSpaceTop(12);
  };

  timediff.prototype.click = function(e) {
    let ctxDraw = this.canvas_.getContext("2d");
    let ctxPicking = this.picking_canvas_.getContext("2d");
    let ctxDynamic = this.dynamic_canvas_.getContext("2d");
    let x = e.canvasx;
    let offsetx = this.canvas_position_.x;
    let y = e.canvasy;
    let offsety = this.canvas_position_.y;
    let scale = window.devicePixelRatio;
    
    let pixel_color = ctxPicking.getImageData((x-offsetx)*scale,
                                              (y-offsety)*scale,
                                              1,
                                              1
                                              ).data;
    let eventIdx = this.ColorToId(pixel_color);

    if (eventIdx===this.selected_event_idx_) {
      return;
    }
    this.selected_event_idx_=eventIdx;
    if (this.selected_event_idx_===null) {
      this.default_selected_=true;
    }
    else {
      this.default_selected_=false;
    }
    ctxDraw.clearRect(0, 0, this.canvas_.width, this.canvas_.height);
    ctxDynamic.clearRect(0, 0, this.dynamic_canvas_.width, this.dynamic_canvas_.height);
    this.drawAllLabels();
    this.drawTimeDiff();
  };

  timediff.prototype.select = function(e) {
    this.selected_data_time_ = Math.floor(e.selectedX/1000);
    let ctxDraw = this.canvas_.getContext("2d");
    let ctxDynamic = this.dynamic_canvas_.getContext("2d");
    let scale = window.devicePixelRatio;
    if (this.default_selected_) {
      let cur_default_event_idx = this.selectDefaultEvent(this.selected_data_time_);
      if (cur_default_event_idx !== this.selected_event_idx_) {
        this.selected_event_idx_ = cur_default_event_idx;
        ctxDraw.clearRect(0, 0, this.canvas_.width/scale, this.canvas_.height/scale);
        this.drawAllLabels();
      }
    }
    ctxDynamic.clearRect(0, 0, this.dynamic_canvas_.width/scale, this.dynamic_canvas_.height/scale);
    this.drawTimeDiff();
  };

  timediff.prototype.deselect = function(e) {
    let dynamic_canvas=this.dynamic_canvas_;
    let scale = window.devicePixelRatio;
    dynamic_canvas.getContext("2d").clearRect(0, 0, dynamic_canvas.width/scale, dynamic_canvas.height/scale);
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
    let area = g.getArea();
    this.canvas_position_ = area;
    this.dynamic_canvas_position_.w = area.w;
    this.dynamic_canvas_position_.x = area.x;
    let scale = window.devicePixelRatio;
    // Resize canvases
    this.canvas_.style.top = this.canvas_position_.y+"px";
    this.canvas_.style.left = this.canvas_position_.x+"px";
    this.canvas_.style.width = this.canvas_position_.w+"px";
    this.canvas_.style.height = this.canvas_position_.h+"px";
    this.canvas_.width = this.canvas_position_.w*scale;
    this.canvas_.height = this.canvas_position_.h*scale;
    this.canvas_.getContext("2d").scale(scale,scale);
    this.picking_canvas_.style.top = this.canvas_position_.y+"px";
    this.picking_canvas_.style.left = this.canvas_position_.x+"px";
    this.picking_canvas_.style.width = this.canvas_position_.w+"px";
    this.picking_canvas_.style.height = this.canvas_position_.h+"px";
    this.picking_canvas_.width = this.canvas_position_.w*scale;
    this.picking_canvas_.height = this.canvas_position_.h*scale;
    this.picking_canvas_.getContext("2d").scale(scale,scale);
    this.dynamic_canvas_.style.top = this.dynamic_canvas_position_.y+"px";
    this.dynamic_canvas_.style.left = this.dynamic_canvas_position_.x+"px";
    this.dynamic_canvas_.style.width = this.dynamic_canvas_position_.w+"px";
    this.dynamic_canvas_.style.height = this.dynamic_canvas_position_.h+"px";
    this.dynamic_canvas_.width = this.dynamic_canvas_position_.w*scale;
    this.dynamic_canvas_.height = this.dynamic_canvas_position_.h*scale;
    this.dynamic_canvas_.getContext("2d").scale(scale,scale);
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
      layout: this.layout,
      click: this.click,
      select: this.select,
      deselect: this.deselect,
      clearChart: this.clearChart,
      didDrawChart: this.didDrawChart
    };
  };

  /**
   * Helper functions
   */
  timediff.prototype.toCanvasXCoord = function(date_obj,offsetx){
    let g = this.g;
    return g.toDomXCoord( date_obj ) - offsetx;
  }
  
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

  timediff.prototype.selectDefaultEvent = function(unix_sec){
    let idx = null;
    for (let i=0; i<this.data_.length; i++){
      let row = this.data_[i];
      if (row.time>unix_sec)
        break;
      if (row.default_selectable) {
        idx = i;
      }
    }
    return idx;
  };

  timediff.prototype.drawLabel=function (ctx, x, ymin, ymax, label, styleString){
    let label_offsetX = 3;
    let label_offsetY = -3;
    x = Math.floor(x)+0.5;
    // Line stroke
    ctx.save();
    this.applyStyle(ctx,styleString);
    ctx.beginPath();
    ctx.moveTo(x, ymin);
    ctx.lineTo(x, ymax);
    ctx.stroke();
    // Fill text
    ctx.translate(x, ymin);
    ctx.rotate(Math.PI/2);
    ctx.textAlign = "left";
    ctx.fillText(label, label_offsetX, label_offsetY);
    ctx.restore();
  };

  timediff.prototype.drawLabelPicking=function (ctx, x, ymin, ymax, label, id){
    let label_offsetX = 3;
    let label_offsetY = -3;
    let color = this.IdToColor(id);
    // Fill text
    ctx.save();
    ctx.translate(x, ymin);
    ctx.rotate(Math.PI/2);
    ctx.textAlign = "left";
    ctx.font= "10 Arial";
    ctx.fillStyle= color;
    let labelShape = ctx.measureText(label);
    ctx.fillRect(label_offsetX, label_offsetY, labelShape.width, -8); // 8 is because of the font size
    ctx.restore();
  };
  
  timediff.prototype.drawAllLabels = function (){
    let g = this.g;
    let dateRange = g.xAxisRange();
    let lbl_col = "abbreviation";
    if (dateRange[1]-dateRange[0] < 30*24*3600*1000) // Resolution of 1 month
      lbl_col = "label" 
    let ctx = this.canvas_.getContext("2d");
    // Draw all labels
    ctx.globalAlpha=0.5;
    for (let i=0; i<this.data_.length; i++) {
      let row = this.data_[i];
      let x = this.toCanvasXCoord( new Date(1000*row["time"]),
                                   this.canvas_position_.x);
      let label = row[lbl_col];
      let styleString = row["style"] || "";
      this.drawLabel(ctx, x, 0, this.g.height_, label, styleString);
    }
    // Draw the selected label
    ctx.globalAlpha=1;
    if (this.selected_event_idx_!==null){
      let idx = this.selected_event_idx_;
      let row = this.data_[idx];
      let x = this.toCanvasXCoord( new Date(1000*row["time"]),
                                    this.canvas_position_.x);
      let label = row[lbl_col];
      let styleString = row["style"] || "";
      this.drawLabel(ctx, x, 0, this.g.height_, label, styleString );
    }
  }

  timediff.prototype.drawAllLabelsPicking = function (lbl_name){
    let g = this.g;
    let dateRange = g.xAxisRange();
    let lbl_col = "abbreviation";
    if (dateRange[1]-dateRange[0] < 30*24*3600*1000) // Resolution of 1 month
      lbl_col = "label" 
    let ctx = this.picking_canvas_.getContext("2d");
    // Draw all labels picking
    for (let i=0; i<this.data_.length; i++) {
      let row = this.data_[i];
      let x = this.toCanvasXCoord( new Date(1000*row["time"]),
                                    this.canvas_position_.x);
      let label = row[lbl_col];
      this.drawLabelPicking(ctx, x, 0, this.picking_canvas_.height, label, i);
    }
  }

  timediff.prototype.drawTimeDiff = function(){
    if (this.selected_event_idx_===null ||
        this.selected_data_time_===null) {
      return;
    }
    let dynamic_canvas = this.dynamic_canvas_;
    let selected_event_idx = this.selected_event_idx_;
    let eventTime = this.data_[selected_event_idx]["time"];
    let selected_data_time = this.selected_data_time_;
    let timediffLabel = this.prettyInterval(selected_data_time - eventTime);
    // Draw
    let ctx = dynamic_canvas.getContext("2d");
    ctx.font="10 Arial";
    let timediffLabelWidth = ctx.measureText(timediffLabel).width;
    let eventX = this.toCanvasXCoord( new Date(1000*eventTime),
                                      this.dynamic_canvas_position_.x);
    let dataX = this.toCanvasXCoord(new Date(1000*selected_data_time),
                                    this.dynamic_canvas_position_.x);
    let color = this.BOSTON_RED;
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
        this.drawArrow(ctx,eventX,6,"right");
        this.drawArrow(ctx,dataX,6,"left");
      }
      if (eventX - dataX >=20+timediffLabelWidth){
        ctx.textAlign="left";
        ctx.fillText(timediffLabel, dataX+10, 6);
      }
      else {
        ctx.textAlign="right";
        ctx.fillText(timediffLabel, dataX-3, 6);
      }
    }
    if (dataX-eventX >= 0) {
      if (dataX-eventX >= 20) {
        this.drawArrow(ctx,eventX,5,"left");
        this.drawArrow(ctx,dataX,5,"right");
      }
      if (dataX-eventX >=20+timediffLabelWidth){
        ctx.textAlign="right";
        ctx.fillText(timediffLabel, dataX-10, 6);
      }
      else {
        ctx.textAlign="left";
        ctx.fillText(timediffLabel, dataX+3, 6);
      }
    }
  };

  timediff.prototype.drawArrow = function(ctx,x,y,direction){
    if (direction==="left"){
      ctx.beginPath();
      ctx.moveTo(x+1, y);
      ctx.lineTo(x+6, y-6);
      ctx.lineTo(x+6, y+6);
      ctx.closePath();
      ctx.fill();
      return;
    }
    if (direction==="right"){
      ctx.beginPath();
      ctx.moveTo(x-1, y);
      ctx.lineTo(x-6, y-6);
      ctx.lineTo(x-6, y+6);
      ctx.closePath();
      ctx.fill();
      return;
    }
  }
  
  timediff.prototype.applyStyle = function (ctx, styleString){
    let styles = styleString.split(';');
    let fs="10px";
    let fw=""; // normal
    let lt="solid";
    let color="black";
    // Get style from string
    for (let style of styles){
      let kv = style.split(':');
      let k = kv[0];
      let v = kv[1];
      switch (k){
        case "font-size":
          fs = v;
          break;
        case "font-weight":
          fw = v;
          break;
        case "line-type":
          lt = v;
          break;
        case "color":
          color = v;
          break;
        default:
          // No supposed to reach here
          break;
      }
    }
    // Apply style
    ctx.font = `${fw} ${fs} Arial`;
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    if (lt === "dash")
      ctx.setLineDash([4]);
    else if (lt === "solid")
      ctx.setLineDash([]);
    else
      throw new Error(`${this.constructor.name}: Invalid line type ${lt}.`);
  };
  
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
      if (p===precision && num===0){
        continue;
      }
      else if (p === precision){
        output=num+" "+unit;
        tmpSec-=num*value;
        p-=1;
      }
      else {
        output+=","+num+" "+unit;
        tmpSec-=num*value;
        p-=1;
      }
      if (p===0){
        break;
      }
    }
    return prepend+output;
  };
  
  return timediff;
})();
