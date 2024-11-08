/**
 * @fileoverview
 * Provides the JavaScript interactions for all pages.
 *
 * @author 
 * Victoria JAmes
 */

/** namespace. */
var rhit = rhit || {};




rhit.quizPageManager = null; 
rhit.fbleaderBoardManager = null; 
rhit.movieQuestionsAPI = "https://opentdb.com/api.php?amount=10&category=11&difficulty=medium&type=multiple"; 
rhit.videoGameQuestionsAPI = "https://opentdb.com/api.php?amount=10&category=15&difficulty=medium&type=multiple"; 
rhit.mythologyQuestionsAPI = "https://opentdb.com/api.php?amount=10&category=20&difficulty=medium&type=multiple"; 
rhit.FB_KEY_CATEGORY = "category"; 
rhit.FB_KEY_NICKNAME = "nickname"; 
rhit.FB_KEY_SCORE= "score"; 
rhit.FB_KEY_COLLECTION_LEADERBOARD = "LeaderBoard"; 


//sources:
//https://dev.to/codebubb/how-to-shuffle-an-array-in-javascript-2ikj#:~:text=The%20first%20and%20simplest%20way,)%20%3D%3E%200.5%20%2D%20Math.


//Function used in previous projects with citation
//https://stackoverflow.com/questions/61555636/firebase-firebase-h-file-not-found
function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}


rhit.QuizPageController = class { 
	constructor(){ 
		this.correctIndex = null; 
		this.questionNumber = 0; 
		this.ansOrder = null; 
		console.log("new Quiz Page Cotroller")
		const mcqButtons = document.querySelectorAll('.mcq-button'); 
		
		$("#pickCategory").modal('show'); 
		
		mcqButtons.forEach( button => { 
			button.addEventListener("click", (event)=>{ 

				const value = button.dataset.value; 
				console.log("MCQ index " + value + " pressed"); 
				this.updateScore(value); 
			});
		}); 
		document.getElementById("submitScoreBTN").addEventListener("click", event => { 
			console.log("submitScore"); 
			const score = rhit.quizPageManager.getScore(); 
			const category = this.newHTML; 
			
			if(document.getElementById("inputName").value == "")this.name ="Anonymous"; 
			else this.name = document.getElementById("inputName").value; 
			rhit.fbleaderBoardManager.add(this.name , score, category).then(()=> { 
				window.location.href  = "/LeaderBoard.html"; 

			}); 

		}); 

		const playButton = document.querySelector("#playButton"); 
		playButton.addEventListener("click", (event)=> { 
			const dropDown = document.getElementById("dropDown"); 
			console.log(dropDown.value) ; 
			if(dropDown.value == 0){ 
				document.getElementById("alert").innerHTML = "You Must Select a Category!"; 
			}
			else{ 
				this.newHTML = "Fml"; 
				if(dropDown.value==1)this.newHTML = "Movies"; 
				else if(dropDown.value==2)this.newHTML = "Video Games"; 
				else this.newHTML = "Mythology"; 

				document.getElementById('categoryText').innerHTML = this.newHTML; 
				rhit.quizPageManager = new rhit.QuizPageManager(dropDown.value); 
				rhit.quizPageManager.createQuiz().then(variable => {
					$("#pickCategory").modal('hide');
					this.updatePage(); 
				}); 

			}
			

		}); 


	}


	updateScore(value){ 
		if(this.ansOrder[value]==1){ 
			console.log("Correct Answer!")
			rhit.quizPageManager.incScore(); 
		}
		this.questionNumber++; 
		this.updatePage(); 
			
	}
	updatePage(){ 
		if(this.questionNumber == 10){ 

			this.endGame(); 
		}
		else{
		console.log("updatePage"); 
		const questionStr = rhit.quizPageManager.getQuestion(this.questionNumber); 
		this.ansOrder = rhit.quizPageManager.getRandomAnswerOrder(); 
		this.ansOrder = rhit.quizPageManager.getRandomAnswerOrder(); 
		//set question html
		document.getElementById("question").innerHTML = questionStr; 

		//set answers html
		document.getElementById("mCQ1").innerHTML = rhit.quizPageManager.getAnswers(this.questionNumber, this.ansOrder[0]); 
		document.getElementById("mCQ2").innerHTML = rhit.quizPageManager.getAnswers(this.questionNumber, this.ansOrder[1]);
		document.getElementById("mCQ3").innerHTML = rhit.quizPageManager.getAnswers(this.questionNumber, this.ansOrder[2]);
		document.getElementById("mCQ4").innerHTML = rhit.quizPageManager.getAnswers(this.questionNumber, this.ansOrder[3]);
		}

	}
	endGame(){ 
		document.getElementById("scoreReport").innerHTML= `Your score was ${rhit.quizPageManager.getScore()}/10!`; 
		$("#finalScoreModal").modal('show'); 
	}
}

