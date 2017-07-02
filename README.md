# net-tools/google-js-api

## Interface to some Google APIs

This packages contains :

- `maps.js` : a helper class `nettools.google.maps.MapManager` to provide useful methods to display maps, routes, and markers.



## Setup instructions ##

To install net-tools/google-js-api package, just require it through composer and insert any script tag required in the `HEAD` section (replace `file.js` with any of the above packages) :
```
<script src="/path_to_vendor/net-tools/google-js-api/src/api/file.js"></script>
```



## Reference ##

### nettools.google.maps.MapManager class ###

The `MapManager` class makes it possible to display a map, routes and markers in a simpler way. For example, any marker created is stored in the `MapManager` class, so that they could be later removed from the map with a call to `raz()` method.

First, create an object of `nettools.google.maps.MapManager` class ; required constructor parameters are :
- mapdiv : the ID of the DOM element to display the map into or the DOM node,
- centerpoint : a `google.maps.LatLng` object or a litteral object {lat:value, lng:value} with the desired default display coordinates,
- mapOpt : a litteral object with any of `google.maps.Map` available options (such as `mapTypeId`),
- directionsRendererOpt : a litteral object with any of `google.maps.DirectionsRenderer` available options.

```javascript
var mm = new nettools.google.maps.MapManager(
          // mapdiv
          "map_canvas2",
          
          // centerpoint
          {lat:45.763691, lng:3.119431}, 
          
          // mapOpt : options for google.maps.Map
          {
              // default zoom
              zoom: 2,

              // streetview widget off
              streetViewControl : false
          }
      );
```

`MapManager` class provides the following members :
- **map** : property to access the underlying `google.maps.Map` object,
- **raz()** : method to clear the map ; it removes markers, routes and reset default options (such as centerpoint),
- **getDirectionsRenderer()** : method to get the `google.maps.DirectionsRenderer` object ; useful to get info about a computed route,
- **getDirectionsService()** : method to get the `google.maps.DirectionsService` object,
- **getInfoWindow()** : method to get the `google.maps.InfoWindow` object (one per map),
- **createMarkers(Object[])** : method to create a lot of markers at a time ; the expected parameter is an array of litteral objects describing the markers (usually `{position:{lat:xxx, lng:xxx}, map:mm.map, title:'Marker here!'}`),
- **createMarker(Object)** : method to create a single marker ; marker parameters are set in the litteral object expected
- **route(point1, point2, options, callback_ok, callback_ko)** : method to compute and display a route between two points. Parameters are :
   - the first two parameters set the start and end coordinates (the type expected can be a string, `google.maps.LatLng` objects, litteral objects `{lat, lng}` or `google.maps.Place` objects), 
   - a litteral options object to give parameters to `DirectionsService` class (such as directionsTravelMode, etc.)
   - callbacks for successful result or failure (see sample file for detail



