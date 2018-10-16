/**
 * @license
 * Copyright 2018 Lingyu Zhou (zhouly@bu.edu, zhoulytwin@gmail.com)
 * GNU Lesser General Public License v3.0
 */

import Dygraph from "dygraphs";

Dygraph.Plugins.SCrosshair = (function() {
  "use strict";

  /**
   * @constructor
   */
  var scrosshair = function(options) {
    console.log({scrosshair:options});
    // Get options
    this.group = options.group;
    // Other variables
    this.g = null;
    this.canvas = document.createElement("canvas");
    this.graph_clientX=null;
    this.ctx = this.canvas.getContext("2d");
    // Styling
    this.canvas.style.position = "absolute";
    this.canvas.style.display = "block";
    scrosshair.synchronizer.register(this);
  };

  scrosshair.prototype.destroy = function () {
    scrosshair.synchronizer.remove(this);
    this.group = null;
    // Other variables
    this.g = null;
    this.canvas.remove();
    this.canvas=null;
    this.graph_clientX=null;
    this.ctx = null;
  };

  /**
   * Methods
   */
  scrosshair.prototype.toString = function() {
    return "SCrosshair Plugin";
  };

  scrosshair.prototype.drawLine = function(datetime_obj) {
    let g = this.g;
    let ctx= this.ctx;
    let area = g.getArea();
    let x = g.toDomXCoord(datetime_obj)-area.x;
    let scale = window.devicePixelRatio;
    ctx.beginPath();
    ctx.moveTo(x,0);
    ctx.lineTo(x,this.canvas.height);
    ctx.stroke();
  };

  scrosshair.prototype.mousemove = function(ev) {
    let g = this.g;
    let ctx= this.ctx;
    let x = ev.clientX-this.graph_clientX;
    let x_dt = g.toDataXCoord(x);
    for (let p of scrosshair.synchronizer.getPeers(this)){
      p.clear();
      p.drawLine(x_dt);
    }
  };

  scrosshair.prototype.mouseout = function(ev) {
    let scale = window.devicePixelRatio;
    for (let p of scrosshair.synchronizer.getPeers(this)){
      p.clear();
    }
  };

  scrosshair.prototype.clear = function(){
    let scale = window.devicePixelRatio;
    this.ctx.clearRect(0,0,this.canvas.width/scale,this.canvas.height/scale);
  }
  
  scrosshair.prototype.didDrawChart = function(ev) {
    let area = this.g.getArea();
    let scale = window.devicePixelRatio;
    this.canvas.width = area.w*scale;
    this.canvas.height = 1;
    this.canvas.style.width = area.w+"px";
    this.canvas.style.height = area.h+"px";
    this.canvas.style.top = area.y+"px";
    this.canvas.style.left = area.x+"px";
    this.graph_clientX = this.g.graphDiv.getClientRects()[0].left;
    this.ctx.scale(scale,scale);
  };
  
  /**
   * @param {Dygraph} g Graph instance.
   * @return {object.<string, function(ev)>} Mapping of event names to callbacks.
   */
  scrosshair.prototype.activate = function(g) {
    this.g = g;
    g.graphDiv.prepend(this.canvas);
    g.graphDiv.addEventListener("mousemove", (ev) => this.mousemove(ev) );
    g.graphDiv.addEventListener("mouseout", (ev) => this.mouseout(ev) );
    return {
      didDrawChart: this.didDrawChart
    };
  };

  scrosshair.synchronizer = {
    groups: {},

    register: function(sc) {
      this.groups[sc.group] = this.groups[sc.group] || [];
      this.groups[sc.group].push(sc);
    },

    remove: function(sc) {;
      if (this.groups[sc.group]) {
        let idx = this.groups[sc.group].indexOf(sc);
        if (idx !== -1) {
          this.groups[sc.group].splice(idx,1);
        }
      }
    },
    
    getPeers: function(sc) {
      if (this.groups[sc.group]){
        return this.groups[sc.group];
      }
      else {
        return [sc];
      }
    }
  };
  
  return scrosshair;
})();
