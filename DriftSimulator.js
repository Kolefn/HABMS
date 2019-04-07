var DriftSimulator = {

    /**
     * Describes a position on earth
     * @typedef {Object} Coords
     * @property {number} latitude
     * @property {number} longitude
     * @property {number} altitude in meters
     */

     /**
      * @typedef {Object} AtmosphericLevel
      * @property {WindVector} vector the wind vector for this step
      * @property {number} altitude in meters
      * @property {number=} pressure in hPa/millibars
      */

    /**
     * Estimates the drift pattern of the ballon as it ascends. 
     * @param {Object} config for configuring the simulation
     * @param {Coords} config.launchPoint the starting lat, lon, and altitude of the ballon.
     * @param {Array<AtmosphericLevel>} config.atmosphericLevels the wind data used to calculate drift
     * @param {number} config.maxAltitude the max altitude in km that your balloon is rated for
     * @param {number} config.weight the total weight of the payload and the balloon
     * @return {Array<Coords>} an array of coordinates describing the estimated path of the balloon
     */
    simulate: (config)=> {
        const { launchPoint, atmosphericLevels, maxAltitude, weight } = config;
        const METERS_PER_KM = 1000;
        const AVG_SPEED_KM_PER_MIN = 0.25;
        const AVG_SPEED_M_PER_MIN = AVG_SPEED_KM_PER_MIN * METERS_PER_KM;
        const EST_FLIGHT_TIME = (maxAltitude*METERS_PER_KM) / AVG_SPEED_M_PER_MIN;

        //assumes wind direction is the same all the way to max altitude beyond last provided level
        atmosphericLevels.push({
            vector: atmosphericLevels[atmosphericLevels.length-1],
            altitude: maxAltitude * METERS_PER_KM
        });

        let coords = [launchPoint];
        for(let i = 0; i < atmosphericLevels.length - 1; i++){
            const level = atmosphericLevels[i];
            const nextLevel = atmosphericLevels[i+1];
            const altDiff = nextLevel.altitude - level.altitude;
            const timeBetweenLevels = altDiff / AVG_SPEED_M_PER_MIN;
            const drift = level.vector.speed * (timeBetweenLevels / 60);
            const headingVector = DriftSimulator.convertDegreesToNormalVector(level.vector.direction);
            const driftVector = headingVector.map((val)=> val * drift);
            const newPoint = DriftSimulator.getCoordsAfterDrift(coords[i], driftVector);
            newPoint.altitude = nextLevel.altitude;
            coords.push(newPoint);
        }
        console.log(coords);

        return coords;
    },

    /**
     * Calculates a new position over earth after drift.
     * @param {Coords} coords the starting position
     * @param {Array<number>} driftVector the amount of drift on x and y axis
     */
    getCoordsAfterDrift: (coords, driftVector) => {
        const { latitude, longitude } = coords;
        const METERS_PER_KM = 1000;
        const DRIFT_EAST_M = driftVector[0] * METERS_PER_KM;
        const DRIFT_NORTH_M = driftVector[1] * METERS_PER_KM;

        const earth = 6378.137,  //radius of the earth in kilometer
            pi = Math.PI,
            m = (1 / ((2 * pi / 360) * earth)) / 1000;  //1 meter in degree

        const newLat = latitude + (DRIFT_NORTH_M * m);
        const newLon = longitude + (DRIFT_EAST_M * m) / Math.cos(latitude * (pi / 180));

        return {...coords, latitude: newLat, longitude: newLon };

    },

    /**
     * Takes compass degrees and translates that degree heading into
     * normalized vector form. e.g.  180  degrees -> (0, -1), 90 degrees -> (1, 0)
     */
    convertDegreesToNormalVector: (degrees) => {
        const rad = degrees * Math.PI / 180;

        return [-Math.sin(rad), -Math.cos(rad)];
    }
}