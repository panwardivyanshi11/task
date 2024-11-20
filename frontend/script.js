//const ws = new WebSocket('ws://localhost:8080');
//ws.onmessage = (event) => {
    //const data = JSON.parse(event.data);
//    updatePollResults(data.pollId, data.optionId);
//};
//document.get
document.addEventListener('DOMContentLoaded', () => {
    const pollOptions = [];
    const pollResultsContainer = document.getElementById('poll-results');
    const leaderboardContainer = document.getElementById('leaderboard');

    document.getElementById('add-option').addEventListener('click', () => {
        const optionText = document.getElementById('poll-option').value;
        if (optionText) {
            pollOptions.push(optionText);
            document.getElementById('poll-option').value = '';
            renderPollOptions();
        }
    });

    document.getElementById('create-poll').addEventListener('click', () => {
        const question = document.getElementById('poll-question').value;
        if (question && pollOptions.length > 0) {
            createPoll(question, pollOptions);
        }
    });

    function renderPollOptions() {
        const optionsContainer = document.getElementById('poll-options');
        optionsContainer.innerHTML = '';
        pollOptions.forEach((option, index) => {
            optionsContainer.innerHTML += `<div><input type="radio" name="poll-option" value="${index}"> ${option}</div>`;
        });
    }

    function createPoll(question, options) {
        fetch('/api/polls', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question, options }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Poll created with ID:', data.pollId);
            loadPollResults(data.pollId);
            loadLeaderboard();
        })
        .catch(error => console.error('Error creating poll:', error));
    }

    function loadPollResults(pollId) {
        fetch(`/api/polls/${pollId}/results`)
            .then(response => response.json())
            .then(results => {
                displayPollResults(results);
            })
            .catch(error => console.error('Error fetching poll results:', error));
    }

    function displayPollResults(results) {
        pollResultsContainer.innerHTML = '';
        results.forEach(result => {
            pollResultsContainer.innerHTML += `<div>${result.option_text}: ${result.votes}</div>`;
        });
    }

    function votePoll(pollId, optionId) {
        fetch('/api/polls/vote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pollId, optionId }),
        })
        .then(response => {
            if (response.ok) {
                console.log('Vote recorded');
                loadPollResults(pollId); // Refresh results
            } else {
                console.error('Failed to record vote');
            }
        })
        .catch(error => console.error('Error voting:', error));
    }

    function updatePollResults(pollId, optionId) {
        loadPollResults(pollId); // Refresh results
    }

    function loadLeaderboard() {
        fetch('/api/leaderboard')
            .then(response => response.json())
            .then(leaderboard => {
                displayLeaderboard(leaderboard);
            })
            .catch(error => console.error('Error fetching leaderboard:', error));
    }

    function displayLeaderboard(leaderboard) {
        leaderboardContainer.innerHTML = '';
        leaderboard.forEach(entry => {
            leaderboardContainer.innerHTML += `<div>${entry.option_text}: ${entry.total_votes}</div>`;
        });
    }
});