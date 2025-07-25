function calculateBMI(){

    const weight = parseFloat(document.getElementById("weight").value);
    const height = parseFloat(document.getElementById("height").value);
    const age = parseInt(document.getElementById("age").value);

    if (isNaN(weight) || isNaN(height) || isNaN(age)) {
        alert('Wprowadź poprawne parametry');
        return;
    }

    const bmi = weight / ((height / 100) ** 2);

    document.getElementById("WynikBMI").innerText = `Twoje BMI to: ${bmi.toFixed(1)}`;

    var BMIresult;
    if(bmi < 18.5){
        BMIresult = "Niedowaga"
    }
    else if(bmi < 24.9){
        BMIresult = "Waga prawidłowa"
    }
    else if(bmi < 29.9){
        BMIresult = "Nadwaga"
    }else {
        BMIresult = "Otyłość"
    }

    document.getElementById("BMIresult").innerText = `Twoja norma BMI to: ${BMIresult}`;
}
function calculatorPPM(){

    const weight = parseFloat(document.getElementById("weight").value);
    const height = parseFloat(document.getElementById("height").value);
    const age = parseInt(document.getElementById("age").value);
    const gender = document.getElementById("gender".value);
    const activityLevel = parseFloat(document.getElementById("activityLevel").value);
    const dietPoint = parseFloat(document.getElementById("dietPoint").value);

    if (isNaN(weight) || isNaN(height) || isNaN(age) || isNaN(activityLevel) || isNaN(dietPoint)) {
        alert('Wprowadź poprawne parametry');
        return;
    }

    var ppm;

    if(gender==="male"){
        ppm = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else{
        ppm = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }

    const callories =ppm*activityLevel + dietPoint;

    document.getElementById("callories").innerText = `Twoja podstawowe dzienne zapotrzebowanie przy wybranym celu i aktywności to ${callories.toFixed(2)}kcal`;
}