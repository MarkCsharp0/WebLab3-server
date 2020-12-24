const testId = 498817;
const testName = 'Санкт-Петербург';
import {jest} from '@jest/globals';

document.documentElement.innerHTML = `<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="style.css">
    <title>Прогноз погоды</title>
</head>
<body>
    <main>
        <div class="weather-header">
            <h1>Погода здесь</h1>
            <input type="button" class="btn btn_update_desktop" value="Обновить геолокацию">
            <input type="button" class="btn btn_update_mobile">
        </div>
        <div class="here">
        <li class="loader loader_here">
            Подождите, данные загружаются <div></div><div></div><div></div>
        </li>
    </div>
        <div class="favorite-header">
            <h2 class="favorite-header__name">Избранное</h2>
            <form class="favorite-header__add-city" name="add_city">
                <input type="input" name="input" class="add-city_input" required="" placeholder="Добавить новый город">
                <input type="submit" name="button" class="btn btn_add" value="+">
            </form>
        </div>
        <ul class="favorite">
        </ul>
    </main>
    <template id="weather-info">
        <li class="weather-info__string">
            <span class="weather-info__string-name"></span>
            <span class="weather-info__string-value"></span>
        </li>
    </template>

    <template id="favorite_city_card">
        <li class="favorite_card">
            <div class="favorite__city-header">
                <h3></h3>
                <span class="temperature">°C</span>
                <div class="icon-weather"></div>
                <input type="button" class="btn btn_delete" value="X">
            </div>
            <ul class="weather-info">
            </ul>
        </li>
    </template>

    <template id="here">
        <div class="city-header">
            <h2></h2>
            <div class="city-header__item icon-weather icon-weather_here"></div>
            <div class="city-header__item temperature temperature_here">°C</div>
        </div>
        <ul class="weather-info">
        </ul>
    </template>

    <template id="loader_here">
        <li class="loader loader_here">
            Подождите, данные загружаются <div></div><div></div><div></div>
        </li>
    </template>

    <template id="loader_favorite">
        <li class="loader">
            Подождите, данные загружаются <div></div><div></div><div></div>
        </li>
    </template>

    <template id="error_here">
        <div class="error">
            Не удалось загрузить информацию.
        </div>
    </template>
    <script type="module" src="./js/index.js"></script>
</body>`;
window.alert = jest.fn();

let mockGetWeather = jest.fn((url) => {
    return {success: true, payload: fakeObject}
});
import { Api } from "../client/js/Api.js";
import { Util } from "../client/js/Util.js";
import { App } from "../client/js/App.js";
import fetchMock from "jest-fetch-mock";
fetchMock.enableMocks();

const getWeatherDefault = Api.prototype.getWeatherDefault;
const getFavoriteWeatherList = Api.prototype.getFavoriteWeatherList;
const getWeather = Api.prototype.getWeather;
const createCityCardFavorite = Util.prototype.createCityCardFavorite;
const createCityCardHere = Util.prototype.createCityCardHere;
const getFavoriteLoader = Util.prototype.getFavoriteLoader;
const fakeObject = {
    "coord": {
        "lon": 30.26,
        "lat": 59.89
    },
    "weather": [
        {
            "id": 600,
            "main": "Snow",
            "description": "небольшой снег",
            "icon": "13n"
        }
    ],
    "base": "stations",
    "main": {
        "temp": -0.23,
        "feels_like": -3.71,
        "temp_min": -0.56,
        "temp_max": 0,
        "pressure": 1014,
        "humidity": 97
    },
    "visibility": 10000,
    "wind": {
        "speed": 2,
        "deg": 180
    },
    "snow": {
        "1h": 0.24
    },
    "clouds": {
        "all": 90
    },
    "dt": 1608101141,
    "sys": {
        "type": 1,
        "id": 8926,
        "country": "RU",
        "sunrise": 1608101787,
        "sunset": 1608123185
    },
    "timezone": 10800,
    "id": 498817,
    "name": "Санкт-Петербург",
    "cod": 200
};
const api = new Api();
const app = new App();
const util = new Util();

