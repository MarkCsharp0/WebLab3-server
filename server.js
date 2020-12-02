const express = require('express');
const fetch = require('node-fetch');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const session = require('express-session');
const app = express();

const apiKey = "fa80dfd43dd64fe4ef5aaa1ab1bce741";
const apiLink = 'https://api.openweathermap.org/data/2.5/weather?units=metric&lang=ru&';
const clientLink = "http://localhost:63342";

const Datastore = require('nedb');
const database = new Datastore({ filename: '.data/database', autoload: true });

const corsOptions = {
    origin: clientLink,
    credentials: true,
    methods: 'GET, POST, DELETE, OPTIONS',
    headers: 'Origin, X-Requested-With, Content-Type, Accept'
};

const cookieOptions = {
    maxAge: 1000 * 60 * 60 * 24 * 30,
};

const responseFailed = {
    success: false,
    payload: "Не получилось получить информацию с сервера"
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
app.listen(3000);

app.get('/weather/city', cors(corsOptions), async (request, response) => {
    const weatherResponse = await getWeatherByName(request.query.q);
    
    response.json(weatherResponse);
});

app.get('/weather/coordinates', cors(corsOptions), async (request, response) => {
    const weatherResponse = await getWeatherByCoords(request.query.lat, request.query.lon);

    response.json(weatherResponse);
});

app.get('/weather/:id', cors(corsOptions), async (request, response) => {
    const weatherResponse = await getWeatherByID(request.params.id);

    response.json(weatherResponse);
});

app.get('/favourites', cors(corsOptions), (request, response) => {
    let userKey = request.cookies.userKey;
    if(typeof(userKey) == 'undefined') {
        userKey = request.session.id;
    }
    console.log(request.cookies);
    database.find({ userToken: userKey }, function(error, docs) {
        if (error != null) {
            response.json({ success: false, payload: error });
        }
        else if (docs.length === 0) {
            response.json({ success: true, payload: []});
        }
        else {
            response.cookie('userKey', userKey, cookieOptions);
            response.json({ success: true, payload: docs[0].cities });
        }
    })
});

app.post('/favourites/:city', cors(corsOptions), async (request, response) => {
    const weatherResponse = await getWeatherByName(request.params.city);
    console.log(weatherResponse);
    let userKey = request.cookies.userKey;
    if(typeof(userKey) == 'undefined') {
        userKey = request.session.id;
    }

    if(weatherResponse.success) {   
        database.find({ userToken: userKey, cities: { $elemMatch: weatherResponse.payload.id } }, function(error, docs) {
            if (error != null) {
                response.json({ success: false, payload: error });
            }
            else if(docs.length !== 0) {
                response.cookie('userKey', userKey, cookieOptions).json({ success: true, duplicate: true })
            } 
            else {
                database.update({ userToken: userKey }, { $addToSet: { cities: weatherResponse.payload.id } }, { upsert: true }, function() {
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
    console.log(request.session);

    if(!Number.isInteger(id)) {
        response.json({ success: false, payload: 'Incorrect query' });
    }
    else {
        database.find({ userToken: userKey, cities: { $elemMatch : id } }, function(error, docs) {
            if(error != null) {
                response.json({ success: false, payload: error });
            }
            else if(docs.length === 0) {
                response.json({ success: false, payload: 'City id is not in the list' });
            }
            else {
                database.update({ userToken: userKey }, { $pull: { cities: id} }, function(error) {
                    if(error != null) {
                        response.json({ success: false, payload: error });
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

async function getWeather(url) {
    try {
        const response = await fetch(url);
        try {
            const data = await response.json();
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

function getWeatherByName(cityName) {
    const requestURL = apiLink + 'q=' + encodeURI(cityName) + '&appid=' + apiKey;
    return getWeather(requestURL);
}

function getWeatherByID(cityID) {
    const requestURL = apiLink + 'id=' + encodeURI(cityID) + '&appid=' + apiKey;
    return getWeather(requestURL);
}

function getWeatherByCoords(latitude, longitude) {
    const requestURL = apiLink + 'lat=' + encodeURI(latitude) + '&lon=' + encodeURI(longitude) + '&appid=' + apiKey;
    return getWeather(requestURL);
}
