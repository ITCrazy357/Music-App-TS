//AP Player
const aplayer = document.querySelector("#aplayer");
if (aplayer) {
  let dataSong = aplayer.getAttribute("data-song");
  dataSong = JSON.parse(dataSong);

  let dataSinger = aplayer.getAttribute("data-singer");
  dataSinger = JSON.parse(dataSinger);

  const ap = new APlayer({
    container: aplayer,
    audio: [
      {
        name: dataSong.title,
        artist: dataSinger.fullName,
        url: dataSong.audio,
        cover: dataSong.avatar,
      },
    ],
    autoplay: true,
    volume: 0.7,
  });

  const avatar = document.querySelector(".singer-detail .inner-avatar img");

  ap.on("play", function () {
    avatar.style.animationPlayState = "running";
  });

  ap.on("pause", function () {
    avatar.style.animationPlayState = "paused";
  });
}

// Show Alert
const showAlerts = document.querySelectorAll("[show-alert]");
if (showAlerts.length > 0) {
  showAlerts.forEach((alert) => {
    const time = parseInt(alert.getAttribute("data-time")) || 3000;
    const closeAlert = alert.querySelector("[close-alert]");

    setTimeout(() => {
      alert.classList.add("alert-hidden");
    }, time);

    if (closeAlert) {
      closeAlert.addEventListener("click", () => {
        alert.classList.add("alert-hidden");
      });
    }
  });
}

//Like
const listButtonLike = document.querySelectorAll("[button-like]");
if (listButtonLike.length > 0) {
  listButtonLike.forEach((buttonLike) => {
    buttonLike.addEventListener("click", () => {
      const idSong = buttonLike.getAttribute("button-like");
      const isActive = buttonLike.classList.contains("active");

      const typeLike = isActive ? "dislike" : "like";

      const link = `/songs/like/${typeLike}/${idSong}`;

      const option = {
        method: "PATCH",
      };

      fetch(link, option)
        .then((res) => res.json())
        .then((data) => {
          if (data.code === 200) {
            const span = buttonLike.querySelector("span");
            if (span) {
              span.innerHTML = `${data.like} lượt thích`;
            } else {
              // fallback if it's text node, though span is better
              const textNode = Array.from(buttonLike.childNodes).find(
                (n) =>
                  n.nodeType === Node.TEXT_NODE &&
                  n.textContent.includes("lượt thích"),
              );
              if (textNode) {
                textNode.textContent = ` ${data.like} lượt thích`;
              }
            }

            // Thêm class active để đổi màu icon
            buttonLike.classList.toggle("active");
          }
        });
    });
  });
}

//Favorite
const listButtonFavorite = document.querySelectorAll("[button-favorite]");
if (listButtonFavorite.length > 0) {
  listButtonFavorite.forEach((buttonFavorite) => {
    buttonFavorite.addEventListener("click", () => {
      const idSong = buttonFavorite.getAttribute("button-favorite");
      const isActive = buttonFavorite.classList.contains("active");

      const typeFavorite = isActive ? "unfavorite" : "favorite";

      const link = `/songs/favorite/${typeFavorite}/${idSong}`;

      const option = {
        method: "PATCH",
      };

      fetch(link, option)
        .then((res) => res.json())
        .then((data) => {
          if (data.code === 200) {
            buttonFavorite.classList.toggle("active");
          }
        });
    });
  });
}

// Suggest Search
const boxSearch = document.querySelector(".box-search");
if (boxSearch) {
  const inputSearch = boxSearch.querySelector("input[name='keyword']");
  const boxSuggest = boxSearch.querySelector(".inner-suggest");
  const innerList = boxSearch.querySelector(".inner-suggest .inner-list");

  inputSearch.addEventListener("keyup", () => {
    const keyword = inputSearch.value.trim();

    if (keyword) {
      const link = `/search/suggest?keyword=${keyword}`;

      fetch(link)
        .then((res) => res.json())
        .then((data) => {
          if (data.code === 200) {
            const songs = data.songs;
            if (songs.length > 0) {
              const html = songs
                .map(
                  (song) => `
                <a href="/songs/detail/${song.slug}" class="inner-item">
                  <div class="inner-image">
                    <img src="${song.avatar}" alt="${song.title}" />
                  </div>
                  <div class="inner-info">
                    <div class="inner-title">${song.title}</div>
                    <div class="inner-author">
                      <i class="fa-solid fa-microphone-lines"></i> ${song.infoSinger.fullName}
                    </div>
                  </div>
                </a>
              `,
                )
                .join("");

              innerList.innerHTML = html;
              boxSuggest.classList.add("show");
            } else {
              innerList.innerHTML = "";
              boxSuggest.classList.remove("show");
            }
          }
        });
    } else {
      innerList.innerHTML = "";
      boxSuggest.classList.remove("show");
    }
  });

  // Ẩn gợi ý khi click ra ngoài
  document.addEventListener("click", (e) => {
    if (!boxSearch.contains(e.target)) {
      boxSuggest.classList.remove("show");
    }
  });
}
