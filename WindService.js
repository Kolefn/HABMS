var WindService = {
    /**
     * A custom data structure used by the wind surface to describe wind.
     * @typedef {Object} WindVector
     * @property {number} direction the direction degree the wind is coming from 
     * @property {number} speed kilometers per hour
     */


    /**
     * Get wind data for a position on earth at a specified 
     * pressure altitude.
     * @param {number} latitude 
     * @param {number} longitude
     * @param {number} millibars of atmospheric pressure at the altitude
     * @see `WindService.SUPPORTED_PRESSURES`
     * @return {WindVector} 
     */
    getWindAtLocation: (latitude, longitude, millibars) => {
        const url = WindService.constructRequestURL(latitude, longitude, millibars);
        return WindService.loadIFrame(url)
            .then(WindService.extractDataFromHTML);
    },

    /**
     * Side loads the data provider site in an iframe and periodically checks if the needed
     * data has loaded within the iframe. This will eventually timeout if the provider does 
     * not load the data in a reasonable amount of time.
     * @param {string} url the request url with parameters set
     * @param {number} timeout in seconds 
     * @return {Promise<*>} returns with iframe html
     */
    loadIFrame: (url, timeout = 10) => {
        return new Promise((resolve, reject)=> {
            let resolved = false;
            let iframe = document.getElementById("wind_service_iframe");
            iframe.src = url;
            iframe.addEventListener('load', (evt) => {
                resolve(evt.target);
                resolved = true;
            });
            
            setTimeout(()=> {
                if(!resolved){
                    reject("loading timed out");
                }
            }, timeout * 1000);
        });
        
    },

    extractDataFromHTML: (html) => {
        // let content = document.getElementById("wind_service_iframe").contentWindow.body;
        // console.log(content);
    },

    /**
    * Build the url that the data will be fetched from.
    * @param {number} latitude 
    * @param {number} longitude
    * @param {number} millibars of atmospheric pressure at the altitude
    */
    constructRequestURL: (latitude, longitude, millibars) => {
        return `https://earth.nullschool.net/#current/wind/isobaric/${millibars}hPa/loc=${longitude},${latitude}`;
    },

    /**
     * Conversts millibars (hPa) to pressure altitude in feet. Note
     * this is not 100% accurate but approximate within ~100ft. 
     * @param {number} millibars of atmospheric pressure
     * @return {number} the approx. altitude in feet
     */
    convertMillibarsToAltitudeFt: (millibars) => {
        const MULT = 145366.45;
        const STANDARD_ATM_PRESS = 1013.25;
        const EXP = 0.190284;

        return MULT * ( 1 - Math.pow(millibars / STANDARD_ATM_PRESS, EXP)); 
    },

    loadOptions: ()=> {
        let selectionList = document.getElementById("pressure_select");
        for(let key in WindService.SUPPORTED_PRESSURES){
            let option = document.createElement("option");
            option.text = key;
            option.value = WindService.SUPPORTED_PRESSURES[key];
            selectionList.add(option);
        }
    },

    handleFormSubmit: () => {
        const lat = document.getElementById("launch_latitude").value;
        const lon = document.getElementById("launch_longitude").value;
        const pressure = document.getElementById("pressure_select").value;
        

        WindService.getWindAtLocation(lat, lon, pressure);
    },


    SUPPORTED_PRESSURES: {
        hPa1000: 1000,
        hPa800: 850,
        hPa700: 700,
        hPa500: 500,
        hPa250: 250,
        hPa70: 70,
        hPa10: 10, 
    },
}