var galtonUrl = 'http://galton.minutes.urbica.co/foot?'
/*
document.getElementById('profile-selector').addEventListener('change', function() {
  galtonUrl = document.getElementById('profile-selector').value;
});
*/

var args = location.search.replace(/^\?/,'').split('&').reduce(function(o, param){ var keyvalue=param.split('='); o[keyvalue[0]] = keyvalue[1]; return o; }, {});
mapboxgl.accessToken = 'pk.eyJ1IjoidXJiaWNhIiwiYSI6ImNpbnlvMXl4bDAwc293ZGtsZjc3cmV1MWYifQ.ejYUpie2LkrVs_dmQct1jA';

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/urbica/cinyado0k004cbunmpjsqxlb8',
  center: [37.61701583862305, 55.750931611695684],
  zoom: 12
});

var gridSource = new mapboxgl.GeoJSONSource({
  data: {
    type: 'FeatureCollection',
    features: []
  }
});


var debugSource = new mapboxgl.GeoJSONSource({
      data: turf.featurecollection([])
    });

var layers = [
  [30, '#00aaFF', 0.2],
  [25, '#00aaFF', 0],
  [20, '#00aaFF', 0.4],
  [15, '#00aaFF', 0],
  [10, '#00aaFF', 0.6],
  [5, '#00aaFF', 0]
];

map.on('style.load', function () {
  map.addSource('grid', gridSource);
  map.addSource('debug', debugSource);

  layers.forEach(function (layer, i) {
    map.addLayer({
      'id': 'grid-' + i,
      'type': 'fill',
      'source': 'grid',
      'layout': {},
      'paint': {
        'fill-color': layer[1],
        'fill-opacity': layer[2]
      },
      'filter': [
        'all',
        ['==', '$type', 'Polygon'],
        ['<=', 'time', layer[0]]
      ]
    }, "road-path");

    map.addLayer({
      'id': 'points-' + i,
      'type': 'circle',
      'source': 'grid',
      'layout': {},
      'paint': {
        "circle-radius": 0,
        "circle-color": layer[1]
      },
      'filter': [
        'all',
        ['==', '$type', 'Point'],
        ['<=', 'time', layer[0]]
      ]
    });

  });

  map.addLayer({
    'id': 'debug',
    'type': 'fill',
    'source': 'debug',
    'layout': {},
    'paint': {
      'fill-color': "#999",
      'fill-opacity': 0.6
    }
  });

});

map.on('click', function (e) {
  console.time('request');

  var url = galtonUrl + 'lng=' + e.lngLat.lng + '&lat=' +  e.lngLat.lat;

  d3.json(url, function(data) {
    var debugPoints = turf.featurecollection([]);
    console.log(data);
    console.timeEnd('request');
    console.time('hull');

    debugPoints.features = data.features.filter(function(f) {
      return f.geometry.type == 'Point' && f.properties.time <= 20;
    });
//      console.log(points);
    var hull = turf.concave(debugPoints, 0.5, 'kilometers');
    console.log(hull);


    console.timeEnd('hull');
    gridSource.setData(data);
    debugSource.setData(turf.featurecollection([hull]));

  });
});

var popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
});

map.on('mousemove', function(e) {
  var features = map.queryRenderedFeatures(e.point, { layers: ['grid-0', 'grid-1', 'grid-2', 'grid-3', 'grid-4', 'grid-5'] });
  if (!features.length) {
      popup.remove();
      return;
  }
  var feature = features[0];
  popup.setLngLat(e.lngLat)
      .setHTML(feature.properties.time)
      .addTo(map);
});
