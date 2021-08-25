"use strict";

//declare global vars here
var games; //collects JSON data
var slcLeagues;//select
var selectedLeague //helps build the games list table
//divs
var divLeagues;
var divGames;
var divBets;
var divResults;
//btns
var btnSave;
//tbls
var tblLeagues; //icoontjes
var tblGames;//wedstrijden
var tblBets;//betting form
var tblOutcome;//result

//wait for document load
window.addEventListener('load',Initialize);
/**
 * Main program
 */
function Initialize()
{
    //parse JSON;
    games  = JSON.parse(fixtures);
    //or perform API call
    BindElements();
    LoadLeaguesInList();//load the select list
    ShowLogos();//show the logos
    AddEvents();//add the events
    //make buttons invisible with visibility property
    
    SetElementVisibility(btnSave,"hidden");
    
}

/**
 * Binds the elements
 */
function BindElements()
{
    slcLeagues  = document.querySelector("#slcleagues");
    //divs
    divLeagues = document.querySelector("#divleagues");
    divGames = document.querySelector("#divgames");
    divBets = document.querySelector("#divbets");
    divResults = document.querySelector("#divresults");
    //btns
    btnSave  = document.querySelector("#btnsave");
    
}
/**
 * loads the leagues in list
 */
function LoadLeaguesInList()
{
    //empty the list
    slcLeagues.innerHTML = "";
    
    //load the leagues
    //for in loops over object properties
    //javascript object = key=>value pair array
    //games['SerieA'] = Games[...];
    for(let league in games)
    {
        slcLeagues.options.add
        (
            new Option(league,league)
        );
    }
}
/**
 * shows the league logos
 */
function ShowLogos()
{
    //var for path
    let path = "";
    let tableData = "<tr>";
    //create the table
    tblLeagues = document.createElement('table');
    //loop through the leagues to get the logos
    for(let league in games)
    {
        //get the logos
        path = `img/${league}/${games[league].Logo}`;
        tableData+= `<td><img id="${league}" src="${path}" height="150" width="150"></td>`;
    }
    //close row
    tableData += "</tr>";
    //add to table
    tblLeagues.innerHTML = tableData;
    //add table to div
    divLeagues.append(tblLeagues);
}
/**
 * adds all the events
 */
function AddEvents()
{
    btnSave.addEventListener("click", SaveBets);
    //add list event
    slcLeagues.addEventListener("change", ShowGamesInLeague);
    //add to logos
    AddEventsToLogos();
}

/**
 * adds the events to the logos
 */
function AddEventsToLogos()
{
    //divLeagues bevat de een table met imgs
    let imgLogos = divLeagues.querySelectorAll("img");
    //returns nodelist ==> array
    imgLogos.forEach(element => 
    {
        element.addEventListener("click",ShowGamesInLeague);    
    });
}
/**
 * Shows the games by building the table
 * and passing to div
 */
function ShowGamesInLeague()
{
    //Reset the UI
    ResetUI();
    
    //empty the bets div
    divBets.innerHTML = "";
    //empty the game div
    divGames.innerHTML = "";
    let gamesInLeague;
    if(this.tagName == "SELECT")//change in Select
    //has to be CAPS
    {
        selectedLeague = slcLeagues.options[slcLeagues.selectedIndex].value;
    }
    else//click from image
    {
        //get the league from img id
        selectedLeague = this.id;
        //switches the select list to the clicked league
        ChangeSelect(selectedLeague);
    }
    //get the games from the JSON array
    gamesInLeague = games[selectedLeague];
    //build the game table
    divGames.appendChild(BuildTableFromGames(gamesInLeague));

    
    //add event listeners to checkboxes
    AddEventsToCheckboxes();
    //show the table
    SetElementVisibility(divGames,"visible");
}

/**
 * builds the game table
 * @param {*} gamesInLeague 
 */
