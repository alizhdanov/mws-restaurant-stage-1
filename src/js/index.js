import GoogleMapsLoader from 'google-maps';
import registerSW from './registerSW';
import DBHelper from './dbhelper';

GoogleMapsLoader.KEY = 'AIzaSyC0SKLqoNyihvyvXcg1LuusMewXaFNFvJA';

/**
 * RegisterSW
 */
registerSW();

// TODO: globals change to regular constatns? But in this case fix name colisions
const globals = {
    restaurants: undefined,
    neighborhoods: undefined,
    cuisines: undefined,
    googleMaps: undefined,
    map: [],
    markers: [],
};

/**
 * Fetch all neighborhoods and set their HTML.
 */
const fetchNeighborhoods = () => {
    DBHelper.fetchNeighborhoods((error, neighborhoods) => {
        if (error) {
            // Got an error
            console.error(error);
        } else {
            globals.neighborhoods = neighborhoods;
            fillNeighborhoodsHTML();
        }
    });
};

/**
 * Set neighborhoods HTML.
 */
const fillNeighborhoodsHTML = (neighborhoods = globals.neighborhoods) => {
    const select = document.getElementById('neighborhoods-select');
    neighborhoods.forEach(neighborhood => {
        const option = document.createElement('option');
        option.innerHTML = neighborhood;
        option.value = neighborhood;
        select.append(option);
    });
};

/**
 * Fetch all cuisines and set their HTML.
 */
const fetchCuisines = () => {
    DBHelper.fetchCuisines((error, cuisines) => {
        if (error) {
            // Got an error!
            console.error(error);
        } else {
            globals.cuisines = cuisines;
            fillCuisinesHTML();
        }
    });
};

/**
 * Set cuisines HTML.
 */
const fillCuisinesHTML = (cuisines = globals.cuisines) => {
    const select = document.getElementById('cuisines-select');

    cuisines.forEach(cuisine => {
        const option = document.createElement('option');
        option.innerHTML = cuisine;
        option.value = cuisine;
        select.append(option);
    });
};

/**
 * Update page and map for current restaurants.
 */
const updateRestaurants = () => {
    const cSelect = document.getElementById('cuisines-select');
    const nSelect = document.getElementById('neighborhoods-select');

    const cIndex = cSelect.selectedIndex;
    const nIndex = nSelect.selectedIndex;

    const cuisine = cSelect[cIndex].value;
    const neighborhood = nSelect[nIndex].value;

    DBHelper.fetchRestaurantByCuisineAndNeighborhood(
        cuisine,
        neighborhood,
        (error, restaurants) => {
            if (error) {
                // Got an error!
                console.error(error);
            } else {
                resetRestaurants(restaurants);
                fillRestaurantsHTML();
                setTimeout(() => {
                    setLazyLoader();
                }, 1500);
            }
        }
    );
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
const resetRestaurants = restaurants => {
    // Remove all restaurants
    globals.restaurants = [];
    const ul = document.getElementById('restaurants-list');
    ul.innerHTML = '';

    // Remove all map markers
    globals.markers.forEach(m => m.setMap(null));
    globals.markers = [];
    globals.restaurants = restaurants;
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
const fillRestaurantsHTML = (restaurants = globals.restaurants) => {
    const ul = document.getElementById('restaurants-list');
    restaurants.forEach(restaurant => {
        ul.append(createRestaurantHTML(restaurant));
    });
    if (globals.googleMaps) {
        addMarkersToMap();
    }
};

/**
 * Create restaurant HTML.
 */
const createRestaurantHTML = restaurant => {
    const li = document.createElement('li');
    const src = DBHelper.imageUrlForRestaurant(restaurant);
    const lazySrc = src.replace(/jpe?g|png/, 'svg');
    li.innerHTML = `
    <article>
        <a href="${DBHelper.urlForRestaurant(restaurant)}">
          <img 
                class="restaurant-img lazy" 
                src="${lazySrc}" 
                data-src="${src}"
                alt="${DBHelper.imageAltTextForRestaurant(restaurant)}">
        </a>
        <h3>
        <a href="${DBHelper.urlForRestaurant(restaurant)}">
          ${restaurant.name}
        </a>
        </h3>
        <address>
            <p>${restaurant.neighborhood}</p>
            <p>${restaurant.address}</p>
        </address>
        <a href="${DBHelper.urlForRestaurant(
        restaurant
    )}" class="link">View Details</a>
    </article>
  `;

    return li;
};

/**
 * Add markers for current restaurants to the map.
 */
const addMarkersToMap = (restaurants = globals.restaurants) => {
    restaurants.forEach(restaurant => {
        // Add marker to the map
        const marker = DBHelper.mapMarkerForRestaurant(restaurant, globals.map);
        globals.googleMaps.maps.event.addListener(marker, 'click', () => {
            window.location.href = marker.url;
        });
        globals.markers.push(marker);
    });
};

const setLazyLoader = () => {
    const lazyImages = [].slice.call(document.querySelectorAll('img.lazy'));

    if ('IntersectionObserver' in window) {
        const cb = (entries) => {
            entries.forEach(function(entry) {
                if (entry.isIntersecting && entry.intersectionRatio >= 1) {
                    let lazyImage = entry.target;
                    lazyImage.src = lazyImage.dataset.src;
                    lazyImage.classList.remove('lazy');
                    lazyImageObserver.unobserve(lazyImage);
                }
            });
        };

        const opt = {
            rootMargin: '0px',
            threshold: 1.0,
        };

        const lazyImageObserver = new IntersectionObserver(cb,opt);

        lazyImages.forEach(function(lazyImage) {
            lazyImageObserver.observe(lazyImage);
        });
    }
};

/**
 * Initialize Google map, called from HTML.
 */
let loc = {
    lat: 40.722216,
    lng: -73.987501,
};

const loadMap = () => {
    GoogleMapsLoader.load((google) => {
        globals.googleMaps = google;
        globals.map = new google.maps.Map(document.getElementById('map'), {
            zoom: 12,
            center: loc,
            scrollwheel: false,
        });
        updateRestaurants();
    });
};

if (window.innerWidth >= 991) {
    GoogleMapsLoader.load((google) => {
        globals.googleMaps = google;
        globals.map = new google.maps.Map(document.getElementById('map'), {
            zoom: 12,
            center: loc,
            scrollwheel: false,
        });
        updateRestaurants();
    });
} else {
    updateRestaurants();
    document.getElementById('load-map').addEventListener('click', (evt) => {
        evt.preventDefault();

        loadMap();
    })

}

document.getElementById('cuisines-select').addEventListener('change', () => {
    updateRestaurants();
});

document.getElementById('neighborhoods-select').addEventListener('change', () => {
    updateRestaurants();
});


/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', event => {
    fetchNeighborhoods();
    fetchCuisines();
});
