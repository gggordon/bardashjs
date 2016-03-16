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

    /*=======================================================
      STEP 1A: RELATIVE BAR WIDTHS
     =======================================================*/
    // Each bar should have its width proportional to the relative max
    function relativeBarWidths($baseNode, catTotals) {
        var max = _.max(catTotals);
        $baseNode.find('.bar').each(function() {
            $(this).css({ 'width': $(this).attr('data-value') / max * 100 + "%" })
        }); //each bar
    }; //relativeBarWidths

    /*=======================================================
     STEP 1B: Value-BY-CATEGORY LEVEL OF DATA
     =======================================================*/

    function createLegend($baseNode, comparable) {
        var colorRange = d3.scale.category10().domain(d3.range(11).reverse());
        $baseNode.find('.bar-chart').after('<div class="legend"></div>');
        var categories = _.pluck(comparable[0].stats, 'name');
        $.each(categories, function(key, value) {
            var span = $('<span>' + value + '</span>');
            span.css({ 'border-color': d3.rgb(colorRange(key)).brighter(1) });
            span.css({ 'background-color': d3.rgb(colorRange(key)).darker(1) });
            $baseNode.find('.legend').append(span);
        });
    }; //createLegend

    function applyCategories($baseNode, comparable) {
        var colorRange = d3.scale.category10().domain(d3.range(11).reverse());
        $baseNode.find('.bar').each(function() {
            var bar = $(this);
            bar.append('<div class="statsblock"></div>');
            var index = bar.attr('data-index');
            var relevantStats = _.findWhere(comparable, { 'id': index })['stats'];
            $.each(relevantStats, function(key, value) {
                var stat = $('<span class="stat" data-index="' + value['name'] + '" data-value="' + value['value'] + '"></span>');
                stat.css({ 'background-color': colorRange(key) });
                bar.children('.statsblock').append(stat);
            }); //each relevantStats
        }); //each bar
    }; //applyCategories

    /*=======================================================
      STEP 1C: CATEGORY LEVEL WIDTHS AS PROPORATION OF SPEND
     =======================================================*/

    function setCategoryWidths($baseNode,comparable) {
        $baseNode.find('.bar').each(function() {
            var bar = $(this);
            var index = bar.attr('data-index');
            var relevantStats = _.findWhere(comparable, { 'id': index })['stats'];
            var barTotal = _.reduce(_.pluck(relevantStats, 'value'), function(memo, num) {
                return memo + num });
            $.each($(this).find('.stat'), function(stat_id, stat) {
                $(stat).css({ 'width': $(stat).attr('data-value') / barTotal * 100 + "%" });
            })
        });
    }

    // ratios of each spending category, will be used later to normalize by category spending
    function setCategoryRatios($baseNode,comparable) {
        var categoryTotals = _.map(comparable[0]['stats'], function(obj, iter) {
            return _.reduce(_.map(comparable, function(obj2, iter2) {
                return _.find(obj2.stats, function(obj3, iter3) {
                    return obj3.name == obj.name;
                }).value;
            }), function(memo, num) {
                return memo + num
            }); //reduce
        }); //categoryTotals
        var average = _.reduce(categoryTotals, function(memo, num) {
            return memo + num; }, 0) / categoryTotals.length;

        // Setting categoryRatios as a global variable that we can access later
        categoryRatios = [];
        $.each(categoryTotals, function(i) {
            categoryRatios[i] = 1 / (categoryTotals[i] / average);
        })
        categoryRatios = _.object(_.pluck(exportsToCanada[0]['stats'], 'name'), categoryRatios);

        // storing the categoryRatios on the comparable object and ourArray
        comparable = _.map(comparable, function(obj, iter) {
            var stats = _.map(obj.stats, function(obj2, iter2) {
                obj2.normalizedValue = categoryRatios[obj2.name] * obj2.value;
                return obj2;
            }); //innermap
            obj.stats = stats;
            return obj;
        }); //map
        ourArray = comparable;
    }; //setCategoryRatios
     
    function initializeBars($node, comparable) {
        // We create a new element using jQuery. We can style it in CSS using the .bar-chart class.
        $node.append('<div class="bar-chart"></div>');

        // We reduce our comparable to category totals
        catTotals = _.map(comparable, function(obj, iter) {
            var valueArray = _.pluck(obj.stats, "value");
            return _.reduce(valueArray, function(memo, num) {
                return memo + num
            });
        }); //_.map

        // For each of this yearly totals, create a bar in our new bar chart.
        $.each(catTotals, function(key, value) {
            $node.find('.bar-chart').append('<div class="bar" data-index="' + comparable[key].id + '" data-value="' + value + '"><span><em>' + comparable[key].id + ':</em> <strong>' + commafy(value) + '</strong></span></div>');
        }); //each catTotals

        //////// Step 1A: Make the length of each bar relative to its $ spent
        relativeBarWidths($node, catTotals);

        //////// Step 1B: Drop another level of metrics in: a breakdown of the yearly spend
        createLegend($node, comparable);
        applyCategories($node, comparable);

        //////// Step 1C: Make the width of each category proportional to 
        setCategoryWidths($node, comparable);
        //setCategoryRatios(comparable);

    };

    



    /**
     * @class Bardash
     * @param divNode HTMLNode html element to display dashboard in
     * @param options Object configuration settings
     * @param [options.title] String Number of words to get from description. Default: 20
     * @param [options.init] Boolean - Should the chart be created Default: true
     * @param options.data Array|Object - Dataset to be used
     * @param options.data[0].id String - Name of Category
     * @param options.data[0].stats Array|Object - Category statistics 
     * @param options.data[0].stats[0].name String - feature name
     * @param options.data[0].stats[0].value Number - feature value
     */
    function Bardash(divNode, opts) {
        opts = opts || {};
        var _self = this;
        _self.CONSTANTS = {
            SELECTORS: {
                TITLE: '.bardash-chart-title'
            }
        };
        _self.title = opts.title;
        _self.$chartArea = $(divNode);

        _self.addTitle = function(title) {
            if (_self.$chartArea.find('h4.bardash-chart-title').length == 0)
                _self.$chartArea.prepend('<h4 class="bardash-chart-title">' + title + '</h4>');
            else
                _self.$chartArea.find('.bardash-chart-title').text(title);
        }

        _self.init = function(props) {
            props = props || {};
            if (props.title)
                _self.addTitle(props.title);
            ////// STEP 1: Draw a bar for each year of our data.
            initializeBars(props.data);

            ////// STEP 2: Allow for user interaction with our visualization
            //initializeControls();

            ////// STEP 3: Advanced interaction through a click and hold interface
            //handleTouch();

        };


        if (opts.init !== false)
            _self.init(opts);
    }




    if (w instanceof Object) {
        w.bardash = Bardash;
    }
    $.fn.bardash = function(opts) {
        return this.each(function(i, el) {
            $(el).data('crab', new Bardash(el, opts));
        });
    };


})(
    typeof jQuery == 'undefined' ? undefined : jQuery,
    typeof d3 == 'undefined' ? undefined : d3,
    typeof c3 == 'undefined' ? undefined : c3,
    typeof _ == 'undefined' ? undefined : _,
    typeof window == 'undefined' ? undefined : window
);
