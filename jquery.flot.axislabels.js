/*
Axis Labels Plugin for flot. :P
http://github.com/markrcote/flot-axislabels
Released under the GPLv3 license by Xuan Luo, September 2010.
Improvements by Mark Cote, December 2010.

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

 */
(function ($) {
    var options = { };

     function canvasSupported() {
         return !!document.createElement('canvas').getContext;
     }

     function canvasTextSupported() {
         if (!canvasSupported()) {
             return false;
         }
         var dummy_canvas = document.createElement('canvas');
         var context = dummy_canvas.getContext('2d');
         return typeof context.fillText == 'function';
     }

    function css3TransitionSupported() {
        var div = document.createElement('div');
        return typeof div.style.MozTransition != 'undefined'    // Gecko
            || typeof div.style.OTransition != 'undefined'      // Opera
            || typeof div.style.webkitTransition != 'undefined' // WebKit
            || typeof div.style.transition != 'undefined';
    }


    function AxisLabel(axisName, plot, opts) {
        this.axisName = axisName;
        this.plot = plot;
        this.opts = opts;
        this.width = 0;
        this.height = 0;
    }


    CanvasAxisLabel.prototype = new AxisLabel();
    CanvasAxisLabel.prototype.constructor = CanvasAxisLabel;
    function CanvasAxisLabel(axisName, plot, opts) {
        AxisLabel.prototype.constructor.call(this, axisName, plot, opts);
    }

    CanvasAxisLabel.prototype.calculateSize = function(padding) {
        if (!this.opts.axisLabelFontSizePixels)
            this.opts.axisLabelFontSizePixels = 14;
        if (!this.opts.axisLabelFontFamily)
            this.opts.axisLabelFontFamily = 'sans-serif';
        // since we currently always display x as horiz.
        // and y as vertical, we only care about the height
        this.width = this.opts.axisLabelFontSizePixels + padding;
        this.height = this.opts.axisLabelFontSizePixels + padding;
    };

    CanvasAxisLabel.prototype.draw = function() {
        var ctx = this.plot.getCanvas().getContext('2d');
        ctx.save();
        ctx.font = this.opts.axisLabelFontSizePixels + 'px ' +
            this.opts.axisLabelFontFamily;
        var width = ctx.measureText(this.opts.axisLabel).width;
        var height = this.opts.axisLabelFontSizePixels;
        var x, y, angle = 0;
        if (this.axisName == 'xaxis') {
            x = this.plot.getPlotOffset().left + this.plot.width()/2 - width/2;
            y = this.plot.getCanvas().height - height * 0.28;
        } else if (this.axisName == 'x2axis') {
            x = this.plot.getPlotOffset().left + this.plot.width()/2 - width/2;
            y = height;
        } else if (this.axisName == 'yaxis') {
            x = height * 0.72;
            y = this.plot.getPlotOffset().top + this.plot.height()/2 + width/2;
            angle = -Math.PI/2;
        } else if (this.axisName == 'y2axis') {
            x = this.plot.getPlotOffset().left + this.plot.width() + this.plot.getPlotOffset().right - height * 0.72;
            y = this.plot.getPlotOffset().top + this.plot.height()/2 - width/2;
            angle = Math.PI/2;
        }
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillText(this.opts.axisLabel, 0, 0);
        ctx.restore();
    };


    // TODO: Respect padding when all other renderers.

    HtmlAxisLabel.prototype = new AxisLabel();
    HtmlAxisLabel.prototype.constructor = HtmlAxisLabel;
    function HtmlAxisLabel(axisName, plot, opts) {
        AxisLabel.prototype.constructor.call(this, axisName, plot, opts);
    }

    HtmlAxisLabel.prototype.calculateSize = function(padding) {
        var elem = $('<div class="axisLabels" style="position:absolute;">' + this.opts.axisLabel + '</div>');
        this.plot.getPlaceholder().append(elem);
        this.width = elem.outerWidth(true);
        this.height = elem.outerHeight(true);
        elem.remove();
    };

    HtmlAxisLabel.prototype.draw = function() {
        this.plot.getPlaceholder().find('#' + this.axisName + 'Label').remove();
        var elem = $('<div id="' + this.axisName + 'Label" " class="axisLabels" style="position:absolute;">' + this.opts.axisLabel + '</div>');
        this.plot.getPlaceholder().append(elem);
        if (this.axisName == 'xaxis') {
            elem.css('left', this.plot.getPlotOffset().left + this.plot.width()/2 - elem.outerWidth()/2 + 'px');
            elem.css('bottom', '0px');
        } else if (this.axisName == 'x2axis') {
            elem.css('left', this.plot.getPlotOffset().left + this.plot.width()/2 - elem.outerWidth()/2 + 'px');
            elem.css('top', '0px');
        } else if (this.axisName == 'yaxis') {
            elem.css('top', this.plot.getPlotOffset().top + this.plot.height()/2 - elem.outerHeight()/2 + 'px');
            elem.css('left', '0px');
        } else if (this.axisName == 'y2axis') {
            elem.css('top', this.plot.getPlotOffset().top + this.plot.height()/2 - elem.outerHeight()/2 + 'px');
            elem.css('right', '0px');
        }
    };


    CssTransformAxisLabel.prototype = new HtmlAxisLabel();
    CssTransformAxisLabel.prototype.constructor = CssTransformAxisLabel;
    function CssTransformAxisLabel(axisName, plot, opts) {
        HtmlAxisLabel.prototype.constructor.call(this, axisName, plot, opts);
    }

    CssTransformAxisLabel.prototype.calculateSize = function(padding) {
        HtmlAxisLabel.prototype.calculateSize.call(this, padding);
        this.labelHeight = this.height;
        this.labelWidth = this.width;
        if (this.axisName.charAt(0) == 'y') {
            this.height = this.labelWidth;
            this.width = this.labelHeight;
        }
    };

    CssTransformAxisLabel.prototype.transforms = function(degrees, x, y) {
        var stransforms = {
            '-moz-transform': '',
            '-webkit-transform': '',
            '-o-transform': '',
            '-ms-transform': ''
        };
        if (x != 0 || y != 0) {
            var stdTranslate = ' translate(' + x + 'px, ' + y + 'px)';
            stransforms['-moz-transform'] += stdTranslate;
            stransforms['-webkit-transform'] += stdTranslate;
            stransforms['-o-transform'] += stdTranslate;
            stransforms['-ms-transform'] += stdTranslate;
        }
        if (degrees != 0) {
            var rotation = degrees / 90;
            var stdRotate = ' rotate(' + degrees + 'deg)';
            stransforms['-moz-transform'] += stdRotate;
            stransforms['-webkit-transform'] += stdRotate;
            stransforms['-o-transform'] += stdRotate;
            stransforms['-ms-transform'] += stdRotate;
        }
        var s = '';
        for (var prop in stransforms) {
            if (stransforms[prop]) {
                s += prop + ':' + stransforms[prop] + ';';
            }
        }
        s += ';';
        return s;
    };

    CssTransformAxisLabel.prototype.draw = function() {
        this.plot.getPlaceholder().find("." + this.axisName + "Label").remove();
        var xoff = 0, yoff = 0, degrees = 0;
        if (this.axisName == 'xaxis') {
            xoff = this.plot.getPlotOffset().left + this.plot.width()/2 - this.labelWidth/2;
            yoff = this.plot.getPlotOffset().top + this.plot.height() + this.plot.getPlotOffset().bottom - this.labelHeight;
        } else if (this.axisName == 'x2axis') {
            xoff = this.plot.getPlotOffset().left + this.plot.width()/2 - this.labelWidth/2;
        } else if (this.axisName == 'yaxis') {
            degrees = -90;
            xoff = -1 * (this.labelWidth/2 - this.labelHeight/2);
            yoff = this.plot.getPlotOffset().top + this.plot.height()/2;
        } else if (this.axisName == 'y2axis') {
            degrees = 90;
            xoff = this.plot.getPlotOffset().left + this.plot.width() + this.plot.getPlotOffset().right - this.labelWidth/2 - this.labelHeight/2;
            yoff = this.plot.getPlotOffset().top + this.plot.height()/2;
        }
        var elem = $('<div class="axisLabels ' + this.axisName + 'Label" style="position:absolute; top: 0; ' + this.transforms(degrees, xoff, yoff) +
                     '">' + this.opts.axisLabel + '</div>');
        this.plot.getPlaceholder().append(elem);
    };


    IeTransformAxisLabel.prototype = new CssTransformAxisLabel();
    IeTransformAxisLabel.prototype.constructor = IeTransformAxisLabel;
    function IeTransformAxisLabel(axisName, plot, opts) {
        CssTransformAxisLabel.prototype.constructor.call(this, axisName, plot, opts);
        this.requiresResize = false;
    }

    IeTransformAxisLabel.prototype.transforms = function(degrees, x, y) {
        // I didn't feel like learning the crazy Matrix stuff, so this uses
        // a combination of the rotation transform and CSS positioning.
        var s = '';
        if (x != 0) {
            s += 'left: ' + x + 'px; ';
        }
        if (y != 0) {
            s += 'top: ' + y + 'px; ';
        }
        if (degrees != 0) {
            var rotation = degrees/90;
            while (rotation < 0) {
                rotation += 4;
            }
            s += ' filter: progid:DXImageTransform.Microsoft.BasicImage(rotation=' + rotation + ')';
            // see below
            this.requiresResize = (this.axisName == 'y2axis');
        }
        return s;
    };

    IeTransformAxisLabel.prototype.draw = function() {
        CssTransformAxisLabel.prototype.draw.call(this);
        if (this.requiresResize) {
            var elem = this.plot.getPlaceholder().find("." + this.axisName + "Label");
            // Since we used CSS positioning instead of transforms for
            // translating the element, and since the positioning is done
            // before any rotations, we have to reset the width and height
            // in case the browser wrapped the text (specifically for the
            // y2axis).
            elem.css('width', this.labelWidth);
            elem.css('height', this.labelHeight);
        }
    };


    function init(plot) {
        // This is kind of a hack. There are no hooks in Flot between
        // the creation and measuring of the ticks (setTicks, measureTickLabels
        // in setupGrid() ) and the drawing of the ticks and plot box
        // (insertAxisLabels in setupGrid() ).
        //
        // Therefore, we use a trick where we run the draw routine twice:
        // the first time to get the tick measurements, so that we can change
        // them, and then have it draw it again.
        var secondPass = false;

        var axisLabels = {};

        var defaultPadding = 2;  // padding between axis and tick labels
        plot.hooks.draw.push(function (plot, ctx) {
            if (!secondPass) {
                // MEASURE AND SET OPTIONS
                $.each(plot.getAxes(), function(axisName, axis) {
                    var opts = axis.options // Flot 0.7
                        || plot.getOptions()[axisName]; // Flot 0.6
                    if (!opts || !opts.axisLabel)
                        return;

                    var renderer = null;

                    if (!opts.axisLabelUseHtml && navigator.appName == 'Microsoft Internet Explorer') {
                        var ua = navigator.userAgent;
                        var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
                        if (re.exec(ua) != null) {
                            rv = parseFloat(RegExp.$1);
                        }
                        if (rv >= 9 && !opts.axisLabelUseCanvas && !opts.axisLabelUseHtml) {
                            renderer = CssTransformAxisLabel;
                        } else if (!opts.axisLabelUseCanvas && !opts.axisLabelUseHtml) {
                            renderer = IeTransformAxisLabel;
                        } else if (opts.axisLabelUseCanvas) {
                            renderer = CanvasAxisLabel;
                        } else {
                            renderer = HtmlAxisLabel;
                        }
                    } else {
                        if (opts.axisLabelUseHtml || (!css3TransitionSupported() && !canvasTextSupported()) && !opts.axisLabelUseCanvas) {
                            renderer = HtmlAxisLabel;
                        } else if (opts.axisLabelUseCanvas || !css3TransitionSupported()) {
                            renderer = CanvasAxisLabel;
                        } else {
                            renderer = CssTransformAxisLabel;
                        }
                    }

                    axisLabels[axisName] = new renderer(axisName, plot, opts);

                    var padding = opts.axisLabelPadding === undefined ? defaultPadding : opts.axisLabelPadding;

                    axisLabels[axisName].calculateSize(padding);

                    if (axisName.charAt(0) == 'x')
                        axis.labelHeight += axisLabels[axisName].height;
                    else
                        axis.labelWidth += axisLabels[axisName].width;
                    opts.labelHeight = axis.labelHeight;
                    opts.labelWidth = axis.labelWidth;
                });
                // re-draw with new label widths and heights
                secondPass = true;
                plot.setupGrid();
                plot.draw();
            } else {
                // DRAW
                $.each(plot.getAxes(), function(axisName, axis) {
                    var opts = axis.options // Flot 0.7
                        || plot.getOptions()[axisName]; // Flot 0.6
                    if (!opts || !opts.axisLabel)
                        return;

                    axisLabels[axisName].draw();
                });
            }
        });
    }



    $.plot.plugins.push({
        init: init,
        options: options,
        name: 'axisLabels',
        version: '1.0'
    });
})(jQuery);
