let restaurants;
let neighborhoods;
let cuisines;
let newMap;
let markers = [];


// Fetch neighborhoods and cuisines as soon as the page is loaded.

document.addEventListener('DOMContentLoaded', (event) => {
    initMap(); // added
    fetchNeighborhoods();
    fetchCuisines();
});

// Fetch all neighborhoods and set their HTML.

fetchNeighborhoods = () => {
    DBHelper.fetchNeighborhoods((error, neighborhoods) => {
        if (error) { // Got an error
            console.error(error);
        } else {
            self.neighborhoods = neighborhoods;
            fillNeighborhoodsHTML();
        }
    });
};

// Set neighborhoods HTML.

fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
    const select = document.getElementById('neighborhoods-select');
    neighborhoods.forEach(neighborhood => {
        const option = document.createElement('option');
        option.innerHTML = neighborhood;
        option.value = neighborhood;
        select.append(option);
    });
};

// Fetch all cuisines and set their HTML.

fetchCuisines = () => {
    DBHelper.fetchCuisines((error, cuisines) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            self.cuisines = cuisines;
            fillCuisinesHTML();
        }
    });
};


// Set cuisines HTML.

fillCuisinesHTML = (cuisines = self.cuisines) => {
    const select = document.getElementById('cuisines-select');

    cuisines.forEach(cuisine => {
        const option = document.createElement('option');
        option.innerHTML = cuisine;
        option.value = cuisine;
        select.append(option);
    });
};

//Initialize leaflet map, called from HTML.

initMap = () => {
    self.newMap = L.map('map', {
        center: [40.709, -73.977185],
        zoom: 12,
        scrollWheelZoom: false,
        style: "mapbox://styles/mapbox/streets-v9"
    });
    L.tileLayer("https://api.mapbox.com/styles/v1/ewelinaki/cjjgxvo60b69f2rqbuiy11fng/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZXdlbGluYWtpIiwiYSI6ImNqajlzaHl5ZzMwYXkzcXFnOHBtODZjcDEifQ.ByUI3DY2PYsPmmSFIGnzkA", {
        maxZoom: 18,
        // id: 'mapbox.streets',
    }).addTo(self.newMap);


    updateRestaurants();

};


// Update page and map for current restaurants.

updateRestaurants = () => {
    const cSelect = document.getElementById('cuisines-select');
    const nSelect = document.getElementById('neighborhoods-select');

    const cIndex = cSelect.selectedIndex;
    const nIndex = nSelect.selectedIndex;

    const cuisine = cSelect[cIndex].value;
    const neighborhood = nSelect[nIndex].value;

    DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            resetRestaurants(restaurants);
            fillRestaurantsHTML();
        }
    });


};


// Clear current restaurants, their HTML and remove their map markers.

resetRestaurants = (restaurants) => {
    // Remove all restaurants
    self.restaurants = [];
    const ul = document.getElementById('restaurants-list');
    ul.innerHTML = '';

    // Remove all map markers
    if (self.markers) {
        self.markers.forEach(marker => marker.remove());
    }
    self.markers = [];
    self.restaurants = restaurants;
};


// Create all restaurants HTML and add them to the webpage.

fillRestaurantsHTML = (restaurants = self.restaurants) => {
    const results = document.getElementById('results');
    results.className = "is-results";
    const ul = document.getElementById('restaurants-list');

    if (restaurants.length === 0) {
        results.className = "no-results";
        results.innerText = `There is no restaurants satisfying your criteria.`;
    } else if (restaurants.length === 1) {
        results.innerText = `There is one restaurant satisfying your criteria.`;
    } else {
        results.innerText = `There are ${restaurants.length} restaurants satisfying your criteria.`;
    }

    restaurants.forEach(restaurant => {
        ul.append(createRestaurantHTML(restaurant));
    });


    addMarkersToMap();
};

// Create restaurant HTML.

createRestaurantHTML = (restaurant) => {
    const li = document.createElement('li');

    const image = document.createElement('img');
    image.className = 'restaurant-img';
    image.src = DBHelper.imageUrlForRestaurant(restaurant);
    image.alt = `Restaurant ${restaurant.name}`;
    li.append(image);

    const div = document.createElement('div');
    div.className = 'restaurant-info';
    li.append(div);

    const divAddress = document.createElement('div');
    divAddress.className = 'restaurant-address';
    div.append(divAddress);


    const name = document.createElement('h1');
    name.innerHTML = restaurant.name;
    divAddress.append(name);

    const neighborhood = document.createElement('p');
    neighborhood.innerHTML = restaurant.neighborhood;
    divAddress.append(neighborhood);

    const address = document.createElement('p');
    address.innerHTML = restaurant.address;
    divAddress.append(address);

    const more = document.createElement('a');
    more.innerHTML = 'View Details';
    more.setAttribute("aria-label", `${restaurant.name} details`);
    more.setAttribute("tabindex", `5`);
    more.href = DBHelper.urlForRestaurant(restaurant);
    div.append(more);

    return li
};

// Add markers for current restaurants to the map.

addMarkersToMap = (restaurants = self.restaurants) => {
    restaurants.forEach(restaurant => {
        // Add marker to the map
        const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
        marker.on("click", onClick);

        function onClick() {
            window.location.href = marker.options.url;
        }

        self.markers.push(marker);
    });

};

// ignore map component with aria

window.onload = function () {
    document.getElementById("map").addEventListener("focus", () => {
        document.getElementById("restaurants-list").focus()
    });
    document.getElementById("footer").addEventListener("focus", () => {
        document.getElementById("title").focus()
    });
};


// Center map view depends on selected neighborhood
const nSelect = document.getElementById('neighborhoods-select');

nSelect.addEventListener("change", () => {

    if (nSelect.value === "Queens") {
        self.newMap.setView(new L.LatLng(40.7410994, -73.9576962), 12);


    } else if (nSelect.value === "Brooklyn") {
        self.newMap.setView(new L.LatLng(40.6887451, -73.9734033), 12);


    } else if (nSelect.value === "Manhattan") {
        self.newMap.setView(new L.LatLng(40.727397, -73.99246), 12);


    } else {
        self.newMap.setView(new L.LatLng(40.709, -73.977185), 12);
    }


});
