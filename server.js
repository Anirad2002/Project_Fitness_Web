const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const session = require('express-session');
const nodemailer = require('nodemailer');
const app = express();
const port = 3000;


// Mongo
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
  token: {type: String, default: null},
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null }
});

const User = mongoose.model('User', UserSchema);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({ secret: 'secretKey', resave: false, saveUninitialized: true }));

const questionsDir = path.join(__dirname, 'pytania');
if (!fs.existsSync(questionsDir)) {
  fs.mkdirSync(questionsDir);
}

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

async function sendResetEmail(email, token) {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'jakschudnac.help@gmail.com', 
      pass: 'gswg bdzn irlp mdri'
    }
  });

  let mailOptions = {
    from: 'jakschudnac.help@gmail.com',
    to: email,
    subject: 'Resetowanie hasła',
    text: `Kliknij na poniższy link, aby zresetować swoje hasło: http://localhost:3000/reset-password/${token}`
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log('Error sending email: ', error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}


module.exports = sendResetEmail;

module.exports = sendResetEmail;


function authenticate(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
}

// Usuwanie konta użytkownika
app.delete('/api/usun-profil', async (req, res) => {
  const { username } = req.session.user;

  try {
    await User.findOneAndDelete({ username });
    req.session.destroy();

    res.send('Konto zostało usunięte');
  } catch (err) {
    console.error('Błąd podczas usuwania konta:', err);
    res.status(500).send('Wystąpił błąd podczas usuwania konta.');
  }
});

// Rejestracja użytkownika
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
    req.session.user = {
      email: user.email,
      username: user.username,
      height: user.height,
      weight: user.weight,
      targetWeight: user.targetWeight,
      age: user.age,
      token: user.token
    };
    req.session.loggedin = false;
    res.redirect('/');
  } catch (err) {
    res.status(400).send(err);
  }
});

// Logowanie użytkownika
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
app.get('/request-password-reset', (req, res) => {
  res.render('request-password-reset', { error: null, message: null });
});

app.post('/request-password-reset', async (req, res) => {
  const { email } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('request-password-reset', { error: 'Użytkownik z tym adresem email nie istnieje', message: null });
    }

    const token = uuidv4();
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; 

    await user.save();

    sendResetEmail(user.email, token);

    res.render('request-password-reset', { error: null, message: 'E-mail z kodem resetowania hasła został wysłany' });
  } catch (err) {
    console.error('Błąd podczas resetowania hasła:', err);
    res.status(500).send('Wystąpił błąd serwera');
  }
});

app.get('/reset-password/:token', (req, res) => {
  const { token } = req.params;
  res.render('reset-password', { token, error: null, message: null });
});

app.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.render('reset-password', { token, error: 'Token resetowania hasła jest nieprawidłowy lub wygasł', message: null });
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) return res.render('reset-password', { token, error: passwordError, message: null });

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.render('reset-password', { token: null, error: null, message: 'Hasło zostało zresetowane pomyślnie' });
  } catch (err) {
    console.error('Błąd podczas resetowania hasła:', err);
    res.status(500).send('Wystąpił błąd serwera');
  }
});

app.get('/zalogowany', (req, res) => {
  const user = req.session.user;
  const loggedin = req.session.loggedin || false; 

  if (!user) return res.redirect('/login');

  res.render('zalogowany', { user, loggedin });
});

app.get('/api/profil', (req, res) => {
  const user = req.session.user;
  if (!user) return res.status(400).send('Nie można znaleźć użytkownika');

  res.json(user);
});

app.post('/logout', (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(400).send('Proszę się zalogować przed wylogowaniem');
  }
  console.log('Użytkownik wylogowany:', req.session.user.username);
  req.session.destroy();
  res.redirect('/');
});

app.get('/', (req, res) => {
  const user = req.session.user;
  const loggedin = req.session.loggedin || false; 

  if (req.session.user) {
    res.render('zalogowany', { user, loggedin });
  } else {
    res.render('index', { user, loggedin });
  }
});
app.get('/user/:username', async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username });

  if (!user) {
    return res.status(400).send('Nie można znaleźć użytkownika');
  }
  res.json(user);
});


app.post('/api/edytuj-profil', authenticate, async (req, res) => {
  const { email, username } = req.session.user;
  const { age, height, weight, targetWeight } = req.body;

  try {
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { age, height, weight, targetWeight },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'Nie znaleziono użytkownika' });
    }

    req.session.user = {
      email: updatedUser.email,
      username: updatedUser.username,
      height: updatedUser.height,
      weight: updatedUser.weight,
      targetWeight: updatedUser.targetWeight,
      age: updatedUser.age,
      token: updatedUser.token
    };

    res.json({ message: 'Profil został pomyślnie zaktualizowany' });
  } catch (err) {
    console.error('Błąd podczas aktualizacji profilu:', err);
    res.status(500).json({ error: 'Wystąpił błąd podczas aktualizacji profilu.' });
  }
});
app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/profil', (req, res) => {
  res.render('profil', { user: req.session.user });
});

