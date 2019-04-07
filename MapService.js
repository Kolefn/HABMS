var MapService = {

    markers: [],

    initMap: (latitude, longitude) => {
        let latlng = new google.maps.LatLng(latitude, longitude);

        MapService.map = new google.maps.Map(
            document.getElementById('map'), {zoom: 7, center: latlng});
    },

    addMarker: (latitude, longitude, label, color) => {
        let latlng = new google.maps.LatLng(latitude, longitude);
        let marker = new google.maps.Marker({position: latlng, map: MapService.map, label, icon: `./balloon_icon_${color}.png` });
        MapService.markers.push(marker);
    },

    addMarkers: (points) => {
        const markers = points.map((point, index)=> {
            const { latitude, longitude, color } = point;
            MapService.addMarker(latitude, longitude, index.toString(), color);
        });

        MapService.markers.concat(markers);
    }
}