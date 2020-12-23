const apiKey = "fa80dfd43dd64fe4ef5aaa1ab1bce741";
const apiLink = 'https://api.openweathermap.org/data/2.5/weather?units=metric&lang=ru&';
import fetch from "node-fetch";

const responseFailed = {
    success: false,
    payload: "Не получилось получить информацию с сервера"
};

export class fetchFunctions {
    async  getWeather(url) {
        try {
            const response = await fetch(url);
            try {
                const data = await response.json();
                console.log(data.message);
                if(data.cod >= 300)
                    return { success: false, payload: data.message };
                return { success: true, payload: data }
            }
            catch (error) {
                return responseFailed;
            }
        }
        catch (error) {
            return { success: false, payload: error }
        }
    }

    getWeatherByName(cityName) {
        const requestURL = apiLink +  'q=' + encodeURI(cityName) + '&appid=' + apiKey;
        //console.log(requestURL);

        return this.getWeather(requestURL);
    }

    getWeatherByID(cityID) {
        //console.log(cityID);
        const requestURL = apiLink + 'id=' + encodeURI(cityID) + '&appid=' + apiKey;
        return this.getWeather(requestURL);
    }

    getWeatherByCoords(latitude, longitude) {
        const requestURL = apiLink + 'lat=' + encodeURI(latitude) + '&lon=' + encodeURI(longitude) + '&appid=' + apiKey;
        return this.getWeather(requestURL);
    }
}