rhit.QuizPageManager = class { 
	constructor(category){ 
		this.score =0; 
		console.log("new Quiz Page Manager!")
		this.category = category;
		if(this.category==1){ 
			this.apiHandler = new rhit.apiHandler(rhit.movieQuestionsAPI); 
		} 
		else if(this.category == 2){ 
			this.apiHandler = new rhit.apiHandler(rhit.videoGameQuestionsAPI); 
		}
		else{ 
			this.apiHandler = new rhit.apiHandler(rhit.mythologyQuestionsAPI); 
		}


	}

	createQuiz(){ 
	
		return this.apiHandler.getQuestionList().then(() => {
			
			this.questionList = this.apiHandler.questionList;
			console.log(this.questionList);

			
			return this.questionList; 
		}); 
	}

	getQuestion(question){ 
		return this.questionList[question][0]; 
	}
	getAnswers(question, index){ 
		console.log("i: " + index + " Q: " + question); 
		return this.questionList[question][index]; 
	}


	incScore(){ 
		this.score+=1; 

	}

	submitScoreToLeaderBoard(){ 

	}
	getRandomAnswerOrder(){
		let myArray = [1,2,3,4]
		return myArray.sort(() => Math.random() - 0.5);

	}

	getScore(){ 
		return this.score; 
	}

}

rhit.apiHandler= class  { 
	constructor(api){ 
		this.api = api; 
		this.data = null; 
		this.questionList = []; 
	}

	getQuestionList(){ 
		this.questionList = []; 
		return fetch(this.api) 
			.then(response => response.json())
			.then(data => {
				console.log(data);
				this.data = data; 
				console.log(data.results[0].question + " 1 "); 
				
				for(let i =0; i<10; i++){
					const questionArray = []; 
					questionArray.push(data.results[i].question); 
					questionArray.push(data.results[i].correct_answer); 
					questionArray.push(data.results[i].incorrect_answers[0]);
					questionArray.push(data.results[i].incorrect_answers[1] ); 
					questionArray.push(data.results[i].incorrect_answers[2] ); 
					this.questionList.push(questionArray); 
				}
				
			}); 
			return this.questionList;
	}

	
}

rhit.LeaderBoardController = class{ 
	constructor(){
		rhit.fbleaderBoardManager.beginListening(this.updateList.bind(this));
	}

	_createCard(entry, num) {
		return htmlToElement(`  <div class="card">
        <div class="card-body">
          <h5 class="card-title">#${num}  ${entry.name}</h5>
          <h6 class="card-subtitle mb-2 ">Category: ${entry.category}</h6>
		  <h6 class="card-subtitle mb-2 ">Score: ${entry.score}/10</h6>

        </div>
      </div>`);
	}



	updateList() {
		console.log("updateList");
		const newList = htmlToElement('<div id="leaderBoard"></div>');
		for (let i = 0; i < rhit.fbleaderBoardManager.length; i++) {

			const entry = rhit.fbleaderBoardManager.getEntryAtIndex(i);
			const newCard = this._createCard(entry, i+1);


			newList.appendChild(newCard);
		}
		//remove old
		const oldList = document.querySelector("#leaderBoard")
		oldList.removeAttribute("id");
		oldList.hidden = true;
		//Put in new list container 
		oldList.parentElement.appendChild(newList);
	}
}



rhit.LeaderEntry = class { 
	constructor (id, name, score, category){ 
		this.id = id; 
		this.name = name; 
		this.score = score; 
		this.category = category; 
	}
}

rhit.LeaderBoardManager = class { 
	constructor(){ 
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_KEY_COLLECTION_LEADERBOARD);
		this._unsubscribe = null;
	}

	add(name, score, category) {
		console.log("attempt add"); 
		return this._ref.add({
			[rhit.FB_KEY_NICKNAME]: name,
			[rhit.FB_KEY_SCORE]: score,
			[rhit.FB_KEY_CATEGORY]: category,
		})
		.then(function(docRef) {
			console.log("Document written with ID: ", docRef.id);
			return Promise.resolve(); 
		})
		.catch(function(error) {
			console.error("Error adding document: ", error);
			return Promise.reject(error);  
		});
	}

	beginListening(changeListener){ 
		this._unsubscribe = this._ref.orderBy(rhit.FB_KEY_SCORE, "desc")
		.limit(20)
		.onSnapshot((querySnapshot) => {
			console.log("Leaderboard Update");

			this._documentSnapshots = querySnapshot.docs;

			changeListener();
		});

	}

	stopListening() {
		this._unsubscribe();
	}
	getEntryAtIndex(index){ 
		const docSnapshot = this._documentSnapshots[index];
		const entry = new rhit.LeaderEntry(
			docSnapshot.id,
			docSnapshot.get(rhit.FB_KEY_NICKNAME),
			docSnapshot.get(rhit.FB_KEY_SCORE),
			docSnapshot.get(rhit.FB_KEY_CATEGORY)); 

			
		return entry;
	}
	get length() {
		return this._documentSnapshots.length;

	}
}
	

/* Main, handles detecting page and running their controllers */

rhit.main = function () {
	console.log("Ready");
	rhit.fbleaderBoardManager = new rhit.LeaderBoardManager(); 

	if(document.querySelector("#mainPage")){ 
		console.log("You are on the main page, all functionality handled in html"); 
	}
	if(document.querySelector("#leaderPage")){ 
		console.log("You are at the Leaderboard"); 
		rhit.fbleaderBoardManager = new rhit.LeaderBoardManager(); 

		new rhit.LeaderBoardController(); 
	}
	if(document.querySelector("#quizPage")){ 
		console.log("You are on the quiz page"); 
		
		new rhit.QuizPageController(); 
	}
};

rhit.main();
