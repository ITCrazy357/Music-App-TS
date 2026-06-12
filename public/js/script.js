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

  if (avatar) {
    ap.on("play", function () {
      avatar.style.animationPlayState = "running";
    });

    ap.on("pause", function () {
      avatar.style.animationPlayState = "paused";
    });
  }

  ap.on("ended", function () {
    const link = `/songs/listen/${dataSong._id}`;

    const option = {
      method: "PATCH",
    };

    fetch(link, option)
      .then((res) => res.json())
      .then((data) => {
        const listenElement = document.querySelector(
          ".inner-action.inner-listen span",
        );
        if (listenElement) {
          listenElement.innerHTML = ` ${data.listen} lượt nghe`;
        }
      });
  });

  // ===== CUSTOM LYRICS SYNC LOGIC =====
  const lyricsContainer = document.querySelector("#lyrics-container");
  if (lyricsContainer) {
    const rawLyrics = lyricsContainer.getAttribute("data-lyrics");

    // Check if it's LRC format (contains [mm:ss.xx] or [mm:ss])
    const lrcRegex = /\[\d{2}:\d{2}(?:\.\d{1,3})?\]/;
    const isLrc = lrcRegex.test(rawLyrics);

    if (isLrc) {
      // Parse LRC
      const lines = rawLyrics.split("\n");
      const parsedLyrics = [];
      const timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{1,3}))?\]/;

      lines.forEach((line) => {
        const match = timeRegex.exec(line);
        if (match) {
          const minutes = parseInt(match[1]);
          const seconds = parseInt(match[2]);
          const msStr = match[3] || "0";
          const milliseconds = parseInt(msStr.padEnd(3, "0"));
          const timeInSeconds = minutes * 60 + seconds + milliseconds / 1000;
          const text = line.replace(timeRegex, "").trim();

          parsedLyrics.push({ time: timeInSeconds, text: text || "&nbsp;" });
        }
      });

      // Render lyrics HTML
      if (parsedLyrics.length > 0) {
        lyricsContainer.innerHTML = parsedLyrics
          .map(
            (lyric, index) =>
              `<div class="lyric-line" data-index="${index}" data-time="${lyric.time}">${lyric.text}</div>`,
          )
          .join("");

        const lyricElements = lyricsContainer.querySelectorAll(".lyric-line");
        let currentIndex = -1;

        // Click to seek
        lyricElements.forEach((el) => {
          el.addEventListener("click", () => {
            const time = parseFloat(el.getAttribute("data-time"));
            ap.seek(time);
            ap.play();
          });
        });

        // Sync with audio time
        ap.on("timeupdate", () => {
          const currentTime = ap.audio.currentTime;

          // Find current lyric index
          let newIndex = -1;
          for (let i = 0; i < parsedLyrics.length; i++) {
            if (currentTime >= parsedLyrics[i].time) {
              newIndex = i;
            } else {
              break;
            }
          }

          if (newIndex !== currentIndex && newIndex !== -1) {
            // Remove old classes
            lyricElements.forEach((el, idx) => {
              el.classList.remove("active");
              if (idx < newIndex) {
                el.classList.add("passed");
              } else {
                el.classList.remove("passed");
              }
            });

            // Add active class
            const currentEl = lyricElements[newIndex];
            currentEl.classList.add("active");

            // Auto scroll to center
            const containerHeight = lyricsContainer.clientHeight;
            const elOffsetTop = currentEl.offsetTop;
            const elHeight = currentEl.clientHeight;

            lyricsContainer.scrollTo({
              top: elOffsetTop - containerHeight / 2 + elHeight / 2,
              behavior: "smooth",
            });

            currentIndex = newIndex;
          }
        });
      } else {
        lyricsContainer.innerHTML = `<div class="inner-text" style="color: var(--white); line-height: 1.8; font-size: 16px; white-space: pre-wrap;">${rawLyrics}</div>`;
      }
    } else {
      // Not LRC, just render plain text with nice formatting
      lyricsContainer.innerHTML = `<div class="inner-text" style="color: rgba(255,255,255,0.8); line-height: 2.2; font-size: 16 px; white-space: pre-wrap; text-align: center; padding: 20px;">${rawLyrics || "Đang cập nhật lời bài hát..."}</div>`;
    }
  }
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

