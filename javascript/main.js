onUiLoaded(async () => {
  let cm, obsins;
  const { EditorView } = await import('https://esm.sh/@codemirror/view@6.4.1'),

  SDP = 'SD-Simple-DP',
  sdp = 'sd-simple-dp',
  sdps = `${sdp}-style`,
  mainBtn = `${sdp}-main-button`,
  activeBtn = `.${mainBtn}.${sdps}`,

  gradioApp = document.querySelector('body > gradio-app'),
  Row = document.getElementById(`${SDP}-Row`),
  Column = document.getElementById(`${SDP}-Column`),
  saveButton = document.getElementById(`${SDP}-Save-Button`),

  createEL = (t, o = {}) => {
    const l = document.createElement(t);
    for (const [k, v] of Object.entries(o)) {
      if (k === 'class') l.className = Array.isArray(v) ? v.join(' ') : v;
      else if (k === 'style' && typeof v === 'object') Object.assign(l.style, v);
      else if (k === 'html') l.innerHTML = v;
      else if (k === 'text') l.textContent = v;
      else if (k === 'children') l.append(...(Array.isArray(v) ? v : [v]));
      else if (k === 'dataset') Object.assign(l.dataset, v);
      else if (k in l) l[k] = v;
      else l.setAttribute(k, v);
    }
    return l;
  },

  registerEvents = () => {
    Box.querySelectorAll('span').forEach((btn) => {
      btn.onclick = () => {
        const w = btn.dataset.width, h = btn.dataset.height,
        activeTab = gradioApp.querySelector("#tab_txt2img[style*='display: block'], #tab_img2img[style*='display: block']"),
        tabName = activeTab.id.includes('txt2img') ? 'txt2img' : 'img2img',
        wn = gradioApp.querySelector(`#${tabName}_width input[type='number']`),
        hn = gradioApp.querySelector(`#${tabName}_height input[type='number']`);
        if (wn && hn) {
          wn.value = w; hn.value = h;
          updateInput(wn); updateInput(hn);
        }
      };
    });
  },

  updateBox = (t) => {
    Box.innerHTML = '';
    const lines = t.split('\n');

    let wrapper = null;

    lines.forEach((line) => {
      const textLine = line.trim();

      if (textLine.startsWith('>')) {
        wrapper = createEL('div', { class: `${sdp}-group` });
        const label = createEL('label', { class: `${sdp}-label`, text: textLine.replace('>', '').trim() });
        wrapper.append(label);
        Box.append(wrapper);
        return;
      }

      if (textLine.includes('x') && !textLine.startsWith('#')) {
        const [width, height] = textLine.split('x').map(Number);
        if (!isNaN(width) && !isNaN(height)) {
          const btn = createEL('span', { class: `${sdp}-button`, text: `${width} x ${height}`, dataset: { width, height } });
          (wrapper ? wrapper : Box).append(btn);
          return;
        }
      }

      wrapper = null;
    });

    registerEvents();
  },

  loadPreset = async () => {
    const res = await fetch(window.SDSimpleDPpath), text = await res.text();
    updateBox(text);
  },

  savePreset = () => {
    updateBox(cm.state.doc.toString().trim());
  },

  autoCorrect = (cm, editor) => {
    let timeout;
    const con = editor.querySelector('.cm-editor > .cm-scroller > .cm-content'),

    apply = () => {
      let m, p = [];
      const t = cm.state.doc.toString(),
      r = /(\d+)\s*[xX]\s*(\d+)/g;

      while ((m = r.exec(t)) !== null) {
        const cr = `${m[1]} x ${m[2]}`;
        if (m[0] !== cr) p.push({ from: m.index, to: m.index + m[0].length, insert: cr });
      }
      if (p.length) cm.dispatch({ changes: p });
    },

    obs = new MutationObserver(() => {
      clearTimeout(timeout);
      timeout = setTimeout(apply, 1000);
    });

    return {
      start: () => obs.observe(con, { childList: true, subtree: true, characterData: true }),
      stop: () => obs.disconnect()
    };
  },

  createSetting = () => {
    const editor = document.getElementById(`${SDP}-Editor`);
    if (editor) {
      const markdown = createEL('div', {  id: `${SDP}-Markdown`, class: 'prose', html: SDSimpleDimensionPreset.title() }),

      codeWrapper = editor.querySelector('.codemirror-wrapper'),
      exCloseButton = createEL('span', { id: `${SDP}-Example-Close-Button`, html: SDSimpleDimensionPreset.cross(), title: 'close info', onclick: function () { this.parentElement.style.display = ''; } }),
      exPre = createEL('pre', { html: SDSimpleDimensionPreset.example() }),
      exInfo = createEL('div', {  id: `${SDP}-Example-Info`, children: [exCloseButton, exPre] }),
      exDisplayButton = createEL('span', { id: `${SDP}-Example-Display-Button`, html: '?', title: 'display info', onclick: () => exInfo.style.display = 'flex' }),
      frame = createEL('span', { id: `${SDP}-Editor-Frame` }),
      link = createEL('a', {
        id: `${SDP}-Link`,
        href: 'https://github.com/gutris1/sd-simple-dimension-preset',
        text: 'v4',
        target: '_blank',
        rel: 'noopener noreferrer'
      });

      codeWrapper.parentElement.prepend(frame);
      codeWrapper.prepend(exDisplayButton, exInfo);
      Column.prepend(markdown, exitButton, link);

      setTimeout(() => {
        saveButton.onclick = () => {
          exCloseButton.click();
          saveButton.classList.add(sdps);
          savePreset();

          const wrap = document.querySelector('#SD-Simple-DP-Editor > .wrap.default'),
          obs = new MutationObserver(() => {
            if (!wrap.querySelector('.eta-bar')) {
              saveButton.classList.remove(sdps);
              obs.disconnect();
            }
          });

          obs.observe(wrap, { childList: true });
        };

        document.getElementById(`${SDP}-Load-Button`).click();
        gradioApp.querySelector('.gradio-container > .main').append(document.querySelector(`#txt2img_script_container #${SDP}-Row`));
        gradioApp.querySelector(`#img2img_script_container #${SDP}-Row`)?.remove();
      }, 1000);

      setTimeout(() => {
        (async () => {
          const ed = editor.querySelector('.cm-editor');
          cm = EditorView.findFromDOM(ed);
          obsins = autoCorrect(cm, editor);

          ed.addEventListener('focusin', () => frame.classList.add(sdps));
          ed.addEventListener('focusout', () => {
            frame.classList.remove(sdps);
            ed.querySelector('.cm-selectionLayer').innerHTML = '';
          });
        })();
      }, 1500);
    }
  },

  displaySetting = () => {
    let g = gradioApp ? gradioApp.offsetWidth : 0;
    closeBox(gradioApp.querySelector(activeBtn));
    document.body.style.overflow = 'hidden';
    const n = gradioApp.offsetWidth, w = n - g;
    if (w > 0) gradioApp.style.paddingRight = w + 'px';
    [Row, Column].forEach(el => el.classList.add(sdps));
    Row.style.visibility = 'visible';
    setTimeout(() => (Column.classList.remove(sdps), Row.focus()), 300);
    setTimeout(() => {
      Row.onkeydown = (e) => rowKeydown(e);
      exitButton.onclick = closeSetting;
    }, 1000);
    obsins.start();
  },

  closeSetting = () => {
    obsins.stop();
    Row.classList.remove(sdps);
    Column.classList.add(sdp);
    Row.onkeydown = exitButton.onclick = null;
    setTimeout(() => requestAnimationFrame(() => {
      gradioApp.style.paddingRight = document.body.style.overflow = Row.style.visibility = '';
      Row.blur?.() || document.activeElement === Row && document.body.focus();
      Column.classList.remove(sdp);
    }), 150);
  },

  displayBox = (btn, f = false) => {
    const rect = btn.getBoundingClientRect(),
    viewW = window.innerWidth,
    viewH = window.innerHeight,
    boxW = 182,
    boxH = parent.offsetHeight || 200,
    space = viewW - (rect.left + rect.width),
    spaceBelow = viewH - rect.bottom,
    W = `${boxW - rect.width}px`;

    svgGear.style.transition = '';

    if (spaceBelow >= boxH + 20) {
      parent.style.top = Gear.style.top = '0'; Gear.style.position = 'relative';
      setTimeout(() => requestAnimationFrame(() => Box.style.marginTop = '8px'), 1);
    } else {
      parent.style.bottom = Gear.style.top = '100%'; Gear.style.position = 'absolute';
      setTimeout(() => requestAnimationFrame(() => Box.style.marginBottom = '8px'), 1);
    }

    if (f) [parent, btn].forEach(el => el.classList.add(sdps));

    if (space >= boxW + 10) {
      parent.style.right = Box.style.right = ''; Box.style.left = Gear.style.left = '0';
      setTimeout(() => requestAnimationFrame(() => (Gear.style.left = W, svgGear.style.transform = 'rotate(180deg)')), 10);
    } else {
      parent.style.right = Box.style.right = '0'; Gear.style.left = W;
      setTimeout(() => requestAnimationFrame(() => (Gear.style.left = '0', svgGear.style.transform = 'rotate(-180deg)')), 10);
    }

    setTimeout(() => requestAnimationFrame(() => Gear.style.opacity = Box.style.opacity = '1'), 10);
  },

  closeBox = (btn) => {
    [parent, btn].forEach(el => el.classList.remove(sdps));
    [parent, Box, Gear, svgGear].forEach(el => el.removeAttribute('style'));
  },

  rowKeydown = (e) => {
    if (e.key === 'Escape') {
      document.getElementById(`${SDP}-Exit-Setting-Button`).click();
    } 
    else if ((e.key.toLowerCase() === 's') && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (saveButton.classList.contains(sdps)) return;
      saveButton.click();
    }
  },

  switchBtns = gradioApp.querySelectorAll('#txt2img_res_switch_btn, #img2img_res_switch_btn'),
  switchBtnClasses = Array.from(switchBtns[0].classList),

  Box = createEL('div', { id: `${SDP}-Box` }),
  Gear = createEL('button', {
    id: `${SDP}-Setting-Button`,
    class: switchBtnClasses,
    title: 'open setting',
    html: SDSimpleDimensionPreset.settingButton(),
    onclick: () => displaySetting()
  }),

  exitButton = createEL('span', {
    id: `${SDP}-Exit-Setting-Button`,
    html: SDSimpleDimensionPreset.cross(),
    title: 'close Setting'
  }),

  parent = createEL('div', { id: SDP, children: [Gear, Box] });
  document.body.append(parent);

  ['txt2img', 'img2img'].forEach((tabName, index) => {
    const Button = createEL('button', {
      id: `${SDP}-Main-Button-${tabName}`,
      class: [...switchBtnClasses, `${sdp}-main-button`],
      title: 'Simple Dimension Preset',
      html: SDSimpleDimensionPreset.mainButton()
    }),

    wrap = createEL('div', { id: `${SDP}-Wrap-${tabName}`, class: `${sdp}-wrap`, children: Button });
    switchBtns[index].parentNode.insertBefore(wrap, switchBtns[index]);

    Button.onclick = () => {
      if (parent.classList.contains(sdps)) {
        closeBox(Button);
      } else {
        wrap.append(parent);
        svgGear.style.transition = 'none';
        svgGear.style.transform = '';
        displayBox(Button, true);
      }
    };
  });

  ['mousedown', 'touchstart'].forEach(evt => {
    document.addEventListener(evt, e => {
      const btn = gradioApp.querySelector(activeBtn);
      if (parent.classList.contains(sdps) && (
        !btn || (!btn.contains(e.target) &&
        !Box.contains(e.target) &&
        !Gear.contains(e.target)
      ))) closeBox(btn);
    }, { passive: evt === 'touchstart' });
  });

  window.addEventListener('resize', () => {
    if (parent.classList.contains(sdps)) {
      const btn = gradioApp.querySelector(activeBtn);
      closeBox(btn);
      displayBox(btn, true);
    }
  });

  loadPreset();
  createSetting();
  Row.tabIndex = 0;
  const svgGear = document.getElementById(`${SDP}-Gear-SVG`);
});

