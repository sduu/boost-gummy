(function () {
  let footerTop = document.querySelector('.footer').offsetTop - window.innerHeight;
  let isMobile;
  let scrollTop;
  let bodyOffsetHeight;

  /* Smooth Scrollbar */
  const smoothScroll = window.Scrollbar.init(document.querySelector('#scroll-content'), {thumbMinSize: 10, speed: 2});

  smoothScroll.addListener(function (e) {
    var _this = this;
    ScrollTrigger.update();

    scrollTop = _this.offset.y;
    bodyOffsetHeight = _this.limit.y;

    /* 위치 고정 */
    if (scrollTop < footerTop && !isMobile) {
      canvasWrap.style.top = scrollTop + 'px';
    }
  });

  /* Scroll Trigger */
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.defaults({scroller: document.querySelector('#scroll-content')});

  ScrollTrigger.scrollerProxy('#scroll-content', {
    scrollTop(value) {
      if (arguments.length) {
        smoothScroll.scrollTop = value;
      }
      return smoothScroll.scrollTop;
    },
  });

  /* 모바일 체크 */
  ScrollTrigger.matchMedia({
    '(max-width: 767px)': function () {
      isMobile = true;
    },
    '(min-width: 768px)': function () {
      isMobile = false;
    },
  });

  /* canvas scroll interaction */
  const canvasWrap = document.querySelector('#scene-content');
  const canvas = canvasWrap.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  function initCanvas() {
    const sceneClip = new Image();
    const sceneNum = 299;
    const sceneArray = [];
    let scenePos = {x: 0};
    let sceneSize;
    let sceneEl;
    let currentScene;
    let progress;
    let frame;
    let resizeTimer;

    sceneClip.src = './../assets/images/frame/A_00000_alpha.png';

    for (let i = 0; i <= sceneNum; i++) {
      let index = i + '';
      sceneEl = new Image();
      sceneEl.src = `./../assets/images/frame/A_${index.padStart(5, '0')}.webp`;
      sceneArray.push(sceneEl);
    }

    resize();
    update();

    window.addEventListener('resize', function () {
      resize();
    });

    const moveCenter = gsap.fromTo(
      scenePos,
      {x: () => 0.35 * canvas.offsetWidth},
      {
        x: 0,
        scrollTrigger: {
          trigger: '.header',
          start: 'top top',
          endTrigger: '.main-section-2',
          end: 'top top',
          scrub: true,
          markers: true,
          invalidateOnRefresh: true,
        },
      }
    );

    function drawScene() {
      ctx.save();
      ctx.drawImage(sceneClip, canvas.width / 2 - sceneSize / 2 + scenePos.x, canvas.height / 2 - sceneSize / 2, sceneSize, sceneSize);
      ctx.globalCompositeOperation = 'source-in';
      ctx.drawImage(sceneArray[currentScene], canvas.width / 2 - sceneSize / 2 + scenePos.x, canvas.height / 2 - sceneSize / 2, sceneSize, sceneSize);

      ctx.restore();
    }

    function update() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      progress = Math.min(scrollTop / (footerTop / 4), 4) || 0;
      progress = progress - Math.trunc(progress);
      currentScene = Math.round(sceneNum * progress);

      drawScene();

      frame = requestAnimationFrame(update);
    }

    function resize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        cancelAnimationFrame(frame);

        if (isMobile) return;

        canvas.width = canvasWrap.offsetWidth;
        canvas.height = canvasWrap.offsetHeight;

        footerTop = document.querySelector('.footer').offsetTop - window.innerHeight;
        sceneSize = (580 / 1280) * canvas.offsetWidth;

        update();
      }, 300);
    }
  }

  /* init event */
  window.addEventListener('load', initCanvas);
})();