beforeEach(() => {
    fetch.resetMocks();
    mockGetWeather.mockClear();
    Api.prototype.getWeatherDefault = getWeatherDefault;
    Api.prototype.getFavoriteWeatherList = getFavoriteWeatherList;
    Api.prototype.getWeather = getWeather;
    Util.prototype.getFavoriteLoader = getFavoriteLoader;
    Util.prototype.createCityCardFavorite = createCityCardFavorite;
    Util.prototype.createCityCardHere = createCityCardHere;
});

test('test getDefaultWeather function', async () => {
    Api.prototype.getWeather = mockGetWeather;
    const ans = api.getWeatherDefault();
    expect(ans).toStrictEqual({success: true, payload: fakeObject});
    expect(mockGetWeather.mock.calls[0][0]).toBe('http://localhost:3000/weather/' + testId.toString());
});

test('test addFavoriteCity function', async () => {
    Api.prototype.getWeather = mockGetWeather;
    const ans = api.addFavoriteCity(testName);
    expect(ans).toStrictEqual({success: true, payload: fakeObject});
    expect(mockGetWeather.mock.calls[0][0]).toBe('http://localhost:3000/favourites/' + encodeURI(testName));
    expect(mockGetWeather.mock.calls[0][1]).toBe('POST');
});

test('test deleteFavoriteCity function', async () => {
    let mockGet = jest.fn((url) => {
        return {success: true}
    });
    Api.prototype.getWeather = mockGet;
    const ans = api.deleteFavoriteCity(testId);
    expect(ans).toStrictEqual({success: true});
    expect(mockGet.mock.calls[0][0]).toBe('http://localhost:3000/favourites/' + testId.toString());
    expect(mockGet.mock.calls[0][1]).toBe('DELETE');
});

test('test getFavoriteWeatherList function', async () => {
    let mockGetWeather = jest.fn((url) => {
        return {success: true, payload: [498817]}
    });
    Api.prototype.getWeather = mockGetWeather;
    const ans = await api.getFavoriteWeatherList();
    expect(ans).toStrictEqual({success: true, payload: [498817]});
    expect(mockGetWeather.mock.calls[0][0]).toBe('http://localhost:3000/favourites');
    expect(mockGetWeather.mock.calls.length).toBe(1);
});

test('test getWeatherByID function', async () => {
    Api.prototype.getWeather = mockGetWeather;
    const ans = api.getWeatherByID(testId.toString());
    expect(ans).toStrictEqual({success: true, payload: fakeObject});
    expect(mockGetWeather.mock.calls[0][0]).toBe('http://localhost:3000/weather/' + encodeURI(testId.toString()));
});

test('test getWeather function', async () => {
    fetch.mockResponseOnce(JSON.stringify(fakeObject));
    const api = new Api();
    const ans = await api.getWeather('http://localhost:3000/weather/' + encodeURI(testId.toString()), 'GET');
    expect(ans).toStrictEqual(fakeObject);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/weather/' + encodeURI(testId.toString()), { method: 'GET', credentials: 'include'});
});

test('test getWeatherByName function', async () => {
    Api.prototype.getWeather = mockGetWeather;
    const ans = api.getWeatherByName(testName);
    expect(ans).toStrictEqual({success: true, payload: fakeObject});
    expect(mockGetWeather.mock.calls[0][0]).toBe('http://localhost:3000/weather/city?q=' + encodeURI(testName));
});

test('test degreesToDirection function - degree more than 360', () => {
    const ans = util.degreesToDirection(365);
    expect(ans).toBe(null);
});

test('test degreesToDirection function - degree less than zero', () => {
    const ans = util.degreesToDirection(-5);
    expect(ans).toBe(null);
});

test('test degreesToDirection function - north direction', () => {
    const ans = util.degreesToDirection(0);
    expect(ans).toBe("северный");
});

test('test degreesToDirection function - east direction', () => {
    const ans = util.degreesToDirection(90);
    expect(ans).toBe("восточный");
});

test('test degreesToDirection function - south direction', () => {
    const ans = util.degreesToDirection(180);
    expect(ans).toBe("южный");
});

test('test degreesToDirection function - west direction', () => {
    const ans = util.degreesToDirection(270);
    expect(ans).toBe("западный");
});

