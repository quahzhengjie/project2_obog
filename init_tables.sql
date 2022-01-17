INSERT INTO species (name, scientific_name) VALUES ('Wandering Whistling Duckling Duck', 'Dendrocygna arcuata'), ('Lesser Whistling Duck', 'Dendrocygna javanica'), ('Cotton Pygmy Goose', 'ettapus coromandelianus'), ('Gadwall', 'Anas strepera'), ('Eurasian Wigeon', 'Anas penelope'), ('Northern Shoveler','Anas clypeata'), ('Northern Pintail', 'Anas acuta'), ('Garganey', 'Anas querquedula'), ('Eurasian Teal', 'Anas crecca'), ('Tufted Duck', 'Aythya fuligula'), ('Red Junglefowl', 'Gallus gallus');            

//PROJECT 2 STARTS HERE

OBOG EVENTS:
CREATE TABLE IF NOT EXISTS OBOGEVENTS (
  id SERIAL PRIMARY KEY,
  name TEXT,
  time TEXT,
  platform TEXT,
  details TEXT
);

INSERT INTO OBOGEVENTS (name, platform, details, time) VALUES ('Serenading Series V','YouTube','The Yuhua Serenading Series was launched in 2016 with the intention of reaching out to our community through familiar and evergreen songs. Though we regrettably cannot hold our concert in person this year, we have come together in smaller groups to record these songs and will be presenting it to you virtually, and you can enjoy it anytime, anywhere!','2021-03-01');

INSERT INTO OBOGEVENTS (name, platform, details, time) VALUES ('Evergreen Serenades
@ Singapore Botanical Gardens','Singapore Botanical Gardens', 'Didnt manage to catch us at the Esplanade Outdoor Theatre or couldnt get enough of us? OBOG Wind Symphony will be performing at the Singapore Botanic Gardens Shaw Symphony Stage on 15th March 2020 6pm. We are looking forward to a great evening at the gardens. Bring along your family, friends and picnic mats and we will see you there! 😊','2020-03-15');

INSERT INTO OBOGEVENTS (name, platform, details, time) VALUES ('Whoopee!','Yuhua Community Club', 'OBOG Wind Symphony presents “WHOOPEE! Series 1” on 23 November (Sat), 7.30pm at Yuhua Community Club (Hall)! Featuring uplifting songs such as Caribbean Sundance, Music for a Festival, Symphonic Dances “Tango” and “Hoedown” and Clarinets to the Fore!','2019-11-23');

INSERT INTO OBOGEVENTS (name, platform, details, time) VALUES ('SYCW-OBOG Conducting Masterclass','Goodman Arts Centre', 'Singapore Youth Chamber Winds is excited to be kickstarting our 2022 Youth Chamber Project soon! Applications to audition for our upcoming Youth Chamber Project close tonight dont wait, apply now via https://linktr.ee/chamberwinds!','2022-16-01');

OBOG Registration Form (NOTES):
CREATE TABLE IF NOT EXISTS users_OBOGEVENTS (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  OBOGEVENTS_id INTEGER REFERENCES OBOGEVENTS(id),
  date TEXT,
  instrument TEXT
);

CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  text TEXT,
  users_obogevents_id INTEGER REFERENCES users_obogevents(id),
  user_id INTEGER REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT,
  password TEXT
);

CREATE TABLE IF NOT EXISTS photos (
  id SERIAL PRIMARY KEY,
  imgsrc TEXT,
  obogevents_id INTEGER REFERENCES obogevents(id)
);


CREATE TABLE IF NOT EXISTS photos_obogevents (
  id SERIAL PRIMARY KEY,
  photos_id INTEGER REFERENCES obogevents(id), 
  obogevents_id INTEGER REFERENCES obogevents(id)
);

INSERT INTO photos (imgsrc, obogevents_id) VALUES ('imgsrcSeranadingSeriesV','1');
INSERT INTO photos (imgsrc, obogevents_id) VALUES ('imgsrcEvergreenSerenades','2');
 