document.addEventListener('DOMContentLoaded', async () => {
  window.getRunningScript = () => new Error().stack.match(/file=[^ \n]*\.js/)?.[0];
  const path = getRunningScript()?.match(/file=[^\/]+\/[^\/]+\//)?.[0];
  if (path) window.SDSimpleDPpath = `${path}simple-preset.txt?ts=${Date.now()}`;

  document.body.append(Object.assign(document.createElement('style'), {
    id: 'SD-Simple-DP-Style',
    textContent: /firefox/i.test(navigator.userAgent) ? SDSimpleDimensionPreset.fox() : SDSimpleDimensionPreset.webkit()
  }));
});

const SDSimpleDimensionPreset = {
fox: () => `
#SD-Simple-DP-Editor .cm-scroller {
  scrollbar-width: thin !important;
  scrollbar-color: var(--primary-400) transparent !important;
}
`,

webkit: () => `
#SD-Simple-DP-Editor .cm-scroller::-webkit-scrollbar {
  width: 6px !important;
}

#SD-Simple-DP-Editor .cm-scroller::-webkit-scrollbar-track {
  border-radius: 0px !important;
  margin-top: 32px !important;
  margin-bottom: 6px !important;
  background: transparent !important;
}
`,

mainButton: () => `
<svg xmlns='http://www.w3.org/2000/svg' x='0px' y='0px' width='40' height='40' viewBox='0 0 24 18' fill='transparent'>
<path fill=''
d='M9 5a1 1 0 1 0 0 2 1 1 0 0 0 0-2z M6.17 5a3.001 3.001 0 0 1 5.66 0
H19a1 1 0 1 1 0 2h-7.17a3.001 3.001 0 0 1-5.66 0H5a1 1 0 0 1 0-2h1.17z
M15 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm -2.83 0a3.001 3.001 0 0 1 5.66 0
H19a1 1 0 1 1 0 2h-1.17a3.001 3.001 0 0 1-5.66 0H5a1 1 0 1 1 0-2h7.17z'/>
</svg>
`,

settingButton: () => `
<svg id='SD-Simple-DP-Gear-SVG' xmlns='http://www.w3.org/2000/svg' x='0px' y='0px' width='35px' height='35px' viewBox='0 0 32 32' stroke='currentColor'>
<path
d='M27.758,10.366 l-1-1.732 c-0.552-0.957-1.775-1.284-2.732-0.732
L23.5,8.206 C21.5,9.36,19,7.917,19,5.608 V5 c0-1.105-0.895-2-2-2 h-2
c-1.105,0-2,0.895-2,2 v0.608 c0,2.309-2.5,3.753-4.5,2.598 L7.974,7.902
C7.017,7.35,5.794,7.677,5.242,8.634 l-1,1.732 c-0.552,0.957-0.225,2.18,0.732,2.732
L5.5,13.402 c2,1.155,2,4.041,0,5.196 l-0.526,0.304 c-0.957,0.552-1.284,1.775-0.732,2.732
l1,1.732 c0.552,0.957,1.775,1.284,2.732,0.732 L8.5,23.794 c2-1.155,4.5,0.289,4.5,2.598
V27 c0,1.105,0.895,2,2,2 h2 c1.105,0,2-0.895,2-2 v-0.608 c0-2.309,2.5-3.753,4.5-2.598
l0.526,0.304 c0.957,0.552,2.18,0.225,2.732-0.732 l1-1.732 c0.552-0.957,0.225-2.18-0.732-2.732
L26.5,18.598 c-2-1.155-2-4.041,0-5.196 l0.526-0.304 C27.983,12.546,28.311,11.323,27.758,10.366 z
M16,20 a4,4 0 1,1 0,-8 a4,4 0 1,1 0,8 z' fill='transparent' stroke-width='2'/>
</svg>
`,

cross: () => `
<svg width="100%" height="100%" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" xml:space="preserve"
stroke="currentColor" style="fill-rule: evenodd; clip-rule: evenodd; stroke-linecap: round; stroke-linejoin: round;">
<g transform="matrix(1.14096,-0.140958,-0.140958,1.14096,-0.0559523,0.0559523)">
<path d="M18,6L6.087,17.913" style="fill: none; fill-rule: nonzero; stroke-width: 5px;"/>
</g>
<path d="M4.364,4.364L19.636,19.636" style="fill: none; fill-rule: nonzero; stroke-width: 5px;"/>
</svg>
`,

title: () => `
<pre>
<h3 id='SD-Simple-DP-Title'>SD Simple Dimension Preset
</h3>Click ? button to see info.
Click Save button to save the preset.
</pre>
`,

example: () =>
`# square  <-- This is a comment
1024 x 1024  <-- This is the value

> Portrait  <-- This is the label
640 x 1536  <-- This is the value
768 x 1344
832 x 1216
896 x 1152

> Landscape  <-- This is the label
1536 x 640  <-- This is the value
1344 x 768
1216 x 832
1152 x 896`
}