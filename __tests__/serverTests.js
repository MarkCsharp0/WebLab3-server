import supertest from 'supertest';
import {jest} from '@jest/globals';

const apiKey = "fa80dfd43dd64fe4ef5aaa1ab1bce741";
const apiLink = 'https://api.openweathermap.org/data/2.5/weather?units=metric&lang=ru&';
const url = 'https://api.openweathermap.org/data/2.5/weather?units=metric&lang=ru&q=%D0%A1%D0%B0%D0%BD%D0%BA%D1%82-%D0%9F%D0%B5%D1%82%D0%B5%D1%80%D0%B1%D1%83%D1%80%D0%B3&appid=fa80dfd43dd64fe4ef5aaa1ab1bce741';
const testId = 498817;
const testName = 'Санкт-Петербург';
const testLatitude = 30.26;
const testLongitude = 59.89;
const badUrl = "badurl";
import {fetchFunctions} from '../server/fetchFunctions';

const f = new fetchFunctions();
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
import fetchMock from "jest-fetch-mock";
fetchMock.enableMocks();
import fetch from 'node-fetch';

import Db from '../server/db.js';
import Datastore from 'nedb';
Db.prototype.database = new Datastore({ filename: 'dbtest/weather', autoload: true });
let database = Db.prototype.database;
import { app } from '../server/server.js';
const request = supertest(app);
const getWeatherByCoords = fetchFunctions.prototype.getWeatherByCoords;
const getWeatherByID = fetchFunctions.prototype.getWeatherByID;
const getWeatherByName = fetchFunctions.prototype.getWeatherByName;
const getWeather = fetchFunctions.prototype.getWeather;
let mockGetWeather = jest.fn((url) => {
    return {success: true, payload: fakeObject}
});
beforeAll(() => {
    database.update({ userToken: "1" }, { $addToSet: { cities: 498817 } }, { upsert: true }, function(error) {
    });
    database.update({ userToken: "2" }, { $addToSet: { cities: 498817 } }, { upsert: true }, function(error) {
    });
});

afterAll(() => {
    database.remove({}, { multi: true }, function (err, numRemoved) {
    });
});

beforeEach(() => {
    fetch.resetMocks();
    mockGetWeather.mockClear();
    fetchFunctions.prototype.getWeather = getWeather;
    fetchFunctions.prototype.getWeatherByID = getWeatherByID;
    fetchFunctions.prototype.getWeatherByCoords = getWeatherByCoords;
    fetchFunctions.prototype.getWeatherByName = getWeatherByName;
});

test('test getWeather function for Spb', async () => {
    fetch.mockResponse(JSON.stringify(fakeObject ));
    const ans = await f.getWeather(url);
    expect(ans.payload).toStrictEqual(fakeObject);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(url);
});

test('test delete a favourite city not from the database', async () => {
    const response = await request.delete(`/favourites/${testId}`);
    //console.log(response);
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.payload).toBe('City id is not in the list');
});

test('test delete a favourite city with uncorrect id', async () => {
    const response = await request.delete(`/favourites/abc`);
    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.payload).toBe('Incorrect query');
});

test('test delete favourite endpoint with correct id', async () => {
    const response = await request.delete(`/favourites/498817`).set('Cookie', ['userKey=2']);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
});

test('test post favorites endpoint ', async () => {
    fetchFunctions.prototype.getWeatherByName = mockGetWeather;
    const response = await request.post("/favourites/%D0%A1%D0%B0%D0%BD%D0%BA%D1%82-%D0%9F%D0%B5%D1%82%D0%B5%D1%80%D0%B1%D1%83%D1%80%D0%B3");
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.payload).toStrictEqual(fakeObject);
});

test('test post favorites endpoint with unknownCity', async () => {
    const mockGetWeatherForUnknownCity = jest.fn((name) => {
        return { success: false, payload: "Информация о введенном городе не найдена" }
    });
    fetchFunctions.prototype.getWeatherByName = mockGetWeatherForUnknownCity;
    const response = await request.post("/favourites/a");
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.payload).toBe("Информация о введенном городе не найдена");
    expect(mockGetWeatherForUnknownCity.mock.calls.length).toBe(1);
    expect(mockGetWeatherForUnknownCity.mock.calls[0][0]).toBe("a");
});

