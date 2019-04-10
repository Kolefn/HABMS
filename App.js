var App = {


    getMissionStats: ()=> {
        const launchDate = App.getLaunchDate();
        const launchPoint = App.getLaunchPoint();
        const { latitude, longitude } = launchPoint;

        WeatherService.getForecastData(launchDate, latitude, longitude).then(App.displayWeatherData);
    },

    runDriftSimulation: () => {
        
        const launchPoint = App.getLaunchPoint();
        const { latitude, longitude } = launchPoint;
        MapService.initMap(latitude, longitude);

        const runButton = document.getElementById("simulate_drift_button");
        const runButtonText = document.getElementById("simulate_drift_button_text");
        runButtonText.innerHTML = "Loading...";
        runButton.disabled = true;
        WindService.getAtmosphericLevelsData(latitude, longitude).then((levels)=> {
            runButton.innerText = "Simulating...";
            const path = DriftSimulator.simulate({
                launchPoint: {
                    ...launchPoint,
                    altitude: 43,
                },
                maxAltitude: 30,
                atmosphericLevels: levels
            });
            runButtonText.innerHTML = "Done.";
            MapService.addMarkers(path);
        });
    },

    displayWeatherData: (payload) => {
        const element = document.getElementById("weather_details");
        let html = "";
        payload.hourly.data.forEach((val)=> {
            html += `<p> ${new Date(val.time * 1000).getHours()}:00`;
            html += ` | ${val.summary} | ${val.temperature} &deg;F`;
            html += ` | ${val.windBearing}&deg;, ${val.windSpeed} mi/h`; 
            html += ` | ${val.pressure} hPa </p>`;
        });

        element.innerHTML = html;
    },

    getLaunchPoint: () => {
        const lat = document.getElementById("launch_latitude").value;
        const lon = document.getElementById("launch_longitude").value;
        return { 
            latitude: Number.parseFloat(lat),
            longitude: Number.parseFloat(lon) 
        };
    },

    getLaunchDate: () => {
        const launchDateString = document.getElementById("launch_date").value;
        const date = new Date(launchDateString);
        date.setHours(24);
        return date;
    }
}

