document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('nav');
  const aside = document.querySelector('aside');

  function updateAsideTop() {
    if (nav && aside) {
      const navHeight = nav.offsetHeight;
      aside.style.top = `${navHeight}px`;
    }
  }

  const resizeObserver = new ResizeObserver(() => {
    updateAsideTop();
  });

  if (nav) {
    resizeObserver.observe(nav);
  }

  window.addEventListener('resize', updateAsideTop);
  updateAsideTop();
});