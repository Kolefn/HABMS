var WindService = {
    /**
     * A custom data structure used by the wind surface to describe wind.
     * @typedef {Object} WindVector
     * @property {number} direction the direction degree the wind is coming from 
     * @property {number} speed kilometers per hour
     * 
     */

     

    /**
     * Get the atmospheric level data required to run drift simulation.
     * @see DriftSimulator for details on atmospheric level data structure 
     * @param {number} latitude 
     * @param {number} longitude
     * @return {Promise<Array<AtmosphericLevel>>}
     */
    getAtmosphericLevelsData: (latitude, longitude) => {
        return WindService.getAllWindVectorsAbovePoint(latitude, longitude)
            .then((vectors)=> {
                const keys = Object.keys(WindService.SUPPORTED_PRESSURES);
                const levels = vectors.map((vector, i)=>{
                    const key = keys[i];
                    const altitude =  WindService.PRESSURE_ALTITUDES_METERS[key];
                    const pressure = WindService.SUPPORTED_PRESSURES[key];
                    return  {vector, altitude, pressure};
                });
                return Promise.resolve(levels);
            });
    },

     /**
     * Get all available wind data for atmospheric levels above a location.
     * @param {number} latitude 
     * @param {number} longitude
     * @return {Array<WindVector>}
     */
    getAllWindVectorsAbovePoint: (latitude, longitude)=> {
        return new Promise((resolve, reject) => {
            const urls = Object.keys(WindService.SUPPORTED_PRESSURES)
                        .map((key)=> WindService.constructRequestURL(latitude, longitude, WindService.SUPPORTED_PRESSURES[key]) );
    
            WindService.loadIFrame(urls[0]).then(()=> {
                let vectors = [];
                const iframe = document.getElementById("wind_service_iframe");
                const iframeDocument = iframe.contentWindow.document;
                const element = iframeDocument.getElementById("location-wind");
                //wait for data to load in
                let isBlank = false;
                element.addEventListener('DOMSubtreeModified', function handler(){
                    if(isBlank){ isBlank = false; return; }else { isBlank = true; }
                    vectors.push(WindService.extractWindVectorFromElement(element));
                    if(vectors.length === urls.length){
                        element.removeEventListener('DOMSubtreeModified', handler);
                        resolve(vectors);
                    }else{
                        iframe.src = urls[vectors.length];
                    }
                });
            });
        });
        
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
            iframe.addEventListener('load', function handler(evt){
                iframe.removeEventListener('load', handler);
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

    /**
     * inner text of the location-wind element looks something like 240° @ 14
     * and needs to be converted to { direction: 240, speed: 14 }
     * @param {*} element
     * @return {WindVector} 
     */
    extractWindVectorFromElement: (element) => {
        const dataString = element.innerText;
        const dataChunks = dataString
                    .replace(/[^\w\s]/gi, '')
                    .split("  ")
                    .map((val)=> Number.parseFloat(val));
        const headingDegrees = dataChunks[0];
        const speed = dataChunks[1];
        const windVector = { direction: headingDegrees, speed };
        return windVector;
    },

    /**
    * Build the url that the data will be fetched from.
    * @param {number} latitude 
    * @param {number} longitude
    * @param {number} millibars of atmospheric pressure at the altitude
    */
    constructRequestURL: (latitude, longitude, millibars) => {
        return `./earth/#current/wind/isobaric/${millibars}hPa/loc=${longitude},${latitude}`;
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

    PRESSURE_ALTITUDES_METERS: {
        hPa1000: 110.8,
        hPa800: 1948.2,
        hPa700: 3010.9,
        hPa500: 5572.1,
        hPa250: 10358.5,
        hPa70: 17661.7,
        hPa10: 25907.5,
    }
}