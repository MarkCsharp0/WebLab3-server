
export class Api {
    static serverLink = 'http://localhost:3000';
    static defaultCityID = "498817";

    getWeatherByName(cityName) {
        let requestURL = Api.serverLink + '/weather/city?q=' + encodeURI(cityName);
        return this.getWeather(requestURL);
    }

    async getWeather(url, method = 'GET') {
       // console.log(url)
        try {
            const response = await fetch(url, {
                method: method,
                credentials: 'include'
            });
           // console.log(response);
            return await response.json();
        } catch (error) {
            return { success: false, payload: error };
        }
    }

    getWeatherDefault() {
        let requestURL = Api.serverLink + '/weather/'+ encodeURI(Api.defaultCityID);
        //console.log(requestURL);
        return this.getWeather(requestURL);
    }

    getWeatherByCoords(latitude, longitude) {
        let requestURL = Api.serverLink + '/weather/coordinates?lat=' + encodeURI(latitude) + '&lon=' + encodeURI(longitude);
       // console.log(requestURL);
        return this.getWeather(requestURL);
    }

    getFavoriteWeatherList() {
        let requestURL = Api.serverLink + '/favourites';
        return this.getWeather(requestURL);
    }

    getWeatherByID(cityID) {
        let requestURL = Api.serverLink + '/weather/' + encodeURI(cityID);
        return this.getWeather(requestURL);
    }

    addFavoriteCity(cityName) {
        let requestURL = Api.serverLink + '/favourites/' + encodeURI(cityName);
        return this.getWeather(requestURL, 'POST');
    }

    deleteFavoriteCity(cityID) {
        let requestURL = Api.serverLink + '/favourites/' + encodeURI(cityID);
        return this.getWeather(requestURL, 'DELETE');
    }
}
