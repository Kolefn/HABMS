var App = {
    getMissionStats: ()=> {
        // WeatherService.handleFormSubmit(); 
        // WindService.handleFormSubmit();
        DriftSimulator.simulate({
            maxAltitude: 30,
            launchPoint: { latitude: 42.364170, longitude: -71.054060, altitude: 43 },
            atmosphericLevels: [
                {
                    vector: {
                        direction: 305,
                        speed: 29
                    },
                    altitude: 110.8
                },
                {
                    vector: {
                        direction: 320,
                        speed: 37
                    },
                    altitude: 1948.2
                },
                {
                    vector: {
                        direction: 300,
                        speed: 61
                    },
                    altitude: 3010.9
                },
                {
                    vector: {
                        direction: 285,
                        speed: 86
                    },
                    altitude: 5572.1
                },
                {
                    vector: {
                        direction: 290,
                        speed: 131
                    },
                    altitude: 10358.5
                },
                {
                    vector: {
                        direction: 285,
                        speed: 68
                    },
                    altitude: 17661.7
                },
                {
                    vector: {
                        direction: 90,
                        speed: 43
                    },
                    altitude: 25907.5
                },
            ]
        }) 
    },
}

