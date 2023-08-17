const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");
const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const grantAccessButton = document.querySelector("[data-grantAcess]");
const searchInput = document.querySelector("[data-searchInput]");
const apiErrorContainer = document.querySelector(".api-error-container");
const apiErrorImg = document.querySelector("[data-notFoundImg]");
const apiErrorMessage = document.querySelector("[data-apiErrorText]");
const apiErrorBtn = document.querySelector("[data-apiErrorBtn]");
const messageText = document.querySelector("[data-messageText]");

let currentTab = userTab;
const API_KEY = TOKEN;
currentTab.classList.add("current-tab");
getFromSessionStorage();


function switchTab(clickedTab){
    apiErrorContainer.classList.remove("active");
    if(clickedTab != currentTab){
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");

        //Below we check is search form is invisible. if yes then make it visible
        if(!searchForm.classList.contains("active")){
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else{
            //Here means we have on search tab now wants your weather tab visible
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            //Now I have in your weather, so here we have to visible weather, so for this let's check local storage first
            //for coordinates, if we have saved then there.
            getFromSessionStorage();
        }
    }
}

userTab.addEventListener('click', () => {
    //pass clicked tab as input parameter
    switchTab(userTab);
});

searchTab.addEventListener('click', () => {
    //pass clicked tab as input parameter
    switchTab(searchTab);
});

//check if coordinates are already present in session storage
function getFromSessionStorage(){
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates){
        //this code runs when we not found user coordinates
        grantAccessContainer.classList.add("active");
    }
    else{
        //When receiving data from a web server, the data is always a string. Parse the data with JSON.parse(), and the data becomes a JavaScript object.
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}


async function fetchUserWeatherInfo(coordinates){
    const {lat, lon} = coordinates;
    //make grant access container invisible
    grantAccessContainer.classList.remove("active");

    //make loader visible
    loadingScreen.classList.add("active");

    //API Call
    try {

        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        if(!data.sys){
            throw data;
        }
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);

    } catch (error) {
        loadingScreen.classList.remove("active");
        apiErrorContainer.classList.add("active");
        apiErrorImg.style.display = "none";
        apiErrorMessage.innerText = `Error: ${error?.message}`;
        apiErrorBtn.addEventListener('click', fetchUserWeatherInfo);
        
    }
}


function renderWeatherInfo(weatherInfo){
    //firstly, we have to fetch the html elements
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windSpeed = document.querySelector("[data-windSpeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    //fetch values from weatherInfo object and put into the UI
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `https://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windSpeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}


function geoLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    }
    else{
        //show an alert gor no geolocation support avaiable
        grantAccessButton.style.display = "none";
        messageText.innerText = "Geolocation is not supported by this browser.";
    }
}


function showPosition(position){
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

grantAccessButton.addEventListener('click', geoLocation);


// Handle geolocation errors
function showError(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        messageText.innerText = "You denied the request for Geolocation.";
        break;
      case error.POSITION_UNAVAILABLE:
        messageText.innerText = "Location information is unavailable.";
        break;
      case error.TIMEOUT:
        messageText.innerText = "The request to get user location timed out.";
        break;
      case error.UNKNOWN_ERROR:
        messageText.innerText = "An unknown error occurred.";
        break;
    }
  }


searchForm.addEventListener('submit', (e) =>{
    e.preventDefault();
    let cityName = searchInput.value;
    if(cityName === ""){
        return;
    }
    else{
        fetchSearchWeatherInfo(cityName);
    }
});


async function fetchSearchWeatherInfo(city){
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");
    apiErrorContainer.classList.remove("active");

    try {
        
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        if (!data.sys) {
            throw data;
          }
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
        
    } catch (error) {
        loadingScreen.classList.remove("active");
        apiErrorContainer.classList.add("active");
        apiErrorMessage.innerText = `Error: ${error?.message}`;
        apiErrorBtn.style.display = "none";
    }
}