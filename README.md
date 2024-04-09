# Covey.Town

Covey.Town provides a virtual meeting space where different groups of people can have simultaneous video calls, allowing participants to drift between different conversations, just like in real life.
Covey.Town was built for Northeastern's [Spring 2021 software engineering course](https://neu-se.github.io/CS4530-CS5500-Spring-2021/), and is designed to be reused across semesters.
You can view our reference deployment of the app at [app.covey.town](https://app.covey.town/), and our project showcase ([Fall 2022](https://neu-se.github.io/CS4530-Fall-2022/assignments/project-showcase), [Spring 2022](https://neu-se.github.io/CS4530-Spring-2022/assignments/project-showcase), [Spring 2021](https://neu-se.github.io/CS4530-CS5500-Spring-2021/project-showcase)) highlight select student projects.

![Covey.Town Architecture](docs/covey-town-architecture.png)

The figure above depicts the high-level architecture of Covey.Town.
The frontend client (in the `frontend` directory of this repository) uses the [PhaserJS Game Library](https://phaser.io) to create a 2D game interface, using tilemaps and sprites.
The frontend implements video chat using the [Twilio Programmable Video](https://www.twilio.com/docs/video) API, and that aspect of the interface relies heavily on [Twilio's React Starter App](https://github.com/twilio/twilio-video-app-react). Twilio's React Starter App is packaged and reused under the Apache License, 2.0.

A backend service (in the `townService` directory) implements the application logic: tracking which "towns" are available to be joined, and the state of each of those towns.

## Running this app locally

Running the application locally entails running both the backend service and a frontend.

### Setting up the backend

To run the backend, you will need a Twilio account. Twilio provides new accounts with $15 of credit, which is more than enough to get started.
To create an account and configure your local environment:

1. Go to [Twilio](https://www.twilio.com/) and create an account. You do not need to provide a credit card to create a trial account.
2. Create an API key and secret (select "API Keys" on the left under "Settings")
3. Create a `.env` file in the `townService` directory, setting the values as follows:

| Config Value            | Description                               |
| ----------------------- | ----------------------------------------- |
| `TWILIO_ACCOUNT_SID`    | Visible on your twilio account dashboard. |
| `TWILIO_API_KEY_SID`    | The SID of the new API key you created.   |
| `TWILIO_API_KEY_SECRET` | The secret for the API key you created.   |
| `TWILIO_API_AUTH_TOKEN` | Visible on your twilio account dashboard. |
| `REACT_APP_YOUTUBE_API_KEY` | Your youtube API key. |

### Starting the backend

Once your backend is configured, you can start it by running `npm start` in the `townService` directory (the first time you run it, you will also need to run `npm install`).
The backend will automatically restart if you change any of the files in the `townService/src` directory.

### Configuring the frontend

Create a `.env` file in the `frontend` directory, with the line: `NEXT_PUBLIC_TOWNS_SERVICE_URL=http://localhost:8081` (if you deploy the towns service to another location, put that location here instead)

For ease of debugging, you might also set the environmental variable `NEXT_PUBLIC_TOWN_DEV_MODE=true`. When set to `true`, the frontend will
automatically connect to the town with the friendly name "DEBUG_TOWN" (creating one if needed), and will *not* try to connect to the Twilio API. This is useful if you want to quickly test changes to the frontend (reloading the page and re-acquiring video devices can be much slower than re-loading without Twilio).

You will also need to add a firebase API key: `FIREBASE_API_KEY` to connect to firebase and be able to make queries to the database.

### Running the frontend

In the `frontend` directory, run `npm start` (again, you'll need to run `npm install` the very first time). After several moments (or minutes, depending on the speed of your machine), a browser will open with the frontend running locally.
The frontend will automatically re-compile and reload in your browser if you change any files in the `frontend/src` directory.

Once you have followed these steps, open up localhost:3000 and follow steps below (you can skip logging into to on render)!

### On Render

Follow these steps to run on render: 
Log into our render at: https://spring24-project-s24-group-201.onrender.com/

Create a fun username and a town. You should spawn into the Basement TV Area. If not, please move your character to the area
You should see our new lounge at the top right.

Now walk onto the grey carpet and you will see a message in black that says “Press Space to watch the YT Watch Party video”
Before clicking “space” let's add some friends. In this example, we see Kamran is friends with Ankit and Ehsen isn’t a friend. In our Active Area Ehsen is not able to join the party. 
Once you press “space” you will be greeted with our Welcome Page. All players have to press space to be in the viewing area.

Now type anything you want to watch on youtube then click the Search button! For this demo let's watch something about brownies.

Once the button is pressed, a new dropdown appears. Please click the dropdown and you will be given the Top 5 videos for your topic. 

Select any of the videos, then press “Add to queue.” Any player can add to the queue and everyone can watch the same video.

Once you add to the queue, you will see a new button pop up called “Start Watch Party”. Before we click that, let's add some other videos, such as cookies. Here we can see an interactive queue for the videos that we want. The first link is the brownie and the second is the cookie video I chose. Now lets press “Start Watch Party” to begin!

Now look at the bottom, your video will appear.

Whenever you get tired of a video, press “Skip Video” and the next video in the queue will play or if you want to watch the whole video through, go ahead! The next video about cookies will be ready to play after the brownie video finishes. Feel free to chat with whomever is in your Watch Party, as you have the ability to chat with friends. 
Since I have nothing else in the queue, the “Skip Button” disappears and here we see that someone has already liked the video. I can press “Like” again and the amount will increase. 

Feel free to hop in and out of the watch party.
