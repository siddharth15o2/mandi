// Obj: List data from API with pagination support

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

// Pagination
function Paginator(loader, options, callback) {
  let state = {
    currentPage: !("currentPage" in options) ? 1 : options.currentPage,
    totalPages: null,
    pageSize: options.pageSize,
    data: [],
  };

  // next page
  function nextPage(callback) {
    return loader(++state.currentPage, state.pageSize).then((data) => {
      state.data = data.records;

      callback(undefined, state);
    });
  }

  // prev page
  function prevPage(callback) {
    return loader(--state.currentPage, state.pageSize).then((data) => {
      state.data = data.records;
      callback(undefined, state);
    });
  }

  // nth page
  function nthPage(n, callback) {
    state.currentPage = n;
    return loader(n, state.pageSize).then((data) => {
      state.data = data.records;
      callback(undefined, state);
    });
  }

  // Initialze paginator
  loader(state.currentPage, state.pageSize).then((data) => {
    state.data = data.records;
    state.totalPages = Math.ceil(data.total / state.pageSize);

    callback(undefined, state);
  });

  return {
    nextPage,
    prevPage,
    nthPage,
  };
}

// Application Logic
function dataLoader(pageNumber, pageSize) {
  let offset = (pageNumber - 1) * pageSize,
    limit = pageSize;

  return fetchData(offset, limit);
}

const paginator = Paginator(dataLoader, { pageSize: 100 }, (err, state) => {
  console.log("Initial State:", state);
  const sp = document.getElementById("selPage");

  // Prepare the nth page selector
  for (let i = 0; i < state.totalPages; i++) {
    let j = i;
    let element = document.createElement("option");
    element.textContent = j + 1;
    element.value = j + 1;
    sp.appendChild(element);
  }

  display(state);
});

document.getElementById("selPage").addEventListener("change", (e) => {
  paginator.nthPage(e.target.value, (err, state) => {
    if (state.currentPage > 1) {
      document.getElementById("prev").removeAttribute("hidden");
    }
    display(state);
  });
});

document.getElementById("nxt").addEventListener("click", (e) => {
  paginator.nextPage((err, state) => {
    if (state.currentPage > 1) {
      document.getElementById("prev").removeAttribute("hidden");
    }
    display(state);
  });
});

document.getElementById("prev").addEventListener("click", (e) => {
  paginator.prevPage((err, state) => {
    if (state.currentPage <= 1) {
      document.getElementById("prev").setAttribute("hidden", true);
    }
    display(state);
  });
});
