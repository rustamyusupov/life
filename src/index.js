const init = async () => {
  const version = document.getElementById("version");

  version.textContent = __APP_VERSION__;
};

document.addEventListener("DOMContentLoaded", init);
