//replace SNAKE CASE w/ CAMEL CASE

function interestPageController(omdbAPI, interestAPIService, filmAPIService, meService, hateBuddiesAngstService, $interval) {
    const ctrl = this;
    ctrl.searchHistory = []; //a SESSION array of all data returned from omdbapi
    ctrl.films = null; //objects of data returned from omdbapi
    ctrl.search_capture = null; //what is typed by user
    ctrl.interestsHistory = []; //SESSION list of saved interests
    ctrl.allMyHates = []; //all a user's 'hates'; used within getMyAngst
    ctrl.allHate = []; // all every hates; used within getAllHate
    ctrl.displayMyHates = []; // used to display My Angst on the page (not for calcs in controller)
    ctrl.myAngst = false; // reveals myAngst in DOM
    ctrl.suggestions = false; // used to toggle singular search & suggestions

    ctrl.buddySocial = null;
    ctrl.buddyIDs = []; // getSocialLink

    function showMyAngst() {
        ctrl.myAngst = ctrl.myAngst ? false: true;
    }

    function searchFilms() {
        ctrl.suggestions = false; //for suggestion / single search toggle
        omdbAPI.get({
            t: ctrl.search_capture
        })
        .$promise.then( (data) => {
            ctrl.films = data;
            ctrl.searchHistory.push(data);
            // console.log(data);
        });

    } // END searchFilms

    function getRandomLetter() {
        let randoNumber1 = 0; //26 letters
        let randoNumber2 = 0;
        let randoLetter1 = "";
        let randoLetter2 = "";
        ctrl.randoLetter = "";
        const alphabet = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',]
        randoNumber1 = Math.floor(Math.random() * (27 - 1) + 1);
        randoNumber2 = Math.floor(Math.random() * (27 - 1) + 1);
        randoLetter1 = alphabet[randoNumber1 - 1];
        randoLetter2 = alphabet[randoNumber2 - 1];
        ctrl.randoLetters = randoLetter1 + randoLetter2;
    }

    function autoSearch() {
        ctrl.filmCount = 0;
        ctrl.suggestions = [];
        getRandomLetter();

        omdbAPI.get({
            s: ctrl.randoLetters
        })
        .$promise.then( (data) => {
            let cleanedData = [];

            if(data.Response === "False"){
                return autoSearch();
            }

            cleanedData = data.Search.filter(Boolean);

            if(cleanedData.length < 4) {
                return autoSearch();
            }

            for(let x = 0; x < 4; x++){
                if(cleanedData[x].Poster === "N/A"){
                    cleanedData[x].Poster = "http://www.downloadclipart.net/medium/18548-penta-star-clip-art.png"; //stock image
                }
                ctrl.suggestions.push(cleanedData[x]);
                if(ctrl.suggestions.length > 4) {
                    x = 4;
                }
            }
            // console.log(cleanedData);
        });

    } // END autoSearch

    function addInterest(savedInterest) { 
//ACTIVATES w/ HATE IT button; savedInterest -> ctrl.films -> interestPageCtrl.films
//  FIRST, saves film to db, THEN saves interest to db using film_id
        ctrl.savedInterest = {
            title: savedInterest.Title,
            genre: (savedInterest.Genre || "movie"),
            director: savedInterest.Director,
            imdbID: savedInterest.imdbID,
            plot: savedInterest.Plot,
            url: savedInterest.Poster,
        };

        filmAPIService.films.save(ctrl.savedInterest).$promise.then(
            (returnData) => {
                ctrl.interest = {
                    user: ctrl.user.id,
                    film: returnData.id,
                    imdbID: returnData.imdbID,
                    url: returnData.url,
                };
               // console.log(returnData);

//  could REFACTOR into 'addFilm()'' and call 'addInterests()'' within
                interestAPIService.createInterests.save(ctrl.interest).$promise.then(
                    (data) => {
                            // console.log(data);
                            ctrl.interestsHistory = [
                                data,
                                ...ctrl.interestsHistory,
// '...'' is an ES6 'spread operator'; takes every item in spread array 
//'...ctrl.interests' and pastes into parent array 'ctrl.interests'
                            ];
                    // console.log(ctrl.interestsHistory);
                    console.log(data);
                    alert('Hated!');
                    }
                );
        });
    } // END addInterest

// gathers ALL interests
    function getAllHate() {
        interestAPIService.interests.get().$promise.then(
            (data) => {
                ctrl.hateBall = data;
                for (let x = 0; x < ctrl.hateBall.results.length; x++) {
                    ctrl.allHate.push(ctrl.hateBall.results[x]);
                }

                getMyAngst();
            }
        );
    } // END getAllHate

//  filters 'ctrl.allHate' into 'ctrl.allMyHates'
    function getMyAngst() {
        for (let x = 0; x < ctrl.allHate.length; x++) {
            if (ctrl.allHate[x].user == ctrl.user.id) {
                ctrl.allMyHates.push(ctrl.allHate[x]);
            }
        }
        ctrl.displayMyHates = ctrl.allMyHates;

        displayMyAngst();
        compareAngst();
    } // END getMyAngst

//  compares 'ctrl.allMyHates' imdbID s w/ other imdbID s w/in 'ctrl.allHate'
//  stores results in 'ctrl.othersWithMe' as a 'hateBuddy' object
    function compareAngst() {
        ctrl.othersWithMe = [];
        let match = {};

        for (let i = 0; i < ctrl.allHate.length; i++) {
            for (let x = 0; x < ctrl.allMyHates.length; x++) {
                if (ctrl.allHate[i].imdbID == ctrl.allMyHates[x].imdbID && ctrl.allHate[i].user != ctrl.user.id) {
                    match = { 
                        hateBuddy : { 
                            userID: ctrl.allHate[i].user, 
                            imdbID: ctrl.allHate[i].imdbID, 
                            username: ctrl.allHate[i].username,
                            title: ctrl.allHate[i].film.title,
                            url: ctrl.allHate[i].film.url,
                        }
                    };
                    ctrl.othersWithMe.push(match);
                }
            }
        }
        // console.log(ctrl.othersWithMe);
        clearData();
    } // END compareAngst

// clears data so that interval doesn't aggregate 'ctrl.othersWithMe'
    function clearData () {
        ctrl.allHate = [];
        ctrl.allMyHates = [];
    }

// uses 'ctrl.othersWithMe' to grab user & imdbIDs
// 'ctrl.displayMyHates = ctrl.allMyHates' in 'getMyAngst()'
    function displayMyAngst() {
        if(ctrl.displayMyHates.length > 0){
            filmAPIService.films.get(ctrl.displayMyHates[0].user)
            .$promise.then( (data) => {
                // console.log(data);
                // console.log(ctrl.displayMyHates);
            });
        } else {
            alert('No films hated. Search for a film or get some suggestions and START HATING!');
        }
    }

// gets hate buddy's e-mail w/ hateBuddyID
    function getSocialLink() {
        // let idObject = {
        //    id: hateBuddyID,
        // };
        alert('working');
        // console.log(hateBuddyID);

        // hateBuddiesAngstService.buddies.get() 
        // .$promise.then((data) => {
        // console.log(data);
        // });
    }

// uses 'ctrl.buddySocial'
    function getOthersAngst() {

    }

// gets current user at /me
    function getMe() {
        meService.me().then( (me) => {
            // console.log(me);
            ctrl.user = me;
        })
    }

// PAGE LOAD functions
    getMe();
    getAllHate();//calls getMyAngst() w/in 'then clause'
    // $interval(getAllHate, 5000);

//  functions
    ctrl.showMyAngst = showMyAngst;
    ctrl.searchFilms = searchFilms;
    ctrl.getRandomLetter = getRandomLetter;
    ctrl.autoSearch = autoSearch; // auto populates w/o need for active search
    ctrl.addInterest = addInterest;
    ctrl.getAllHate = getAllHate; //gathers all 'interests/hates' into 'ctrl.hateBall'
    ctrl.getMyAngst = getMyAngst; //pulls 'my angst' from 'ctrl.hateBall'
    ctrl.compareAngst = compareAngst; // uses 'ctrl.allMyHates' & 'ctrl.allHate' to populate 'ctrl.othersWithMe'
    ctrl.clearData = clearData; // stopping aggregate 'push'to interval functions
    ctrl.displayMyAngst = displayMyAngst; // uses ctrl.displayMyAngst to render to html
    ctrl.getSocialLink = getSocialLink;
    ctrl.getOthersAngst = getOthersAngst;
}; // END interestPageController

export default interestPageController;