MarkIT 🎯

Automated Grading System Using OpenCV and JavaScript

MarkIT is a real-time, camera-based grading system that scans and grades answer sheets automatically. Designed for speed, accuracy, and scalability, MarkIT leverages OpenCV and JavaScript to simplify exam grading and improve efficiency.

⸻

🚀 Features
	•	🎥 Live Camera Integration – Supports multiple camera inputs with real-time streaming.
	•	📝 Automated Paper Detection – Detects answer sheets using contour detection and perspective transformation.
	•	✅ Real-Time Grading – Scans and grades answers live with visual feedback and overlays.
	•	⚙️ Customizable Parameters – Adjustable block sizes, thresholds, and contour approximation for precision grading.
	•	🔄 Multi-Camera Support – Easily switch between available cameras.
	•	🔊 Audio Feedback – Provides instant sound notification when grading is complete.
	•	🖥️ Live Display – Shows real-time scanning results and grading visualization.

⸻

📂 Project Structure
```text 
MarkIT-Automated-Grading-System/
│
├── index.html           # Frontend interface
├── grader.js            # Core grading logic (OpenCV + JavaScript)
├── style.css            # Styling file
├── opencv.js            # OpenCV library
├── assets/              # Additional resources (e.g., sounds, icons)
└── README.md            # Project documentation
```
📦 Technologies Used
	•	OpenCV.js (Real-time image processing)
	•	JavaScript (Core application logic)
	•	HTML & CSS (User interface)
 
🎮 How to Run the Project
	1.	Clone the Repository
 ```text
git clone https://github.com/your-username/MarkIT-Automated-Grading-System.git
cd MarkIT-Automated-Grading-System
```
  2.  Open index.html in a Browser
      No server setup required – it runs locally.
  3.	Grant Camera Permission
      Allow the browser to access your webcam.
  4.	Adjust Parameters as Needed
      Tune block sizes and constants for optimal detection using the UI controls.

🛠️ Customization
	•	You can adjust block size, constant, and approximation parameters in real time.
	•	Easily switch between available cameras using the dropdown menu.
	•	Modify the grading answer key in the grader.js file.
 
 🗒️ Example Use Cases
	•	Multiple-choice test grading for classrooms
	•	Quiz evaluations during competitions
	•	Real-time answer sheet scanning at events

 📢 Acknowledgements
	•	Built during the SolveIT 2019 Regional Innovation Competition.
	•	Special thanks to the mentors and judges who supported this project.

 

 