test('test getWeather function with uncorrect url', async () => {
    fetch.mockAbort();
    const ans = await f.getWeather(badUrl);
    console.log(ans);
    expect(ans.success).toBe(false);
});

test('test get favorites', () => {
    request.get('/favourites').
    expect('Content-Type', /json/).expect(200);
});

test('test get favorites for new user', async () => {
    const response = await request.get("/favourites");
    expect(response.status).toBe(404);
    expect(response.body.payload).toStrictEqual([]);
});

test('test get favorites for old user', async () => {
    const response = await request.get("/favourites").set('Cookie', ['userKey=1']);
    //console.log(response.body);
    expect(response.status).toBe(200);
    expect(response.body.payload).toStrictEqual([498817]);
});

test('test get endpoint by Spb name', async () => {
    fetchFunctions.prototype.getWeatherByName = mockGetWeather;
    const response = await request.get('/weather/city?q=%D0%A1%D0%B0%D0%BD%D0%BA%D1%82-%D0%9F%D0%B5%D1%82%D0%B5%D1%80%D0%B1%D1%83%D1%80%D0%B3');
    expect(response.status).toBe(200);
    expect(response.body.payload.name).toBe('Санкт-Петербург');
    expect(response.body.payload.id).toBe(testId);
    expect(mockGetWeather.mock.calls[0][0]).toBe('Санкт-Петербург');
    expect(mockGetWeather.mock.calls.length).toBe(1);
});

test('test get endpoint without query', async () => {
    //fetchFunctions.prototype.getWeatherByName = mockGetWeather;
    const response = await request.get('/weather/city');
    expect(response.status).toBe(500);
    expect(response.body.payload).toBe("Не получилось получить информацию с сервера");
    expect(response.body.success).toBe(false);
    expect(mockGetWeather.mock.calls.length).toBe(0);
});

test('test get weather endpoint by Spb id(498817)', async () => {
    fetchFunctions.prototype.getWeatherByID = mockGetWeather;
    const response = await request.get('/weather/498817');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.payload.name).toBe('Санкт-Петербург');
});

test('test get weather endpoint by unknown id', async () => {
    let mockGetWeatherById = jest.fn((url) => {
        return {success: false, payload: 'city not found'}
    });
    fetchFunctions.prototype.getWeatherByID = mockGetWeatherById;
    const response = await request.get('/weather/498816');
    expect(response.status).toBe(404);
    expect(response.body.payload).toBe('city not found');
});

test('test getWeatherByName function', () => {
    fetchFunctions.prototype.getWeather = mockGetWeather;
    const ans = f.getWeatherByName(testName);
    console.log(ans);
    expect(ans).toStrictEqual({success: true, payload: fakeObject});
    expect(mockGetWeather.mock.calls[0][0]).toBe(url);
});

test('test getWeatherByID function', () => {
    fetchFunctions.prototype.getWeather = mockGetWeather;
    const ans = f.getWeatherByID(testId);
    // console.log(ans);
    expect(ans).toStrictEqual({success: true, payload: fakeObject});
    expect(mockGetWeather.mock.calls[0][0]).toBe('https://api.openweathermap.org/data/2.5/weather?units=metric&lang=ru&id=498817&appid=fa80dfd43dd64fe4ef5aaa1ab1bce741');
});

test('test getWeatherByCoords function', () => {
    fetchFunctions.prototype.getWeather = mockGetWeather;
    var ans = f.getWeatherByCoords(testLatitude, testLongitude);
    expect(ans).toStrictEqual({success: true, payload: fakeObject});
    expect(mockGetWeather.mock.calls[0][0]).toBe(apiLink + 'lat=' + encodeURI(testLatitude) + '&lon=' + encodeURI(testLongitude) + '&appid=' + apiKey);
});
