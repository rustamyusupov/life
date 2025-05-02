const renderVersion = () => {
  const version = document.getElementById("version");
  version.textContent = __APP_VERSION__;
};

const init = () => {
  renderVersion();
};

document.addEventListener("DOMContentLoaded", init);
