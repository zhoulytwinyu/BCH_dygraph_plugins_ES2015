/**
 * @license
 * Copyright 2018 Lingyu Zhou (zhouly@bu.edu, zhoulytwin@gmail.com)
 * GNU Lesser General Public License v3.0
 */

/*global Dygraph:false */
Dygraph.Plugins.Unzoom = (function() {
  "use strict";

  /**
   * This unzoom plugin adds a unzoom button to a given div. The options
   * object should provide divId field into which the button will be
   * appended.
   * @constructor
   */
  var unzoom = function(options) {
    console.log({unzoom:options});
    // Get options
    this.divId_ = options.divId;
    // Other variables
    this.g=null;
    this.button_ = document.createElement("input");
    // Styling
    this.button_.type="image";
    this.button_.alt="unzoom";
    this.button_.style.width="30px";
    this.button_.src="data:image/png;base64,"+
`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
SUVORK5CYII=`; 
  };
  
  /**
   * Remove button from DOM and reset all variables
   */
  unzoom.prototype.destroy = function(){
    this.divId_ = null;
    this.g=null;
    this.button_.remove();
    this.button_=null;
  };

  /**
   * For certain debug purposes.
   */
  unzoom.prototype.toString = function() {
    return "Unzoom Plugin";
  };

  /**
   * Determine whether to show the button when drawing the graph,
   * when we can determine the zooming of the graph of the current draw.
   */
  unzoom.prototype.didDrawChart = function(e){
    let g = this.g;
    if (g.isZoomed()){
      this.button_.disabled = false;
      this.button_.style.opacity = 1;
    }
    else {
      this.button_.disabled = true;
      this.button_.style.opacity = 0.25;
    }
  };

  /**
   * Listen to button click event to do graph resetZoom
   */
  unzoom.prototype.buttonClick = function(ev){
    let g = this.g;
    g.resetZoom();
  };
  
  /**
   * Add listeners to custom events
   */
  unzoom.prototype.activateCustomEventHandler = function(){
    let self=this;
    this.button_.addEventListener("click", function(ev){
      self.buttonClick(ev);
    });
  }
  
  /**
   * Populate variables, add DOM objects, and specify graph event listeners.
   * @param {Dygraph} g Graph instance.
   * @return {object.<string, function(ev)>} Mapping of event names to callbacks.
   */
  unzoom.prototype.activate = function(g) {
    this.g=g;
    let div = document.getElementById(this.divId_);
    if (div !== null) {
      div.appendChild(this.button_);
      this.activateCustomEventHandler();
    }
    return {
      didDrawChart: this.didDrawChart
    };
  };
  
  return unzoom;
})();
