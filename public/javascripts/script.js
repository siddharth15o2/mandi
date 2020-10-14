// Obj: List data from API with pagination support

// Pagination
function Paginator(loader, options, callback) {
  let state = {
      currentPage: !("currentPage" in options) ? 1 : options.currentPage,
      totalPages: null,
      pageSize: options.pageSize,
      data: [],
    },
    controls = options.controls;

  /**
   * On state update
   *
   * 1. Update controls state
   * 2. Update the view with current page records
   */
  function setState(changes) {
    state = Object.assign(state, changes);

    if (state.totalPages > 1) {
      if (state.currentPage > 1) {
        document.getElementById(controls.prevPage).removeAttribute("hidden");
      }

      if (state.currentPage === 1) {
        document.getElementById(controls.prevPage).setAttribute("hidden", true);
      }

      if (state.currentPage === state.totalPages) {
        document.getElementById(controls.nextPage).setAttribute("hidden", true);
      } else {
        document.getElementById(controls.nextPage).removeAttribute("hidden");
      }

      document.getElementById(controls.pageSelector).value = state.currentPage;
    }

    options.onPageChange(state);
  }

  // nth page
  function goToPage(n, callback) {
    if (n > state.totalPages || n <= 0) {
      return;
    }

    state.currentPage = parseInt(n, 10);

    return loader(n, state.pageSize).then((data) => {
      setState({ data: data.records });

      typeof callback === "function" && callback(undefined, state);
    });
  }

  // next page
  function nextPage(callback) {
    goToPage(state.currentPage + 1, callback);
  }

  // prev page
  function prevPage(callback) {
    goToPage(state.currentPage - 1, callback);
  }

  controls.nextPage &&
    document
      .getElementById(controls.nextPage)
      .addEventListener("click", nextPage);

  controls.prevPage &&
    document
      .getElementById(controls.prevPage)
      .addEventListener("click", prevPage);

  controls.pageSelector &&
    document
      .getElementById(controls.pageSelector)
      .addEventListener("change", (e) => {
        goToPage(e.target.value);
      });

  // Initialze paginator
  loader(state.currentPage, state.pageSize).then((data) => {
    setState({
      data: data.records,
      totalPages: Math.ceil(data.total / state.pageSize),
    });

    if (controls.pageSelector) {
      const sp = document.getElementById(controls.pageSelector);

      // Prepare the nth page selector
      for (let i = 0; i < state.totalPages; i++) {
        let j = i;
        let element = document.createElement("option");
        element.textContent = j + 1;
        element.value = j + 1;
        sp.appendChild(element);
      }
    }

    typeof callback === "function" && callback(undefined, state);
  });

  return {
    nextPage,
    prevPage,
    goToPage,
  };
}

// Application Logic
function dataLoader(pageNumber, pageSize) {
  let offset = (pageNumber - 1) * pageSize,
    limit = pageSize;

  return fetchData(offset, limit);
}

// Fetch data from API
function fetchData(offset, limit) {
  const URL =
      "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070",
    queryParams = [
      "api-key=579b464db66ec23bdd0000018b7e638afa7b4a484ec369098b5ba159",
      "offset=" + offset,
      "limit=" + limit,
      "format=json",
    ].join("&");

  var requestOptions = {
    method: "GET",
  };

  return fetch(URL + "?" + queryParams, requestOptions).then((response) =>
    response.json()
  );
}

// Display data
function display(state) {
  let root = document.getElementById("root");

  root.innerHTML = state.data
    .map((r) => {
      return [r.state, r.district, r.commodity, r.min_price, r.max_price].join(
        ","
      );
    })
    .join("<br/>");
}

const paginator = Paginator(dataLoader, {
  pageSize: 100,
  controls: {
    nextPage: "nxt",
    prevPage: "prev",
    pageSelector: "selPage",
    queryParam: "page",
  },
  onPageChange: (state) => {
    display(state);
  },
});
