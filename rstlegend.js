/**
 * @license
 * Copyright 2018 Lingyu Zhou (zhouly@bu.edu, zhoulytwin@gmail.com)
 * GNU Lesser General Public License v3.0
 */

/*global Dygraph:false */
Dygraph.Plugins.RSTLegend = (function() {
  "use strict";

  /**
   * Creates the RST legend in a (given) div
   *
   * @constructor
   */
  var rstlegend = function(options) {
    console.log(options);
    this.div_ = document.querySelector(options.div || null);
    this.data_ = options.data || [];
  };

  /**
   * Class variables
   */
  rstlegend.RSVToDisplay = {
    "RA":[],
    "NC":["FiO2","NC_Flow","iNO_Set"],
    "MASK":["FiO2","MASK_Flow"],
    "BB":["FiO2","NC_Flow"],
    "HFNC":["FiO2","HFNC_Flow","iNO_Set"],
    "CPAP":["FiO2","CPAP_PEEP_comb"],
    "BIPAP":["FiO2","BIPAP_EPAP","BIPAP_IPAP","BIPAP_Rate"],
    "PSV":["FiO2","PEEP","PS","iNO_Set"],
    "PCV":["FiO2","PEEP","PIP_comb","PS","VR","iNO_Set"],
    "VCV":["FiO2","PEEP","PS","VR","VT_set","iNO_Set"],
    "HFOV":["FiO2","HFOV_Amplitude","HFOV_Frequency","HFOV_MPAW","iNO_Set"],
    "HFJV":["FiO2","HFJV_PEEP","HFJV_PIP","HFJV_Rate","iNO_Set"],
    "ECMO":["ECMO_Flow"]
  };
  rstlegend.RST_LABEL_MAPPING = {
  "RA": "label-custom-normal",
  "NC": "label-custom-normal",
  "MASK": "label-custom-normal",
  "BB":"label-custom-normal",
  "HFNC":"label-custom-concern",
  "CPAP":"label-custom-concern",
  "BIPAP":"label-custom-concern",
  "PSV":"label-custom-attention",
  "PCV":"label-custom-attention",
  "VCV":"label-custom-attention",
  "HFOV":"label-custom-danger",
  "HFJV":"label-custom-danger",
  "ECMO":"label-custom-critical"
  };
  
  rstlegend.prototype.toString = function() {
    return "RST Legend Plugin";
  };

  rstlegend.prototype.select = function(e) {
    if (this.div===null){
      return;
    }
    let idx = e.dygraph.selPoints_[0].idx;
    let rst = this.data_[idx]["RST"];

    // Title [rst | timestamp]
    // Individual RSV scores
    // <hr>
    // RSS
    let title_pannel = document.createElement("div");
    title_pannel.classList.add("label");
    title_pannel.classList.add(rstlegend.RST_LABEL_MAPPING[rst]);
    let RST_title = document.createElement("span");
    RST_title.classList.add("float-left");
    title_pannel.appendChild(RST_title);
    let RST_timeStamp = document.createElement("span");
    RST_timeStamp.classList.add("float-right");
    title_pannel.appendChild(RST_timeStamp);
    let RSVScores=[];
    let RSScore = document.createElement("p");

    // Fill data
    RST_title.innerHTML = rst;
    RST_timeStamp.innerHTML = moment.unix(this.data_[idx]["time"]).format("MM/DD/YYYY HH:MM");
    // RSV Scores
    let self=this;
    rstlegend.RSVToDisplay[rst].forEach(function(rsv){
      let paragraph = document.createElement("p");
      paragraph.style.margin=0;
      let score = self.data_[idx][rsv];
      if (typeof score != typeof 0 ){
        score = "NA";
      }
      else {
        score = "<strong>"+Math.round(score,1)+"</strong>";
      }
      paragraph.innerHTML=rsv+": "+score;
      RSVScores.push(paragraph);
    });
    RSScore.innerHTML = "Score: "+this.data_[idx]["Score"];

    // Clear and then append to DOM
    this.div_.innerHTML="";
    this.div_.appendChild(title_pannel);
    RSVScores.forEach(function(rsv_score){
      self.div_.appendChild(rsv_score);
    });
    this.div_.appendChild(document.createElement("hr"));
    this.div_.appendChild(RSScore);
  };
  
  rstlegend.prototype.deselect = function(e) {
    if (this.div_ === null) {
      return;
    }
    else {
      this.div_.innerHTML="";
    }
  };

  rstlegend.prototype.clearChart = function(e) {
    if (this.div_ === null) {
      return;
    }
    else {
      this.div_.innerHTML="";
    }
  };
  
  /**
   * @param {Dygraph} g Graph instance.
   * @return {object.<string, function(ev)>} Mapping of event names to callbacks.
   */
  rstlegend.prototype.activate = function(g) {
    return {
      select: this.select,
      deselect: this.deselect,
      clearChart: this.clearChart
    };
  };

  rstlegend.prototype.destroy = function() {
    this.div_.innerHTML="";
    this.data_=null;
    this.div_ = null;
  };

  return rstlegend;
})();
