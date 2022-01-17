import express from 'express';
import pg from 'pg';
import methodOverride from 'method-override';
import cookieParser from 'cookie-parser';
import jsSHA from 'jssha';

const SALT = 'OBOG Wind Symphony';

const { Pool } = pg;

let pgConnectionConfigs;
if (process.env.ENV === 'PRODUCTION') {
  // determine how we connect to the remote Postgres server
  pgConnectionConfigs = {
    user: 'postgres',
    // set DB_PASSWORD as an environment variable for security.
    password: process.env.DB_PASSWORD,
    host: 'localhost',
    database: 'quahzhengjie',
    port: 5432,
  };
} else {
  // determine how we connect to the local Postgres server
  pgConnectionConfigs = {
    user: 'quahzhengjie',
    host: 'localhost',
    database: 'quahzhengjie',
    port: 5432,
  };
}

const pool = new Pool(pgConnectionConfigs);

const app = express();
const PORT = process.argv[2];

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(cookieParser());

// displays the sign up form
app.get('/signup', (req, res) => {
  const { loggedIn } = req.cookies;
  res.render('sign-up', { loggedIn });
});

// submits the data in the sign up form
app.post('/signup', (req, res) => {
  const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });

  shaObj.update(req.body.password);

  const hashedPassword = shaObj.getHash('HEX');

  const newUserQuery = 'INSERT INTO users (email, password) VALUES ($1, $2)';
  const inputData = [req.body.email, hashedPassword];

  pool.query(newUserQuery, inputData, (newUserQueryError, newUserQueryResult) => {
    if (newUserQueryError) {
      console.log('error', newUserQueryError);
    } else {
      console.log(newUserQueryResult.rows);
      res.redirect('/login');
    }
  });
});

// displays the login form
app.get('/login', (req, res) => {
  const { loggedIn } = req.cookies;
  res.render('login', { loggedIn });
});

// submits the login data
app.post('/login', (req, res) => {
  pool.query(`SELECT * FROM users WHERE email = '${req.body.email}'`, (emailQueryError, emailQueryResult) => {
    if (emailQueryError) {
      console.log('error', emailQueryError);
      res.status(503).send('request not successful');
      return;
    }

    if (emailQueryResult.rows.length === 0) {
      res.status(403).send('not successful');
      return;
    }

    console.log('password', emailQueryResult.rows[0].password);

    const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
    shaObj.update(req.body.password);
    const hashedPassword = shaObj.getHash('HEX');
    console.log(hashedPassword);
    if (emailQueryResult.rows[0].password === hashedPassword) {
      res.cookie('loggedIn', true);

      const shaObj1 = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
      const unhashedCookieString = `${emailQueryResult.rows[0].id}-${SALT}`;
      shaObj1.update(unhashedCookieString);
      const hashedCookieString = shaObj1.getHash('HEX');
      res.cookie('loggedInHash', hashedCookieString);
      res.cookie('userId', emailQueryResult.rows[0].id);
      res.redirect('/registration');
    } else {
      res.status(403).send('not successful');
    }
  });
});

// logs the user out
app.post('/logout', (req, res) => {
  res.clearCookie('loggedIn');
  res.clearCookie('userId');
  res.clearCookie('loggedInHash');
  res.redirect('/login');
});

//OBOG About us:
//Displays about us page:
app.get('/', (req, res) => {
  res.render('about_us');
});

//OBOG Event Registration Form:
//This route displays the Event Registration Form.
app.get('/registration', (req, res) => {
  const eventQuery = 'SELECT * FROM OBOGEVENTS';
  pool.query(eventQuery, (eventQueryError, eventQueryResult) => {
    if (eventQueryError) {
      console.log('error', eventQueryError);
    } else {
      const data = {
        OBOGEVENTS: eventQueryResult.rows,
      };
      console.log(data);
      res.render('registration', data);
    }
  });
});