test('test deleteCity function', async () => {
    let mockF = jest.fn((url) => {
        return {success: true}
    });
    const util = new Util();
    const element = document.createElement("li");
    element.innerHTML = "<li class=\"favorite_card\" data-city_id='498817'>\n" +
        "        <div class='favorite__city-header'>\n" +
        "            <h3></h3>\n" +
        "            <span class='temperature'>°C</span>\n" +
        "            <div class='icon-weather'></div>\n" +
        "            <input type='button' class='btn btn_delete' value='X'>\n" +
        "        </div>\n" +
        "        <ul class='weather-info'>\n" +
        "        </ul>\n" +
        "    </li>";
    const event = {
        target: {
            element: element,
            closest: function (tag) {
                return this.element;
            }
        }
    };
    Api.prototype.deleteFavoriteCity = mockF;
    await util.deleteCity(event);
    expect(mockF.mock.calls.length).toBe(1);
});


test('test addCity function', async () => {
    let mockAddCity = jest.fn((message) => {
        return {success: true, payload: fakeObject}
    });
    let mockGetFavoriteLoader = jest.fn();
    let mockRemoveLoader = jest.fn();
    let mockCreateCityCardFavorite = jest.fn((message) => {
        return document.getElementById('here').content.cloneNode(true);
    });
    let fakePreventDefault = jest.fn();
    const event = {
        preventDefault: fakePreventDefault,
        target: {
            input: {
                value: testName
            }
        }
    };
    Api.prototype.addFavoriteCity = mockAddCity;
    Util.prototype.removeFavoriteLoader = mockRemoveLoader;
    Util.prototype.createCityCardFavorite = mockCreateCityCardFavorite;
    Util.prototype.getFavoriteLoader = mockGetFavoriteLoader;
    await app.addCity(event);
    expect(mockAddCity.mock.calls[0][0]).toBe(testName);
    expect(mockCreateCityCardFavorite.mock.calls[0][0]).toStrictEqual(fakeObject);
    expect(fakePreventDefault.mock.calls.length).toBe(1);
    expect(event.target.input.value).toBe('');
});

test('test loadHereDefault function', async () => {
    let mockGetWeatherDefault = jest.fn((message) => {
        return {success: true, payload: fakeObject}
    });
    let mockCreateCityCardHere = jest.fn((message) => {
        return "";
    });
    Api.prototype.getWeatherDefault = mockGetWeatherDefault;
    Util.prototype.createCityCardHere = mockCreateCityCardHere;
    await app.loadHereDefault();
    expect(mockGetWeatherDefault.mock.calls.length).toBe(1);
    expect(mockCreateCityCardHere.mock.calls.length).toBe(1);
    expect(mockCreateCityCardHere.mock.calls[0][0]).toStrictEqual(fakeObject);
});

test('test loadHere function', async () => {
    let mockGetWeatherDefault = jest.fn((message) => {
        return {success: true, payload: fakeObject}
    });
    let mockCreateCityCardHere = jest.fn((message) => {
        return "";
    });
    Api.prototype.getWeatherDefault = mockGetWeatherDefault;
    Util.prototype.createCityCardHere = mockCreateCityCardHere;
    await app.loadHere();
    expect(mockGetWeatherDefault.mock.calls.length).toBe(1);
    expect(mockCreateCityCardHere.mock.calls.length).toBe(1);
    expect(mockCreateCityCardHere.mock.calls[0][0]).toStrictEqual(fakeObject);
});

