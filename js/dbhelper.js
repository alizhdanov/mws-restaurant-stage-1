/**
 * Common database helper functions.
 */

const storeName = 'restaraunts-store';
const storeVersion = 1;
const objectStoreName = 'api';

const dbPromise = idb.open(storeName, storeVersion, upgradeDB => {
  upgradeDB.createObjectStore(objectStoreName);
});

const idbRestaraunts = {
  get(key) {
    return dbPromise.then(db => {
      return db
        .transaction(objectStoreName)
        .objectStore(objectStoreName)
        .get(key);
    });
  },
  set(key, val) {
    return dbPromise.then(db => {
      const tx = db.transaction(objectStoreName, 'readwrite');
      tx.objectStore(objectStoreName).put(val, key);
      return tx.complete;
    });
  },
};

const Store = new Map();

class DBHelper {
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    // const port = 8000 // Change this to your server port
    // return `${window.location.origin}/data/restaurants.json`;

    return `http://localhost:1337/restaurants`;
  }

  static getData(query) {
    if (Store.has(query)) {
      return Promise.resolve(Store.get(query));
    } else {
      const promise = fetch(query)
        .then(res => {
          if (!res.ok) {
            throw Error(response.statusText);
          }
          return res.json();
        })
        .catch(err => idbRestaraunts.get(query));

      Store.set(query, promise);

      return promise.then(res => {
        Store.set(query, res);
        console.log(res);
        idbRestaraunts.set(query, res); // todo try to fix it
        return res;
      });
    }
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(params) {
    let query = this.DATABASE_URL;
    if (params && Object.keys(params).length) {
      query += '?';
      const paramsArray = [];
      for (let key in params) {
        paramsArray.push(`${key}=${params[key]}`);
      }

      query += paramsArray.join('&');
    }

    return this.getData(query);
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    return this.getData(`${this.DATABASE_URL}/${id}`)
      .then(restaurant => callback(null, restaurant))
      .catch(err => callback('Restaurant does not exist', null));
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    this.fetchRestaurants({ cousine_type: cuisine })
      .then(restaurants => callback(null, restaurants))
      .catch(err => callback(err, null));
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    this.fetchRestaurants({ neighborhood })
      .then(restaurants => callback(null, restaurants))
      .catch(err => callback(err, null));
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(
    cuisine,
    neighborhood,
    callback
  ) {
    // Fetch all restaurants
    const params = {};

    if (cuisine !== 'all') {
      // filter by cuisine
      params.cuisine_type = cuisine;
    }

    if (neighborhood !== 'all') {
      // filter by neighborhood
      params.neighborhood = neighborhood;
    }

    this.fetchRestaurants(params)
      .then(restaurants => callback(null, restaurants))
      .catch(err => callback(err, null));
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // // Fetch all restaurants
    this.fetchRestaurants().then(restaurants => {
      // Get all neighborhoods from all restaurants
      const neighborhoods = restaurants.map(v => v.neighborhood);
      // Remove duplicates from neighborhoods
      const uniqueNeighborhoods = neighborhoods.filter(
        (v, i) => neighborhoods.indexOf(v) === i
      );
      callback(null, uniqueNeighborhoods);
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    this.fetchRestaurants().then(restaurants => {
      // Get all cuisines from all restaurants
      const cuisines = restaurants.map(v => v.cuisine_type);
      // Remove duplicates from cuisines
      const uniqueCuisines = cuisines.filter(
        (v, i) => cuisines.indexOf(v) === i
      );
      callback(null, uniqueCuisines);
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return `/restaurant.html?id=${restaurant.id}`;
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return restaurant.photograph
      ? `/img/${restaurant.photograph}.jpg`
      : '/img/no-image.jpg';
  }

  /**
   * Restaurant image alt text.
   */
  static imageAltTextForRestaurant(restaurant) {
    return `${restaurant.name}'s thumbnails`;
  }
  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP,
    });
    return marker;
  }
}
