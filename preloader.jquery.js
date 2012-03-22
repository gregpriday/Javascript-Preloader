/**
 * A jQuery asset preloader. It preloads Images, CSS and HTML. It's useful for loading mini apps and widgets.
 *
 * Licensed under the WTFPL http://sam.zoy.org/wtfpl/
 * Written By Greg Priday <http://siteorigin.com/>
 */

(function ($) {
    $.preload = function (assets, options) {
        options = $.extend({
            'nocache':false, // Dont cache requests
            'start':null, // Callback when preloading starts
            'each':null, // Callback after each asset completes
            'complete':null, // Callback after all assets complete
            'insert':false, // Should JS and CSS be inserted after completion (per asset)?
            'insertComplete':true     // Should JS and CSS be inserted after completion of all assets?
        }, options);

        var isComplete = function () {
            var c = 0;
            for (var i = 0; i < assets.length; i++) {
                if (assets[i].loaded) c++;
            }
            return c == assets.length;
        }

        // Preload all the assets
        var assetLoad = function (i) {
            var asset = assets[i];
            if (!asset.loaded) {
                if (asset.callback != null) assets[i].callback();
                asset.loaded = true;
                if (asset.insert && (asset.type == 'css' || asset.type == 'js')) {
                    asset.el.appendTo($('head'));
                }
                if (options.each == 'function') options.each(assets[i]);
                if (isComplete()) {
                    if (typeof options.complete == 'function') options.complete(assets);
                    if (options.insertComplete) {
                        // Insert all assets
                        $.each(assets, function (i, asset) {
                            if (asset.type == 'css' || asset.type == 'js') {
                                asset.el.appendTo($('head'));
                            }
                            else if (asset.type == 'html' && asset.appendTo) {
                                $(asset.appendTo).append(asset.el);
                            }
                        })
                    }
                }
            }
        };

        $.each(assets, function (i, asset) {
            asset = $.extend({
                'type':null,
                'callback':null        // Callback after item is loaded
            }, asset);
            var preload = false;
            var url = asset.url;
            
            if(options.nocache){
                // Add the nocache
                url = url + (url.split('?') > 1 ? '&' : '?') + 'nocache=' + Math.random();
            }
            
            if (asset.type == 'image') {
                asset.el = $('<img />')
                    .attr('src', url);
                preload = true;
            }
            else if (asset.type == 'css') {
                asset.el = $('<link rel="stylesheet" type="text/css" media="all" />')
                    .attr('href', url);
                preload = true;
            }
            else if (asset.type == 'js') {
                asset.el = $('<script type="text/javascript" />')
                    .attr('src', url);
                preload = true;
            }
            else if (asset.type == 'html') {
                $.get(url, function (data) {
                    assets[i].el = $(data);
                    assetLoad(i);
                });
            }

            if (preload) {
                // Load the asset through an image
                assets[i] = asset;
                var img = $('<img />')
                    .attr('src', asset.url)
                    .ready(function () {
                        assetLoad(i, asset)
                    });
            }
        });

        if (options.start != null) options.start();

        return assets;
    }
})(jQuery);