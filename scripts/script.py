from pathlib import Path
import gradio as gr

from modules import scripts

base = Path(scripts.basedir())

default = """# square
1024 x 1024

> Portrait
640 x 1536
768 x 1344
832 x 1216
896 x 1152

> Landscape
1536 x 640
1344 x 768
1216 x 832
1152 x 896
"""

class SDSimpleDimensionPreset(scripts.Script):
    def __init__(self):
        self.preset = base / 'simple-preset.txt'

    def load(self):
        v = self.preset.read_text(encoding='utf-8') if self.preset.exists() else default
        yield gr.Code.update(value=v)

    def save(self, i):
        self.preset.write_text(i, encoding='utf-8')
        yield gr.Code.update(value=str(i))

    def title(self):
        return 'SD Simple Dimension Preset'

    def show(self, is_img2img):
        return scripts.AlwaysVisible

    def ui(self, is_img2img):
        with gr.Row(elem_id='SD-Simple-DP-Row'), gr.Column(elem_id='SD-Simple-DP-Column'):
            editor = gr.Code(max_lines=20, language=None, interactive=True, elem_id='SD-Simple-DP-Editor')

            saveBtn = gr.Button('Save', variant='primary', elem_id='SD-Simple-DP-Save-Button')
            saveBtn.click(self.save, editor, editor)

            loadBtn = gr.Button(visible=False, elem_id='SD-Simple-DP-Load-Button')
            loadBtn.click(self.load, [], editor)