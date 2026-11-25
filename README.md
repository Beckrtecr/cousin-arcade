# Cousin Arcade

Cousin Arcade is a little website full of browser games made by the Cousin Crew. The home page shows every game as a card. Click a card and the game opens full screen right in the page. There is a search box for finding a game by name.

It is plain HTML, CSS and JavaScript. There is no build step, no install and no server code, so it runs anywhere that can serve static files (it includes a `.nojekyll` file so it works on GitHub Pages as is).

## The games

| Game | What it is | How to play |
| --- | --- | --- |
| **Super Seagulls** | A flying shooter starring seagulls. | WASD or arrow keys to fly, mouse to aim and shoot. Collect all 4 guns for god mode. |
| **Notebook Brawl** | A fighting game on a sheet of notebook paper. You can draw your own arena, spikes and all. | Pick a page and your fighters, then fight. Play on one computer, or online with up to 5 people: one person hosts and shares a party code. |
| **One Button Cup** | Four players, one key each, in a cup of quick mini games (soccer, tennis, golf, sumo bump, tug of war, hot potato and more). | Red is Q, Blue is C, Gold is M, Green is P. Press your key to join. Empty seats are played by the computer. |
| **Serpent Arena** | A snake battle against a crowd of bots. Eat, grow and cut them off. | Arrow keys or WASD to steer, boost to sprint (or use a second finger on a phone). |
| **Dopamine Engine** | A clicker game where a stage fills up with gadgets you buy. | Click to earn buzz, spend it in the shop. Meltdowns and Big Bangs reset you for permanent bonuses. Progress saves in your browser. |
| **Bobblehead Ball** | Two player head soccer. | Left player: A/D to move, W to jump, S or Space to kick, F or E for super. Right player: arrow keys to move and jump, Down or / to kick, Enter for super. Touch the ball to charge your super. |
| **Picnic Panic** | Tower defense: bugs march toward your picnic cake and kitchen gadgets squash them. 3 maps, 20 waves, a Queen Ant boss. | Pick a defender from the bottom bar (or keys 1-5), then click or tap the grass to place it. Click a defender to upgrade or sell it. Space sends the next wave. |

## Playing locally

Download or clone the repo, then serve the folder with any simple web server. For example, from the repo folder:

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000> in your browser.

Opening `index.html` straight from your files (double clicking it) mostly works too, but a local server is more reliable, because some browsers block things on `file://` pages. Notebook Brawl's online play also needs an internet connection, since it loads PeerJS from a CDN.

## Adding a game

1. **Make a folder for your game** inside `games/`, for example `games/my-game/`. Use lowercase letters and dashes in the name.
2. **Put your game in `index.html`** inside that folder. This is the file the arcade opens. Keep everything the game needs (scripts, pictures, sounds) inside the folder and link to it with relative paths.
3. **Add a thumbnail (optional).** Put a picture called `thumb.svg` in the folder. If you skip it, the arcade shows a coloured card with the first letter of your game's title.
4. **Add an entry to `games-list.js`.** Copy one of the entries in the `GAMES` list and change it:

   ```js
   {
     title: "My Game",
     maker: "Your Name",
     folder: "games/my-game",
     thumbnail: "games/my-game/thumb.svg", // or "" for no picture
     color: "#7b5cff",                      // card colour when there is no picture
   },
   ```

5. **Check it.** Start the local server, reload the home page and click your card.

Games play inside a frame on the home page, so a game should fit whatever size window it is given and should not need a page of its own. The arcade always loads the newest version of `games-list.js` and of each game, so you do not need to clear your browser cache after a change.

## What's in the repo

```
index.html       the arcade home page and the game player
games-list.js    the list of games shown on the home page
games/<name>/    one folder per game, each with index.html and thumb.svg
```
