export const initUmami = () => {
  const script = document.createElement("script");
  script.src = "https://stats.craftroulette.live/script.js";
  script.defer = true;
  script.dataset.websiteId = "e34c081c-f7d3-41ee-9ebf-30baade2e00a";
  script.dataset.autoTrack = "true";
  script.dataset.doNotTrack = "true"; // Respects user's DNT setting
  document.head.appendChild(script);
};
