/*eslint-disable */

export const mapRender = function (locations) {
  mapboxgl.accessToken =
    'pk.eyJ1IjoieWFja3JhbWFuMTIiLCJhIjoiY2x1cThzNXg2MWkzNjJpcG5zb2c0c3YyYiJ9.Xwy_oFd-1jragzCuPXjz7A';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/yackraman12/clurj3ou800un01qq7tgx1y0o',
    scrollZoom: false, //user will not zoom in the map when he scroll down the page
  });

  const Bounds = new mapboxgl.LngLatBounds();
  locations.forEach((loc) => {
    //create a marker for each element
    const el = document.createElement('div');
    el.className = 'marker';

    //add the marker to the map
    new mapboxgl.Marker({
      Element: el, //the marker that creared
      anchor: 'bottom', //how the anchor is pointing to the location
    })
      .setLngLat(loc.coordinates) //add the marker to those coordinates
      .addTo(map);

    new mapboxgl.Popup({
      offset: 40,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>on day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);
    Bounds.extend(loc.coordinates); //extends the boundaries of the map to the currentloc
  });
  map.fitBounds(Bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
