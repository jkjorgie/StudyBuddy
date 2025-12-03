// __tests__/getEndpoints.test.js
const request = require("supertest");

// Mock the database module BEFORE requiring server.js
jest.mock("../data/database", () => ({
  getDatabase: jest.fn(),
}));

const { getDatabase } = require("../data/database");
const app = require("../server");

describe("GET endpoints", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("GET /user returns 200 and list of users", async () => {
    const fakeUsers = [
      { _id: "1", name: "John Smith", emailAddress: "john@mail.com" },
      { _id: "2", name: "Sarah Johnson", emailAddress: "sarah@mail.com" },
    ];

    const mockDbClient = {
      db: () => ({
        collection: (name) => ({
          // this is the users collection used in controller
          find: () => ({
            toArray: async () => (name === "users" ? fakeUsers : []), // only return users on the "users" collection
          }),
        }),
      }),
    };

    getDatabase.mockReturnValue(mockDbClient);

    const res = await request(app).get("/user");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeUsers);
  });

  test("GET /course returns 200 and list of courses", async () => {
    const fakeCourses = [
      {
        _id: "10",
        courseName: "Intro to Computer Science",
        startDate: "2025-01-15",
        endDate: "2025-05-10",
      },
      {
        _id: "11",
        courseName: "Data Structures",
        startDate: "2025-01-16",
        endDate: "2025-05-11",
      },
    ];

    const mockDbClient = {
      db: () => ({
        collection: (name) => ({
          find: () => ({
            toArray: async () => (name === "courses" ? fakeCourses : []),
          }),
        }),
      }),
    };

    getDatabase.mockReturnValue(mockDbClient);

    const res = await request(app).get("/course");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeCourses);
  });

  test("GET /study-session returns 200 and list of study sessions", async () => {
    const fakeSessions = [
      {
        _id: "21",
        courseId: "10",
        length: 120,
        description: "Recursion practice",
        studySessionRating: 4,
      },
      {
        _id: "22",
        courseId: "11",
        length: 90,
        description: "Binary trees",
        studySessionRating: 5,
      },
    ];

    const mockDbClient = {
      db: () => ({
        collection: (name) => ({
          find: () => ({
            toArray: async () =>
              name === "study_sessions" ? fakeSessions : [],
          }),
        }),
      }),
    };

    getDatabase.mockReturnValue(mockDbClient);

    const res = await request(app).get("/study-session");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeSessions);
  });

  test("GET /task returns 200 and list of tasks", async () => {
    const fakeTasks = [
      {
        _id: "31",
        courseId: "10",
        taskDescription: "Linked list assignment",
        taskDifficultyRating: 3,
        taskTimeEstimate: 180,
        taskTimeActual: 200,
      },
      {
        _id: "32",
        courseId: "11",
        taskDescription: "Study sorting algorithms",
        taskDifficultyRating: 4,
        taskTimeEstimate: 240,
        taskTimeActual: 260,
      },
    ];

    const mockDbClient = {
      db: () => ({
        collection: (name) => ({
          find: () => ({
            toArray: async () => (name === "tasks" ? fakeTasks : []),
          }),
        }),
      }),
    };

    getDatabase.mockReturnValue(mockDbClient);

    const res = await request(app).get("/task");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeTasks);
  });

  // Tests for specific ID endpoints
  describe("GET endpoints by ID", () => {
    test("GET /user/:userId returns 200 and user when found", async () => {
      const fakeUser = {
        _id: "691e9c6c334999dee4d5d70e",
        name: "John Smith",
        emailAddress: "john.smith@example.com",
      };

      const mockDbClient = {
        db: () => ({
          collection: (name) => ({
            findOne: async () => (name === "users" ? fakeUser : null),
          }),
        }),
      };

      getDatabase.mockReturnValue(mockDbClient);

      const res = await request(app).get("/user/691e9c6c334999dee4d5d70e");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(fakeUser);
    });

    test("GET /course/:courseId returns 200 and course when found", async () => {
      const fakeCourse = {
        _id: "691e9cd6334999dee4d5d712",
        courseName: "Intro to Computer Science",
        startDate: "2025-01-15",
        endDate: "2025-05-10",
      };

      const mockDbClient = {
        db: () => ({
          collection: (name) => ({
            findOne: async () => (name === "courses" ? fakeCourse : null),
          }),
        }),
      };

      getDatabase.mockReturnValue(mockDbClient);

      const res = await request(app).get("/course/507f1f77bcf86cd799439012");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(fakeCourse);
    });

    test("GET /task/:taskId returns 200 and task when found", async () => {
      const fakeTask = {
        _id: "507f1f77bcf86cd799439013",
        courseId: "10",
        taskDescription: "Linked list assignment",
        taskDifficultyRating: 3,
        taskTimeEstimate: 180,
        taskTimeActual: 200,
      };

      const mockDbClient = {
        db: () => ({
          collection: (name) => ({
            findOne: async () => (name === "tasks" ? fakeTask : null),
          }),
        }),
      };

      getDatabase.mockReturnValue(mockDbClient);

      const res = await request(app).get("/task/507f1f77bcf86cd799439013");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(fakeTask);
    });

    test("GET /study-session/:sessionId returns 200 and session when found", async () => {
      const fakeSession = {
        _id: "507f1f77bcf86cd799439014",
        courseId: "10",
        length: 120,
        description: "Recursion practice",
        studySessionRating: 4,
      };

      const mockDbClient = {
        db: () => ({
          collection: (name) => ({
            findOne: async () =>
              name === "study_sessions" ? fakeSession : null,
          }),
        }),
      };

      getDatabase.mockReturnValue(mockDbClient);

      const res = await request(app).get(
        "/study-session/507f1f77bcf86cd799439014"
      );

      expect(res.status).toBe(200);
      expect(res.body).toEqual(fakeSession);
    });
  });
});
