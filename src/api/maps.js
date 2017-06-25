'use strict';


// namespace
window.nettools = window.nettools || {};


// lib code
nettools.google = nettools.google || {		
		
    /** 
     * Load a Google API and call a callback when loading over
     *
     * @param string url 
     * @param function(url) cb Callback to call when loading done
     */
    APILoad : function (url, cb)
    {

        if ( cb && (typeof cb === 'function') )
        {
            var cbstr = '_api_loaded' + Math.floor(1000000 + (1+1000000-0)*Math.random());
            nettools.google[cbstr] = cb.bind(null, url);   // set URL parameter as first callback parameter ; may be used to load several APIs at once
        }
        else
            var cbstr = '';
        

        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = url + (cbstr ? "&callback=nettools.google." + cbstr : '');
        document.body.appendChild(script);
    },
    
    
    
    /** 
     * Merge 2 litteral objects
     * 
     * @param Object o1 
     * @param Object o2
     * @return Object Returns a new object ; properties existing in dest AND source are overriden in dest by their values in source
     */
    mergeObjects : function(o1, o2)
    {
        var result = {};

        // copy o1 object to new object
        if ( o1 )
            for ( var p in o1 )
                result[p] = o1[p];

        // copy o2 object to new object
        if ( o2 )
            for ( var p in o2 )
                result[p] = o2[p];

        return result;
    }

    
};








/*** GOOOGLE MAPS ***/
nettools.google.maps = nettools.google.maps || {};


/** 
 * MapManager class
 * 
 * Handle maps related stuff (directions, info windows)
 * Options set when the object is created are kept in memory, so that the map could be later reset to its original settings.
 *
 * mapManagerOptions : 
 * {
 *     markerClick : function(marker)   // callback called when a marker is clicked
 * }
 * 
 * @param string mapdiv ID of DOM tag to hold the map
 * @param google.maps.LatLng|Object(lat,lng) centerpoint Coordinates of default map location as a LatLng object or a litteral object with lat and lng properties
 * @param Object mapOpt Object litteral with default settings for google.maps.Map
 * @param Object directionsRendererOpt Object litteral with default settings for google.maps.DirectionsRenderer
 */
nettools.google.maps.MapManager = nettools.google.maps.MapManager || (function() {

	// ---- PRIVATE STATEMENTS ----
	
	var _directionsRenderer = null;
	var _directionsService = null;
	var _infoWindow = null;

	// ---- /PRIVATE STATEMENTS ----


    return function(mapdiv, centerpoint, mapOpt, directionsRendererOpt)
		{
			// backup default options so that they could be restored when raz() is called
			this.options = {
							map : nettools.google.mergeObjects({center: centerpoint, mapTypeId: google.maps.MapTypeId.ROADMAP}, mapOpt || {}),
							directionsRenderer : directionsRendererOpt || {}
				};
			
			
			// creating map with options ; creating empty markers array
			this.map = new google.maps.Map((typeof mapdiv == 'string')?document.getElementById(mapdiv):mapvid, this.options.map);
			this.markers = new Array();
			
			
        
			// ---- PROTECTED METHODS ----
			
			/**
             * Restore default options and reset route
             */
			this.raz = function()
			{
				// erase markers
				for ( var i = 0 ; i < this.markers.length ; i++ )
				{
					this.markers[i].setMap(null);
					this.markers[i] = null;
				}
				this.markers.length = 0;
				
				
				// no route rendered
				if ( _directionsRenderer )
					this.getDirectionsRenderer().setMap(null);
				
				// center map
				this.map.setOptions(this.options.map);
			};
							
		
        
			/**
             * directionsRenderer accessor
             *
             * @return google.maps.DirectionsRenderer
             */
			this.getDirectionsRenderer = function()
			{
				if ( ! _directionsRenderer )
					_directionsRenderer = new google.maps.DirectionsRenderer(this.options.directionsRenderer);
				
				return _directionsRenderer;
			};
			
        
		
			/**
             * directionsService accessor
             * 
             * @return google.maps.DirectionsService
             */
			this.getDirectionsService = function()
			{
				if ( ! _directionsService )
					_directionsService = new google.maps.DirectionsService();
				
				return _directionsService;
			};
			
			
        
			/**
             * infoWindow accessor
             *
             * @return google.maps.InfoWindow
             */
			this.getInfoWindow = function()
			{
				if ( ! _infoWindow )
					_infoWindow = new google.maps.InfoWindow({});
					
				return _infoWindow;
			};
			
			
			// ---- /PROTECTED METHODS ----
		};
})();



// ---- PUBLIC METHODS
nettools.google.maps.MapManager.prototype = 
{
	/**
     * Create several markers at a time
     *
     * @param Object[] mks Array of litteral objects representing google.maps.Marker constructor options
     */
	createMarkers : function(mks)
	{
		// reset previous markers
		for ( var i=0 ; i < this.markers.length ; i++ )
		{
			this.markers[i].setMap(null);
			this.markers[i] = null;
		}
		this.markers.length = 0;
		
		
		// set the new markers array size (optimization)
		this.markers = new Array(mks.length);
		
		
		// creating markers from mks parameter
		for ( var i = 0 ; i < mks.length ; i++ )
			this.markers[i] = new google.maps.Marker(mks[i]);
	},
	
	
    
	/**
     * Create a single marker
     *
     * @param Object opt Marker options for google.maps.Marker constructor
     * @return google.maps.Marker 
     */
	createMarker : function(opt)
	{
		var marker = new google.maps.Marker(opt);

        this.markers[this.markers.length] = marker;
		return marker;
	},
	
	
    
	/**
     * Compute a route beetween two coordinates
     * 
     * @param google.maps.LatLng|Object(lat,lng)|string|google.maps.Place p1 Start address 
     * @param google.maps.LatLng|Object(lat,lng)|string|google.maps.Place p2 End address 
     * @param Object opts Object litteral with other options for DirectionsService (such as DirectionsTravelMode, etc.)
     * @param function(DirectionsResult) cbok Callback called with a DirectionsResult object if the route has been computed successfuly
     * @param function(DirectionsStatus) cbko Callback called with a DirectionsStatus object if the route has not been computed successfuly
     */
	route : function(p1, p2, opts, cbok, cbko)
	{
		// remove previous route
		this.raz();
		
		var me = this;
		
		
		// send request
		this.getDirectionsService().route( nettools.google.mergeObjects({origin : p1, destination : p2, travelMode : google.maps.DirectionsTravelMode.DRIVING}, opts || {}),

										// callback
										function(result, status)
										{
											// if ok
											if (status == google.maps.DirectionsStatus.OK)
											{
												// plot the route on the map
												me.getDirectionsRenderer().setDirections(result);
												me.getDirectionsRenderer().setMap(me.map); 
													
                                                // user callback
												if ( cbok && (typeof cbok === 'function') )
													cbok(result);
											}
											
											// user callback is ko
											else
												if ( cbko && (typeof cbko === 'function') )
													cbko(status);
										}
									);
	}
};