// enters the data recieved in 'users_obogevents ' into the database
app.post('/registration', (req, res) => {
  const entryQuery = 'INSERT INTO users_obogevents (instrument, date, user_id, obogevents_id) VALUES ($1, $2, $3, $4)';

  const RegistrationData = req.body;
  console.log(Number(req.cookies.userId));
  console.log(RegistrationData.instrument);
  console.log(RegistrationData.date);
  console.log(Number(RegistrationData.obogevents_id));

  const inputData = [RegistrationData.instrument , RegistrationData.date, Number(req.cookies.userId), Number(RegistrationData.obogevents_id)];

  pool.query(entryQuery, inputData, (entryError, entryResult) => {

    if (entryError) {
      console.log('error', entryError);
    } else {
      console.log('note id:', entryResult.rows);
    }
      });
      res.redirect('/dashboard/1');
    });

// displays all the entries in the users_obogevents
app.get('/dashboard/:id', (req, res) => {
  
const usersId = Number(req.params.id);

  const getUserEntriesQuery = `SELECT users_obogevents.id, users_obogevents.date, users_obogevents.instrument, obogevents.name FROM users_obogevents INNER JOIN obogevents ON users_obogevents.obogevents_id = obogevents.id INNER JOIN users ON users_obogevents.user_id = users.id WHERE users.id = ${usersId}`;

  pool.query(getUserEntriesQuery, (getUserEntriesQueryError, getUserEntriesQueryResult) => {
    if (getUserEntriesQueryError) {
      console.log('error', getUserEntriesQueryError);
    } else {
      console.log(getUserEntriesQueryResult.rows);
      const userNotes = getUserEntriesQueryResult.rows;
      const { loggedIn } = req.cookies;
      console.log('logged in?', loggedIn);
      res.render('dashboard', { userNotes, loggedIn });
    }
  });
});

// deletes a single note entry from Dashboard
app.delete('/dashboard/:id/delete', (req, res) => {
  const userOBOGeventsId = Number(req.params.id);
  const getInfoQuery = `SELECT * FROM users_obogevents WHERE id = ${userOBOGeventsId}`;
  pool.query(getInfoQuery, (getInfoQueryError, getInfoQueryResult) => {
    if (getInfoQueryError) {
      console.log('error', getInfoQueryError);
    } else {
      console.log(getInfoQueryResult.rows);
      const userOBOGeventInfo = getInfoQueryResult.rows[0];
      console.log('user_id', userOBOGeventInfo.user_id);
      console.log('userId from cookies', req.cookies.userId);
      console.log('note id:', userOBOGeventInfo.id);
      console.log('date', userOBOGeventInfo.date);
      if (userOBOGeventInfo.user_id === Number(req.cookies.userId)) {
        const deleteuserOBOGQuery = `DELETE FROM users_obogevents WHERE id = ${userOBOGeventsId}`;
        pool.query(deleteuserOBOGQuery, (deleteuserOBOGQueryError, deleteuserOBOGQueryResult) => {
          if (deleteuserOBOGQueryError) {
            console.log('error', deleteuserOBOGQueryError);
          } else {
            res.redirect('/registration');
          }
        });
      } else {
        res.send('You are not authorised to delete this post. ');
      }
    }
  });
});

// displays one single entry in the database
app.get('/registeredevent/:id', (req, res) => {
  console.log('logged in', req.cookies.loggedIn);
  console.log('userid', req.body.id);
  

  const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
  const unhashedCookieString = `${req.cookies.userId}-${SALT}`;
  shaObj.update(unhashedCookieString);
  const hashedCookieString = shaObj.getHash('HEX');
  console.log('logged in hash', req.cookies.loggedInHash);
  console.log('hashedCookieString', hashedCookieString);
  if (req.cookies.loggedInHash !== hashedCookieString) {
    res.status(403).send('please log in');
  } else {
    const { id } = req.params;
    const singleNote = `SELECT users_obogevents.id, users_obogevents.instrument, users_obogevents.date, users.email, obogevents.name AS obogevents FROM users_obogevents INNER JOIN users ON users_obogevents.user_id = users.id INNER JOIN obogevents ON obogevents.id = users_obogevents.obogevents_id WHERE users_obogevents.id = ${id}`;

    pool.query(singleNote, (singleNoteError, singleNoteResult) => {
      if (singleNoteError) {
        console.log('error', singleNoteError);
      } else {
        console.log(singleNoteResult.rows[0]);
        const oneNote = singleNoteResult.rows[0];
        console.log('one note', oneNote);
        const { loggedIn } = req.cookies;
        console.log('logged in?', loggedIn);
        res.render('single-event', { eachNote: oneNote, loggedIn });
      }
    });
  }
});

