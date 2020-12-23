const dirRange = 22.5;
const fullCircle = 360;
import { Api } from "./Api.js";
const directions = [
    "северный", "северо-северо-восточный", "северо-восточный", "восточно-северо-восточный",
    "восточный", "восточно-юго-восточный", "юго-восточный", "юго-юго-восточный",
    "южный", "юго-юго-западный", "юго-западный", "западно-юго-западный",
    "западный", "западно-северо-западный", "северо-западный", "северо-северо-западный"];

const api = new Api();
export class Util {

    createCityCardFavorite(weather) {
        let card = document.getElementById('favorite_city_card').content.cloneNode(true);

        card.querySelector('li').setAttribute('data-city_id', weather.id);
        card.querySelector('h3').innerHTML = weather.name;
        card.querySelector('span.temperature').insertAdjacentHTML('afterbegin', weather.main.temp);
        card.querySelector('div.icon-weather').classList.add(`weather_${this.weatherIdToIcon(weather.weather[0].id)}`);
        card.querySelector('input').addEventListener('click', this.deleteCity);
        let item;
        for (item of this.cityInfoItems(weather)) {
            card.querySelector('ul.weather-info').append(item);
        }

        return card;
    }

    getFavoriteLoader() {
        return document.getElementById('loader_favorite').content.cloneNode(true);
    }

    getHereLoader() {
        return document.getElementById('loader_here').content.cloneNode(true);
    }

    degreesToDirection(degrees) {
        if(degrees < 0 || degrees > fullCircle) {
            return null;
        }
        let diff;
        for (let dir = 0, i = 0; dir < fullCircle; dir += dirRange, i++) {
            diff = degrees - dir;
            if ((diff >= -0.5 * dirRange && diff < 0.5 * dirRange) ||
                (diff - fullCircle >= -0.5 * dirRange && diff - fullCircle < 0.5 * dirRange)) {
                return directions[i];
            }
        }
    }

    removeFavoriteLoader(message) {
        document.querySelector('ul.favorite').removeChild(document.querySelector('ul.favorite li.loader'));
        alert(message);
    }

    async deleteCity(event) {
        //console.log(event.target);
        let cityCard = event.target.closest('li');
        let cityID = Number(cityCard.getAttribute('data-city_id'));
        //console.log(cityID);
        let response;
        try {
            response = await api.deleteFavoriteCity(cityID);
            if (response.success) {
                cityCard.remove();
            } else {
                alert('Не удалось удалить город');
            }
        } catch (error) {
            alert(error);
        }
    }

    createCityCardHere(weather) {
        let card = document.getElementById('here').content.cloneNode(true);
        let icon = this.weatherIdToIcon(weather.weather[0].id);
        console.log(card);
        card.querySelector('div.city-header h2').innerHTML = weather.name;
        card.querySelector('div.city-header div.icon-weather').classList.add(`weather_${icon}`);
        card.querySelector('div.city-header div.temperature').insertAdjacentHTML('afterbegin', weather.main.temp);
        let item;
        for (item of this.cityInfoItems(weather)) {
            card.querySelector('ul.weather-info').append(item);
        }

        return card;
    }

    cityInfoItems(weather) {
        let items = [];
        let direction = this.degreesToDirection(weather.wind.deg);
        let params = [
            {name: 'Ветер', value: `${weather.wind.speed} м/с, ${direction}`},
            {name: 'Облачность', value: `${weather.clouds.all} %`},
            {name: 'Давление', value: `${weather.main.pressure} гПа`},
            {name: 'Влажность', value: `${weather.main.humidity} %`},
            {name: 'Координаты', value: `[${weather.coord.lon}, ${weather.coord.lat}]`}];

        for (const param of params) {
            let infoItem = document.getElementById('weather-info').content.cloneNode(true);
            infoItem.querySelector('span.weather-info__string-name').innerHTML = param.name;
            infoItem.querySelector('span.weather-info__string-value').innerHTML = param.value;
            items.push(infoItem);
        }
        return items;
    }

    weatherIdToIcon(weatherID) {
        if(weatherID === 800)
            return 'sunny';
        if(weatherID === 801)
            return 'light_clouds';
        if(weatherID === 802)
            return 'clouds';
        if(weatherID === 803 || weatherID === 804)
            return 'heavy_clouds';
        if((weatherID >= 300 && weatherID <= 399) || (weatherID >= 520 && weatherID <= 531))
            return 'light_rain';
        if(weatherID >= 500 && weatherID <= 504)
            return 'rain';
        if(weatherID >= 200 && weatherID <= 299)
            return 'thunder';
        if((weatherID >= 600 && weatherID <= 699) || weatherID === 511)
            return 'snow';
        if(weatherID >= 700 && weatherID <= 799)
            return 'mist';
        return 'unknown';
    }
}
