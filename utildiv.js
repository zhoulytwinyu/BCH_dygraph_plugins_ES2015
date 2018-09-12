/**
 * @license
 * Copyright 2018 Lingyu Zhou (zhouly@bu.edu, zhoulytwin@gmail.com)
 * GNU Lesser General Public License v3.0
 */

/*global Dygraph:false */
Dygraph.Plugins.UtilDiv = (function() {
  "use strict";

  /**
   * Create divs on upper, right, and hover position with specified ids.
   * The divs, if specified, will show when mouse hovers on the graph.
   * @constructor
   */
  var utildiv = function(options) {
    console.log({utildiv:options});
    // Get options
    this.upper_ = (options.upper ) ? null : document.createElement("div");
    this.right_ = (options.right ) ? null : document.createElement("div");
    this.hover_ = (options.hover ) ? null : document.createElement("div");
    // Other variables
    this.g = null;
    this.divOpacity_ = 0;
    this.shownDivs_ = [];
    this.animation_ = null;
    // Styling
    if (this.upper_ !== null) {
      this.shownDivs_.push(this.upper_);
      this.upper_.id=options.upper;
      this.upper_.style.height="30px";
      this.upper_.style.position="absolute";
      this.upper_.style.top="-30px";
      this.upper_.style.backgroundColor=this.divBG;
      this.upper_.style.borderTopLeftRadius="2px";
      this.upper_.style.borderTopRightRadius="2px";
      this.upper_.style.visibility="hidden";
    }
    if (this.right_ !== null) {
      this.shownDivs_.push(this.right_);
      this.right_.id=options.right;
      this.right_.style.width="30px";
      this.right_.style.position="absolute";
      this.right_.style.backgroundColor=this.divBG;
      this.right_.style.borderTopRightRadius="2px";
      this.right_.style.borderBottomRightRadius="2px";
      this.right_.style.visibility="hidden";
    }
    if (this.hover_ !== null) {
      this.shownDivs_.push(this.hover_);
      this.hover_.id=options.hover;
      this.hover_.style.maxWidth="200px";
      this.hover_.style.position="fixed";
      this.hover_.style.backgroundColor=this.divBG;
      this.hover_.style.borderRadius="5px";
      this.hover_.style.visibility="hidden";
    }
  };
  utildiv.prototype.divBG = "#C5B9AC"; //boston_warm_gray
  utildiv.prototype.maxOpacity = 0.8;
  
  /**
   * Removes DOM, clear variables
   */
  utildiv.prototype.destroy = function (){
    this.upper_.remove();
    this.right_.remove();
    this.hover_.remove();
    this.upper_.null;
    this.right_.null;
    this.hover_.null;
    this.g = null;
    this.divOpacity_ = null;
    this.shownDivs_ = null;
    this.animation_ = null;
  };
  
  /**
   * For debug
   */
  utildiv.prototype.toString = function() {
    return "UtilDiv Plugin";
  };
  
  /**
   * Show divs on mouseover
   */
  utildiv.prototype.mouseover = function(ev) {
    this.showAllDivs();
  };
  
  /**
   * Hide divs on mouseout
   */
  utildiv.prototype.mouseout = function(ev) {
    this.hideAllDivs();
  };

  /**
   * Update hover div position on mousemove
   */
  utildiv.prototype.mousemove = function(ev) {
    if (this.hover_){
      let x = ev.clientX-this.hover_.clientWidth/2;
      let y = ev.clientY-this.hover_.clientHeight-10;
      this.hover_.style.top=y+"px";
      this.hover_.style.left=x+"px";
    }
  };
  
  /**
   * Add listener for custom events
   */
  utildiv.prototype.activateCustomEventHandler = function(){
    let self = this;
    if (this.shownDivs_.length !== 0) {
      this.g.graphDiv.addEventListener("mouseover", function(ev){
        self.mouseover(ev);
      });
      this.g.graphDiv.addEventListener("mouseout", function(ev){
        self.mouseout(ev);
      });
    }
    if (this.hover_) {
      this.g.graphDiv.addEventListener("mousemove", function(ev){
        self.mousemove(ev);
      });
    }
  };

  /**
   * We have to adjust the right div position when chart is redrawn
   * (e.g. upon resize)
   */
  utildiv.prototype.didDrawChart = function(e){
    if (this.right_) {
      this.right_.style.left=this.g.width_+"px";
    }
  }

  /**
   * @param {Dygraph} g Graph instance.
   * @return {object.<string, function(ev)>} Mapping of event names to callbacks.
   */
  utildiv.prototype.activate = function(g) {
    this.g=g;
    this.shownDivs_.forEach(function(div){
      g.graphDiv.appendChild(div);
    });
    this.activateCustomEventHandler();
    return {
      didDrawChart: this.didDrawChart
    };
  };

  /********************
   * Helpers
   ********************/
  /**
   * First call, timestamp is null:
   * - cancel existing animation,
   * - make divs visible
   * - increase opacity
   * - set up recusion
   * Following call, timestamp is not null:
   * - increase opacity
   * - recusion
   * Stop condition:
   * - opacity max out
   */
  utildiv.prototype.showAllDivs = function(timestamp=null) {
    if (timestamp === null) {
      if (this.animation_ !== null) {
        window.cancelAnimationFrame(this.animation_);
      }
      this.shownDivs_.forEach(function(div) {
        div.style.visibility = "visible";
      });
    }
    if (this.divOpacity_ === this.maxOpacity_) {
      this.animation_ = null;
      return;
    }
    this.divOpacity_ = Math.min( this.maxOpacity,
                                this.divOpacity_+0.1);
    let self = this;
    this.shownDivs_.forEach(function(div){
      div.style.opacity = self.divOpacity_;
    });
    this.animation_ = window.requestAnimationFrame(function(timestamp) {
      self.showAllDivs(timestamp);
    });
  };

  /**
   * First call, timestamp is null:
   * - cancel existing animation,
   * - decrease opacity
   * - set up recusion
   * Following call, timestamp is not null:
   * - decrease opacity
   * - recusion
   * Stop condition:
   * - opacity min out
   * - toggle divs visibility
   */
  utildiv.prototype.hideAllDivs = function(timestamp=null) {
    if (timestamp === null) {
      if (this.animation_ !== null) {
        window.cancelAnimationFrame(this.animation_);
      }
    }
    if (this.divOpacity_ === 0) {
      this.animation_ = null;
      this.shownDivs_.forEach(function(div){
        div.style.visibility = "hidden";
      });
      return;
    }
    this.divOpacity_ = Math.max( 0,
                                this.divOpacity_-0.2);
    let self = this;
    this.shownDivs_.forEach(function(div){
      div.style.opacity = self.divOpacity_;
    });
    this.animation_ = window.requestAnimationFrame(function(timestamp) {
      self.hideAllDivs(timestamp);
    });
  };
  
  return utildiv;
})();
