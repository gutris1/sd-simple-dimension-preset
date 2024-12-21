function LoadSimpleAR(box) {
  fetch("file=extensions/sd-simple-aspect-ratio/simple-ar.txt", { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error('Failed to fetch ar.txt');
      return response.text();
    })
    .then((text) => {
      const lines = text.split('\n');
      let Label = null;
      let BoxContent = '';

      lines.forEach((line) => {
        const textLine = line.trim();

        if (textLine.startsWith('>')) {
          Label = textLine.replace('>', '').trim();
          const ARLabel = document.createElement('div');
          ARLabel.id = 'SimpleAR-label';
          ARLabel.innerText = `${Label}`;
          BoxContent += ARLabel.outerHTML;
        } else if (textLine.includes('x') && !textLine.startsWith('#')) {
          const [width, height] = textLine.split('x').map(Number);

          if (!isNaN(width) && !isNaN(height)) {
            const ARButton = document.createElement('button');
            ARButton.id = 'SimpleAR-button';
            ARButton.setAttribute('data-width', width);
            ARButton.setAttribute('data-height', height);
            ARButton.innerText = `${width} x ${height}`;
            BoxContent += ARButton.outerHTML;
          }
        }
      });

      box.innerHTML = BoxContent;

      box.querySelectorAll('button').forEach((btn) => {
        btn.addEventListener('click', () => {
          const W = btn.getAttribute('data-width');
          const H = btn.getAttribute('data-height');

          const txt2imgTab = document.getElementById('tab_txt2img');
          const img2imgTab = document.getElementById('tab_img2img');
          
          if (txt2imgTab && txt2imgTab.style.display === 'block') {
            const txt2imgW = document.querySelector('#txt2img_width input[type="number"]');
            const txt2imgH = document.querySelector('#txt2img_height input[type="number"]');

            if (txt2imgW && txt2imgH) {
              txt2imgW.value = W;
              txt2imgH.value = H;
              updateInput(txt2imgW);
              updateInput(txt2imgH);
            }
          } else if (img2imgTab && img2imgTab.style.display === 'block') {
            const img2imgW = document.querySelector('#img2img_width input[type="number"]');
            const img2imgH = document.querySelector('#img2img_height input[type="number"]');

            if (img2imgW && img2imgH) {
              img2imgW.value = W;
              img2imgH.value = H;
              updateInput(img2imgW);
              updateInput(img2imgH);
            }
          }
        });
      });
    })
    .catch((err) => {
      console.error(err);
      box.innerText = "Simple Aspect Ratio Die.";
    });
}

function SimpleARBoxPosition(btn, box) {
  const btnRect = btn.getBoundingClientRect();
  const viewport = window.innerWidth;
  const mainButton = 190;
  const spacing = viewport - (btnRect.left + btnRect.width);

  box.style.left = '';
  box.style.right = '';

  if (spacing < mainButton + 10) {
    box.style.right = '1%';
  } else {
    box.style.left = '1%';
  }
}

function AddSimpleAREvent(btn, box) {
  btn.addEventListener('click', () => {
    const ARBox = box.style.display === 'none' ? 'block' : 'none';
    box.style.display = ARBox;

    if (ARBox === 'block') {
      btn.style.border = '2px solid var(--primary-500)';
      SimpleARBoxPosition(btn, box);
    } else {
      btn.style.border = 'none';
    }
  });
}

onUiLoaded(function () {
  const rows = gradioApp().querySelectorAll("#txt2img_dimensions_row .form, #img2img_dimensions_row .form");
  const switchBtns = gradioApp().querySelectorAll("#txt2img_res_switch_btn, #img2img_res_switch_btn");

  const SimpleAR = document.createElement('div');
  SimpleAR.id = 'SimpleAR';

  const SimpleARButton = switchBtns[0].cloneNode(true);
  SimpleARButton.id = 'SimpleAR-main-button';
  SimpleARButton.title = 'Simple Aspect Ratio';
  SimpleARButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg"
        x="0px" y="0px" width="40" height="40"
        viewBox="0 0 24 18" fill="transparent">
      <path d=" 
        M9 5a1 1 0 1 0 0 2 1 1 0 0 0 0-2z
        M6.17 5a3.001 3.001 0 0 1 5.66 0
        H19a1 1 0 1 1 0 2h-7.17a3.001 3.001 0 0 1-5.66 0H5a1 1 0 0 1 0-2h1.17z
        M15 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm
        -2.83 0a3.001 3.001 0 0 1 5.66 0
        H19a1 1 0 1 1 0 2h-1.17a3.001 3.001 0 0 1-5.66 0H5a1 1 0 1 1 0-2h7.17z
      " fill="var(--primary-500)">
      </path>
    </svg>
  `;

  const SimpleARBox = document.createElement('div');
  SimpleARBox.id = 'SimpleAR-box';
  SimpleARBox.classList.add('prose');
  SimpleARBox.style.display = 'none';

  SimpleAR.appendChild(SimpleARButton);
  SimpleAR.appendChild(SimpleARBox);

  rows.forEach((row, index) => {
    const clone = index === 0 ? SimpleAR : SimpleAR.cloneNode(true);
    row.insertBefore(clone, switchBtns[index]);

    const btn = clone.querySelector('#SimpleAR-main-button');
    const box = clone.querySelector('#SimpleAR-box');

    LoadSimpleAR(box);
    AddSimpleAREvent(btn, box);
  });

  window.addEventListener('resize', () => {
    document.querySelectorAll('#SimpleAR-box').forEach((box, index) => {
      if (box.style.display === 'block') {
        const btn = box.parentElement.querySelector('#SimpleAR-main-button');
        SimpleARBoxPosition(btn, box);
      }
    });
  });

  function ClickOutsideAR(e) {
    document.querySelectorAll('#SimpleAR-box').forEach(box => {
      const btn = box.parentElement.querySelector('#SimpleAR-main-button');
      if (box.style.display === 'block' && !box.contains(e.target) && !btn.contains(e.target)) {
        box.style.display = 'none';
        btn.style.border = 'none';
      }
    });
  }

  document.addEventListener('mousedown', ClickOutsideAR);
  document.addEventListener('touchstart', ClickOutsideAR, { passive: true });
});
