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
   * Options: divId
   * - divId format: with no "#" prepended
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
`; 
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
    if (div === null) {
      return null;
    }
    div.appendChild(this.button_);
    this.activateCustomEventHandler();
    return {
      didDrawChart: this.didDrawChart
    };
  };
  
  return unzoom;
})();
