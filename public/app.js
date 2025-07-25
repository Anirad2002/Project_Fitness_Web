document.addEventListener('DOMContentLoaded', function () {
    const bmiForm = document.getElementById('bmi-form');
    const ppmForm = document.getElementById('ppm-form');

    if (bmiForm) {
        bmiForm.addEventListener('submit', function (event) {
            event.preventDefault();
            calculateBMI();
        });
    }

    if (ppmForm) {
        ppmForm.addEventListener('submit', function (event) {
            event.preventDefault();
            calculatePPM();
        });
    }
});

function calculateBMI() {
    const weight = parseFloat(document.getElementById("weight").value);
    const height = parseFloat(document.getElementById("height").value);
    const age = parseInt(document.getElementById("age").value);

    if (isNaN(weight) || isNaN(height)) {
        alert('Wprowadź poprawne parametry');
        return;
    }

    fetch(`/calculateBMI?weight=${weight}&height=${height}&age=${age}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById("WynikBMI").innerText = `Twoje BMI to: ${data.bmi}`;
            document.getElementById("BMIresult").innerText = `Twoja norma BMI to: ${data.result}`;
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Wystąpił błąd podczas obliczania BMI');
        });
}

function calculatePPM() {
    const weight_1 = parseFloat(document.getElementById("weight_1").value);
    const height_1 = parseFloat(document.getElementById("height_1").value);
    const age_1 = parseInt(document.getElementById("age_1").value);
    const gender = document.querySelector('input[name="gender"]:checked').value;
    const activityLevel = parseFloat(document.getElementById("activityLevel").value);
    const dietPoint = parseFloat(document.getElementById("dietPoint").value);

    if (isNaN(weight_1) || isNaN(height_1) || isNaN(age_1) || isNaN(activityLevel) || isNaN(dietPoint)) {
        alert('Wprowadź poprawne parametry');
        return;
    }

    const url = `/calculatePPM?weight_1=${weight_1}&height_1=${height_1}&age_1=${age_1}&gender=${gender}&activityLevel=${activityLevel}&dietPoint=${dietPoint}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            document.getElementById("callories").innerText = `Twoja podstawowe dzienne zapotrzebowanie przy wybranym celu i aktywności to ${data.callories} kcal`;
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Wystąpił błąd podczas obliczania PPM');
        });
}

