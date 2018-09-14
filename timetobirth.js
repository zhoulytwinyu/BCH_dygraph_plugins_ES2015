/**
 * @license
 * Copyright 2018 Lingyu Zhou (zhouly@bu.edu, zhoulytwin@gmail.com)
 * GNU Lesser General Public License v3.0
 */

/*global Dygraph:false */
Dygraph.Plugins.TimeToBirth = (function() {
  "use strict";

  /**
   * Display time to birthday
   * options: div, birth, buttonDiv
   * - birth format: seconds from unix epoch
   * - div/buttonDiv format: id without '#' prepended
   * @constructor
   */
  var timetobirth = function(options) {
    console.log({timetobirth:options});
    // Copy over options
    this.divId_ = options.divId || null;
    this.buttonDivId_ = options.buttonDivId || null;
    this.birth_ = options.birth || null;
    // Create other variables
    this.button_ = document.createElement("input");
    this.div_ = document.createElement("div");
    this.show_ = true;
    // Styling
    this.div_.style.opacity = 1;
    this.div_.style.transition = "opacity 0.5s";
    this.div_.style.overflow = "hidden";
    this.button_.type="image";
    this.button_.alt="birth";
    this.button_.style.width="30px";
    this.button_.src="data:image/png;base64,"+
`iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAAAlwSFlz
AAAI5wAACOcBzedHagAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAU/SURB
VHic7VtbaBxVGP7OzJnZ0U1DpQ/2od0UgmENlooIpbRIUR+kKFSUqKUPvSCIj0WKDwl72JS8tY/C
Sm29gO2DRaj1BlVLvbyo9fJgCtmQ7iXpqA8NSXcym3Nmjg/JlO2yOdvNZudIsx8Ezpz5/v//9tuc
mZ1zzpByuRxSSgkUIIQsSinD6JhzXtq6desAAOTz+f09PT3nVfGNsLi4+H4qlXoDAIrF4nnbtve3
mmN2dnZfOp3+FgBKpVLesqwtNZpNKSVVxQshAkopJZQqeQBgr3Rs2zYopYkWtSMIAiNqW5ZFVpPD
cRwZtSml1ipyGEZzzv2NrgG6BehG1wDdAnSja4BuAbpBhRAcgKUicc7PGIbxQ3Ts+74ftefn568Z
hnGo1cK+7+ejdqVSyTmO80WrOSqVyniNxuNBEDg1p1+ilL6giueczxDXdf1mPyA8zzuSSqXOtipQ
J2ZmZkZt2x5WcTjnf637IbDuDaCc87KUstk1wFedXy2y2exOKeWeTCZzcq1zc84rhJCSiiOE+Ef5
FNhJMMaeA3ABQJ4xtkOXDi0GZLPZXWEYXgbwIAAJ4EnG2DUdWmg+n99v2/VPu3fj9u3bvw0ODhbW
ouCJEyf6hBCfYenDA0tfQhbA82uRP8KNGzceNQzjERXH932PuK67QCl1VETP846mUqkz7YrK5XLW
zZs3vwews/4cIeTlTCZzod0aEcrlctZxnBEVh3N+Pda7gOu6x9DgwwOAlDLHGEvFqQeI8TbIGNss
pVR9I5sAfHrq1KkH4tIExPs74BiAZBPOE3Nzc+/EISZCLAbkcjkLwJF7pB9ijB3opJ5axGKA67p7
sfQvfq84yRjr7ZCcuxCLAVLK3S2GbAZwsBNa6hHXNaB/hf6qIua1TgipR1wGrHRl/1IR81gnhNQj
LgPKDfo8QshFRcxGxlhPpwRFiMUAQsjnDbonCSG/KMIWl/86ilgMyGQylwH8VNc9EYbhOABvhbCz
jLH7wwAA0jTNgwBmavomGGMCwB8N+BcBvBWHMFqtVj+sXahshNoJzNViZGRkanR0dE8QBB8B2A0g
yvkrgF0A5gBcIYSczmQyl7D0mLxqCCF+r1ar76k4YRj+q2U+gDH2FKW0MDw8XGCMbTMM46F0Ov3n
0NBQELeWWA0YGxvbJIQYVHHCMPyZMdaRKbhGoMVi8WPTNE0VSQjxbl9f3zftFuOc75VSfqLimKY5
AGCi3VpTU1OvNtt0IYT4m9q2/WKzCZEgCL5uV1DcsCxrMJFIvKLiGIYR74TI/xFdA3QL0I2uAboF
6EbXAN0CdKNrgG4ButE1QLcA3Vj3BtDZ2dl9jqN8FoLneddj0rNmuHXr1gcbNmy4ouIIIXyaTqe/
i0lTrNi+ffskgMlmvO4QKJVKE5RS5RYRz/Pe7u/vP9duMSnljwCUmxeDIJhutw4AFAqF44lE4k0V
h3M+RS3L2tJsQsSyrDVZs2eMuQAurUWuZjBNs4dS2qfiSCkX1v0QWPcGUCGEckIUAAzD2DM9PX1n
nt73fT+6JoyPj2/r7e19utXClUolPzAwcBUACoXCs5TSlvcHzc/Pf5VOp2cAYHJy8oBz9/388Wbx
UsqNdPltKyWRUnoYwOHo2DCMIoBzAJBMJnckEgnlAsQKOA3g6nL+1xOJxFCrCTjnz2B5tSmZTI7V
jnkhRNN4QsjD634IdA3QLUA3ugboFqAbXQN0C9ANKoSQaLJMXv/6vBDiztaVhYUFYtv2QquFgyAI
attCiJZz1Ly8Bs55FcCdHGEYUiGE8k2YIAjC/wC1S95Q3B+2+gAAAABJRU5ErkJggg==

`; 
  };
  
  /**
   * Removes DOM & clear variables
   */
  timetobirth.prototype.destroy = function() {
    this.divId_ = null;
    this.buttonDivId_ = null;
    this.birth_ = null;
    this.show_ = null;
    this.button_.remove();
    this.div_.remove();
    this.button_ = null;
    this.div_ = null;
  };

  /**
   * Formatted output
   */
  timetobirth.prototype.format = function(age) {
    return `
<b>Age</b>
<span class="pull-right">${age}</span>
`;
  }

  /**
   * For debug
   */
  timetobirth.prototype.toString = function() {
    return "TimeToBirth Plugin";
  };

  /**
   * Update age label when new data point is selected
   */
  timetobirth.prototype.select = function (e) {
    var age = this.prettyInterval(e.selectedX/1000-this.birth_);
    this.div_.innerHTML = this.format(age);
    if (this.show_){
      this.div_.style.display="block";
    }
  }
  
  /**
   * Clear age label when new data point is selected
   */
  timetobirth.prototype.deselect = function (e) {
    this.div_.innerHTML="";
    this.div_.style.display="none";
  }

  /**
   * Listen to button click event to toggle age label display
   */
  timetobirth.prototype.activateCustomEventHandler = function() {
    let self = this;
    this.button_.addEventListener("click",function(ev){
      if (self.show_){
        self.show_ = false;
        self.button_.style.opacity=0.2;
        self.div_.style.height="0px";
        self.div_.style.opacity=0;
      }
      else {
        self.show_ = true;
        self.button_.style.opacity=1;
        self.div_.style.height="";
        self.div_.style.opacity=1;
      }
    });
  }
  
  /**
   * @param {Dygraph} g Graph instance.
   * @return {object.<string, function(ev)>} Mapping of event names to callbacks.
   */
  timetobirth.prototype.activate = function(g) {
    let parentDiv = document.getElementById(this.divId_);
    if (!parentDiv || !this.birth_) {
      return null;
    }
    // Add content div
    parentDiv.appendChild(this.div_);
    // Add button
    let buttonParentDiv = document.getElementById(this.buttonDivId_);
    if (buttonParentDiv) {
      buttonParentDiv.appendChild(this.button_);
    }
    this.activateCustomEventHandler();
    return {
      select: this.select,
      deselect: this.deselect
    };
  };

  /********************
   * Helper function
   ********************/
  /**
   * Format intervals given as seconds since unix epoch to a pretty format:
   * xx day yy hour etc.
   */
  timetobirth.prototype.interval_units = [ ["year",365*24*60*60],
                                        ["month",30*24*60*60],
                                        ["day",24*60*60],
                                        ["hour",60*60],
                                        ["min",60],
                                        ["sec",1]
                                        ];
  timetobirth.prototype.prettyInterval = function(unix_sec,precision=2){
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
  
  return timetobirth;
})();
