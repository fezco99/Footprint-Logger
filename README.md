# Footprint-Logger

# Footprint Logger

A web app that helps users track their daily activities and estimate their carbon footprint. Users can log behaviors like travel, food consumption, and energy use, see a running total of their emissions, and view summaries through charts.

## **Features**

- User registration and login
- Save and retrieve user-specific activity logs
- User dashboard with totals and weekly summaries
- Community average emissions calculation
- Leaderboard for low-footprint users

## **Technologies Used**

- **Front-End:** HTML, CSS, JavaScript, Chart.js
- **Back-End:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** Json web token (JWT)

## **Installation**

1. Clone the repository:

   ```bash
   git clone <repo-url>

   ```

2. **Install dependencies**

   ```bash
   npm install

   ```

3. **Create a `.env` file with:**

   ```javascript
   MONGODB_URI=<your_mongodb_uri>
   JWT_SECRET=<your_secret_key>

   ```

4. **Start the backend server:**

   ```bash
   npm start

   ```

5. **Launch the live server for the frontend**

## Usage

1. Register or Login
2. Add default or custom activities
3. View your carbon footprint summary
4. Filter activities by category
5. Check weekly summary to see a visual breakdown
6. Track weekly streaks and compare with community average
7. View leaderboard for ranks
