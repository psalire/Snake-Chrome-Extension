chrome.runtime.onInstalled.addListener(function() {
	chrome.storage.sync.set({highscore: 0, highscoreHard: 0});
});
