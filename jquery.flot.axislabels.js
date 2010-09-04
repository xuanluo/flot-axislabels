/*
Axis Labels Plugin for flot. :P
Released under the GPLv3 license by Xuan Luo, September 2010.

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

    function init(plot) {
        var secondPass = false;
        plot.hooks.draw.push(function (plot, ctx) {
            if (!secondPass) {
                // MEASURE AND SET OPTIONS
                $.each(plot.getAxes(), function(axisName, axis) {
                    var opts = axis.options // Flot 0.7
                        || plot.getOptions()[axisName]; // Flot 0.6
                    if (!opts || !opts.axisLabel)
                        return;

                    var w, h;
                    if (opts.axisLabelUseCanvas != false)
                        opts.axisLabelUseCanvas = true;
                    if (opts.axisLabelUseCanvas) {
                        if (!opts.axisLabelFontSizePixels)
                            opts.axisLabelFontSizePixels = 14;
                        if (!opts.axisLabelFontFamily)
                            opts.axisLabelFontFamily = 'sans-serif';
                        // since we currently always display x as horiz.
                        // and y as vertical, we only care about the height
                        w = opts.axisLabelFontSizePixels;
                        h = opts.axisLabelFontSizePixels;

                    } else {
                        var elem = $('<div class="axisLabels" style="position:absolute;">' + opts.axisLabel + '</div>');
                        plot.getPlaceholder().append(elem);
                        w = elem.outerWidth(true);
                        h = elem.outerHeight(true);
                        elem.remove();
                    }

                    if (axisName.charAt(0) == 'x')
                        axis.labelHeight += h;
                    else
                        axis.labelWidth += w;
                    opts.labelHeight = axis.labelHeight;
                    opts.labelWidth = axis.labelWidth;
                });
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
                    if (opts.axisLabelUseCanvas) {
                        var ctx = plot.getCanvas().getContext('2d');
                        ctx.save();
                        ctx.font = opts.axisLabelFontSizePixels + 'px ' +
                                opts.axisLabelFontFamily;
                        var width = ctx.measureText(opts.axisLabel).width;
                        var height = opts.axisLabelFontSizePixels;
                        var x, y;
                        if (axisName.charAt(0) == 'x') {
                            x = plot.getPlotOffset().left + plot.width()/2 - width/2;
                            y = plot.getCanvas().height;
                        } else {
                            x = -(plot.getPlotOffset().top + plot.height()/2 - width/2);
                            y = height * 0.72;
                        }
                        ctx.rotate((axisName.charAt(0) == 'x') ? 0 : -Math.PI/2);
                        ctx.fillText(opts.axisLabel, x, y);
                        ctx.restore();

                    } else {
                        plot.getPlaceholder().find('#' + axisName + 'Label').remove();
                        var elem = $('<div id="' + axisName + 'Label" " class="axisLabels" style="position:absolute;">' + opts.axisLabel + '</div>');
                        if (axisName.charAt(0) == 'x') {
                            elem.css('left', plot.getPlotOffset().left + plot.width()/2 - elem.outerWidth()/2 + 'px');
                            elem.css('bottom', '0px');
                        } else {
                            elem.css('top', plot.getPlotOffset().top + plot.height()/2 - elem.outerHeight()/2 + 'px');
                            elem.css('left', '0px');
                        }
                        plot.getPlaceholder().append(elem);
                    }
                });
                secondPass = false;
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
