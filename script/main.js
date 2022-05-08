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
  gsap.registerPlugin(ScrollTrigger, TextPlugin);
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

  /* section-sticky interaction */
  let stickyStep;
  const stickyNum = 3;
  const stickyTimeline = gsap
    .timeline({
      scrollTrigger: {
        trigger: '.section-sticky',
        start: '0',
        end: `${stickyNum * 200}%`,
        pin: true,
        scrub: true,
        onUpdate: ({progress, direction, vars, isActive}) => {
          if (stickyStep !== Math.trunc(progress * stickyNum)) {
            stickyStep = Math.trunc(progress * stickyNum);
            stickyStep === stickyNum ? null : animateSticky(stickyStep);
          }
        },
      },
    })
    .fromTo('.section-sticky .deco-item', {opacity: 0, scale: 0}, {duration: 1, stagger: 0.2, opacity: 1, scale: 1, rotate: 30}, '<')
    .to('.section-sticky .deco-item', {duration: 1, stagger: 0.2, opacity: 0, scale: 1.5, rotate: 60})
    .repeat(2);

  function animateSticky(step = 0) {
    const detailTxt1 = [
      ['01. Provides Major Cold and Flu Relief', '02. Alleviates Sinus Infections', '03. Encourages Healthy Skin', '04. Reduces Inflammation'],
      ['01. Improves Common Cold Symptoms', '02. Holds Antioxidant Properties', '03. Promotes Glowing Skin', '04. Enhances Brain Function'],
      ['01. Acts as a Powerful Antioxidant', '02. Helps Balance Hormones', '03. Maintains Heart Health', '04. Aids in Digestion'],
    ];
    const detailTxt2 = ['BOOST has 150mg of Elderberry Extract per serving', 'BOOST has 100mg of Vitamin C per serving', 'BOOST has 10mg of Zinc per serving'];

    gsap.utils.toArray('.section-sticky .detail li').forEach((item, index) => {
      gsap.to(item, {text: {value: detailTxt1[step][index], padSpace: true}});
    });
    gsap.to('.section-sticky .detail p', {text: {value: detailTxt2[step], padSpace: true}});

    document.querySelectorAll('.section-sticky text').forEach((item, index) => {
      if (index === step) {
        item.classList.add('is-active');
      } else {
        item.classList.remove('is-active');
      }
    });

    document.querySelector('.section-sticky').classList = `section-sticky is-step-${step}`;

    if (step === 0) {
      gsap.to('body', {'background-color': '#ffb800', 'background-image': 'linear-gradient(315.01deg, #ff710d 8.31%, #ffb800 88.22%)'});
    } else if (step === 1) {
      gsap.to('body', {'background-color': '#6f00ff', 'background-image': 'linear-gradient(155.92deg, #929dff 5.36%, #3f52ff 85.08%)'});
    } else if (step === 2) {
      gsap.to('body', {
        'background-color': '#fff',
        'background-image': 'linear-gradient(154.45deg, rgba(0, 26, 255, 0.39) -60.92%, rgba(0, 26, 255, 0) 34.15%, rgba(0, 26, 255, 0.39) 108.43%)',
      });
      document.querySelector('.section-sticky').classList.add('is-inverse');
    }
  }

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