// displays edit form (with user auth)
app.get('/registeredevent/:id/edit', (req, res) => {
  const registeredEvent = Number(req.params.id);
  const getRegisteredEventQuery = `SELECT * FROM users_obogevents WHERE id = ${registeredEvent}`;
  pool.query(getRegisteredEventQuery, (getRegisteredEventQueryError, getRegisteredEventQueryResult) => {
    if (getRegisteredEventQueryError) {
      console.log('error', getRegisteredEventQueryError);
    } else {
      console.log(getRegisteredEventQueryResult.rows);
      const noteInfo = getRegisteredEventQueryResult.rows[0];
      if (noteInfo.user_id === Number(req.cookies.userId)) {
        const eventQuery = 'SELECT * FROM obogevents';
        pool.query(eventQuery, (eventQueryError, eventQueryResult) => {
          if (eventQueryError) {
            console.log('error', eventQueryError);
          } else {
            const data = {
              event: eventQueryResult.rows,
            };
            res.render('edit', {noteInfo, data});
          }
        });
      } else {
        res.send('You are not authorised to edit this post. ');
      }
    }
  });
});

// submit edit data
app.put('/registeredevent/:id/edit', (req, res) => {
  const id = Number(req.params.id);

  const editEntryQuery = `UPDATE users_obogevents SET instrument = '${(req.body.instrument)}', date = '${req.body.date}', obogevents_id = ${Number(req.body.obogevents_id)} WHERE id = ${id} RETURNING *`;

  pool.query(editEntryQuery, (editEntryQueryError, editEntryQueryResult) => {
    if (editEntryQueryError) {
      console.log('error', editEntryQueryError);
    } else {
      console.log(editEntryQueryResult.rows);
      res.redirect('/dashboard/1');
    }
  });
});

//comments
app.post('/registeredevent/:id/comment', (req, res) => {
  const { userId } = req.cookies;
  const notesId = req.params.id;
  console.log(notesId);
  const text = req.body.comment;
  console.log(text);

  const addCommentQuery = 'INSERT INTO comments (text, users_obogevents_id, user_id) VALUES ($1, $2, $3)';
  const inputData = [`'${text}'`, notesId, userId];

  pool.query(addCommentQuery, inputData, (addCommentQueryError, addCommentQueryResult) => {
    if (addCommentQueryError) {
      console.log('error', addCommentQueryError);
    } else {
      console.log('done');
      res.redirect('/dashboard/1');
    }
  });
});

// renders all DISTINCT events registered
app.get('/registeredevent/:id/photos', (req, res) => {
  const usersId = Number(req.params.id);

  // const getEventInfo = `SELECT DISTINCT users_obogevents.id, users_obogevents.date, users_obogevents.instrument, obogevents.name FROM users_obogevents INNER JOIN obogevents ON users_obogevents.obogevents_id = obogevents.id INNER JOIN users ON users_obogevents.user_id = users.id WHERE users.id = ${usersId}`;

  const getEventInfo = `SELECT DISTINCT obogevents.name FROM users_obogevents INNER JOIN obogevents ON users_obogevents.obogevents_id = obogevents.id INNER JOIN users ON users_obogevents.user_id = users.id WHERE users.id = ${usersId}`;

  pool.query(getEventInfo, (getEventInfoError, getEventInfoResult) => {
    if (getEventInfoError) {
      console.log('error', getEventInfoError);
    } else {
      console.log(getEventInfoResult.rows);
      const EventInfo = getEventInfoResult.rows;
      console.log('Event info', EventInfo);
      res.render('all-events', { EventInfo });
    }
  });
});

app.get('/registeredevent/photos/1', (req, res) => {
  const { loggedIn } = req.cookies;
  res.render('photoalbum', { loggedIn });
});

app.get('/registeredevent/photos/2', (req, res) => {
  const { loggedIn } = req.cookies;
  res.render('photoalbum1', { loggedIn });
});

app.get('/registeredevent/photos/3', (req, res) => {
  const { loggedIn } = req.cookies;
  res.render('photoalbum2', { loggedIn });
});

app.get('/registeredevent/photos/4', (req, res) => {
  const { loggedIn } = req.cookies;
  res.render('photoalbum3', { loggedIn });
});

app.listen(PORT);
