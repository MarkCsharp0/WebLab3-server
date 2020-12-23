import Datastore from 'nedb';

export default class Db {
    database = new Datastore({ filename: 'db/weather', autoload: true });
}
