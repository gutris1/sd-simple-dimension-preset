from modules import shared, scripts
from pathlib import Path
import gradio as gr

sdp_root = Path(scripts.basedir())
default_path = sdp_root / 'simple-preset.txt'
default_presets = default_path.read_text(encoding='utf-8')
example_md = (sdp_root / 'examples.md').read_text(encoding='utf-8')

class OptionMarkdown(shared.OptionInfo):
    def __init__(self, text):
        super().__init__(str(text).strip(), label='', component=lambda **kwargs: gr.Markdown(**kwargs))
        self.do_not_save = True

shared.options_templates.update(shared.options_section(('simple-dimension-preset', 'Simple Dimension Preset'), {
    "simple_dimension_preset_doc": OptionMarkdown(example_md),
    "simple_dimension_preset_config": shared.OptionInfo(default_presets, 'simple dimension preset', gr.Code),
}))

class Script(scripts.Script):
    def title(self):
        return "Simple Dimension Preset"

    def show(self, is_img2img):
        return scripts.AlwaysVisible

    def ui(self, is_img2img):
        testBox = gr.Textbox(
            visible=False,
            lines=10,
            show_label=False,
            elem_id="simple_dimension_preset_holder"
        )

        testBox.change(
            fn=self.saving_preset,
            inputs=[testBox],
            outputs=[]
        )

    def saving_preset(self, inputs):
        with default_path.open("w", encoding="utf-8") as file:
            file.write(inputs)

        shared.options_templates['simple_dimension_preset_config'].value = inputs
