(() => {
  'use strict';

  const fig = document.getElementById('gauge-3d');
  const stage = document.getElementById('gauge-stage');
  const btn = document.getElementById('gauge-spin');
  const poster = stage ? stage.querySelector('img.gauge-poster') : null;
  if (!fig || !stage || !btn || !poster) return;

  let loaded = false;

  const fail = (msg) => {
    stage.removeAttribute('aria-busy');
    btn.disabled = true;
    btn.textContent = msg;
  };

  const buildViewer = () => {
    const mv = document.createElement('model-viewer');
    mv.setAttribute('src', btn.dataset.src || '');
    mv.setAttribute('alt', poster.getAttribute('alt') || '');
    mv.setAttribute('camera-controls', '');
    mv.setAttribute('disable-zoom', '');
    mv.setAttribute('touch-action', 'pan-y');
    mv.setAttribute('interaction-prompt', 'none');
    mv.setAttribute('shadow-intensity', '0');
    mv.setAttribute('environment-image', 'neutral');
    mv.setAttribute('loading', 'eager');
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      mv.setAttribute('auto-rotate', '');
    }
    stage.appendChild(mv);

    let timer = 0;
    const cleanup = () => {
      clearTimeout(timer);
      mv.removeEventListener('load', onLoad);
      mv.removeEventListener('error', onError);
    };
    const onFail = (msg) => {
      cleanup();
      if (mv.parentNode) mv.parentNode.removeChild(mv);
      fail(msg);
    };
    const onLoad = () => {
      cleanup();
      stage.classList.add('is-3d');
      stage.removeAttribute('aria-busy');
      btn.hidden = true;
    };
    const onError = () => onFail('Could not load the 3D model; the still stays.');

    mv.addEventListener('load', onLoad);
    mv.addEventListener('error', onError);
    timer = setTimeout(() => {
      if (!stage.classList.contains('is-3d')) {
        onFail('3D took too long to load; the still stays.');
      }
    }, 20000);
  };

  const load = () => {
    if (loaded) return;
    loaded = true;

    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) {
      fail('3D is not available in this browser; the still stays.');
      return;
    }

    stage.setAttribute('aria-busy', 'true');
    btn.disabled = true;
    btn.textContent = 'Loading 3D…';

    if (window.customElements && customElements.get('model-viewer')) {
      buildViewer();
      return;
    }

    const s = document.createElement('script');
    s.type = 'module';
    s.src = btn.dataset.viewer || '';
    s.addEventListener('error', () => {
      fail('Could not load the 3D viewer; the still stays.');
    });
    s.addEventListener('load', () => {
      customElements.whenDefined('model-viewer').then(buildViewer).catch(() => {
        fail('Could not load the 3D viewer; the still stays.');
      });
    });
    document.head.appendChild(s);
  };

  btn.addEventListener('click', load);

  if (window.matchMedia('(min-width: 601px)').matches && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        load();
      }
    }, { threshold: 0.25 });
    io.observe(fig);
  }
})();
