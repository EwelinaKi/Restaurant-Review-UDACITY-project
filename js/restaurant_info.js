let restaurant;
let newMap;

// Initialize map as soon as the page is loaded.

document.addEventListener('DOMContentLoaded', (event) => {
  initMap();
});

// Initialize leaflet map

initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {      
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer("https://api.mapbox.com/styles/v1/ewelinaki/cjjgxvo60b69f2rqbuiy11fng/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZXdlbGluYWtpIiwiYSI6ImNqajlzaHl5ZzMwYXkzcXFnOHBtODZjcDEifQ.ByUI3DY2PYsPmmSFIGnzkA", {
        maxZoom: 18,
        // id: 'mapbox.streets'
      }).addTo(self.newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
};


// Get current restaurant from page URL.

fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant);
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL';
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
};

// Create restaurant HTML and add it to the webpage

fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;
  name.setAttribute("aria-label", `Restaurant ${restaurant.name} cousine type ${restaurant.cuisine_type}`);


    const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;
  address.setAttribute("aria-label", `Address ${restaurant.address}`);



    const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
};

// Create restaurant operating hours HTML table and add it to the webpage.

fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');
    row.setAttribute("tabindex", `5`);
    row.setAttribute("aria-label", `${key} ${operatingHours[key]}`);

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
};

//Create all reviews HTML and add them to the webpage.

fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    noReviews.setAttribute("aria-label", "No reviews yet.");
    noReviews.setAttribute("tabindex", "7");
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
};

// Create review HTML and add it to the webpage.

createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  name.className = "name";
  li.appendChild(name);



  const rating = document.createElement('p');
  rating.innerHTML = "&#9733".repeat(review.rating);
  rating.className = "rating";
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  comments.className = "comment";
  li.appendChild(comments);


  const date = document.createElement('p');
  date.innerHTML = review.date;
  date.className = "date";
  li.appendChild(date);

  li.setAttribute("aria-label", `${review.name} has rated ${review.rating} stars. Review: ${review.comments}`);
  li.setAttribute("tabindex", "7");




    return li;
};

// Add restaurant name to the breadcrumb navigation menu

fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
};

// Get a parameter by name from page URL.

getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
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
