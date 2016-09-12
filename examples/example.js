(function(win, doc) {
  'use strict';
  
  var view = new ol.View({
      center: [0, 0],
      zoom: 3,
      minZoom: 2,
      maxZoom: 20
    }),
    vectorLayer = new ol.layer.Vector({
      source: new ol.source.Vector()
    }),
    baseLayer = new ol.layer.Tile({
      source: new ol.source.OSM()
    }),
    map = new ol.Map({
      target: doc.getElementById('map'),
      view: view,
      layers: [baseLayer, vectorLayer]
    });


  var OverView = new InteractiveOverview({
    collapsed: false,
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM({
          wrapX: false,
          url: 'http://{a-c}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png'
        })
      })
    ]
  });
  map.addControl(OverView);
  

})(window, document);
