const bookContainer = document.getElementById("book");

function isMobile() {
  return window.innerWidth < 768;
}

let config = {
  width: 800,
  height: 500,
  autoCenter: true,
  display: isMobile() ? "single" : "double"
};

function initBook(pages) {
  bookContainer.innerHTML = "";

  pages.forEach((img) => {
    const page = document.createElement("div");
    page.className = "page";

    const image = document.createElement("img");
    image.src = img;

    page.appendChild(image);
    bookContainer.appendChild(page);
  });

  $("#book").turn(config);
}

function preloadImages(imagePaths, callback) {
  let loaded = 0;

  imagePaths.forEach((src) => {
    const img = new Image();
    img.src = src;

    img.onload = () => {
      loaded++;
      if (loaded === imagePaths.length) {
        callback();
      }
    };
  });
}

fetch("data.json")
  .then(res => res.json())
  .then(data => {
    const pages = data.books[0].pages;

    preloadImages(pages, () => {
      initBook(pages);
    });
  });

window.addEventListener("resize", () => {
  location.reload();
});
