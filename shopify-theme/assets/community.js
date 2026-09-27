const communityCarousel = document.querySelector("[data-community-carousel]");
const communitySlides = [...document.querySelectorAll("[data-community-slide]")];
const communityCurrent = document.querySelector("[data-community-current]");
let communityIndex = 1;

function showCommunitySlide(nextIndex) {
  communityIndex = (nextIndex + communitySlides.length) % communitySlides.length;
  communitySlides.forEach((slide, index) => {
    const isActive = index === communityIndex;
    slide.classList.toggle("is-active", isActive);
    slide.setAttribute("aria-hidden", String(!isActive));
  });
  communityCurrent.textContent = String(communityIndex + 1).padStart(2, "0");
}

if (communityCarousel && communitySlides.length) {
  communityCarousel.querySelector("[data-community-previous]").addEventListener("click", () => showCommunitySlide(communityIndex - 1));
  communityCarousel.querySelector("[data-community-next]").addEventListener("click", () => showCommunitySlide(communityIndex + 1));

  let pointerStart = null;
  communityCarousel.addEventListener("pointerdown", (event) => { pointerStart = event.clientX; });
  communityCarousel.addEventListener("pointerup", (event) => {
    if (pointerStart === null) return;
    const distance = event.clientX - pointerStart;
    pointerStart = null;
    if (Math.abs(distance) < 48) return;
    showCommunitySlide(communityIndex + (distance < 0 ? 1 : -1));
  });
  communityCarousel.addEventListener("pointercancel", () => { pointerStart = null; });
}

