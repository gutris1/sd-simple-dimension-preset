async function waitForOpts() {
  for (; ;) {
    if (window.opts && Object.keys(window.opts).length) {
      return window.opts;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function LoadSimplePreset(box) {
  var loadedOpts = await waitForOpts();
  var text = loadedOpts.simple_dimension_preset_config
  var lines = text.split('\n');
  var Label = null;
  var BoxContent = '';
  console.log(text);

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
  addButtonEvents(box);
}

function addButtonEvents(box) {
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
}

function UpdateSimpleBox(box, trimmedText) {
  let BoxContent = '';
  const text = trimmedText.split('\n');

  text.forEach((line) => {
    const Lines = line.trim();

    if (Lines.startsWith('>')) {
      let Label = Lines.replace('>', '').trim();
      BoxContent += `<div id="Simple-R-Label">${Label}</div>`;
    } else if (Lines.includes('x') && !Lines.startsWith('#')) {
      const [width, height] = Lines.split('x').map(Number);

      if (!isNaN(width) && !isNaN(height)) {
        BoxContent += `
          <button 
            id="Simple-R-Button" 
            data-width="${width}" 
            data-height="${height}">
            ${width} x ${height}
          </button>
        `;
      }
    }
  });

  box.innerHTML = BoxContent;
  addButtonEvents(box);
}

function SimpleSaveButton(box) {
  const column = gradioApp().querySelector('#column_settings_simple-dimension-preset');
  const config = gradioApp().querySelector('#setting_simple_dimension_preset_config');

  if (column && config) {
    const SaveDiv = document.createElement('div');
    SaveDiv.id = 'setting_simple_dimension_preset_save';

    const SaveButton = document.createElement('button');
    SaveButton.id = 'setting_simple_dimension_preset_save_button';
    SaveButton.className = 'lg primary gradio-button svelte-cmf5ev';
    SaveButton.textContent = 'Save';
    SaveButton.title = 'Save Simple Preset';

    SaveDiv.appendChild(SaveButton);
    column.insertBefore(SaveDiv, config.nextSibling);

    SaveButton.addEventListener('click', async () => {
      const cmContent = config.querySelector('.cm-content');
      if (cmContent) {
        const lines = Array.from(cmContent.children);
        let plainText = '';

        lines.forEach((line) => {
          if (line.classList.contains('cm-line')) {
            plainText += line.textContent + '\n';
          } else if (line.tagName.toLowerCase() === 'br') {
            plainText += '\n';
          }
        });

        async function waitForOpts() {
          for (; ;) {
            if (window.opts && Object.keys(window.opts).length) {
              return window.opts;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }

        let loadedOpts = await waitForOpts();
        let text = loadedOpts.simple_dimension_preset_config;
        let trimmedText = plainText.trim();
        let textarea = document.querySelector('#simple_dimension_preset_holder > label > textarea');
        let submitButton = document.querySelector('#tab_settings #settings_submit');

        if (textarea && text) {
          textarea.value = trimmedText;
          updateInput(textarea);
          text = trimmedText;
          console.log(text);
          UpdateSimpleBox(box, trimmedText);
          submitButton.click();
        }
      }
    });
  }
}

function SimpleRBoxPosition(btn, box, set) {
  const btnRect = btn.getBoundingClientRect();
  const viewport = window.innerWidth;
  const mainButton = 190;
  const spacing = viewport - (btnRect.left + btnRect.width);

  box.style.left = '';
  box.style.right = '';
  set.style.left = '';
  set.style.right = '';

  if (spacing < mainButton + 10) {
    box.style.right = '1%';
    set.style.right = '0rem';
    setTimeout(() => {
      set.style.right = '4.2rem';
    }, 10);
  } else {
    box.style.left = '1%';
    set.style.left = '0rem';
    setTimeout(() => {
      set.style.left = '4.2rem';
    }, 10);
  }
}

function SimpleREvent(btn, box, set) {
  btn.addEventListener('click', () => {
    const SimpleRBox = box.style.display === 'none' ? 'block' : 'none';
    const SimpleSettingButton = box.style.display === 'none' ? 'block' : 'none';
    box.style.display = SimpleRBox;
    set.style.display = SimpleSettingButton;
    set.style.left = '0';
    set.style.right = '0';

    if (SimpleRBox === 'block') {
      btn.style.boxShadow = '0 0 0 1.5px var(--button-secondary-text-color-hover)';
      btn.querySelector('svg').style.fill = 'var(--button-secondary-text-color-hover)';
      SimpleRBoxPosition(btn, box, set);
    } else {
      btn.style.boxShadow = 'none';
      btn.querySelector('svg').style.fill = '';
    }
  });

  set.addEventListener('click', () => {
    MoveToSettings();
  });
}

function MoveToSettings() {
  const settingSimple = Array.from(document.querySelectorAll('#tab_settings #settings .tab-nav button'))
    .find(button => button.textContent.trim() === 'Simple Dimension Preset');
  const settingsTab = Array.from(document.querySelectorAll('#tabs .tab-nav button'))
    .find(button => button.textContent.trim() === 'Settings');

  if (settingSimple) {
    settingSimple.click(); settingsTab.click();
  }
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
  SimpleRButton.title = 'Simple Dimension Preset';
  SimpleRButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
        width="40" height="40" viewBox="0 0 24 18" fill="transparent">
      <path fill=""
        d="M9 5a1 1 0 1 0 0 2 1 1 0 0 0 0-2z M6.17 5a3.001 3.001 0 0 1 5.66 0
        H19a1 1 0 1 1 0 2h-7.17a3.001 3.001 0 0 1-5.66 0H5a1 1 0 0 1 0-2h1.17z
        M15 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm -2.83 0a3.001 3.001 0 0 1 5.66 0
        H19a1 1 0 1 1 0 2h-1.17a3.001 3.001 0 0 1-5.66 0H5a1 1 0 1 1 0-2h7.17z">
      </path>
    </svg>
  `;

  const SimpleRBox = document.createElement('div');
  SimpleRBox.id = 'Simple-R-Box';
  SimpleRBox.classList.add('prose');
  SimpleRBox.style.display = 'none';

  const SimpleSettingButton = switchBtns[0].cloneNode(true);
  SimpleSettingButton.id = 'Simple-Setting-Button';
  SimpleSettingButton.title = 'Go To Settings';
  SimpleSettingButton.style.display = 'none';
  SimpleSettingButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" 
        width="35px" height="35px" viewBox="0 0 32 32">
      <path
        d="M27.758,10.366 l-1-1.732 c-0.552-0.957-1.775-1.284-2.732-0.732
        L23.5,8.206 C21.5,9.36,19,7.917,19,5.608 V5 c0-1.105-0.895-2-2-2 h-2
        c-1.105,0-2,0.895-2,2 v0.608 c0,2.309-2.5,3.753-4.5,2.598 L7.974,7.902
        C7.017,7.35,5.794,7.677,5.242,8.634 l-1,1.732 c-0.552,0.957-0.225,2.18,0.732,2.732
        L5.5,13.402 c2,1.155,2,4.041,0,5.196 l-0.526,0.304 c-0.957,0.552-1.284,1.775-0.732,2.732
        l1,1.732 c0.552,0.957,1.775,1.284,2.732,0.732 L8.5,23.794 c2-1.155,4.5,0.289,4.5,2.598
        V27 c0,1.105,0.895,2,2,2 h2 c1.105,0,2-0.895,2-2 v-0.608 c0-2.309,2.5-3.753,4.5-2.598
        l0.526,0.304 c0.957,0.552,2.18,0.225,2.732-0.732 l1-1.732 c0.552-0.957,0.225-2.18-0.732-2.732
        L26.5,18.598 c-2-1.155-2-4.041,0-5.196 l0.526-0.304 C27.983,12.546,28.311,11.323,27.758,10.366 z
        M16,20 a4,4 0 1,1 0,-8 a4,4 0 1,1 0,8 z"
        fill="transparent" stroke="" stroke-width="2"
      />
    </svg>
  `;

  SimpleRdiv.appendChild(SimpleRButton);
  SimpleRdiv.appendChild(SimpleRBox);
  SimpleRdiv.appendChild(SimpleSettingButton);

  rows.forEach((row, index) => {
    const clone = index === 0 ? SimpleRdiv : SimpleRdiv.cloneNode(true);
    row.insertBefore(clone, switchBtns[index]);

    const btn = clone.querySelector('#Simple-R-Main-Button');
    const box = clone.querySelector('#Simple-R-Box');
    const set = clone.querySelector('#Simple-Setting-Button');

    LoadSimplePreset(box);
    SimpleREvent(btn, box, set);
  });

  window.addEventListener('resize', () => {
    document.querySelectorAll('#Simple-R-Box').forEach((box, index) => {
      if (box.style.display === 'block') {
        const btn = box.parentElement.querySelector('#Simple-R-Main-Button');
        const set = box.parentElement.querySelector('#Simple-Setting-Button');
        SimpleRBoxPosition(btn, box, set);
      }
    });
  });

  function ClickOutsideEL(e) {
    document.querySelectorAll('#Simple-R-Box').forEach(box => {
      const btn = box.parentElement.querySelector('#Simple-R-Main-Button');
      const set = box.parentElement.querySelector('#Simple-Setting-Button');
      if (box.style.display === 'block' && !box.contains(e.target) && !btn.contains(e.target) && !set.contains(e.target)) {
        box.style.display = 'none';
        btn.style.boxShadow = 'none';
        set.style.display = 'none';
        set.style.left = '0';
        set.style.right = '0';
        btn.querySelector('svg').style.fill = '';
      }
    });
  }

  SimpleSaveButton(SimpleRBox);

  document.addEventListener('mousedown', ClickOutsideEL);
  document.addEventListener('touchstart', ClickOutsideEL, { passive: true });
});
