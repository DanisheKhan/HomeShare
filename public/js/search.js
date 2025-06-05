document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.querySelector(".search-input");
  const locationSuggestions = document.getElementById("location-suggestions");
  const SEARCH_HISTORY_KEY = "homeshare_search_history";

  if (!searchInput || !locationSuggestions) return;

  // Save search term to local storage
  function saveSearchToHistory(searchTerm) {
    if (!searchTerm.trim()) return;

    // Get existing history
    let searchHistory = JSON.parse(
      localStorage.getItem(SEARCH_HISTORY_KEY) || "[]"
    );

    // Remove if exists already (to move it to top)
    searchHistory = searchHistory.filter(
      (term) => term.toLowerCase() !== searchTerm.toLowerCase()
    );

    // Add to beginning
    searchHistory.unshift(searchTerm);

    // Limit to 10 items
    searchHistory = searchHistory.slice(0, 10);

    // Save back to storage
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory));
  }

  // Get search history from local storage
  function getSearchHistory() {
    return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || "[]");
  }

  // Function to fetch locations from backend
  async function fetchLocationSuggestions() {
    try {
      const response = await fetch("/api/locations");
      if (!response.ok) {
        throw new Error("Failed to fetch location data");
      }

      const data = await response.json();
      const searchHistory = getSearchHistory();

      // Clear existing options
      while (locationSuggestions.firstChild) {
        locationSuggestions.removeChild(locationSuggestions.firstChild);
      }

      // Add search history first (if exists)
      if (searchHistory.length > 0) {
        searchHistory.forEach((term) => {
          const option = document.createElement("option");
          option.value = term;
          locationSuggestions.appendChild(option);
        });
      }

      // Add all locations and countries
      if (data && data.locations) {
        const addedLocations = new Set(
          searchHistory.map((term) => term.toLowerCase())
        );

        data.locations.forEach((location) => {
          if (!addedLocations.has(location.toLowerCase())) {
            const option = document.createElement("option");
            option.value = location;
            locationSuggestions.appendChild(option);
            addedLocations.add(location.toLowerCase());
          }
        });
      }
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
    }
  }

  // Fetch locations when focusing on the search input
  searchInput.addEventListener("focus", fetchLocationSuggestions);

  // Visual feedback on search input
  searchInput.addEventListener("focus", function () {
    this.parentElement.classList.add("search-focused");
  });

  searchInput.addEventListener("blur", function () {
    this.parentElement.classList.remove("search-focused");
  });

  // Save search when form is submitted
  const searchForm = document.querySelector(".search-form");
  if (searchForm) {
    searchForm.addEventListener("submit", function () {
      saveSearchToHistory(searchInput.value);
    });
  }
});
