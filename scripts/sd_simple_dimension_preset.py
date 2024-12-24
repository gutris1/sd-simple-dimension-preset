from modules import shared, scripts
from pathlib import Path
import gradio as gr


sdp_root = Path(scripts.basedir())
default_presets = (sdp_root / 'simple-preset.txt').read_text(encoding='utf-8')
example_md = (sdp_root / 'examples.md').read_text(encoding='utf-8')


class OptionMarkdown(shared.OptionInfo):
    def __init__(self, text):
        super().__init__(str(text).strip(), label='', component=lambda **kwargs: gr.Markdown(**kwargs))
        self.do_not_save = True


shared.options_templates.update(shared.options_section(('simple-dimension-preset', 'Simple Dimension Preset'), {
    "simple_dimension_preset_doc": OptionMarkdown(example_md),
    "simple_dimension_preset_config": shared.OptionInfo(default_presets, 'simple dimension preset', gr.Code),
}))
