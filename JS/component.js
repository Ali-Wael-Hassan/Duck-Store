document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('nav');
  const aside = document.querySelector('aside');
  const mainComp = document.querySelector('main');

  function updateAsideTop() {
    if (nav && aside) {
      const navHeight = nav.offsetHeight;
      aside.style.top = `${navHeight}px`;
    }
  }

  function updateMain() {
    if (mainComp) {
      if(nav) {
        const navHeight = nav.offsetHeight;
        mainComp.style.marginTop = `${navHeight}px`;
      }

      if(aside) {
        const asideWidth = aside.offsetWidth;
        mainComp.style.marginLeft = `${asideWidth}px`;
      }
    }
    
  }

  function resizeAll() {
    updateAsideTop();
    updateMain();
  }

  const resizeObserver = new ResizeObserver(() => {
    resizeAll();
  });

  if (nav) {
    resizeObserver.observe(nav);
  }

  window.addEventListener('resize', resizeAll);
  resizeAll();
});