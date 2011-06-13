(function() {
    /*
        Unit tests writen using QUnit, jQuery's unit-testing framework
    */

    $('document').ready(function() {
        var dv;
        // First instantiate the element
        $('#diva-wrapper').diva({
            iipServerBaseUrl: "http://coltrane.music.mcgill.ca:9000/fcgi-bin/iipsrv.fcgi?FIF=/mnt/images/beromunster/",
            zoomLevel: 2,
            backendServer: "http://petrucci.musiclibs.net:9002/divaserve.php?d=beromunster",
            onReady: function() {
                // Only run tests after the document viewer has loaded
                dv = $('#diva-wrapper').data('diva');

                /* =============================== */
                module("Public functions");

                test("getItemTitle()", function() {
                    equals(dv.getItemTitle(), "Beromunster", "The title should be Beromunster");
                });


                test("getCurrentPage()", function() {
                    equals(dv.getCurrentPage(), 0, "The initial page index (not number) should be 0");
                });

                test("gotoPage()", function() {
                    ok(!dv.gotoPage(1000), "We shouldn't be able to go to page 1000");
                    ok(!dv.gotoPage(0), "We shouldn't be able to go to page 0 (as 0 is not a valid page number)");
                    ok(dv.gotoPage(100), "We SHOULD be able to go to page 100");
                    equals(dv.getCurrentPage(), 99, "getCurrentPage() should now return 99");
                    // Reset it to the initial page
                    dv.gotoPage(0);
                });

                test("getZoomLevel()", function() {
                    equals(dv.getZoomLevel(), 2, "The initial zoom level should be 2");
                });

                asyncTest("zoomIn(), callback and return value", function() {
                    expect(2);
                    var canZoomIn = dv.zoomIn(function(zoomLevel) {
                        equals(zoomLevel, 3, "After zooming in, level should be 3");
                        start();
                    });

                    ok(canZoomIn, "Should be able to zoom in");
                });

                // Unit tests shouldn't change state but it's hard to avoid in this case
                // Looks like each async test has to be done separately
                asyncTest("zoomIn() again", function() {
                    expect(2);
                    var canZoomIn = dv.zoomIn(function(zoomLevel) {
                        equals(zoomLevel, 4, "Should be 4 after zooming again");
                        start();
                    });

                    ok(canZoomIn, "Should be able to zoom in");
                });

                asyncTest("zoomIn() when we can't zoom in", function() {
                    expect(2);
                    var canZoomIn = dv.zoomIn(function(zoomLevel) {
                        equals(zoomLevel, 4, "Should still be 4");
                        start();
                    });

                    ok(!canZoomIn, "Should not be able to zoom in");
                });

                // Now make sure zooming out works
                asyncTest("zoomOut() once", function() {
                    expect(2);
                    var canZoomOut = dv.zoomOut(function(zoomLevel) {
                        equals(zoomLevel, 3, "Should be 3 now");
                        start();
                    });

                    ok(canZoomOut, "Should be able to zoom out");
                });

                asyncTest("zoomOut() again", function() {
                    var canZoomOut = dv.zoomOut(function(zoomLevel) {
                        equals(zoomLevel, 2, "Should be 2 now");
                        start();
                    });

                    ok(canZoomOut, "Should work");
                });

                asyncTest("zoomOut() once again", function() {
                    var canZoomOut = dv.zoomOut(function(zoomLevel) {
                        equals(zoomLevel, 1, "Should be one now");
                        start();
                    });

                    ok(canZoomOut, "Zooming out should work");
                });

                asyncTest("last working zoomOut()", function() {
                    var canZoomOut = dv.zoomOut(function(zoomLevel) {
                        equals(zoomLevel, 0, "Should be 0");
                        start();
                    });

                    ok(canZoomOut, "Should still work");
                });

                asyncTest("zoomOut() when we can't zoom out", function() {
                    var canZoomOut = dv.zoomOut(function(zoomLevel) {
                        equals(zoomLevel, 0, "Should still be 0");
                        start();
                    });

                    ok(!canZoomOut, "Can't zoom out anymore");
                });

                // iPad-specific tests
                if (navigator.platform == 'iPad') {
                    module("Testing on the iPad");
                    test("Dimensions on the iPad", function() {
                        // First get a jQuery object for the outer element
                        var selector = $('#1-diva-outer');
                        // Figure out what the heights and widths should be later
                        equals(selector.height(), 854, "An arbitrary height");
                        equals(selector.width(), 748, "An arbitrary width");
                    });
                }

                module("diva-utils.js functions");
                test("executeCallback()", function() {
                    expect(3);
                    $.executeCallback(function(parameter) {
                        equals(parameter, 4, "Should pass it a 4");
                    }, 4);
                    $.executeCallback(function() {
                        ok(true, "Execute callback with no parameters (no errors hopefully");
                    });
                    ok(!$.executeCallback(null), "If it can't be executed, return false");
                });

                test("getHashParam()", function() {
                    // First try it with no hash params - should return false
                    ok(!$.getHashParam('anything'), "No hash params, should return false");

                    // Now set the current URL to something
                    var baseUrl = window.location.href;
                    window.location.hash = '#p=149&z=2'
                    console.log("url:" + window.location.href);
                    var nonexistentParam = $.getHashParam('lol');
                    var firstParam = $.getHashParam('p');
                    var secondParam = $.getHashParam('z');
                    ok(!nonexistentParam, "The nonexistent param should return false");
                    equals(firstParam, '149', "The 'p' param should be 149 (string)");
                    equals(secondParam, '2', "The 'z' param should be 2 (string)");

                    // Now let there be only one element in the URL
                    window.location.hash = '#p=149';
                    console.log('now:' + window.location.hash);
                    var soleParam = $.getHashParam('p');
                    equals(soleParam, '149', "The 'p' param should be 149 when it is the sole param");

                    // Now let there be other elements in the URL
                    window.location.hash = '#z=2&p=100&lol=lol';
                    var anotherFirstParam = $.getHashParam('z');
                    var anotherSecondParam = $.getHashParam('p');
                    var thirdParam = $.getHashParam('lol');
                    equals(anotherFirstParam, '2', "The 'z' param should be '2' when it is the first param");
                    equals(anotherSecondParam, '100', "The 'p' param should be '100' when it is the middle param");
                    equals(thirdParam, 'lol', "The last param should be 'lol'");
                });
            }
        });
    });
}());
