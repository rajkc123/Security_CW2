import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Pagination from '../../components/Pagination';
import './Practice.css'; // Import the custom CSS



//using regex for Progress report

const Practice = () => {
    const navigate = useNavigate();
    const [time, setTime] = useState(60);
    const [text, setText] = useState('');
    const [wordCount, setWordCount] = useState(0);
    const [tasks, setTasks] = useState([]); // Initialize tasks as an empty array
    const [currentPage, setCurrentPage] = useState(1); // State for current page
    const tasksPerPage = 1; // Number of tasks per page
    const [submittedAnswer, setSubmittedAnswer] = useState('');
    const [showExplanation, setShowExplanation] = useState(false);
    const [selectedTaskType, setSelectedTaskType] = useState('Write about the Photo'); // State for selected task type
    const [playCount, setPlayCount] = useState(0); // Track audio play count
    const audioRef = useRef(null);
    const [isDisabled, setIsDisabled] = useState(false); // State to track if input is disabled
    const [overallScore, setOverallScore] = useState(0); // State for overall progress score
    const [grammarPercentage, setGrammarPercentage] = useState(0); // State for grammar percentage
    const [subscriptionValid, setSubscriptionValid] = useState(null); // Check subscription status
    const [spellingPercentage, setSpellingPercentage] = useState(0); // State for spelling percentage

    const bottomRef = useRef(null); // Reference to scroll to the bottom


    useEffect(() => {
        // Verify user subscription
        const checkSubscription = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5002/api/profile/check-subscription', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
    
                if (response.data.active) {
                    setSubscriptionValid(true);  // Correctly set the subscription status
                } else {
                    setSubscriptionValid(false);
                    alert(response.data.message || 'You need a valid subscription to access this page.');
                    navigate('/pricing'); // Redirect to pricing page if no subscription
                }
            } catch (error) {
                console.error('Error checking subscription:', error);
                setSubscriptionValid(false);
                navigate('/pricing'); // Redirect in case of error
            }
        };
    
        checkSubscription();
    }, [navigate]);
    



    useEffect(() => {
        if (time > 0) {
            const timer = setInterval(() => {
                setTime(time - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else {
            handleSubmit(); // Automatically submit the answer when the timer reaches 0
            setIsDisabled(true); // Disable the text field
        }
    }, [time]);

    useEffect(() => {
        setWordCount(text.trim().split(/\s+/).filter(word => word.length > 0).length);
    }, [text]);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const url =
                    selectedTaskType === 'Write about the Photo'
                        ? 'http://localhost:5002/practiceTasks'
                        : 'http://localhost:5002/audioQuestions';

                const response = await axios.get(url);
                if (response.data && response.data.tasks) {
                    setTasks(response.data.tasks);
                } else {
                    setTasks(response.data.questions); // Ensure tasks is an empty array if nothing is returned
                }
            } catch (error) {
                console.error('Error fetching practice tasks:', error);
                setTasks([]); // Set tasks to an empty array if there's an error
            }
        };

        fetchTasks();
    }, [selectedTaskType]);

    const handleRetry = () => {
        setText('');
        setWordCount(0);
        setTime(60);
        setShowExplanation(false);
        setSubmittedAnswer('');
        setPlayCount(0); // Reset play count on retry
        setIsDisabled(false); // Enable the text field again
        setOverallScore(0); // Reset overall score
        setGrammarPercentage(0); // Reset grammar percentage
        setSpellingPercentage(0); // Reset spelling percentage
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    };

    const calculateGrammarPercentage = (userInput, explanation) => {
        const sanitizedInput = userInput.trim().toLowerCase();
        const sanitizedExplanation = explanation.trim().toLowerCase();

        // Match words between user input and explanation (basic grammar check)
        const userWords = sanitizedInput.split(/\s+/);
        const explanationWords = sanitizedExplanation.split(/\s+/);
        const matchedWords = userWords.filter(word => explanationWords.includes(word));

        // Calculate grammar percentage
        const percentage = (matchedWords.length / explanationWords.length) * 100;
        return percentage;
    };

    const calculateSpellingPercentage = (userInput, explanation) => {
        const sanitizedInput = userInput.trim().toLowerCase();
        const sanitizedExplanation = explanation.trim().toLowerCase();

        // Check for exact word matches
        const userWords = sanitizedInput.split(/\s+/);
        const explanationWords = sanitizedExplanation.split(/\s+/);
        const correctSpellingCount = userWords.reduce((count, word, index) => {
            return count + (word === explanationWords[index] ? 1 : 0);
        }, 0);

        // Calculate spelling percentage
        const percentage = (correctSpellingCount / explanationWords.length) * 100;
        return percentage;
    };

    const handleSubmit = () => {
        setSubmittedAnswer(text);
        setShowExplanation(true);
        setIsDisabled(true); // Disable the text field after submission

        // Calculate the grammar and spelling percentages
        const currentTask = tasks[currentPage - 1];
        if (currentTask) {
            const grammar = calculateGrammarPercentage(text, currentTask.explanation);
            const spelling = calculateSpellingPercentage(text, currentTask.explanation);
            const overall = (grammar + spelling) / 2; // Calculate overall score as an average

            setGrammarPercentage(grammar);
            setSpellingPercentage(spelling);
            setOverallScore(overall);
        }

        // Scroll to the bottom of the page when the progress report appears
        setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        handleRetry(); // Reset state for the new page
    };

    const handleAudioPlay = () => {
        if (playCount < 3) {
            setPlayCount(playCount + 1);
            audioRef.current.play();
        }
    };

    // Calculate the current task based on the current page
    const indexOfLastTask = currentPage * tasksPerPage;
    const indexOfFirstTask = indexOfLastTask - tasksPerPage;
    const currentTasks = tasks.slice(indexOfFirstTask, indexOfLastTask);

    return (
        <div>
            <Navbar />
            <div className="container my-5">
                <div className="mb-4">
                    <label htmlFor="taskTypeSelect" className="form-label">Select Task Type</label>
                    <select
                        id="taskTypeSelect"
                        className="form-select"
                        value={selectedTaskType}
                        onChange={(e) => {
                            setSelectedTaskType(e.target.value);
                            setCurrentPage(1); // Reset to the first page when task type changes
                            handleRetry(); // Reset task-specific states
                        }}
                    >
                        <option value="Write about the Photo">Write about the Photo</option>
                        <option value="Listen and Type">Listen and Type</option>
                    </select>
                </div>

                {tasks && tasks.length > 0 ? (
                    currentTasks.map((task, index) => (
                        <div key={index} className="card p-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="m-0">Task: <span className="badge bg-warning text-dark">{task.taskType}</span></h5>
                                <div className="text-right" style={{ fontSize: '2rem' }}>
                                    <span>{String(Math.floor(time / 60)).padStart(2, '0')}:{String(time % 60).padStart(2, '0')}</span>
                                </div>
                            </div>

                            {selectedTaskType === 'Write about the Photo' ? (
                                <>
                                    <div className="text-center mb-3">
                                        <h6>Write one or more sentences about the image</h6>
                                    </div>
                                    <div className="text-center mb-3">
                                        <img src={`http://localhost:5002/uploads/${task.imageUrl}`} alt="Example" className="img-fluid" width={'400px'} />
                                    </div>
                                    <hr />
                                    <div className="text-center mb-3">
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            placeholder="Type Here..."
                                            value={text}
                                            onChange={(e) => setText(e.target.value)}
                                            disabled={isDisabled} // Disable the text field if isDisabled is true
                                        ></textarea>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="text-center mb-3">
                                        <h6>Listen and type what you hear</h6>
                                    </div>
                                    <div className="text-center mb-3">
                                        <div className="custom-audio-button" onClick={handleAudioPlay}>
                                            <img src={'play_button.png'} alt="Play" />
                                        </div>
                                        <audio
                                            ref={audioRef}
                                            src={`http://localhost:5002/uploads/${task.audioUrl}`}
                                            onEnded={() => setPlayCount(playCount)}
                                        />
                                        <hr />
                                        <p>{3 - playCount} listens remaining</p>
                                    </div>
                                    <div className="text-center mb-3">
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            placeholder="Type Here..."
                                            value={text}
                                            onChange={(e) => setText(e.target.value)}
                                            disabled={isDisabled} // Disable the text field if isDisabled is true
                                        ></textarea>
                                    </div>
                                </>
                            )}

                            <div className="d-flex justify-content-between align-items-center">
                                <button className="btn btn-warning" onClick={handleRetry}>Retry</button>
                                <div>
                                    <span>Word count: {wordCount}</span>
                                </div>
                                <button className="btn btn-warning" onClick={handleSubmit} disabled={isDisabled}>Submit</button> {/* Disable submit button if time has finished */}
                            </div>
                            {showExplanation && (
                                <div className="mt-3">
                                    <h6 className='answer-label'>Your Answer:</h6>
                                    <p>{submittedAnswer}</p>
                                    <h6 className='answer-label'>Explanation:</h6>
                                    <p>{task.explanation}</p>
                                    <h6 className='progress-bar-label'>Progress Report:</h6>
                                    <div className="progress-container">
                                        <div className="progress-bar-wrapper">
                                            <p className='progress-bar-label'>Overall Score:</p>
                                            <div className="progress">
                                                <div className={`progress-bar ${overallScore >= 40 ? 'bg-success' : 'bg-danger'}`} role="progressbar" style={{ width: `${overallScore}%` }}>
                                                    {overallScore.toFixed(2)}%
                                                </div>
                                            </div>
                                        </div>
                                        <div className="progress-bar-wrapper">
                                            <p className='progress-bar-label'>Grammar:</p>
                                            <div className="progress">
                                                <div className={`progress-bar ${grammarPercentage >= 40 ? 'bg-success' : 'bg-danger'}`} role="progressbar" style={{ width: `${grammarPercentage}%` }}>
                                                    {grammarPercentage.toFixed(2)}%
                                                </div>
                                            </div>
                                        </div>
                                        <div className="progress-bar-wrapper">
                                            <p className='progress-bar-label'>Spelling:</p>
                                            <div className="progress">
                                                <div className={`progress-bar ${spellingPercentage >= 40 ? 'bg-success' : 'bg-danger'}`} role="progressbar" style={{ width: `${spellingPercentage}%` }}>
                                                    {spellingPercentage.toFixed(2)}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef}></div> {/* Reference to scroll to the bottom */}
                        </div>
                    ))
                ) : (
                    <p>No tasks found.</p>
                )}

                <Pagination
                    tasksPerPage={tasksPerPage}
                    totalTasks={tasks.length}
                    paginate={handlePageChange}
                    currentPage={currentPage}
                />
            </div>
        </div>
    );
};

export default Practice;