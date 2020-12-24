import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import session from 'express-session';
import {fetchFunctions} from './fetchFunctions.js';
export const app = express();
const f = new fetchFunctions();
const clientLink = "http://localhost:63342";

import Db from './db.js';
import Datastore from 'nedb';
Db.prototype.database = new Datastore({ filename: 'db/weather', autoload: true });

const corsOptions = {
    origin: clientLink,
    credentials: true,
    methods: 'GET, POST, DELETE, OPTIONS',
    headers: 'Origin, X-Requested-With, Content-Type, Accept'
};

const cookieOptions = {
    maxAge: 1000 * 60 * 60 * 24 * 30,
};

const cityNotFound = {
    success: false,
    payload: "Информация о введенном городе не найдена"
};

app.use(express.json());
app.options(cors(corsOptions));
app.use(function (request, response, next) {
    response.header('Access-Control-Allow-Origin', clientLink);
    response.header('Access-Control-Allow-Credentials', true);
    response.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
    if (request.method === 'OPTIONS') {
        response.send(200);
    }
    else {
        next();
    }
});
const sess = {
    secret: 'weather',
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 90,
        secure: false
    }
};
app.use(cookieParser());
app.use(session(sess));

app.get('/weather/city', cors(corsOptions), async (request, response) => {
    const cityName = request.query.q;
    if (cityName == null) {
        response.status(500).json({
            success: false,
            payload: "Не получилось получить информацию с сервера"
        });
    } else {
        const weatherResponse = await f.getWeatherByName(cityName);
        response.json(weatherResponse);
    }
});

app.get('/weather/coordinates', cors(corsOptions), async (request, response) => {
    const weatherResponse = await f.getWeatherByCoords(request.query.lat, request.query.lon);

    response.json(weatherResponse);
});

app.get('/weather/:id', cors(corsOptions), async (request, response) => {
    const weatherResponse = await f.getWeatherByID(request.params.id);
    if (weatherResponse.payload === 'city not found') {
        response.status(404).json(weatherResponse);
    } else {
        response.status(200).json(weatherResponse);
    }
});

app.get('/favourites', cors(corsOptions), (request, response) => {
    let userKey = request.cookies.userKey;
    if(typeof(userKey) == 'undefined') {
        userKey = request.session.id;
    }
    Db.prototype.database.find({ userToken: userKey }, function(error, docs) {
        if (error != null) {
            response.status(500).json({ success: false, payload: error });
        }
        else if (docs.length === 0) {
            response.status(404).json({ success: true, payload: []});
        }
        else {
            response.cookie('userKey', userKey, cookieOptions);
            console.log(docs[0].cities);
            response.status(200).json({ success: true, payload: docs[0].cities });
        }
    })
});

app.post('/favourites/:city', cors(corsOptions), async (request, response) => {
    let cityName = request.params.city;
    if (cityName == null) {
        response.status(500).json({
            success: false,
            payload: "Не получилось получить информацию с сервера"
        });
        return;
    }
    const weatherResponse = await f.getWeatherByName(cityName);
    let userKey = request.cookies.userKey;
    if(typeof(userKey) == 'undefined') {
        userKey = request.session.id;
    }
    //console.log(db.database.getAllData());

    if(weatherResponse.success) {
        Db.prototype.database.find({ userToken: userKey, cities: { $elemMatch: weatherResponse.payload.id } }, function(error, docs) {
            if (error != null) {
                response.json({ success: false, payload: error });
            }
            else if(docs.length !== 0) {
                response.cookie('userKey', userKey, cookieOptions).json({ success: true, duplicate: true })
            } 
            else {
                Db.prototype.database.update({ userToken: userKey }, { $addToSet: { cities: weatherResponse.payload.id } }, { upsert: true }, function() {
                    if (error != null) {
                        response.json({ success: false, payload: error });
                    } 
                    else {
                        response.cookie('userKey', userKey, cookieOptions);
                        response.json(weatherResponse);
                    }
                })
            }
        })
    }
    else {
        response.status(404).json(cityNotFound);
    }
});

app.delete('/favourites/:id', cors(corsOptions), (request, response) => {
    const id = Number(request.params.id);
    let userKey = request.cookies.userKey;
    if(typeof(userKey) == 'undefined') {
        userKey = request.session.id;
    }
    if(!Number.isInteger(id)) {
        response.status(500).json({ success: false, payload: 'Incorrect query' });
    }
    else {
        Db.prototype.database.find({ userToken: userKey, cities: { $elemMatch : id } }, function(error, docs) {
            if(error != null) {
                response.status(500).json({ success: false, payload: error });
            }
            else if(docs.length === 0) {
                console.log('Not found');
                response.status(404).json({ success: false, payload: 'City id is not in the list' });
            }
            else {
                Db.prototype.database.update({ userToken: userKey }, { $pull: { cities: id} }, function(error) {
                    if(error != null) {
                        response.status(500).json({ success: false, payload: error });
                    } 
                    else {
                        response.cookie('userKey', userKey, cookieOptions);
                        response.json({ success: true });
                    }
                })
            }
        }) 
    }
});
