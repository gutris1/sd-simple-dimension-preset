from pathlib import Path
import gradio as gr

from modules import scripts

path = Path(scripts.basedir())

class SDSimpleDimensionPreset(scripts.Script):
    def __init__(self):
        self.preset = path / 'simple-preset.txt'

    def load(self):
        yield gr.Code.update(value=str(self.preset.read_text(encoding='utf-8')))

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