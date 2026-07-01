# Trash Sorting Assistant

Trash Sorting Assistant is an AI-powered web application that helps users classify waste items into the correct waste category. The application uses an image classification model to predict whether an uploaded or captured image belongs to categories such as cardboard, glass, metal, paper or plastic.

The goal of this project is to make waste sorting easier, more understandable and more accessible for users. By combining machine learning with a simple web interface, the application gives users a predicted waste category, a confidence score and sorting advice.

## Project Overview

This project was developed as an individual AI and Machine Learning project. The main focus was to train an image classification model and connect it to a working web application.

The application allows users to upload or capture an image of a waste item. The backend processes the image, sends it to the trained model and returns the predicted class with a confidence score. The frontend then displays the prediction result in a clear and user-friendly way.

## Features

* Image upload functionality
* Camera capture functionality
* Waste classification into multiple categories
* Prediction confidence score
* Sorting advice based on the predicted category
* Warning message when the model is uncertain
* Flask backend connected to a trained machine learning model
* User-friendly web interface

## Waste Categories

The model classifies waste into the following categories:

* Cardboard
* Glass
* Metal
* Paper
* Plastic

## Machine Learning Model

The project uses an image classification model **(EfficientNetB0)** trained with transfer learning. The model was trained to recognize different types of waste based on images.

During the project, the dataset was prepared, cleaned and split into training, validation and testing sets. The model was evaluated using accuracy, validation results and a confusion matrix to understand how well it performed on the different waste categories.

## Technologies Used

* Python
* TensorFlow
* EfficientNetB0
* Flask
* Flask-CORS
* NumPy
* Pillow
* HTML
* CSS
* JavaScript
* Machine Learning
* Computer Vision
* Image Classification


## How the Application Works

1. The user uploads or takes an image of a waste item.
2. The frontend sends the image to the Flask backend.
3. The backend preprocesses the image.
4. The trained machine learning model predicts the waste category.
5. The backend returns the predicted category and confidence score.
6. The frontend displays the result and gives sorting advice to the user.

## Running the Project Locally

### 1. Clone the repository

```bash
git clone https://github.com/alyarahasanova110505-max/Trash-Sorting-Assistant.git
cd Trash-Sorting-Assistant
```

### 2. Install backend dependencies

Go to the backend folder:

```bash
cd backend
```

Install the required packages:

```bash
py -3.12 -m pip install -r requirements.txt
```


```bash
py -3.12 -m pip install flask flask-cors tensorflow numpy pillow
```

### 3. Start the backend

```bash
py -3.12 app.py
```

### 4. Start the frontend

Open a new terminal and go to the frontend folder:

```bash
cd frontend
```

Start a local server:

```bash
py -3.12 -m http.server 5500
```

Then open the application in the browser:

```text
http://localhost:5500
```

## Note About Dataset and Model Files

The full dataset and trained model files are not included in this repository because they can be large. The repository mainly contains the project code, structure and explanation.

To run the full prediction system locally, the trained model file should be placed in the correct model folder expected by the backend.

## What I Learned

Through this project I learned how to build a complete AI-powered application by combining machine learning with backend and frontend development. I gained experience in dataset preparation, image preprocessing, transfer learning, model evaluation, API development and creating a user-friendly interface around an AI model.

This project helped me understand how computer vision can be used to solve practical everyday problems, such as improving waste sorting and supporting better recycling decisions.

## Author

Developed by Alyara Hasanova as part of a Software Engineering and AI/Machine Learning project.
