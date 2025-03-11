// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDSqm8jVq2pLkyGQy2E-4zWRXe-VnhDOyI",
    authDomain: "employmentsurvey-42be6.firebaseapp.com",
    databaseURL: "https://employmentsurvey-42be6-default-rtdb.firebaseio.com",
    projectId: "employmentsurvey-42be6",
    storageBucket: "employmentsurvey-42be6.firebasestorage.app",
    messagingSenderId: "334938476720",
    appId: "1:334938476720:web:cc003077836beca1c66b75",
    measurementId: "G-FRWXZL4NEC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

document.getElementById('submitButton').addEventListener('click', submitSurvey);

function submitSurvey() {
    alert("submitSurvey function called!"); // Debugging alert

    // Get form values
    const month = document.getElementById('month').value;
    const monthsWorked = document.getElementById('monthsWorked').value;
    const feedbackElement = document.querySelector('input[name="feedback"]:checked');
    const feedback = feedbackElement ? feedbackElement.value : null;

    alert(`Form values: Month = ${month}, Months Worked = ${monthsWorked}, Feedback = ${feedback}`); // Debugging alert

    if (!month || !monthsWorked || !feedback) {
        alert("Please fill out all fields.");
        return; // Stop the function if any field is empty
    }

    // Create an object to hold all the survey data
    const surveyData = {
        month: month,
        monthsWorked: monthsWorked,
        feedback: feedback
    };

    alert("Survey data: " + JSON.stringify(surveyData)); // Debugging alert

    // Reference the 'responses' node in the database
    const responsesRef = ref(database, 'responses');

    // Push the survey data to the 'responses' node
    push(responsesRef, surveyData)
        .then(() => {
            alert("Survey data submitted successfully!");
        })
        .catch((error) => {
            alert("Error submitting survey data: " + error);
        });
}