// Ads View Tracking & Slider Logic
const adSwiperContainers = document.querySelectorAll(".ads-swiper-container");
if (adSwiperContainers.length > 0) {
  const adObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const adId = entry.target.getAttribute("data-ad-id");
        if (adId && !entry.target.hasAttribute("data-tracked")) {
          fetch(`/ads/view/${adId}`, { method: "POST" })
            .catch(err => console.error("Ad view tracking error"));
          entry.target.setAttribute("data-tracked", "true");
        }
      }
    });
  }, { threshold: 0.5 });

  adSwiperContainers.forEach(container => {
    const banners = container.querySelectorAll(".ad-banner-container");
    
    // Track views
    banners.forEach(ad => {
      adObserver.observe(ad);
    });

    // Initialize Swiper
    new Swiper(container, {
      slidesPerView: 1,
      spaceBetween: 20,
      loop: banners.length > 1,
      speed: 800,
      autoplay: banners.length > 1 ? {
        delay: 4000,
        disableOnInteraction: false,
      } : false,
      navigation: {
        nextEl: container.querySelector('.ads-nav-next'),
        prevEl: container.querySelector('.ads-nav-prev'),
      }
    });
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

// Admin - Preview Image
const uploadImageInputs = document.querySelectorAll(".upload-image-input");

if (uploadImageInputs.length > 0) {
  uploadImageInputs.forEach(input => {
    input.addEventListener("change", (e) => {
      if (e.target.files.length) {
        const image = URL.createObjectURL(e.target.files[0]);
        // Find the preview element
        const parent = input.closest(".form-group") || input.parentElement;
        const preview = parent.querySelector(".upload-image-preview");
        if(preview) {
          preview.src = image;
          preview.style.display = "block";
        }
      }
    });
  });
}

// Admin - Preview Audio
const uploadAudioInput = document.querySelector(".upload-audio-input");
const uploadAudioPreview = document.querySelector(".upload-audio-preview");

if (uploadAudioInput && uploadAudioPreview) {
  const source = uploadAudioPreview.querySelector("source");
  uploadAudioInput.addEventListener("change", (e) => {
    if (e.target.files.length) {
      const audio = URL.createObjectURL(e.target.files[0]);
      if (source) {
        source.src = audio;
      } else {
        uploadAudioPreview.src = audio;
      }
      uploadAudioPreview.load();
      uploadAudioPreview.style.display = "block";
    }
  });
}

// ===== COMMENTS SYSTEM =====
// Comment Form Submit
const formComment = document.querySelector("#form-comment");
if (formComment) {
  formComment.addEventListener("submit", (e) => {
    e.preventDefault();
    const action = formComment.getAttribute("action");
    const contentInput = formComment.querySelector("textarea[name='content']");
    const content = contentInput.value.trim();

    if (!content) return;

    fetch(action, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === 200) {
          contentInput.value = "";

          // Append new comment without reload
          const commentsList = document.querySelector(".comments-list");
          const commentsHeaderCount = document.querySelector(
            ".comments-title span",
          );

          if (!commentsList || !data.comment) return;

          // If currently no comments, replace placeholder
          const noComments = commentsList.querySelector(".no-comments");

          const comment = data.comment;
          const user = comment.userId || {};

          const newItem = document.createElement("div");
          newItem.className = "comment-item";
          newItem.innerHTML = `
            <div class="comment-avatar">
              <img src="${user.avatar || "/images/avatar.png"}" alt="${user.fullName || ""}" />
            </div>
            <div class="comment-content">
              <div class="comment-author-name">${user.fullName || ""}</div>
              <div class="comment-text">${comment.content || ""}</div>
              <div class="comment-meta">
                <span class="comment-time">${comment.createdAt ? new Date(comment.createdAt).toLocaleString("vi-VN") : ""}</span>

                <button class="comment-action btn-like" button-like-comment="${comment._id}"${comment.isLikedByUser ? " active" : ""}>
                  <i class="fa-solid fa-thumbs-up"></i>
                  <span class="count">${comment.likeCount ?? 0}</span>
                </button>

                <button class="comment-action btn-dislike" button-dislike-comment="${comment._id}"${comment.isDislikedByUser ? " active" : ""}>
                  <i class="fa-solid fa-thumbs-down"></i>
                  <span class="count">${comment.dislikeCount ?? 0}</span>
                </button>
              </div>
            </div>
          `;

          if (noComments) {
            noComments.remove();
          }

          if (commentsList.firstChild) {
            commentsList.insertBefore(newItem, commentsList.firstChild);
          } else {
            commentsList.appendChild(newItem);
          }

          // Update header count
          if (commentsHeaderCount) {
            const currentText = commentsHeaderCount.textContent || "";
            const match = currentText.match(/\((\d+)\)/);
            if (match) {
              const n = parseInt(match[1], 10);
              if (!Number.isNaN(n)) {
                commentsHeaderCount.textContent = `Bình luận (${n + 1})`
                  .replace(/^Bình luận\s*/, "")
                  .trim();
              }
            }
          }
        } else {
          alert(data.message || "Có lỗi xảy ra, vui lòng thử lại.");
        }
      })
      .catch((err) => {
        console.error(err);
        alert("Có lỗi xảy ra, vui lòng thử lại.");
      });
  });
}

