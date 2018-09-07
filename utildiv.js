/**
 * @license
 * Copyright 2018 Lingyu Zhou (zhouly@bu.edu, zhoulytwin@gmail.com)
 * GNU Lesser General Public License v3.0
 */

/*global Dygraph:false */
Dygraph.Plugins.UtilDiv = (function() {
  "use strict";

  /**
   * @constructor
   */
  var utildiv = function(options) {
    console.log({utildiv:options});
    // Get options
    this.upper_left_ = document.createElement("div");
    this.upper_right_ = null;
    this.lower_left_ = null;
    this.lower_right_ = null;
    this.hover_ = document.createElement("div");
    // Other variables
    this.g=null;
    // Styling
    this.upper_left_.style.height="30px";
    this.upper_left_.style.width="20px";
    this.upper_left_.style.position="absolute";
    this.upper_left_.style.backgroundColor="#cccccc";
    this.upper_left_.style.opacity=0.8;
    this.upper_left_.style.borderRadius="2px";
    this.upper_left_.style.visibility="hidden";
    this.hover_.style.minHeight="100px";
    this.hover_.style.width="200px";
    this.hover_.style.position="fixed";
    this.hover_.style.backgroundColor="#cccccc";
    this.hover_.style.opacity=0.8;
    this.hover_.style.borderRadius="2px";
    this.hover_.style.visibility="hidden";
  };
  
  utildiv.prototype.destroy = function (){
    //TODO
  };
  
  /**
   * Methods
   */
  utildiv.prototype.toString = function() {
    return "UtilDiv Plugin";
  };

  utildiv.prototype.mouseover = function(ev) {
    this.upper_left_.style.visibility="visible";
  };
  
  utildiv.prototype.mouseout = function(ev) {
    this.upper_left_.style.visibility="hidden";
  };
  
  utildiv.prototype.mousemove = function(ev) {
    let x = ev.clientX-this.hover_.clientWidth/2;
    let y = ev.clientY-this.hover_.clientHeight-10;
    this.hover_.style.top=y+"px";
    this.hover_.style.left=x+"px";
  };
  
  utildiv.prototype.activateCustomEventHandler = function(){
    let self = this;
    this.g.graphDiv.addEventListener("mouseover",function(ev){
      self.mouseover(ev);
    });
    this.g.graphDiv.addEventListener("mouseout",function(ev){
      self.mouseout(ev);
    });
    this.g.graphDiv.addEventListener("mousemove",function(ev){
      self.mousemove(ev);
    });
  };

  utildiv.prototype.select = function(e){
    this.hover_.style.visibility="visible";
  }

  utildiv.prototype.deselect = function(e){
    this.hover_.style.visibility="hidden";
  }
  /**
   * @param {Dygraph} g Graph instance.
   * @return {object.<string, function(ev)>} Mapping of event names to callbacks.
   */
  utildiv.prototype.activate = function(g) {
    this.g=g;
    g.graphDiv.appendChild(this.upper_left_);
    g.graphDiv.appendChild(this.hover_);
    this.activateCustomEventHandler();
    return {
      select: this.select,
      deselect: this.deselect,
    };
  };

  /**
   * Helpers
   */
  
  return utildiv;
})();
