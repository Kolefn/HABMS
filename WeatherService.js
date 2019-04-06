var WeatherService = {

    /**
     * Uses the DarkSky TimeMachine forcast api to fetch 
     * weather data for a date in the past or future.
     * @param {Date} date the day of the requested forcast
     * @param {float} latitude of the forecast location
     * @param {float} longitude of the forecast location
     * @return {Promise<Object>} Resolves with a dark sky response payload object
     */
    getForecastData: (date, latitude, longitude) => {
        const url = WeatherService.getForecastRequestURL(date, latitude, longitude);
        return fetch(url).then(function(response) {
            return response.json();
        }).then(function(data) {
            console.log(data);
            return Promise.resolve(data);
        }).catch(function(error) {
            console.log(error);
            return Promise.reject(error);
        });
    },

    /**
     * Constructs the HTTPS URL that forecast data will be fetched from. 
     * @param {Date} date for which to get forecast data
     * @param {float} latitude of the forcast location
     * @param {float} longitude of the forecast location
     */
    getForecastRequestURL: (date, latitude, longitude) => {
        const time = WeatherService.getFormattedTimeString(date);
        return `https://api.darksky.net/forecast/${CREDENTIALS.DARK_SKY_API_KEY}/${latitude},${longitude},${time}`;
    },

    /**
     * Converts a date object to the appropriate time string format used by the Dark Sky API.
     * @param {Date}
     * @return {string} 
     */
    getFormattedTimeString(date){
        return date.valueOf() / 1000;

    },

    handleFormSubmit: () => {
        const missionDateString = document.getElementById("mission_date").value;
        const launchLat = document.getElementById("launch_latitude").value;
        const launchLon = document.getElementById("launch_longitude").value;

        WeatherService.getForecastData(new Date(missionDateString), launchLat, launchLon);
    }
 };