// Comment Edit/Delete Actions (owner only)
const commentEditButtons = document.querySelectorAll("[button-edit-comment]");
const commentDeleteButtons = document.querySelectorAll(
  "[button-delete-comment]",
);

if (commentEditButtons.length > 0) {
  commentEditButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const idComment = btn.getAttribute("button-edit-comment");
      const commentItem = btn.closest(".comment-item");
      if (!idComment || !commentItem) return;

      const commentTextEl = commentItem.querySelector(".comment-text");
      if (!commentTextEl) return;

      const currentContent = commentTextEl.textContent || "";

      commentItem.dataset.editing = "true";

      commentTextEl.innerHTML = `
        <textarea class="comment-edit-textarea" rows="3">${currentContent.replace(/</g, "<").replace(/>/g, ">")}</textarea>
        <div class="comment-edit-actions" style="margin-top:8px; display:flex; gap:8px;">
          <button class="btn btn-primary btn-comment-save" type="button">Lưu</button>
          <button class="btn btn-outline-secondary btn-comment-cancel" type="button">Hủy</button>
        </div>
      `;

      const btnSave = commentItem.querySelector(".btn-comment-save");
      const btnCancel = commentItem.querySelector(".btn-comment-cancel");

      if (btnCancel) {
        btnCancel.addEventListener("click", () => {
          commentItem.dataset.editing = "false";
          commentTextEl.textContent = currentContent;
          // Restore owner action buttons if they were removed
          const meta = commentItem.querySelector(".comment-meta");
          if (meta && !meta.querySelector(".comment-owner-actions")) {
            meta.insertAdjacentHTML(
              "beforeend",
              `
                <div class="comment-owner-actions">
                  <button class="comment-action btn-edit" type="button" button-edit-comment="${idComment}">Chỉnh sửa</button>
                  <button class="comment-action btn-delete" type="button" button-delete-comment="${idComment}">Xóa</button>
                </div>
              `,
            );

            meta
              .querySelector("[button-edit-comment]")
              ?.addEventListener("click", () => {
                meta.querySelector("[button-edit-comment]")?.click();
              });

            meta
              .querySelector("[button-delete-comment]")
              ?.addEventListener("click", () => {
                meta.querySelector("[button-delete-comment]")?.click();
              });
          }
        });
      }

      if (btnSave) {
        btnSave.addEventListener("click", () => {
          const textarea = commentItem.querySelector(".comment-edit-textarea");
          const newContent = textarea ? textarea.value.trim() : "";
          if (!newContent) return;

          fetch(`/comments/edit/${idComment}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: newContent }),
          })
            .then((res) => {
              if (res.status === 401) {
                window.location.href = "/auth/login";
                return null;
              }
              return res.json();
            })
            .then((data) => {
              if (!data) return;
              if (data.code === 200 && data.comment) {
                const updated = data.comment;
                const timeEl = commentItem.querySelector(".comment-time");
                commentItem.querySelector(".comment-text").textContent =
                  updated.content || "";

                if (timeEl) {
                  const timeText = timeEl.textContent || "";
                  if (updated.edited && !timeText.includes("đã chỉnh sửa")) {
                    timeEl.textContent = `${timeText} • đã chỉnh sửa`;
                  }
                }

                commentItem.dataset.editing = "false";

                // Re-render owner action buttons
                const ownerActions = commentItem.querySelector(
                  ".comment-owner-actions",
                );
                if (ownerActions) ownerActions.remove();

                const meta = commentItem.querySelector(".comment-meta");
                if (meta) {
                  meta.insertAdjacentHTML(
                    "beforeend",
                    `
                      <div class="comment-owner-actions">
                        <button class="comment-action btn-edit" type="button" button-edit-comment="${updated._id}">Chỉnh sửa</button>
                        <button class="comment-action btn-delete" type="button" button-delete-comment="${updated._id}">Xóa</button>
                      </div>
                    `,
                  );

                  // Re-bind events for the re-rendered buttons
                  const newEditBtn = meta.querySelector(
                    "[button-edit-comment]",
                  );
                  const newDeleteBtn = meta.querySelector(
                    "[button-delete-comment]",
                  );

                  if (newEditBtn) {
                    newEditBtn.addEventListener("click", () => {
                      newEditBtn.click();
                    });
                  }

                  if (newDeleteBtn) {
                    newDeleteBtn.addEventListener("click", () => {
                      newDeleteBtn.click();
                    });
                  }
                }
              } else {
                alert(data.message || "Có lỗi xảy ra, vui lòng thử lại.");
              }
            })
            .catch((err) => {
              console.error(err);
              alert("Có lỗi xảy ra, vui lòng thử lại.");
            });
        });
      }
    });
  });
}

if (commentDeleteButtons.length > 0) {
  commentDeleteButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const idComment = btn.getAttribute("button-delete-comment");
      const commentItem = btn.closest(".comment-item");
      if (!idComment || !commentItem) return;

      const ok = confirm("Bạn có chắc muốn xóa bình luận này?");
      if (!ok) return;

      fetch(`/comments/delete/${idComment}`, { method: "DELETE" })
        .then((res) => {
          if (res.status === 401) {
            window.location.href = "/auth/login";
            return null;
          }
          return res.json();
        })
        .then((data) => {
          if (!data) return;
          if (data.code === 200) {
            commentItem.remove();

            const commentsList = document.querySelector(".comments-list");
            if (commentsList) {
              const items = commentsList.querySelectorAll(".comment-item");
              if (!items || items.length === 0) {
                commentsList.innerHTML = `<div class="no-comments"><p>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p></div>`;
              }
            }
          } else {
            alert(data.message || "Có lỗi xảy ra, vui lòng thử lại.");
          }
        })
        .catch((err) => {
          console.error(err);
          alert("Có lỗi xảy ra, vui lòng thử lại.");
        });
    });
  });
}

// ===== COMMENTS FILTER (AJAX, no reload) =====
const commentsSortSelect = document.querySelector("#comments-sort");
if (commentsSortSelect) {
  commentsSortSelect.addEventListener("change", () => {
    const sort = commentsSortSelect.value;
    const songId = commentsSortSelect.getAttribute("data-song-id");

    const commentsList = document.querySelector(".comments-list");
    const commentsHeaderCount = document.querySelector(".comments-title span");
    if (!songId || !commentsList || !commentsHeaderCount) return;

    // optional: show loading state
    commentsList.innerHTML = `<div class="no-comments"><p>Đang tải bình luận...</p></div>`;

    fetch(`/comments-filter?songId=${songId}&sort=${sort}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data || data.code !== 200) return;

        const comments = data.comments || [];
        // render
        if (comments.length > 0) {
          commentsList.innerHTML = comments
            .map((comment) => {
              const user = comment.userId || {};
              const isOwner = false; // server already returns isLiked/isDisliked but owner actions handled by view only
              // We still render like/dislike buttons; owner buttons will only exist for initial SSR.
              // After filter change, owner buttons won't appear unless you render them server-side with auth.
              // (Keep UX stable: show like/dislike always.)
              return `
                <div class="comment-item">
                  <div class="comment-avatar">
                    <img src="${user.avatar || "/images/avatar.png"}" alt="${user.fullName || ""}" />
                  </div>
                  <div class="comment-content">
                    <div class="comment-author-name">${user.fullName || ""}</div>
                    <div class="comment-text">${comment.content || ""}</div>
                    <div class="comment-meta">
                      <span class="comment-time">${comment.createdAt ? new Date(comment.createdAt).toLocaleString("vi-VN") : ""}${comment.edited && comment.editedAt ? " • đã chỉnh sửa" : ""}</span>
                      ${comment.isLikedByUser ? `<button class="comment-action btn-like active" button-like-comment="${comment._id}"><i class="fa-solid fa-thumbs-up"></i><span class="count">${comment.likeCount ?? 0}</span></button>` : `<button class="comment-action btn-like" button-like-comment="${comment._id}"><i class="fa-solid fa-thumbs-up"></i><span class="count">${comment.likeCount ?? 0}</span></button>`}
                      ${comment.isDislikedByUser ? `<button class="comment-action btn-dislike active" button-dislike-comment="${comment._id}"><i class="fa-solid fa-thumbs-down"></i><span class="count">${comment.dislikeCount ?? 0}</span></button>` : `<button class="comment-action btn-dislike" button-dislike-comment="${comment._id}"><i class="fa-solid fa-thumbs-down"></i><span class="count">${comment.dislikeCount ?? 0}</span></button>`}
                    </div>
                  </div>
                </div>
              `;
            })
            .join("");
        } else {
          commentsList.innerHTML = `<div class="no-comments"><p>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p></div>`;
        }

        commentsHeaderCount.textContent = `Bình luận (${comments.length})`;

        // re-bind like/dislike after render
        const commentLikeButtons = document.querySelectorAll(
          "[button-like-comment]",
        );
        const commentDislikeButtons = document.querySelectorAll(
          "[button-dislike-comment]",
        );

        if (commentLikeButtons.length > 0) {
          commentLikeButtons.forEach((btn) => {
            btn.addEventListener("click", () => {
              const idComment = btn.getAttribute("button-like-comment");
              const link = `/comments/like/${idComment}`;

              fetch(link, { method: "PATCH" })
                .then((res) => {
                  if (res.status === 401) {
                    window.location.href = "/auth/login";
                    return null;
                  }
                  return res.json();
                })
                .then((data) => {
                  if (data && data.code === 200) {
                    btn.querySelector(".count").textContent = data.likeCount;
                    const dislikeBtn = btn.parentElement.querySelector(
                      "[button-dislike-comment]",
                    );
                    if (dislikeBtn) {
                      dislikeBtn.querySelector(".count").textContent =
                        data.dislikeCount;
                    }
                    if (data.isLiked) btn.classList.add("active");
                    else btn.classList.remove("active");
                    if (data.isDisliked) {
                      dislikeBtn.classList.add("active");
                    } else {
                      dislikeBtn && dislikeBtn.classList.remove("active");
                    }
                  }
                });
            });
          });
        }

        if (commentDislikeButtons.length > 0) {
          commentDislikeButtons.forEach((btn) => {
            btn.addEventListener("click", () => {
              const idComment = btn.getAttribute("button-dislike-comment");
              const link = `/comments/dislike/${idComment}`;

              fetch(link, { method: "PATCH" })
                .then((res) => {
                  if (res.status === 401) {
                    window.location.href = "/auth/login";
                    return null;
                  }
                  return res.json();
                })
                .then((data) => {
                  if (data && data.code === 200) {
                    btn.querySelector(".count").textContent = data.dislikeCount;
                    const likeBtn = btn.parentElement.querySelector(
                      "[button-like-comment]",
                    );
                    if (likeBtn)
                      likeBtn.querySelector(".count").textContent =
                        data.likeCount;
                    if (data.isDisliked) btn.classList.add("active");
                    else btn.classList.remove("active");
                    if (data.isLiked) likeBtn.classList.add("active");
                    else likeBtn && likeBtn.classList.remove("active");
                  }
                });
            });
          });
        }
      })
      .catch(() => {
        commentsList.innerHTML = `<div class="no-comments"><p>Không thể tải bình luận</p></div>`;
      });
  });
}

