/**
 * @author gggordon <https://github.com/gggordon>
 * @overview bardashjs
 * @description Bar Chart Dashboards Made Easy
 * @license MIT
 * @created 15.3.2015
 * @dependencies
 *     - jQuery ~ >1.11.*
 *     - underscore ~ 1.5.*
 *     - d3 ~ 3.*
 *     - c3 ~ 0.3.*
 */

;
(function($, d3, c3, _, w) {
	var bardash = {
        version: "0.0.1",
        name: "bardashjs"
    };
    if ([$, d3, c3, _, w].filter(function(dependency) {
            return dependency == undefined
        }).length) {
        throw new Error("jQuery, d3, c3 and underscore are required for " + bardash.name);
    }

    /**
 	 * @class Bardash
 	 * @param divNode HTMLNode html element to display dashboard in
 	 * @param options Object configuration settings
     * @param [options.descWordCount] String Number of words to get from description. Default: 20
     * @param [options.appendContent] Boolean Whether crabber should append/prepend content. Default: true
 	 */
    function Bardash(divnode,opts){

    }
    

    

    if(w instanceof Object){
        w.bardash = Bardash;
    }
    $.fn.bardash = function(opts){
        return this.each(function(i,el){
        	$(el).data('crab',new Bardash(el,opts));
        });
    };


})(
    typeof jQuery == 'undefined' ? undefined : jQuery,
    typeof d3 == 'undefined' ? undefined : d3,
    typeof c3 == 'undefined' ? undefined : c3,
    typeof _ == 'undefined' ? undefined : _,
    typeof window == 'undefined' ? undefined : window
);
