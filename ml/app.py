import gradio as gr
from predict import predict_text

def predict(text):
    result = predict_text(text)
    return result

iface = gr.Interface(
    fn=predict,
    inputs=gr.Textbox(
        lines=3,
        placeholder="Tulis perasaan Anda..."
    ),
    outputs="json",
    title="Mental Health NLP Model",
    description="Analisis kesehatan mental berbasis NLP"
)

iface.launch()