const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

function calculateBMI(weight, height, age) {
    const bmi = weight / ((height / 100) ** 2);
    let BMIresult;
    if (bmi < 18.5) {
        BMIresult = "Niedowaga"
    } else if (bmi < 24.9) {
        BMIresult = "Waga prawidłowa"
    } else if (bmi < 29.9) {
        BMIresult = "Nadwaga"
    } else {
        BMIresult = "Otyłość"
    }
    return { bmi: bmi.toFixed(1), result: BMIresult };
}

function calculatorPPM(weight, height, age, gender, activityLevel, dietPoint) {
    let ppm;
    if (gender === "male") {
        ppm = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
        ppm = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
    const callories = ppm * activityLevel + dietPoint;
    return callories.toFixed(2);
}

app.get('/calculateBMI', (req, res) => {
    const { weight, height, age } = req.query;
    const bmiData = calculateBMI(parseFloat(weight), parseFloat(height), parseInt(age));
    res.json(bmiData);
});

app.get('/calculatePPM', (req, res) => {
    const { weight, height, age, gender, activityLevel, dietPoint } = req.query;
    const ppmData = calculatorPPM(parseFloat(weight), parseFloat(height), parseInt(age), gender, parseFloat(activityLevel), parseFloat(dietPoint));
    res.json({ callories: ppmData });
});

app.get('/', (req, res) => {
    res.render('kalkulator');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
