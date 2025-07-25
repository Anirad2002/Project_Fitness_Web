const express = require('express');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const app = express();
const port = 3000;


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
  password: { type: String, required: true }
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

app.listen(port, () => {
  console.log(`Serwer działa na http://localhost:${port}`);
});