app.get('/sport', (req, res) => {
  const user = req.session.user;
  const loggedin = req.session.loggedin || false;
  res.render('sport', { user, loggedin });
});

app.get('/zywnosc', (req, res) => {
  const user = req.session.user;
  const loggedin = req.session.loggedin || false;
  res.render('zywnosc', { user, loggedin });
});

app.get('/woda', (req, res) => {
  const user = req.session.user;
  const loggedin = req.session.loggedin || false;
  res.render('woda', { user, loggedin});
});

app.get('/sen', (req, res) => {
  const user = req.session.user;
  const loggedin = req.session.loggedin || false;
  res.render('sen', { user, loggedin });
});

app.get('/onas', (req, res) => {
  const user = req.session.user;
  const loggedin = req.session.loggedin || false;
  res.render('onas', { user, loggedin });
});

app.get('/kalkulator', (req, res) => {
  const user = req.session.user;
  const loggedin = req.session.loggedin || false;
  res.render('kalkulator', { user, loggedin });
});

app.get('/form', (req, res) => {
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

app.get('/bmi.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'bmi.js'));
});


app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/blog', (req, res) => {
  res.render('blog');
});

app.get('/faq', (req, res) => {
  res.render('faq');
});

app.get('/forum', (req, res) => {
  res.render('forum');
});

app.get('/search', (req, res) => {
  const query = req.query.query;
  res.render('search-results', { query });
});

// BMI
function calculateBMI(weight, height) {
  console.log(`Parametry do obliczenia BMI - waga: ${weight}, wzrost: ${height}`);
  const bmi = weight / ((height / 100) ** 2);
  let BMIresult;
  if (bmi < 18.5) {
      BMIresult = "Niedowaga";
  } else if (bmi < 24.9) {
      BMIresult = "Waga prawidłowa";
  } else if (bmi < 29.9) {
      BMIresult = "Nadwaga";
  } else {
      BMIresult = "Otyłość";
  }
  return { bmi: bmi.toFixed(1), result: BMIresult };
}

app.get('/calculateBMI', (req, res) => {
  const { weight, height } = req.query;
  if (!weight || !height) {
      res.status(400).json({ error: 'Prosze wprowadzic wszystkie dane' });
      return;
  }
  const bmiData = calculateBMI(parseFloat(weight), parseFloat(height));
  res.json(bmiData);
});

// PPM
function calculatePPM(weight_1, height_1, age_1, gender, activityLevel, dietPoint) {
  console.log(`Parametry do obliczania PPM - waga: ${weight_1}, wzrost: ${height_1}, wiek: ${age_1}, 
  plec: ${gender}, poziom aktywnosci: ${activityLevel}, cel diety: ${dietPoint} `);
  let ppm;
  if (gender === "male") {
      ppm = 88.362 + (13.397 * weight_1) + (4.799 * height_1) - (5.677 * age_1);
  } else {
      ppm = 447.593 + (9.247 * weight_1) + (3.098 * height_1) - (4.330 * age_1);
  }
  const callories = (ppm * activityLevel + dietPoint).toFixed(2);
  return { callories };
}

app.get('/calculatePPM', (req, res) => {
  const { weight_1, height_1, age_1, activityLevel, dietPoint } = req.query;
  const gender = req.query.gender; 

  if (!weight_1 || !height_1 || !age_1 || !gender || !activityLevel || !dietPoint) {
    res.status(400).json({ error: 'Prosze wprowadzic wszystkie dane' });
    return;
  }
  const ppmData = calculatePPM(parseFloat(weight_1), parseFloat(height_1), parseInt(age_1), gender, parseFloat(activityLevel), parseFloat(dietPoint));
  res.json(ppmData);
});

app.listen(port, () => {
  console.log(`Serwer działa na http://localhost:${port}`);
});


// Woda
function calculateWaterIntake(weight) {
  const waterIntake = weight * 35;
  return { waterIntake: waterIntake.toFixed(2) };
}

app.get('/calculateWaterIntake', (req, res) => {
  const { weight } = req.query;
  if (!weight) {
    res.status(400).json({ error: 'Proszę wprowadzić wagę' });
    return;
  }
  const waterData = calculateWaterIntake(parseFloat(weight));
  res.json(waterData);
});
