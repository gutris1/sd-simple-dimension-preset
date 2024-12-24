function LoadSimplePreset(box) {
  fetch("file=extensions/sd-simple-resolution-preset/simple-preset.txt", { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error('Failed to fetch simple-preset.txt');
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
          const SimpleRLabel = document.createElement('div');
          SimpleRLabel.id = 'Simple-R-Label';
          SimpleRLabel.innerText = `${Label}`;
          BoxContent += SimpleRLabel.outerHTML;
        } else if (textLine.includes('x') && !textLine.startsWith('#')) {
          const [width, height] = textLine.split('x').map(Number);

          if (!isNaN(width) && !isNaN(height)) {
            const SimpleRButton = document.createElement('button');
            SimpleRButton.id = 'Simple-R-Button';
            SimpleRButton.setAttribute('data-width', width);
            SimpleRButton.setAttribute('data-height', height);
            SimpleRButton.innerText = `${width} x ${height}`;
            BoxContent += SimpleRButton.outerHTML;
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
      box.innerText = "Simple Resolution Preset Die.";
    });
}

function SimpleRBoxPosition(btn, box) {
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

function SimpleREvent(btn, box) {
  btn.addEventListener('click', () => {
    const SimpleRBox = box.style.display === 'none' ? 'block' : 'none';
    box.style.display = SimpleRBox;

    if (SimpleRBox === 'block') {
      btn.style.border = '2px solid var(--primary-500)';
      SimpleRBoxPosition(btn, box);
    } else {
      btn.style.border = 'none';
    }
  });
}

onUiLoaded(function () {
  let rows;
  let isThatForge = gradioApp().querySelector('.gradio-container-4-40-0') !== null;

  if (isThatForge) {
    rows = gradioApp().querySelectorAll("#txt2img_dimensions_row, #img2img_dimensions_row");
  } else {
    rows = gradioApp().querySelectorAll("#txt2img_dimensions_row .form, #img2img_dimensions_row .form");
  }

  const switchBtns = gradioApp().querySelectorAll("#txt2img_res_switch_btn, #img2img_res_switch_btn");

  const SimpleRdiv = document.createElement('div');
  SimpleRdiv.id = 'Simple-R';

  const SimpleRButton = switchBtns[0].cloneNode(true);
  SimpleRButton.id = 'Simple-R-Main-Button';
  SimpleRButton.title = 'Simple Resolution Preset';
  SimpleRButton.innerHTML = `
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

  const SimpleRBox = document.createElement('div');
  SimpleRBox.id = 'Simple-R-Box';
  SimpleRBox.classList.add('prose');
  SimpleRBox.style.display = 'none';

  SimpleRdiv.appendChild(SimpleRButton);
  SimpleRdiv.appendChild(SimpleRBox);

  rows.forEach((row, index) => {
    const clone = index === 0 ? SimpleRdiv : SimpleRdiv.cloneNode(true);
    row.insertBefore(clone, switchBtns[index]);

    const btn = clone.querySelector('#Simple-R-Main-Button');
    const box = clone.querySelector('#Simple-R-Box');

    LoadSimplePreset(box);
    SimpleREvent(btn, box);
  });

  window.addEventListener('resize', () => {
    document.querySelectorAll('#Simple-R-Box').forEach((box, index) => {
      if (box.style.display === 'block') {
        const btn = box.parentElement.querySelector('#Simple-R-Main-Button');
        SimpleRBoxPosition(btn, box);
      }
    });
  });

  function ClickOutsideEL(e) {
    document.querySelectorAll('#Simple-R-Box').forEach(box => {
      const btn = box.parentElement.querySelector('#Simple-R-Main-Button');
      if (box.style.display === 'block' && !box.contains(e.target) && !btn.contains(e.target)) {
        box.style.display = 'none';
        btn.style.border = 'none';
      }
    });
  }

  document.addEventListener('mousedown', ClickOutsideEL);
  document.addEventListener('touchstart', ClickOutsideEL, { passive: true });
});
