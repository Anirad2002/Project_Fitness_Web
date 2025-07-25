const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const session = require('express-session');
const app = express();
const port = 3000;

//mongo
mongoose.connect('mongodb://localhost:27017/myapp')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  height: { type: Number, required: true },
  weight: { type: Number, required: true },
  targetWeight: { type: Number, required: true },
  age: { type: Number, required: true },
  password: { type: String, required: true },
  token: {type: String, default: null}
});
const User = mongoose.model('User', UserSchema);

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

const questionsDir = path.join(__dirname, 'pytania');

if (!fs.existsSync(questionsDir)) {
  fs.mkdirSync(questionsDir);
}
app.use(session({ secret: 'secretKey', resave: false, saveUninitialized: true }));
app.use(express.static(path.join(__dirname, 'views')));

app.get('/', (req, res) => {
  res.render('form');
});

app.post('/submit', (req, res) => {
  const { message } = req.body;

  fs.readdir(questionsDir, (err, files) => {
    if (err) {
      console.error('Błąd podczas odczytywania listy plików pytania:', err);
      res.status(500).send('Wystąpił błąd podczas zapisywania pytania.');
      return;
    }

    const nextQuestionNumber = files.length + 1;
    const questionFile = path.join(questionsDir, `pytanie${nextQuestionNumber}.txt`);

    fs.writeFile(questionFile, message, (err) => {
      if (err) {
        console.error('Błąd podczas zapisywania pliku pytania:', err);
        res.status(500).send('Wystąpił błąd podczas zapisywania pytania.');
        return;
      }
      console.log(`Zapisano pytanie do pliku ${questionFile}`);
      res.render('confirmation');
    });
  });
});
// spr hasla
const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) return 'Hasło musi mieć co najmniej 8 znaków';
  if (!hasUpperCase) return 'Hasło musi zawierać co najmniej jedną wielką literę';
  if (!hasLowerCase) return 'Hasło musi zawierać co najmniej jedną małą literę';
  if (!hasNumbers) return 'Hasło musi zawierać co najmniej jedną cyfrę';
  if (!hasSpecialChar) return 'Hasło musi zawierać co najmniej jeden znak specjalny';

  return null;
};
// reg
app.post('/register', async (req, res) => {
  const { email, username, height, weight, targetWeight, age, password } = req.body;

  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    return res.status(400).send('Użytkownik o tym adresie e-mail już istnieje');
  }
  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    return res.status(400).send('Użytkownik o tej nazwie użytkownika już istnieje');
  }
  const passwordError = validatePassword(password);
  if (passwordError) return res.status(400).send(passwordError);

  const token = uuidv4 ();
  console.log('Token wygenerowany:', token);

  const user = new User({
    email,
    username,
    height,
    weight,
    targetWeight,
    age,
    password,
    token
  });
  try {
    await user.save();
    console.log('Użytkownik został zarejestrowany:', user.username);
    req.session.loggedin = false;
    res.redirect('/'); 
  } catch (err) {
    res.status(400).send(err);
  }
});
//login 
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  console.log('Próba logowania dla użytkownika:', username); 
  try {
    const user = await User.findOne({ username });
    if(user){
      console.log('Token uzytkownika:',user.token);

    }
    if (!user) {
      console.log('Nie znaleziono użytkownika:', username);
      return res.status(400).send('Nieprawidłowa nazwa użytkownika lub hasło');
    }

    if (password !== user.password) {
      console.log('Nieprawidłowe hasło dla użytkownika:', username);
      return res.status(400).send('Nieprawidłowe hasło');
    }

    req.session.user = {
      email: user.email,
      username: user.username,
      height: user.height,
      weight: user.weight,
      targetWeight: user.targetWeight,
      age: user.age,
      token: user.token
    };
    req.session.loggedin = true;
    res.redirect('/zalogowany');
  } catch (err) {
    console.error('Błąd podczas logowania:', err);
    res.status(500).send('Wystąpił błąd serwera');
  }
});
// api zalogowanego
app.get('/api/profil', (req, res) => {
  const user = req.session.user;
  if (!user) return res.status(400).send('Nie można znaleźć użytkownika');

  res.json(user);
});
//wylogowanie ze sprawdzeniem czy ktos sie zalogowal
app.post('/logout', (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(400).send('Proszę się zalogować przed wylogowaniem');
  }
  console.log('Użytkownik wylogowany:', req.session.user.username);
  req.session.destroy();
  res.redirect('/');
});
//
app.get('/calculateBMI', (req, res) => {
  const { weight, height} = req.query;

  if (!weight || !height) {
      return res.status(400).send('Brakujące parametry');
  }

  const bmi = (parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2)).toFixed(2);
  let result;

  if (bmi < 18.5) {
      result = 'niedowaga';
  } else if (bmi < 24.9) {
      result = 'waga prawidłowa';
  } else if (bmi < 29.9) {
      result = 'nadwaga';
  } else {
      result = 'otyłość';
  }

  res.json({ bmi, result });
});

app.get('/calculatePPM', (req, res) => {
  const { weight_1, height_1, age_1, gender, activityLevel, dietPoint } = req.query;

  if (!weight_1 || !height_1 || !age_1) {
      return res.status(400).send('Brakujące parametry');
  }

  let ppm;
  if (gender === "male") {
      ppm = 88.362 + (13.397 * weight_1) + (4.799 * height_1) - (5.677 * age_1);
  } else {
      ppm = 447.593 + (9.247 * weight_1) + (3.098 * height_1) - (4.330 * age_1);
  }

  const callories = (ppm * activityLevel + dietPoint).toFixed(2);
  res.json({ callories });
});
//

app.listen(port, () => {
  console.log(`Serwer działa na http://localhost:${port}`);
});