function BuildTableFromGames(gamesInLeague)
{
    let tableForGames = document.createElement('table');
    let tableRow = "";

    tableForGames.innerHTML += `<th>Bet</th><th>Home</th><th>Away</th><th>Win Draw Loose<th>`;

    if(!Array.isArray(gamesInLeague.Games))
    {
        tableRow += BuildGamesTableRow(gameInLeague.Games);
    }
    else
    {
        gamesInLeague.Games.forEach(game => 
            {
                tableRow += BuildGamesTableRow(game, selectedLeague);
            });
    }
    tableForGames.innerHTML += tableRow;
    tableForGames.innerHTML += "</table>";
    return tableForGames;


    
}
/**
 * builds the row for the games table
 * @param {*} game 
 */
function BuildGamesTableRow(game,league)
{
   let row = `<tr><td><input type="checkbox" id="${league}" value="${game.Id}"></td>
            <td>${game.Home}</td>
            <td>${game.Away}</td>
            <td>${game.Quote.Win}  ${game.Quote.Draw} ${game.Quote.Lose}</td></tr>`;
   return row;
}

/**
 * this function adds events to the games checkboxes
 */
function AddEventsToCheckboxes()
{
    //get the checkboxes
    let chxGames = divGames.querySelectorAll("input[type='checkbox']");
    chxGames.forEach(game => 
    {
        game.addEventListener("click",()=>{ShowBettingForm(chxGames);});
        
    })
}

/**
 * Checks if var is array
 * @param {*} arToCheck 
 */
function IsArray(arToCheck)
{
    return Array.isArray(arToCheck);
}

/**
 * show the form to make a bet
 * @param {} chxGames 
 */
function ShowBettingForm(chxGames)
{
    //empty the div
    divBets.innerHTML = "";
    //holds the games
    let selectedGames = new Array()
    if(!IsArray(games[selectedLeague].Games))
    {
        //only one game
        selectedGames.push(games[selectedLeague].Games);
    }
    else
    {
        //loop through selected chxboxes
        chxGames.forEach(chxGame =>
        {
            //if checked get the games from the array
            if(chxGame.checked)
            {
               //find the game int the games array of the gameleague
               let game = games[chxGame.id].Games.find(game =>{return game.Id == chxGame.value});
               selectedGames.push(game);
            }
        });
    }
    //pass the selected games to build the form
    divBets.append(BuildBettingForm(selectedGames));
    //show the divBets
    SetElementVisibility(divBets,"visible");
}
/**
 * set the visibility of an element
 * @param {} element
 * @param {} visibility 
 */
function SetElementVisibility(element,visibility)
{
    element.style.visibility = visibility;
}

/**
 * builds the betting form
 * @param {} games 
 */
function BuildBettingForm(games)
{
    //create a table
    let betTable = document.createElement('table');
    //set the id
    betTable.id = "tblBets";
    if(games.length > 0)
    {
        //show the save bets button
        SetElementVisibility(btnSave,"visible");
        //add table header
        betTable.innerHTML = 
            `<tr>
                <th>Home</th>
                <th>Away</th>
                <th>Outcome</th>
                <th>Amount</th>
            </tr>`;
        //add games
        games.forEach(game =>
        {
            //input type text with id = league_gameId for outcome
            //input type text with id gameId_amount for bet
            betTable.innerHTML += 
            `<tr><td>${game.Home}</td>
             <td>${game.Away}</td>
             <td>
             <select id=slcOutcome_${game.Id}>
                <option value='win'>Win</option>
                <option value='lose'>Lose</option>
                <option value='draw'>Draw</option>
             </select</td>
             <td><input type="number" id="txtAmount_${game.Id}">
             </tr>`;
        });
    }
    else
    {
        SetElementVisibility(btnSave,"hidden");
    }
    return betTable;
}

/**
 * saves the bet to the array
 */
