from flask import Flask, render_template, request, send_file, jsonify
from PIL import Image, ImageDraw, ImageFont
import os
from io import BytesIO
import base64
import json

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=["POST"])
def generate_meme():
    files = request.files.getlist("image")
    top_text = request.form.get("top_text", "").upper()
    bottom_text = request.form.get("bottom_text", "").upper()
    font_name = request.form.get("font", "arial.ttf")
    font_color = request.form.get("font_color", "white")
    font_size = int(request.form.get("font_size", 60))
    text_positions = json.loads(request.form.get("text_positions", "{}"))

    edited_images = []

    try:
        font = ImageFont.truetype(font_name, size=font_size)

        for image_file in files:
            image = Image.open(image_file)
            draw = ImageDraw.Draw(image)

            # Add top text
            if top_text:
                top_text_position = text_positions.get("top", "center")
                if top_text_position == "left":
                    draw.text((10, 10), top_text, font=font, fill=font_color)
                elif top_text_position == "right":
                    top_text_bbox = draw.textbbox((0, 0), top_text, font=font)
                    top_text_width = top_text_bbox[2] - top_text_bbox[0]
                    draw.text((image.width - top_text_width - 10, 10), top_text, font=font, fill=font_color)
                else:
                    top_text_bbox = draw.textbbox((0, 0), top_text, font=font)
                    top_text_width = top_text_bbox[2] - top_text_bbox[0]
                    draw.text(((image.width - top_text_width) / 2, 10), top_text, font=font, fill=font_color)

            # Add bottom text
            if bottom_text:
                bottom_text_position = text_positions.get("bottom", "center")
                if bottom_text_position == "left":
                    draw.text((10, image.height - 60), bottom_text, font=font, fill=font_color)
                elif bottom_text_position == "right":
                    bottom_text_bbox = draw.textbbox((0, 0), bottom_text, font=font)
                    bottom_text_width = bottom_text_bbox[2] - bottom_text_bbox[0]
                    draw.text((image.width - bottom_text_width - 10, image.height - 60), bottom_text, font=font, fill=font_color)
                else:
                    bottom_text_bbox = draw.textbbox((0, 0), bottom_text, font=font)
                    bottom_text_width = bottom_text_bbox[2] - bottom_text_bbox[0]
                    draw.text(((image.width - bottom_text_width) / 2, image.height - 60), bottom_text, font=font, fill=font_color)

            # Save the resulting image to BytesIO object
            output = BytesIO()
            image.save(output, format="PNG")
            output.seek(0)
            edited_images.append(base64.b64encode(output.getvalue()).decode('utf-8'))

        return jsonify(edited_images)

    except Exception as e:
        return str(e), 500

@app.route('/download', methods=["POST"])
def download_image():
    image_data = request.json.get('image_data')
    image_data = base64.b64decode(image_data)
    image = Image.open(BytesIO(image_data))
    output = BytesIO()
    image.save(output, format="PNG")
    output.seek(0)
    return send_file(output, mimetype='image/png', as_attachment=True, download_name='edited_image.png')

if __name__ == "__main__":
    app.run(debug=True)
