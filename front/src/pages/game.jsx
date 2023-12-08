// import Canvas from "../WebGL/Game/Canvas.jsx";
import questionsAnswer from "../data/questions.json";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Island } from "@/components/Island/Island";

const Game = () => {
  const { user, loggedIn, isLoading } = useContext(AuthContext);
  const [gameState, setGameState] = useState("started");
  const [questions, setQuestions] = useState(questionsAnswer.questions);
  const [question, setQuestion] = useState({});
  const [level, setLevel] = useState(1);
  const [progress, setProgress] = useState([]);
  const LastLevel = 8 + 1;

  useEffect(() => {
    const currentQuestion = questions.find((q) => q.level === level);
    setQuestion(currentQuestion);
  }, [questions, level]);

  const handleAnswer = (answer) => {
    if (answer.status) {
      setProgress([...progress, { level: level, reponse: true }]);
      setLevel(level + 1);
    } else {
      setProgress([...progress, { level: level, reponse: false }]);
      setLevel(level + 1);
    }
  };

  useEffect(() => {
    if (user && loggedIn && !isLoading) {
      fetch("http://localhost:5001/v1/game/getprogression", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.progression) {
            setProgress(JSON.parse(data.progression));
            if (JSON.parse(data.progression).length > 0) {
              const lastLevel = JSON.parse(data.progression).pop().level;
              setLevel(lastLevel + 1);
            }
          } else {
            setProgress([]);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
    if (!user && !loggedIn && !isLoading) {
      const savedProgress = localStorage.getItem("progress");
      if (savedProgress) {
        setProgress(JSON.parse(savedProgress));
        if (JSON.parse(savedProgress).length > 0) {
          const lastLevel = JSON.parse(savedProgress).pop().level;
          setLevel(lastLevel + 1);
        }
      } else {
        setProgress([]);
      }
    }
  }, [user, loggedIn, isLoading]);

  useEffect(() => {
    if (user && loggedIn && !isLoading) {
      if (progress.length > 0) {
        fetch("http://localhost:5001/v1/game/updateprogression", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: new URLSearchParams({
            progression: JSON.stringify(progress),
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log(data);
          })
          .catch((error) => {
            console.error(error);
          });
      }
    }
    if (!user && !loggedIn && !isLoading) {
      localStorage.setItem("progress", JSON.stringify(progress));
    }
  }, [progress, user, loggedIn, isLoading]);

  const startNewGame = () => {
    setLevel(1);
    setProgress([]);
    setGameState("new");
  };

  const continueGame = () => {
    setGameState("continue");
  };

  return (
    <div className="game">
      {LastLevel === level ? (
        <div className="end">
          <h1>Fin du jeu</h1>
          <p>
            Vous avez répondu correctement à{" "}
            {progress.filter((item) => item.reponse === true).length} questions
            sur {LastLevel - 1}
          </p>
        </div>
      ) : (
        <>
          {gameState === "new" && (
            <div className="new-game-screen">
              <h1>Nouvelle partie</h1>
              <button onClick={() => setGameState("started")}>Commencer</button>
            </div>
          )}

          {gameState === "continue" && (
            <div className="continue-screen">
              <h1>Continuer la partie</h1>
              <button onClick={() => setGameState("started")}>Continuer</button>
            </div>
          )}

          {gameState === "started" && (
            <>
              <Island />
              <div className="game_popup">
                <h2>{question.question}</h2>
                <div className="answers">
                  {question.reponses &&
                    (() => {
                      const falseAnswers = {
                        answer: question.reponses.incorrecte,
                        status: false,
                      };
                      const correctAnswer = {
                        answer: question.reponses.correcte,
                        status: true,
                      };
                      const answers = [falseAnswers, correctAnswer];
                      return answers.map((answer, index) => (
                        <button
                          className="primary"
                          key={index}
                          onClick={() => handleAnswer(answer)}
                        >
                          {answer.answer}
                        </button>
                      ));
                    })()}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Game;