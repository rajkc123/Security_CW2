import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../../components/Navbar';
import './AdminDashboard.css'; // Import the custom CSS

const AdminDashboard = () => {
    const [taskType, setTaskType] = useState('Write about the Photo'); // State for the task type
    const [mediaFile, setMediaFile] = useState(null); // State for the selected media file (image or audio)
    const [mediaPreview, setMediaPreview] = useState(null); // State for the media preview URL
    const [explanation, setExplanation] = useState(''); // State for the task explanation
    const [tasks, setTasks] = useState([]); // State for the list of tasks

    // Define URL based on the selected task type
    const getTaskPostURL = useCallback(() => {
        return taskType === 'Write about the Photo' 
            ? 'http://localhost:5002/practiceTasks'
            : 'http://localhost:5002/audioQuestions';
    }, [taskType]);

    // Fetch tasks based on the selected task type
    const fetchTasks = useCallback(async () => {
        try {
            const response = await axios.get(getTaskPostURL());
            if (response.data.tasks) {
                setTasks(response.data.tasks); // Set the tasks state with the fetched data
            } else {
                setTasks([]); // Ensure tasks is an empty array if nothing is returned
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setTasks([]); // Set tasks to an empty array if there's an error
            toast.error('Error fetching tasks'); // Display an error toast message
        }
    }, [getTaskPostURL]);



    // Fetch tasks when the component mounts and when taskType changes
    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);



    // Handle media file selection (image or audio)
    const handleMediaChange = (e) => {
        const file = e.target.files[0];
        setMediaFile(file); // Set the selected media file state
        setMediaPreview(URL.createObjectURL(file)); // Create and set the media preview URL
    };

    // Handle form submission to add a new task
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('taskType', taskType); // Append task type to the form data
        formData.append(taskType === 'Write about the Photo' ? 'image' : 'audio', mediaFile); // Append the correct file type (image or audio)
        formData.append('explanation', explanation); // Append explanation to the form data

        try {
            await axios.post(getTaskPostURL(), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Set the content type header for file uploads
                },
            });
            toast.success('Task added successfully'); // Display a success toast message
            // Reset form fields
            setTaskType('Write about the Photo');
            setMediaFile(null);
            setMediaPreview(null);
            setExplanation('');
            // Fetch updated tasks
            fetchTasks();
        } catch (err) {
            console.error(err);
            toast.error('Failed to add task'); // Display an error toast message
        }
    };

    // Handle task deletion
    const handleDelete = async (taskId) => {
        try {
            const deleteURL = taskType === 'Write about the Photo'
                ? `http://localhost:5002/practiceTasks/${taskId}`
                : `http://localhost:5002/audioQuestions/${taskId}`;

            await axios.delete(deleteURL); // Delete the task by its ID
            setTasks(tasks.filter(task => task._id !== taskId)); // Update the tasks state by filtering out the deleted task
            toast.success('Task deleted successfully'); // Display a success toast message
        } catch (err) {
            console.error('Error deleting task:', err);
            toast.error('Failed to delete task'); // Display an error toast message
        }
    };

    return (
        <div>
            <Navbar />
            <div className='backgorund'>
            <img src="/profile_back.jpg" alt="bg-image" className="bg-image" />
                
            <div className="container my-5">
                <ToastContainer /> {/* Toast container for displaying toast messages */}
                <h2 className="mb-4">Admin Dashboard</h2>
                <form onSubmit={handleSubmit} className="mb-5">
                    <div className="mb-3">
                        <label htmlFor="taskType" className="form-label">Task Type</label>
                        <select
                            id="taskType"
                            className="form-select"
                            value={taskType}
                            onChange={(e) => {
                                setTaskType(e.target.value);
                                setMediaFile(null); // Reset media file when task type changes
                                setMediaPreview(null); // Reset media preview when task type changes
                            }} // Update task type state on change
                        >
                            <option value="Write about the Photo">Write about the Photo</option>
                            <option value="Listen and Type">Listen and Type</option>
                        </select>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="media" className="form-label">
                            {taskType === 'Write about the Photo' ? 'Image' : 'Audio'} {/* Conditionally render label */}
                        </label>
                        <input
                            type="file"
                            className="form-control"
                            id="media"
                            accept={taskType === 'Write about the Photo' ? 'image/*' : 'audio/*'} // Accept only images or audio files based on task type
                            onChange={handleMediaChange}
                        /> {/* File input for media selection */}
                        {mediaPreview && (
                            <div className="mt-3">
                                {taskType === 'Write about the Photo' ? (
                                    <img src={mediaPreview} alt="Selected" className="img-preview" /> // Image preview
                                ) : (
                                    <audio controls src={mediaPreview} className="audio-preview">Your browser does not support the audio element.</audio> // Audio preview
                                )}
                            </div>
                        )}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="explanation" className="form-label">Explanation</label>
                        <textarea
                            className="form-control"
                            id="explanation"
                            rows="3"
                            value={explanation}
                            onChange={(e) => setExplanation(e.target.value)} // Update explanation state on change
                        ></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary">Add Task</button>
                </form>
                <h3>Existing Tasks</h3>
                {tasks && tasks.length > 0 ? (
                    <ul className="list-group">
                        {tasks.map(task => (
                            <li key={task._id} className="list-group-item d-flex justify-content-between align-items-center">
                                <div>
                                    {task.taskType === 'Write about the Photo' ? (
                                        <img
                                            src={`http://localhost:5002/uploads/${task.imageUrl}`} // Display the task image
                                            alt="Task"
                                            className="img-thumbnail me-3"
                                            style={{ width: '100px' }}
                                        />
                                    ) : (
                                        <audio controls src={`http://localhost:5002/uploads/${task.audioUrl}`}>Your browser does not support the audio element.</audio> // Display the task audio
                                    )}
                                    <span>{task.explanation}</span> {/* Display the task explanation */}
                                </div>
                                <button className="btn btn-danger" onClick={() => handleDelete(task._id)}> {/* Delete button */}
                                    <i className="fas fa-trash-alt"></i> Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No tasks found.</p>
                )}
            </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
