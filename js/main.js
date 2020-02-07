function string_compare( a, b ) {
    if ( a < b ){
        return -1;
    }
    if ( a > b ){
        return 1;
    }
    return 0;
}

var cvre_data = {
    playerList: [],
    sortingFunctions: [
        {
            totalScore: (a,b) => {return b.totalScore - a.totalScore},
            username: (a,b) => {return string_compare(a.username,b.username)},
            team: (a,b) => {return string_compare(a.team,b.team)},
            rank: (a,b) => {return a.rank - b.rank}
        },
        {
            totalScore: (a,b) => {return a.totalScore - b.totalScore},
            username: (a,b) => {return string_compare(b.username,a.username)},
            team: (a,b) => {return string_compare(b.team,a.team)},
            rank: (a,b) => {return b.rank - a.rank}
        }
    ],
    sortingMethod: "new",
    reverseSort: false
};

function get_data(){
    $.getJSON("https://cvrescores.herokuapp.com/api/scores", parse_data);
}

function parse_data(rawScoreData){
    var playerList = [];
    var playerId2Index = {};
    for(index in rawScoreData){
        scoreData = rawScoreData[index];
        if(playerId2Index.hasOwnProperty(scoreData.userId)){
            var player = playerList[playerId2Index[scoreData.userId]]
            player.songPlays[scoreData.levelId]++
            if(player.topScores.hasOwnProperty(scoreData.levelId)){
                if(player.topScores[scoreData.levelId].hasOwnProperty("score")){
                    if(player.topScores[scoreData.levelId].score < scoreData.score){
                        player.topScores[scoreData.levelId] = JSON.parse(JSON.stringify(scoreData));
                    }
                } else {
                    player.topScores[scoreData.levelId] = JSON.parse(JSON.stringify(scoreData));
                }
            }
            // } else {
            //     console.log("Found invalid levelId: " + scoreData.levelId);
            // }
            player.scores.push(scoreData);
        } else {
            var player = {
                username: scoreData.username,
                team: scoreData.team,
                schoolId: scoreData.schoolId,
                userId: scoreData.userId,
                scores: [scoreData],
                topScores: {
                    "custom_level_B3BD1BBBB18A53381E183EEADF78CCC5E523F07D": {},
                    "custom_level_D0B25B0B05C7B14C5EA55774D1F751705F360026": {},
                    "custom_level_AB36FD22C1060AC3696AF0CD6BD1E25DB3AEBF18": {}
                },
                songPlays:{
                    "custom_level_B3BD1BBBB18A53381E183EEADF78CCC5E523F07D": 0,
                    "custom_level_D0B25B0B05C7B14C5EA55774D1F751705F360026": 0,
                    "custom_level_AB36FD22C1060AC3696AF0CD6BD1E25DB3AEBF18": 0
                },
                totalScore: 0
            }
            player.topScores[scoreData.levelId] = JSON.parse(JSON.stringify(scoreData));
            player.songPlays[scoreData.levelId]++;
            playerId2Index[scoreData.userId] = playerList.length;
            playerList.push(player);
        }
    }

    for(index in playerList){
        player = playerList[index];
        player.songsCompleted = 0;
        for(levelId in player.topScores){
            if(player.topScores[levelId].hasOwnProperty("score")){
                player.totalScore += player.topScores[levelId].score;
                player.songsCompleted++;
            }
        }
    }

    playerList.sort(cvre_data.sortingFunctions[0].totalScore);

    for(index in playerList){
        player = playerList[index];
        player.rank = Number(index) + 1;
        if(player.rank <= 16){
            player.d1 = true;
        } else {
            player.d1 = false;
        }
    }

    cvre_data.playerList = playerList;

    cvre_data.reverseSort = !cvre_data.reverseSort;

    set_sort_method(cvre_data.sortingMethod);

}

function set_sort_method(method){

    if(method == cvre_data.sortingMethod){
        cvre_data.reverseSort = !cvre_data.reverseSort;
    } else {
        cvre_data.reverseSort = false;
    }

    cvre_data.sortingMethod = method;
    
    cvre_data.playerList.sort(cvre_data.sortingFunctions[cvre_data.reverseSort ? 1 : 0][method]);

    $(".arrow_down").css("visibility","hidden");
    $(".arrow_up").attr("hidden", "true");

    $("." + cvre_data.sortingMethod + "_" + (cvre_data.reverseSort ? "up" : "down")).css("visibility","visible").removeAttr("hidden");
    $("." + cvre_data.sortingMethod + "_" + (!cvre_data.reverseSort ? "up" : "down")).css("visibility","hidden").attr("hidden", "true");
    output_table();
}

function output_table(){
    var table_body = $("#large_scoreboard")[0].children[1];
    table_body.innerHTML = "";
    for(index in cvre_data.playerList){
        var player = cvre_data.playerList[index];
        var row = table_body.insertRow();
        row.className = "hoverable";
        row.insertCell().innerHTML = player.rank;
        row.insertCell().innerHTML = player.username;
        row.insertCell().innerHTML = player.team;
        row.insertCell().innerHTML = player.totalScore;
        row.onclick = new Function("","show_player_info(\""+index+"\");");
    }

    table_body = $("#small_scoreboard")[0].children[1];
    table_body.innerHTML = "";
    for(index in cvre_data.playerList){
        var player = cvre_data.playerList[index];
        var row = table_body.insertRow();
        // row.className = "hoverable";
        row.insertCell().innerHTML = player.rank;
        row.insertCell().innerHTML = player.username;
        row.insertCell().innerHTML = player.totalScore;
        row.onclick = new Function("","show_player_info(\""+index+"\");");
    }
}

function show_player_info(index){
    var player = cvre_data.playerList[index];
    console.log("showing user: "+ player.username);
    var modal = $("#player_info")[0];

    $("#player_info_username").html(player.username);
    var table_body = $("#song_table")[0].children[1];

    table_body.innerHTML = "";
    $("#mobile_score_cards")[0].innerHTML = "";

    for(levelId in player.topScores){
        var score_data = player.topScores[levelId];
        if(!score_data.hasOwnProperty("score")){
            continue;
        }
        var row = table_body.insertRow();
        row.insertCell().innerHTML = score_data.mapName;
        row.insertCell().innerHTML = score_data.score;
        row.insertCell().innerHTML = "" + Math.round(score_data.accuracy*10000)/100 + "%";
        row.insertCell().innerHTML = score_data.stats.averageCutScore;
        row.insertCell().innerHTML = score_data.stats.missedCount;
        row.insertCell().innerHTML = player.songPlays[levelId];

        var card = $("#score_card_template").clone().removeAttr("id").removeAttr("hidden");

        console.log(card);
        
        card.find("span").html(score_data.mapName);
        card.find("p").html("Score: " + score_data.score + "pts"
            + "<br>Accuracy: " + Math.round(score_data.accuracy*10000)/100 + "%"
            + "<br>Avg. Cut: " + score_data.stats.averageCutScore
            + "<br>Misses: " + score_data.stats.missedCount
            + "<br>Plays: " + player.songPlays[levelId])
        card.appendTo("#mobile_score_cards");
    }

    $("#player_info_bio").html("Team: " + player.team
        + "<br>Division: " + (player.d1 ? 1 : 2)
        + "<br>Uploads: " + player.scores.length
        + "<br>Songs Completed: " + player.songsCompleted);

    modal = M.Modal.getInstance(modal);
    modal.open();
}

$(document).ready(() => {
    M.AutoInit();
    cvre_data.sortingMethod = "rank";
    get_data();
    setInterval(get_data,1000*5);
});

