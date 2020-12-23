import { Api } from "./Api.js";
import { Util } from "./Util.js";

const api = new Api();
const util = new Util();

export class App {
    constructor() {

    }

    async start() {
        this.loadHere();
        this.loadFavorites();
        let addCityForm = document.forms.add_city;
        addCityForm.addEventListener('submit', this.addCity);
        document.querySelector('div.weather-header input.btn_update_desktop').addEventListener('click', this.loadHere);
        document.querySelector('div.weather-header input.btn_update_mobile').addEventListener('click', this.loadHere);
    }

async addCity(event) {
    event.preventDefault();
    console.log(event.target);
    console.log(event.target.input);
    let input = event.target.input;
    let cityName = input.value;
    input.value = '';
    let loader = util.getFavoriteLoader();
    let favorite =  document.querySelector('ul.favorite');
    if (favorite != null) {
        favorite.append(loader);
    }
    let weatherRequest;
    try {
        weatherRequest = await api.addFavoriteCity(cityName);
        if (!weatherRequest.success) {
            util.removeFavoriteLoader(weatherRequest.payload);
            return;
        }
        if (weatherRequest.duplicate) {
            util.removeFavoriteLoader('Город уже в списке');
            return;
        }
        let weather = weatherRequest.payload;
        if (favorite != null) {
            favorite.replaceChild(util.createCityCardFavorite(weather), document.querySelector('ul.favorite li.loader'));
        }
    } catch (err) {
        util.removeFavoriteLoader('Не удалось получить информацию');
    }
}

    getCurrentLocation() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition((location) => resolve(location.coords), reject)
        })
    }

async loadHere() {
        //console.log("Start update");
    let loader = util.getHereLoader();
    document.querySelector('.here').innerHTML = "";
    document.querySelector('.here').append(loader);
    //console.log(navigator.geolocation);
    try {
        const coords = await App.prototype.getCurrentLocation();
        await App.prototype.loadHereByCoords(coords);
    } catch(e) {
        console.log(e);
        return App.prototype.loadHereDefault();
    }
}

insertHereError(error) {
        document.querySelector('.here').replaceChild(error, document.querySelector('.here .loader'));
        alert('Не удалось загрузить информацию');
    }

async loadHereByCoords(coords) {
    //this.createCityCardHere(null);
   // console.log(position.coords.latitude);
    //console.log(position.coords.longitude);
    let error = document.getElementById('error_here').content.cloneNode(true);
    let weather;
    let weatherRequest;
    try {
        weatherRequest = await api.getWeatherByCoords(coords.latitude, coords.longitude);
        //console.log(weatherRequest);
        if (!weatherRequest.success) {
            this.insertHereError(error);
        } else {
            weather = weatherRequest.payload;
            document.querySelector('.here').replaceChild(util.createCityCardHere(weather), document.querySelector('.here .loader'));
        }
    } catch (err) {
        this.insertHereError(error);
    }
}


async loadHereDefault() {
       // this.createCityCardHere(null);
    let error = document.getElementById('error_here').content.cloneNode(true);
    let weather;
    let weatherRequest;
    const hereElement = document.querySelector(".here");
    try {
        weatherRequest = await api.getWeatherDefault();
        if (!weatherRequest.success) {
            if (hereElement != null) {
                hereElement.replaceChild(error, document.querySelector('.here .loader'));
            }
            alert('Не удалось загрузить информацию');
        } else {
            weather = weatherRequest.payload;
            let cityCard = util.createCityCardHere(weather);
            if (hereElement != null) {
                hereElement.replaceChild(cityCard, document.querySelector('.here .loader'));
            }
        }
    } catch (err) {
        if (hereElement != null) {
            hereElement.replaceChild(error, document.querySelector('.here .loader'));
        }
        alert('Не удалось загрузить информацию');
    }
}

async loadFavorites() {
    let weatherRequest;
    try {
        let weatherResponse = await api.getFavoriteWeatherList();
        if (!weatherResponse.success) {
            alert('Не удалось получить список избранных городов');
            return;
        }
        let favoriteCities = weatherResponse.payload;
        for (let i = 0; i < favoriteCities.length; i++) {
            let loader = util.getFavoriteLoader();
            document.querySelector('ul.favorite').append(loader);
        }
        let weather;
        for (let cityID of favoriteCities) {
            try {
                weatherRequest = await api.getWeatherByID(cityID);
                if (!weatherRequest.success) {
                    util.removeFavoriteLoader(weatherRequest.payload);
                } else {
                    weather = weatherRequest.payload;
                    let cityCard = util.createCityCardFavorite(weather);
                    document.querySelector('ul.favorite').replaceChild(cityCard, document.querySelector('ul.favorite li.loader'));
                }
            } catch (err) {
                util.removeFavoriteLoader('Не удалось получить информацию');
            }
        }
    } catch (error) {
        alert('Не удалось получить список избранных городов');
    }
}

}
