/*!
 * GMaps.js v0
 *
 * Copyright 2013, tubackkhoa@gmail.com
 * Released under the MIT License.
 */



(function ($) {

    App.loadJs($('<script src="themes/admin/assets/jquery-ui-map/jquery.ui.map.js"></script>'));
    App.loadJs($('<script src="themes/admin/assets/jquery-ui-map/jquery.ui.map.services.js"></script>'));

    // after document ready, we then load gmap for faster rendering
    $(function () {
        App.loadJs($('<script src="http://maps.google.com/maps/api/js?sensor=true&language=' +
                App.lang + '&callback=gmapReadyFire&libraries=places,visualization&v=3.exp"></script>'));
    });

    var getCurrentPosition = function (callback, geoPositionOptions) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                    function (result) {
                        callback(result, 'OK');
                    },
                    function (error) {
                        callback(null, error);
                    },
                    geoPositionOptions
                    );
        } else {
            callback(null, 'NOT_SUPPORTED');
        }
    };
    var sourceMap = {}; // cached name=>position for suggestion
    var addMarker = function (lat, lng, el) {
        var position = new google.maps.LatLng(lat, lng);
        el.gmap('clear', 'markers');
        var marker = el.gmap('addMarker', {
            position: position,
            bounds: true,
            draggable: true
        }, function (map, marker) {
            setAddress(position, marker, el);
            $(marker).addEventListener('dragend', function (event) {
                setAddress(event.latLng, this, el);
            });
        });

        return marker;
    };

    var setAddress = function (position, marker, el) {
        el.gmap('search', {'location': position}, function (results, status) {
            if (status == 'OK') {
                marker.setTitle(results[0].formatted_address);
                el.triggerHandler('setAddressComplete', [results[0].formatted_address, position]);
            } else {
                errorMessage("Geocoder failed due to: " + status);
            }
        });
    };

    var setAddressSource = function (query, process, marker, map, el) {
        el.gmap('search', {'address': query}, function (results, status) {
            if (status === 'OK') {
                var address = $.map(results, function (item) {
                    sourceMap[item.formatted_address] = item.geometry.location;
                    return item.formatted_address;
                });
                process(address);
                if (address.length === 1) {
                    var position = sourceMap[address[0]];
                    marker.setTitle(address[0]);
                    //addMarker(position.lat(), position.lng(), el);
                    marker.setPosition(position);
                    map.setCenter(position);
                    el.triggerHandler('setAddressComplete', [address[0], position]);
                }
            } else if (status === 'OVER_QUERY_LIMIT') {
                errorMessage('Google said it\'s too much!');
            } else if (status === 'ZERO_RESULTS') {
                // try with place
                if (google.maps.places) {
                    var service = new google.maps.places.PlacesService(map);
                    service.textSearch({query: query}, function (results, status) {
                        if (status == google.maps.places.PlacesServiceStatus.OK) {
                            // try with first result
                            var position = results[0].geometry.location;
                            marker.setTitle(results[0].formatted_address);
                            marker.setPosition(position);
                            map.setCenter(position);
                            el.triggerHandler('setAddressComplete', [results[0].formatted_address, position]);
                        } else {
                            errorMessage('Not found');
                        }
                    });
                } else {
                    errorMessage('Not found');
                }
            }
        });
    };

    // extend function
    App.Func.handleGmap = function (selector) {
        $.gmapReady(function () {
            if (!$().gmap)
                return;
            var data = selector.data();
            data.container = App.getContainer(selector, data.container);
            var mapEl = selector.find('.gmaps');
            var lngEl = selector.find(data.lngEl);
            var latEl = selector.find(data.latEl);
            if (!lngEl.length)
                lngEl = $(data.lngEl);
            if (!latEl.length)
                latEl = $(data.latEl);
            var zoomEl = selector.find(data.zoomEl);
            var gmapAddress = selector.find(data.addressEl);
            var map;
            var marker;

            selector.bind('windowResize', function () {
                // function for resize should run after html is reconstructed
                setTimeout(function () {
                    mapEl.gmap('refresh');
                });

            });

            // assign some options from selector to address input
            gmapAddress.attr('placeholder', data.placeholder || '');

            // init gmap with lat and lng in boundary
            mapEl.gmap().bind('init', function (evt, mapready) {
                map = mapready;
                if (!data.lat && !data.lng) {
                    // default value, should came from html markup
                    marker = addMarker(data.defaultLat || 21.008581, data.defaultLng || 105.796798, mapEl)[0];

                    getCurrentPosition(function (position, status) {
                        if (status === 'OK')
                            //addMarker(position.coords.latitude, position.coords.longitude, mapEl);	
                            var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                        marker.setPosition(pos);
                        map.setCenter(pos);
                        setAddress(pos, marker, mapEl);
                    });
                } else {
                    marker = addMarker(+data.lat, +data.lng, mapEl)[0];
                }
                // fix top-left corner
                mapEl.gmap('refresh');
                map.setZoom(data.zoom || 14);
                // pure map v3 object here		  				  
                $(map).addEventListener('zoom_changed', function () {
                    zoomEl.val(map.getZoom());
                });

                // click to rebind address
                $(marker).addEventListener('click', function () {
                    gmapAddress.val(marker.title);
                });

            });

            // auto bind address from drag & drop
            mapEl.bind('setAddressComplete', function (e, address, position) {
                if (data.setAddress)
                    gmapAddress.val(address);
                lngEl.val(position.lng());
                latEl.val(position.lat());
            });

            gmapAddress.typeahead({
                source: function (query, process) {
                    setAddressSource(query, process, marker, map, mapEl);
                },
                updater: function (name) {
                    var position = sourceMap[name];
                    //addMarker(position.lat(), position.lng(), mapEl);	
                    marker.setTitle(name);
                    marker.setPosition(position);
                    map.setCenter(position);
                    mapEl.triggerHandler('setAddressComplete', [name, position]);
                    return name;

                },
                container: data.container
            });
        });
    };

})(jQuery);

