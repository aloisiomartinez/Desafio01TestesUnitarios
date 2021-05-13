import request from "supertest";
import { Connection, createConnection } from "typeorm";

import { app } from "../../../../app";

let connection: Connection;

describe("Show User Profile Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to show an user profile", async () => {
    // Arrange
    const userData = {
      name: "user name",
      email: "user@email.com",
      password: "123456"
    };

    let response = await request(app)
      .post("/api/v1/users")
      .send(userData);

    expect(response.status).toBe(201);

    response = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: userData.email,
        password: userData.password
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");

    const { token } = response.body;

    // Act
    response = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("name");
    expect(response.body).toHaveProperty("email");
    expect(response.body).toHaveProperty("created_at");
    expect(response.body).toHaveProperty("updated_at");
  })
})