// Comment Like/Dislike Actions
const commentLikeButtons = document.querySelectorAll("[button-like-comment]");

const commentDislikeButtons = document.querySelectorAll(
  "[button-dislike-comment]",
);

if (commentLikeButtons.length > 0) {
  commentLikeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const idComment = btn.getAttribute("button-like-comment");
      const link = `/comments/like/${idComment}`;

      fetch(link, { method: "PATCH" })
        .then((res) => {
          // Check if response is 401 Unauthorized (not logged in) - might redirect or return error
          if (res.status === 401) {
            window.location.href = "/auth/login";
            return null;
          }
          return res.json();
        })
        .then((data) => {
          if (data && data.code === 200) {
            // Update UI
            btn.querySelector(".count").textContent = data.likeCount;
            const dislikeBtn = btn.parentElement.querySelector(
              "[button-dislike-comment]",
            );
            if (dislikeBtn) {
              dislikeBtn.querySelector(".count").textContent =
                data.dislikeCount;
            }

            if (data.isLiked) {
              btn.classList.add("active");
            } else {
              btn.classList.remove("active");
            }

            if (data.isDisliked) {
              dislikeBtn.classList.add("active");
            } else {
              dislikeBtn.classList.remove("active");
            }
          } else if (data && data.code !== 200) {
            if (data.message === "Vui lòng đăng nhập!") {
              // assuming auth.middleware might send this
              window.location.href = "/auth/login";
            } else {
              alert(data.message);
            }
          }
        });
    });
  });
}

if (commentDislikeButtons.length > 0) {
  commentDislikeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const idComment = btn.getAttribute("button-dislike-comment");
      const link = `/comments/dislike/${idComment}`;

      fetch(link, { method: "PATCH" })
        .then((res) => {
          if (res.status === 401) {
            window.location.href = "/auth/login";
            return null;
          }
          return res.json();
        })
        .then((data) => {
          if (data && data.code === 200) {
            // Update UI
            btn.querySelector(".count").textContent = data.dislikeCount;
            const likeBtn = btn.parentElement.querySelector(
              "[button-like-comment]",
            );
            if (likeBtn) {
              likeBtn.querySelector(".count").textContent = data.likeCount;
            }

            if (data.isDisliked) {
              btn.classList.add("active");
            } else {
              btn.classList.remove("active");
            }

            if (data.isLiked) {
              likeBtn.classList.add("active");
            } else {
              likeBtn.classList.remove("active");
            }
          } else if (data && data.code !== 200) {
            if (data.message === "Vui lòng đăng nhập!") {
              window.location.href = "/auth/login";
            } else {
              alert(data.message);
            }
          }
        });
    });
  });
}
