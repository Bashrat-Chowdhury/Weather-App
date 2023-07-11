var userFormEl = document.querySelector("#city-name-input");
var cityInputEl = document.querySelector("#city");
var citySearchTerm = document.querySelector("#city-name");
var tempEl = document.querySelector("#temp");
var windEl = document.querySelector("#wind");
var humidityEl = document.querySelector("#humidity");
var dayContainersEl = document.querySelector("#day-containers");
var currentContainerEl = document.querySelector("#currentweather");
var currentDateEl = document.querySelector("#date");
var currentIconEl = document.querySelector("#currentWeatherIcon");
var pastSearchesList = document.querySelector("#pastSearches");

//Function to take user input

var formSubmitHandler = function (event) {
  event.preventDefault();

  clearResults();
  var city = cityInputEl.value.trim();

  // Save the search term to local storage
  saveSearchTerm(city);

  if (city) {
    getLongLat(city);
    return;
  }

  return;
};

var formSubmitHandlerList = function (event) {
  console.log("clicked handler");
  console.log(event);
  clearResults();
  console.log("clicked handler after preventy default");
  var city = event;

  // Save the search term to local storage
  saveSearchTerm(city);

  if (city) {
    getLongLat(city);
    return;
  }

  return;
};

//function to remove past search weather data when a new search is made
function clearResults() {
  // Remove all child elements from the container
  while (dayContainersEl.firstChild) {
    dayContainersEl.removeChild(dayContainersEl.firstChild);
  }
}

//Function to fetch city long-lat
var getLongLat = function (city) {
  var apiUrl =
    "http://api.openweathermap.org/geo/1.0/direct?q=" +
    city +
    "&limit=5&appid=6201ea899f467d1644aea975f74d08f9";

  fetch(apiUrl)
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
          var lat = data[0].lat;
          var lon = data[0].lon;
          getWeather(lat, lon);
        });
      } else {
        alert("Error: " + response.statusText);
      }
    })
    .catch(function (error) {
      alert("Unable to connect to Weather API");
    });
};

//Function to fetch City Weather using lat, lon
var getWeather = function (lat, lon) {
  var apiUrl =
    "https://api.openweathermap.org/data/2.5/forecast?lat=" +
    lat +
    "&lon=" +
    lon +
    "&appid=6201ea899f467d1644aea975f74d08f9";
  fetch(apiUrl)
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
          displayWeather(data);
        });
      } else {
        alert("Error: " + response.statusText);
      }
    })
    .catch(function (error) {
      alert("Unable to connect to Weather API");
    });
};

//Function to display Weather
var displayWeather = function (weather) {
  //displays city from API response
  citySearchTerm.textContent = weather.city.name;
  //displays current date from API response
  currentDateEl.textContent = "  (" + convertTime(weather.list[0].dt) + ")";
  //population weather conditions using API response
  tempEl.textContent = "Temp: " + weather.list[0].main.temp + " K";
  windEl.textContent = "Wind: " + weather.list[0].wind.speed + " meter/sec";
  humidityEl.textContent = "Humidity: " + weather.list[0].main.humidity + " %";

  //creating span for icon
  var currentWeatherIconEl = document.createElement("span");
  //condition for displaying certain icons
  if (weather.list[0].main.temp > 292) {
    currentWeatherIconEl.innerHTML = "<i class='fas fa-sun'></i>";
  } else if (weather.list[0].main.temp <= 292) {
    currentWeatherIconEl.innerHTML = "<i class='fas fa-temperature-down'></i>";
  }

  currentIconEl.appendChild(currentWeatherIconEl);

  //for-loop to create individual day containers for each day
  // i += 8 taken as API returns weather for every 3 hours
  for (var i = 7; i < 40; i += 8) {
    var dayContainerEl = document.createElement("div");
    dayContainerEl.classList.add("day-container");
    dayContainersEl.appendChild(dayContainerEl);

    var utcTime = weather.list[i].dt;
    console.log(utcTime);
    //element to display current date on day container
    var dateEl = document.createElement("h4");
    dateEl.textContent = convertTime(utcTime);
    dayContainerEl.appendChild(dateEl);

    var statusIconEl = document.createElement("span");
    if (weather.list[i].main.temp > 292) {
      statusIconEl.innerHTML = "<i class='fas fa-sun'></i>";
    } else if (weather.list[i].main.temp <= 292) {
      statusIconEl.innerHTML = "<i class='fas fa-temperature-down'></i>";
    }

    dayContainerEl.appendChild(statusIconEl);

    //list elements added to day container and populated using API response
    var weatherItems = document.createElement("ul");
    weatherItems.style.listStyleType = "none";
    weatherItems.style.marginLeft = "-30px";
    weatherItems.style.marginRight = "15px";
    dayContainerEl.appendChild(weatherItems);
    var tempEl1 = document.createElement("li");
    var windEl1 = document.createElement("li");
    var humidityEl1 = document.createElement("li");

    tempEl1.textContent = "Temp: " + weather.list[i].main.temp + " K";
    windEl1.textContent = "Wind: " + weather.list[i].wind.speed + " m/s";
    humidityEl1.textContent =
      "Humidity: " + weather.list[i].main.humidity + " %";

    weatherItems.appendChild(tempEl1);
    weatherItems.appendChild(windEl1);
    weatherItems.appendChild(humidityEl1);
  }

  return;

  //function to convert UTC time
  function convertTime(utcTime) {
    // Convert UTC time to a Date object
    const date = new Date(utcTime * 1000);
    // Get the formatted date string in "M/DD/YYYY" format
    const options = {
      month: "numeric",
      day: "2-digit",
      year: "numeric",
    };
    const formattedDate = date.toLocaleDateString("en-US", options);
    console.log(formattedDate);

    return formattedDate;
  }
};

// Function to save the search term to local storage
function saveSearchTerm(searchTerm) {
  // Retrieve existing search terms from local storage
  const existingSearchTerms = getSearchTerms();

  // Add the new search term to the existing ones
  existingSearchTerms.push(searchTerm);

  // Save the updated search terms to local storage
  localStorage.setItem("searchTerms", JSON.stringify(existingSearchTerms));

  // Update the displayed past searches
  displayPastSearches();
}
// Function to retrieve the saved search terms from local storage
function getSearchTerms() {
  const storedSearchTerms = localStorage.getItem("searchTerms");
  return storedSearchTerms ? JSON.parse(storedSearchTerms) : [];
}

// Function to display the past searches
function displayPastSearches() {
  // Clear the existing list
  pastSearchesList.innerHTML = "";

  // Retrieve the saved search terms
  const searchTerms = getSearchTerms();

  // Create list items for each search term
  searchTerms.forEach((searchTerm) => {
    const listItem = document.createElement("li");
    listItem.classList.add("highlight");

    listItem.textContent = searchTerm;

    // Attach a click event listener to the list item
    listItem.addEventListener("click", () => {
      console.log("clicked");
      formSubmitHandlerList(searchTerm);
    });

    // Append the list item to the past searches list
    pastSearchesList.appendChild(listItem);
  });
}

userFormEl.addEventListener("submit", formSubmitHandler);
displayPastSearches();