test('test cityInfoItems function', () => {
    let mockDegreesToDirection = jest.fn(() => {return "южный"});
    Util.prototype.degreesToDirection = mockDegreesToDirection;
    const ans = util.cityInfoItems(fakeObject);
    expect(ans.length).toBe(5);
    expect(mockDegreesToDirection.mock.calls.length).toBe(1);
    expect(mockDegreesToDirection.mock.calls[0][0]).toBe(fakeObject.wind.deg);
    expect(ans[0].querySelector('span.weather-info__string-name').innerHTML).toBe("Ветер");
    expect(ans[1].querySelector('span.weather-info__string-name').innerHTML).toBe("Облачность");
    expect(ans[2].querySelector('span.weather-info__string-name').innerHTML).toBe("Давление");
    expect(ans[3].querySelector('span.weather-info__string-name').innerHTML).toBe("Влажность");
    expect(ans[4].querySelector('span.weather-info__string-name').innerHTML).toBe("Координаты");
    expect(ans[0].querySelector('span.weather-info__string-value').innerHTML).toBe(`${fakeObject.wind.speed} м/с, южный`);
    expect(ans[1].querySelector('span.weather-info__string-value').innerHTML).toBe(`${fakeObject.clouds.all} %`);
    expect(ans[2].querySelector('span.weather-info__string-value').innerHTML).toBe(`${fakeObject.main.pressure} гПа`);
    expect(ans[3].querySelector('span.weather-info__string-value').innerHTML).toBe(`${fakeObject.main.humidity} %`);
    expect(ans[4].querySelector('span.weather-info__string-value').innerHTML).toBe(`[${fakeObject.coord.lon}, ${fakeObject.coord.lat}]`);
});

test('test getFavoriteLoader function', () => {
    const ans = util.getFavoriteLoader();
    expect(ans.querySelector("li").outerHTML).toBe("<li class=\"loader\">\n" +
        "            Подождите, данные загружаются <div></div><div></div><div></div>\n" +
        "        </li>");
});

test('test getHereLoader function', () => {
    const ans = util.getHereLoader();
    expect(ans.querySelector("li").outerHTML).toBe("<li class=\"loader loader_here\">\n" +
        "            Подождите, данные загружаются <div></div><div></div><div></div>\n" +
        "        </li>");
});

test('test weatherIdToIcon function', () => {
    const ans = util.weatherIdToIcon(fakeObject.weather[0].id);
    expect(ans).toBe("snow");
});

test('test createCityCardHere function', () => {
    const ans = util.createCityCardHere(fakeObject);
    expect(ans.querySelector("div").outerHTML).toBe("<div class=\"city-header\">\n" +
        "            <h2>Санкт-Петербург</h2>\n" +
        "            <div class=\"city-header__item icon-weather icon-weather_here weather_snow\"></div>\n" +
        "            <div class=\"city-header__item temperature temperature_here\">-0.23°C</div>\n" +
        "        </div>");
});

test('test createCityCardFavorite function', () => {
    const ans = util.createCityCardFavorite(fakeObject);
    expect(ans.querySelector("div").outerHTML).toBe("<div class=\"favorite__city-header\">\n" +
        "                <h3>Санкт-Петербург</h3>\n" +
        "                <span class=\"temperature\">-0.23°C</span>\n" +
        "                <div class=\"icon-weather weather_snow\"></div>\n" +
        "                <input type=\"button\" class=\"btn btn_delete\" value=\"X\">\n" +
        "            </div>");
});

test('test start function', async () => {
    let mockLoadHere = jest.fn((message) => {
        return null;
    });
    let mockLoadFavorite = jest.fn((message) => {
        return null;
    });
    App.prototype.loadHere = mockLoadHere;
    App.prototype.loadFavorites = mockLoadFavorite;
    await app.start();
    expect(mockLoadHere.mock.calls.length).toBe(1);
    expect(mockLoadFavorite.mock.calls.length).toBe(1);
});

test('test loadHereByCoords function', async () => {
    let mockCreateCityCardHere = jest.fn((message) => {
        return null;
    });
    let mockGetByCoords = jest.fn((message) => {
        return {success: true, payload: fakeObject}
    });
    const coords = {
        latitude: fakeObject.coord.lat,
        longitude: fakeObject.coord.lon
    };
    App.prototype.insertHereError = jest.fn;
    Util.prototype.createCityCardHere = mockCreateCityCardHere;
    Api.prototype.getWeatherByCoords = mockGetByCoords;
    await app.loadHereByCoords(coords);
    expect(mockCreateCityCardHere.mock.calls.length).toBe(1);
    expect(mockGetByCoords.mock.calls[0][0]).toBe(fakeObject.coord.lat);
    expect(mockGetByCoords.mock.calls[0][1]).toBe(fakeObject.coord.lon);
});
