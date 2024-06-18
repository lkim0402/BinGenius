from flask import Flask, render_template, request
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import load_img, img_to_array
from tensorflow.keras.applications.vgg16 import preprocess_input


app = Flask(__name__)

#loading the model
model = load_model('my_model.h5')

#creating classes
class_names = ['Cardboard', 'Glass', 'Metal', 'Paper', 'Plastic', 'Trash']

def prepare_image(image, target_size):
    if image.mode != 'RGB':
        image = image.convert('RGB')
    image = image.resize(target_size)
    image = img_to_array(image)
    image = np.expand_dims(image, axis=0)
    image = image / 255.0
    return image

#Creating routes
@app.route('/', methods=['GET'])
def hello_world():
    return render_template('index.html')

@app.route('/', methods=['POST'])
def predict():
    """
    1. User uploads the image
    2. Image is processed by the model
    3. Model returns the prediction
    4. Prediction is displayed to the user
    """
    imagefile = request.files['imagefile']
    image_path = "./images/" + imagefile.filename
    imagefile.save(image_path)
    
    
    #loading and preprocessing the image
    image = load_img(image_path, target_size=(150, 150))
    image = prepare_image(image, target_size=(150, 150))
    
    # Make prediction
    prediction = model.predict(image)
    predicted_class_index = np.argmax(prediction, axis=1)[0]
    predicted_class = class_names[predicted_class_index]
    confidence = prediction[0][predicted_class_index]

    return render_template('index.html', prediction=f"{predicted_class} with confidence {confidence:.2f}")


if __name__ == '__main__':
    app.run(port=3000, debug=True)
    
    