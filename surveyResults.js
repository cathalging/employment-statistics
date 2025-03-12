import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getDatabase, ref, get} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";

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

async function processSurveyData() {
    try {
        // Reference the 'responses' node in the database
        const responsesRef = ref(database, 'responses');

        // Fetch the data
        const snapshot = await get(responsesRef);

        // In case I cleared the database
        if (!snapshot.exists()) {
            console.log("No data available");
            return;
        }

        // Convert the data to an array of responses
        const responses = Object.values(snapshot.val());

        // Initialize variables for calculations
        let totalMonthsWorked = 0;
        let averageMonthsWorked
        const monthCounts = {
            january: 0,
            february: 0,
            march: 0,
            april: 0,
            may: 0,
            june: 0,
            july: 0,
            august: 0,
            september: 0,
            october: 0,
            november: 0,
            december: 0
        };
        let trueFeedbackCount = 0;
        let falseFeedbackCount = 0;

        // Process each response
        responses.forEach(response => {

            // Calculate total months worked
            totalMonthsWorked += parseInt(response.monthsWorked, 10);
            // Calculate the average months worked
            averageMonthsWorked = totalMonthsWorked / responses.length;

            // Count appearances of each month
            if (monthCounts.hasOwnProperty(response.month)) {
                monthCounts[response.month]++;
            }

            // Count feedback
            if (response.feedback === "true") {
                trueFeedbackCount++;
            } else if (response.feedback === "false") {
                falseFeedbackCount++;
            }
        });

        // Return the results for use in other parts of your app
        return {
            averageMonthsWorked,
            monthCounts,
            trueFeedbackCount,
            falseFeedbackCount
        };
    } catch (error) {
        console.error("Error processing survey data:", error);
    }
}

window.onload = function() {
    let averageMonthsWorked, monthCounts, trueFeedbackCount, falseFeedbackCount;

    processSurveyData().then(results => {
        averageMonthsWorked = results.averageMonthsWorked
        monthCounts = results.monthCounts
        trueFeedbackCount = results.trueFeedbackCount
        falseFeedbackCount = results.falseFeedbackCount
    }).then(() => {

        // Bar Chart
        const monthLabels = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const barData = {
            labels: monthLabels,
            datasets: [{
                label: "Number of users",
                data: Object.values(monthCounts),
                backgroundColor: "#F5CB5C",
                borderColor: "#E8EDDF",
                borderWidth: 2
            }]
        }

        let barCanvas = document.getElementById("monthsWorkedBar")
        let barCtx = barCanvas.getContext('2d');
        new Chart(barCtx, {
            type: 'bar',
            data: barData,
            options: {
                // Fixes graph resizing issue
                responsive: false,
                maintainAspectRatio: false,
                devicePixelRatio: 4,
                scales: {
                    x: { title: { display: true, text: "Users" , color: "#E8EDDF"}, ticks: {color: "#E8EDDF"}},
                    y: { title: { display: true, text: "Month",  color: "#E8EDDF" }, ticks: {color: "#E8EDDF"}, beginAtZero: true},
                }
            }
        });

        // Donut Chart
        const doughnutChartData = {
            labels: ["Yes", "No"],
            datasets: [{
                label: "Number of users",
                data: [trueFeedbackCount, falseFeedbackCount],
                backgroundColor: ["#F5CB5C", "#333533"]
            }],

        }

        let doughnutCanvas = document.getElementById("feedbackDoughnut")
        let doughnutCtx = doughnutCanvas.getContext('2d');

        new Chart(doughnutCtx, {
            type: 'doughnut',
            data: doughnutChartData,
            options: {
                // Fixes graph resizing issue
                responsive: false,
                maintainAspectRatio: false,
                devicePixelRatio: 4,

            }
        })

    })

}
