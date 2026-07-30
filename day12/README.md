Axios
Axios is a JavaScript library used to send HTTP requests from React or other JavaScript applications.
Installation
npm install axios
GET request
import axios from "axios";

const response = await axios.get("http://localhost:8000/api/tasks");
console.log(response.data);
POST request
await axios.post("http://localhost:8000/api/tasks", {
  title: "Learn Axios",
  completed: false,
});
Error handling
try {
  const response = await axios.get("/api/tasks");
  setTasks(response.data);
} catch (error) {
  setError(error.message);
}
Axios benefits
Automatically converts JSON responses.
Supports GET, POST, PUT, PATCH, and DELETE.
Provides convenient error handling.
Supports request headers and authentication tokens.
Supports interceptors and request cancellation.

CORS 
CORS means Cross-Origin Resource Sharing. It controls whether a frontend can access a backend running on a different origin.
An origin consists of:
protocol + domain + port
For example, these are different origins:
React:   http://localhost:5173
FastAPI: http://localhost:8000
The backend must permit the React origin.
FastAPI CORS configuration
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
Common CORS error
Blocked by CORS policy
This usually means:
The frontend origin is not allowed.
The backend lacks CORS configuration.
The requested method or header is not permitted.
The frontend uses the wrong backend URL.
For production, list trusted origins instead of using:
allow_origins=["*"]
4:18 PM
Ask for approval
5.6 TerraExtra High5.6 TerraExtra High5.6 SolExtra High
