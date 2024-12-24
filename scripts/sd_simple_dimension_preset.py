from modules import shared, scripts
from pathlib import Path
import gradio as gr


sdp_root = Path(scripts.basedir())
default_presets = (sdp_root / 'simple-preset.txt').read_text(encoding='utf-8')


shared.options_templates.update(shared.options_section(('simple-dimension-preset', 'Simple Dimension Preset'), {
    "simple_dimension_preset_config": shared.OptionInfo(default_presets, 'simple dimension preset', gr.Code),
}))