function SaveBets()
{
    //collect the data from the betting table
    let tblBets = document.querySelector("#tblBets");//betting table
    let betsAmount = tblBets.querySelectorAll("input[type='number']");//amount input type text
    //make a betting array to hold betting objects
    let arBets = new Array();
    //if multiple games loop over the txtamount input types
    
    
    betsAmount.forEach(amount =>
    {
        //Make an object
        let bet = new Object();
        //get the id
        bet.Id = GetGameIdFromInputId(amount.id);
        //get the outcome prediction using the Id (gameid)
        bet.Outcome = GetPredictedOutcome(bet.Id);
        //get the amount
        bet.Amount = amount.value;
        //get the quote from JSON array using the predicted Outcome (Win,Lose,Draw)
        //check if Leaugue Games property is an array (Bundesliga only has one game)
        if(Array.isArray(games[selectedLeague].Games))
            bet.Quote = games[selectedLeague].Games[bet.Id-1].Quote[bet.Outcome];
        else
        bet.Quote = games[selectedLeague].Games.Quote[bet.Outcome];
        //add to objects array
        arBets.push(bet);
    });
    
    //call showresult function
    ShowResult(arBets);
}
/**
 * returns the selected outcome value
 * @param {} id 
 */
function GetPredictedOutcome(id)
{
    let slcOutcome = document.querySelector(`#slcOutcome_${id}`);
    return slcOutcome.options[slcOutcome.selectedIndex].text;
}

/**
 * simulates outcome with random number
 */
function SimulateOutcome()
{
    let randomOutcome = Math.ceil(Math.random()*3);
    let outcome;
    switch (randomOutcome)
    {
        case 1:
            outcome = "Win";
            break;
        case 2:
            outcome = "Lose";
            break;
        case 3:
            outcome = "Draw";
            break;
    }
    return outcome;
}

/**
 * gets the game Id from the input txtAmount, and select slcOutcome
 * @param {} id 
 */
function GetGameIdFromInputId(id)
{
    return id.substr(id.indexOf("_")+1,1);
}

/**
 * Simulate bets and show results
 * @param {*} bets 
 */
function ShowResult(bets)
{
    let win = 0;
    //loop over the bets
    bets.forEach(bet => 
    {
        //generate random outcome and check with predicted outcome
        //add property SimulatedOutcome to bet object
        bet.SimulatedOutcome = SimulateOutcome();
        if(bet.Outcome == bet.SimulatedOutcome)
        {
            //calculate win
            bet.Win = Math.round(bet.Amount * bet.Quote);
        }
        else
        {
            bet.Win = 0;
        }
    });
    BuildResultTable(bets);
}
/**
 * builds the table for the results
 */
function BuildResultTable(bets)
{
    //hide everything
    ResetUI();
    //empty the divResults
    divResults.innerHTML = "";
    let resultsTable ="<table>";
    resultsTable += `<tr>
                    <th>Home</th>
                    <th>Away</th>
                    <th>Predicted</th>
                    <th>Outcome</th>
                    <th>You Win</th>
                </tr>`;
    //loop over the bets
    bets.forEach(bet =>
    {
        if(Array.isArray(games[selectedLeague].Games))//leaugue with multiple games
        {
            resultsTable += 
            `<td>${games[selectedLeague].Games[bet.Id-1].Home}</td>
            <td>${games[selectedLeague].Games[bet.Id-1].Away}</td>`;
        }
        else//league with one game
        {
            resultsTable +=
            `<td>${games[selectedLeague].Games.Home}</td>
            <td>${games[selectedLeague].Games.Away}</td>`;
        }
        resultsTable += 
        `<td>${bet.Outcome}</td>
        <td>${bet.SimulatedOutcome}</td>
        <td>${bet.Win} Euro</td>
        </tr>`;
    });
    resultsTable += '</table>';
    divResults.innerHTML = resultsTable;
    //show the divresults
    SetElementVisibility(divResults,"visible");
}

/**
 * makes all the divs not visbile
 */
function ResetUI()
{
    SetElementVisibility(divGames,"collapse");
    SetElementVisibility(divBets,"collapse");
    SetElementVisibility(btnSave,"collapse");
    SetElementVisibility(divResults,"collapse");
}

/**
 * Adapts the clicked League in select
 */
function ChangeSelect(chosenLeague)
{
    for(let index in slcLeagues)
    {
        if (slcLeagues[index].value == chosenLeague)
        {
            slcLeagues.selectedIndex = index;
            break;
        }
    }
}
